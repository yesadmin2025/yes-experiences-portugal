import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface BuilderCheckoutBody {
  // amountInCents is no longer accepted from the client. Price is computed
  // server-side from builder_routing_rules to prevent price manipulation.
  guests: number;
  regionLabel: string;
  stopLabels: string[];
  pace: string;
  /** Optional bounded "Add to your day" element keys (concierge-confirmed). */
  elements?: string[];
  customerEmail?: string;
  returnUrl: string;
  environment: StripeEnv;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST")
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const body = (await req.json()) as BuilderCheckoutBody;

    if (!body || typeof body !== "object")
      return jsonError("Invalid body", 400);
    if (!Number.isInteger(body.amountInCents) || body.amountInCents < 5000)
      return jsonError("Amount must be at least 50 EUR", 400);
    if (!Number.isInteger(body.guests) || body.guests < 1 || body.guests > 12)
      return jsonError("Guests must be between 1 and 12", 400);
    if (!body.regionLabel || typeof body.regionLabel !== "string" || body.regionLabel.length > 80)
      return jsonError("Invalid region", 400);
    if (!Array.isArray(body.stopLabels) || body.stopLabels.length === 0 || body.stopLabels.length > 10)
      return jsonError("Invalid stops", 400);
    if (!body.returnUrl || !/^https?:\/\//.test(body.returnUrl))
      return jsonError("Invalid return URL", 400);
    if (body.environment !== "sandbox" && body.environment !== "live")
      return jsonError("Invalid environment", 400);

    const elements = Array.isArray(body.elements)
      ? body.elements.filter((e) => typeof e === "string" && e.length <= 40).slice(0, 10)
      : [];

    const stripe = createStripeClient(body.environment);

    const stopsSummary = body.stopLabels.slice(0, 6).join(" · ");
    const elementsSummary = elements.length > 0 ? ` · concierge: ${elements.join(", ")}` : "";
    const productName = `Private experience — ${body.regionLabel}`;
    const description = `${body.guests} guest${body.guests > 1 ? "s" : ""} · ${body.pace} pace · ${stopsSummary}${elementsSummary}`.slice(0, 500);

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: productName,
              description,
            },
            unit_amount: body.amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      ui_mode: "embedded_page",
      return_url: body.returnUrl,
      ...(body.customerEmail && { customer_email: body.customerEmail }),
      metadata: {
        booking_type: "builder",
        region: body.regionLabel,
        guests: String(body.guests),
        pace: body.pace,
        stops: body.stopLabels.slice(0, 8).join("|").slice(0, 480),
        ...(elements.length > 0 && { elements: elements.join("|").slice(0, 200) }),
      },
    });

    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-builder-checkout error:", e);
    return jsonError(e instanceof Error ? e.message : "Unknown error", 500);
  }
});

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
