/**
 * Shared Zod schemas for booking checkout requests.
 *
 * IMPORTANT: this file is client-safe (no server imports, no secrets).
 * Both the React form code and the createServerFn input validator import
 * from here so the contract cannot drift.
 */
import { z } from "zod";

export const BOOKING_TYPES = ["tailored", "builder", "multi-day"] as const;
export type BookingType = (typeof BOOKING_TYPES)[number];

/**
 * Maximum line-item amount we will hand to Stripe in a single session, in
 * cents (EUR). Generous enough for a multi-day private journey, but capped
 * to prevent runaway form input or tampered client-side prices from
 * creating absurd checkout sessions.
 */
export const MAX_AMOUNT_CENTS = 250_000_00; // €250,000

export const checkoutLineItemSchema = z.object({
  /** Human-readable label shown on the Stripe checkout page. */
  label: z.string().min(1).max(200),
  /** Optional second line, e.g. "3 guests · pickup 09:00 · Lisbon area". */
  description: z.string().max(400).optional(),
  /** Per-unit amount in cents, EUR. */
  unitAmountCents: z
    .number()
    .int()
    .min(0)
    .max(MAX_AMOUNT_CENTS),
  /** Quantity (guests / nights / etc). Default 1. */
  quantity: z.number().int().min(1).max(50).default(1),
});

export type CheckoutLineItem = z.infer<typeof checkoutLineItemSchema>;

export const createCheckoutSessionSchema = z
  .object({
    bookingType: z.enum(BOOKING_TYPES),

    /** Free-form id of the originating tour or journey, if any. */
    sourceTourId: z.string().max(120).optional(),
    sourceJourneyId: z.string().max(120).optional(),

    customerEmail: z.string().email().max(254),
    customerName: z.string().min(1).max(120).optional(),
    customerPhone: z.string().max(40).optional(),

    guests: z.number().int().min(1).max(50).default(1),
    /** ISO date string (YYYY-MM-DD) for the preferred experience date. */
    preferredDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "preferredDate must be YYYY-MM-DD")
      .optional(),
    notes: z.string().max(2000).optional(),

    lineItems: z.array(checkoutLineItemSchema).min(1).max(20),

    /**
     * Arbitrary extra metadata stored on the booking row (e.g. selected
     * tailored options, route summary). Capped to prevent abuse.
     */
    metadata: z.record(z.string(), z.string().max(500)).optional(),
  })
  .superRefine((data, ctx) => {
    const total = data.lineItems.reduce(
      (sum, li) => sum + li.unitAmountCents * (li.quantity ?? 1),
      0,
    );
    if (total <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Checkout total must be greater than zero.",
        path: ["lineItems"],
      });
    }
    if (total > MAX_AMOUNT_CENTS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Checkout total exceeds the maximum allowed (€${(MAX_AMOUNT_CENTS / 100).toLocaleString()}).`,
        path: ["lineItems"],
      });
    }
  });

export type CreateCheckoutSessionInput = z.infer<
  typeof createCheckoutSessionSchema
>;

export interface CreateCheckoutSessionResult {
  /** Stripe Checkout Session URL — redirect the browser here. */
  url: string;
  /** Stripe session id (cs_test_… in test mode). */
  sessionId: string;
}
