/**
 * Stripe webhook endpoint.
 *
 * Public route (under /api/public/* so platform auth is bypassed) — but we
 * verify the Stripe signature on every request and fail closed otherwise.
 *
 * Handled events:
 *   - checkout.session.completed   → mark booking `paid`, store payment intent id
 *   - checkout.session.expired     → mark booking `cancelled`
 *   - checkout.session.async_payment_failed → mark booking `failed`
 *   - charge.refunded              → mark booking `refunded`
 *
 * The webhook URL to register in the Stripe dashboard is:
 *   https://project--<project-id>.lovable.app/api/public/stripe-webhook
 * (use the -dev variant for the test-mode webhook).
 */
import { createFileRoute } from "@tanstack/react-router";
import type Stripe from "stripe";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getStripe, getStripeWebhookSecret } from "@/server/stripe.server";

type BookingStatus =
  | "pending"
  | "paid"
  | "cancelled"
  | "refunded"
  | "failed";

async function setBookingStatus(
  sessionId: string,
  status: BookingStatus,
  extra: Record<string, unknown> = {},
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("bookings")
    .update({ status, ...extra })
    .eq("stripe_session_id", sessionId);
  if (error) {
    console.error(
      `[stripe-webhook] failed to set status=${status} for session ${sessionId}`,
      error,
    );
  }
}

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const signature = request.headers.get("stripe-signature");
        if (!signature) {
          return new Response("Missing stripe-signature header", {
            status: 400,
          });
        }

        let webhookSecret: string;
        try {
          webhookSecret = getStripeWebhookSecret();
        } catch (err) {
          console.error("[stripe-webhook] webhook secret missing", err);
          return new Response("Webhook not configured", { status: 503 });
        }

        const rawBody = await request.text();

        const stripe = getStripe();
        let event: Stripe.Event;
        try {
          event = await stripe.webhooks.constructEventAsync(
            rawBody,
            signature,
            webhookSecret,
          );
        } catch (err) {
          console.error("[stripe-webhook] signature verification failed", err);
          return new Response("Invalid signature", { status: 401 });
        }

        try {
          switch (event.type) {
            case "checkout.session.completed": {
              const session = event.data.object as Stripe.Checkout.Session;
              await setBookingStatus(session.id, "paid", {
                stripe_payment_intent_id:
                  typeof session.payment_intent === "string"
                    ? session.payment_intent
                    : (session.payment_intent?.id ?? null),
              });
              break;
            }
            case "checkout.session.expired": {
              const session = event.data.object as Stripe.Checkout.Session;
              await setBookingStatus(session.id, "cancelled");
              break;
            }
            case "checkout.session.async_payment_failed": {
              const session = event.data.object as Stripe.Checkout.Session;
              await setBookingStatus(session.id, "failed");
              break;
            }
            case "charge.refunded": {
              const charge = event.data.object as Stripe.Charge;
              const paymentIntentId =
                typeof charge.payment_intent === "string"
                  ? charge.payment_intent
                  : (charge.payment_intent?.id ?? null);
              if (paymentIntentId) {
                const { error } = await supabaseAdmin
                  .from("bookings")
                  .update({ status: "refunded" })
                  .eq("stripe_payment_intent_id", paymentIntentId);
                if (error) {
                  console.error(
                    "[stripe-webhook] refund update failed",
                    error,
                  );
                }
              }
              break;
            }
            default:
              // Ignore other event types — Stripe sends many we don't care about.
              break;
          }

          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          console.error("[stripe-webhook] handler error", err);
          return new Response("Webhook handler error", { status: 500 });
        }
      },
    },
  },
});
