/**
 * Stripe server-only client.
 *
 * Reads STRIPE_SECRET_KEY from process.env at call time (NOT at module
 * scope, per server-runtime guidance — env injection happens per request).
 *
 * Throws a descriptive error if the key is missing so callers (server
 * functions, webhook routes) can surface a clean message instead of crashing.
 *
 * IMPORTANT: NEVER import this file from client code. The .server.ts
 * suffix triggers Vite's import-protection plugin, but we belt-and-suspender
 * by also keeping the secret read inside the factory.
 */
import Stripe from "stripe";

let cached: Stripe | null = null;

/**
 * Returns true when STRIPE_SECRET_KEY is configured. Use this from server
 * functions to short-circuit gracefully (e.g. return a "checkout not
 * configured yet" error instead of a 500) before the real keys arrive.
 */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Lazily instantiate the Stripe client. Throws if the secret key isn't set.
 * Caches the instance per worker instance.
 */
export function getStripe(): Stripe {
  if (cached) return cached;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not configured. Add it via the secrets manager " +
        "(test mode key starts with sk_test_…) before calling Stripe.",
    );
  }

  cached = new Stripe(key, {
    // Pin the API version so future Stripe upgrades don't break us silently.
    // Cast: the SDK's exported LatestApiVersion union excludes older pinned
    // versions, but the Stripe API itself accepts any valid YYYY-MM-DD string.
    apiVersion: "2024-12-18.acacia" as Stripe.StripeConfig["apiVersion"],
    typescript: true,
    appInfo: {
      name: "Dreamscape Builder (YES Experiences Portugal)",
    },
  });
  return cached;
}

/**
 * Returns the configured webhook secret. Webhook handler fails closed
 * (401 / signature invalid) when this is missing — never accept unverified
 * webhook payloads.
 */
export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET is not configured. Add it via the secrets " +
        "manager (test mode value starts with whsec_…).",
    );
  }
  return secret;
}
