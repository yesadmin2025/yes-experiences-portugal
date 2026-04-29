/**
 * Booking checkout server functions.
 *
 * Creates a Stripe Checkout Session, writes a `pending` booking row via the
 * service-role admin client, and returns the redirect URL. The Stripe
 * webhook (src/routes/api/public/stripe-webhook.ts) flips the row to
 * `paid` once Stripe confirms the payment — that's the source of truth.
 *
 * No user authentication is required: a guest can pay without an account.
 * All inputs are validated server-side; client-supplied amounts are
 * accepted but capped (see checkout.schemas.ts) — once Bokun-style real
 * pricing tables exist we'll harden this further by re-deriving prices
 * from the source tour/journey id.
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequestHost } from "@tanstack/react-start/server";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  createCheckoutSessionSchema,
  type CreateCheckoutSessionResult,
} from "./checkout.schemas";
import { getStripe, isStripeConfigured } from "./stripe.server";

/**
 * Detects the public origin (https://host) for building Stripe redirect URLs.
 * Honors the Host header so it works in preview, published, and custom
 * domains without needing an env var.
 */
function getPublicOrigin(): string {
  const host = getRequestHost();
  // Local dev fallback
  if (!host) return "http://localhost:8080";
  // Lovable / Cloudflare always serves https in preview & production.
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((input) => createCheckoutSessionSchema.parse(input))
  .handler(async ({ data }): Promise<CreateCheckoutSessionResult> => {
    if (!isStripeConfigured()) {
      throw new Error(
        "Booking checkout is not yet enabled. Please contact us directly " +
          "and we'll confirm your booking by hand.",
      );
    }

    const stripe = getStripe();
    const origin = getPublicOrigin();

    // 1) Create the pending booking row first so we always have a record,
    //    even if the user abandons the Stripe page.
    const amountTotalCents = data.lineItems.reduce(
      (sum, li) => sum + li.unitAmountCents * (li.quantity ?? 1),
      0,
    );

    const { data: booking, error: insertError } = await supabaseAdmin
      .from("bookings")
      .insert({
        booking_type: data.bookingType,
        source_tour_id: data.sourceTourId ?? null,
        source_journey_id: data.sourceJourneyId ?? null,
        customer_email: data.customerEmail,
        customer_name: data.customerName ?? null,
        customer_phone: data.customerPhone ?? null,
        guests: data.guests,
        preferred_date: data.preferredDate ?? null,
        notes: data.notes ?? null,
        amount_total: amountTotalCents,
        currency: "eur",
        status: "pending",
        metadata: data.metadata ?? {},
      })
      .select("id")
      .single();

    if (insertError || !booking) {
      console.error("[checkout] failed to insert pending booking", insertError);
      throw new Error("Could not create booking. Please try again.");
    }

    // 2) Create the Stripe Checkout Session.
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: data.customerEmail,
        line_items: data.lineItems.map((li) => ({
          quantity: li.quantity ?? 1,
          price_data: {
            currency: "eur",
            unit_amount: li.unitAmountCents,
            product_data: {
              name: li.label,
              description: li.description,
            },
          },
        })),
        // We pass the booking id back so the webhook can locate the row.
        client_reference_id: booking.id,
        metadata: {
          booking_id: booking.id,
          booking_type: data.bookingType,
          source_tour_id: data.sourceTourId ?? "",
          source_journey_id: data.sourceJourneyId ?? "",
        },
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout/cancelled?booking_id=${booking.id}`,
        // 30-min hold so abandoned sessions clean up automatically.
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      });

      // 3) Persist the session id on the booking so the webhook can match.
      await supabaseAdmin
        .from("bookings")
        .update({ stripe_session_id: session.id })
        .eq("id", booking.id);

      if (!session.url) {
        throw new Error("Stripe did not return a checkout URL.");
      }
      return { url: session.url, sessionId: session.id };
    } catch (err) {
      // Mark booking as failed so we don't leak an orphan pending row.
      await supabaseAdmin
        .from("bookings")
        .update({ status: "failed" })
        .eq("id", booking.id);
      console.error("[checkout] Stripe session create failed", err);
      throw new Error(
        err instanceof Error
          ? `Checkout failed: ${err.message}`
          : "Checkout failed.",
      );
    }
  });
