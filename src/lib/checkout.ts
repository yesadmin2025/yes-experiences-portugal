/**
 * Client-side checkout helper.
 *
 * Thin wrapper around the createCheckoutSession server function that
 * also handles the redirect. Keeps booking forms simple:
 *
 *   import { startCheckout } from "@/lib/checkout";
 *   await startCheckout({ bookingType: "tailored", ... });
 */
import { createCheckoutSession } from "@/server/checkout.functions";
import type { CreateCheckoutSessionInput } from "@/server/checkout.schemas";

export async function startCheckout(
  input: CreateCheckoutSessionInput,
): Promise<void> {
  const { url } = await createCheckoutSession({ data: input });
  // Full-page redirect — Stripe's hosted checkout is a separate origin.
  window.location.href = url;
}

export type { CreateCheckoutSessionInput } from "@/server/checkout.schemas";
