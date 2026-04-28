import { useEffect, useState } from "react";

/**
 * WhatsAppFab
 *  - Always visible floating action button (bottom-right) that opens a
 *    direct WhatsApp conversation with a real local guide.
 *  - Brand-teal background (Option A from the brief) so the surface stays
 *    in visual harmony with the rest of the site — no raw WhatsApp green.
 *  - The icon (the official WhatsApp glyph) is rendered in ivory so it
 *    remains instantly recognizable without breaking the palette.
 *  - A subtle tooltip ("Chat with a local") slides in on hover/focus.
 *  - Hover: gentle lift + soft gold glow ring. Tap target ≥44px.
 *  - Mounts itself slightly above the mobile sticky CTA so the two never
 *    overlap, and respects iOS safe-area insets.
 */

// Single source of truth — swap once when the production number is known.
const WHATSAPP_NUMBER = "351000000000"; // intl format, no '+' / spaces
const WHATSAPP_MESSAGE = "Hi! I'd love a local's help shaping my journey in Portugal.";

function whatsappHref() {
  const url = new URL(`https://wa.me/${WHATSAPP_NUMBER}`);
  url.searchParams.set("text", WHATSAPP_MESSAGE);
  return url.toString();
}

export function WhatsAppFab() {
  // Tiny mount delay so the button fades in after the hero settles —
  // immediate appearance feels intrusive on first paint.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 600);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      // Bottom-right per brief. Sit above the mobile sticky CTA (~64px) on
      // small screens, drop back to a comfortable bottom-8 on md+.
      className="fixed right-5 md:right-8 z-40 print:hidden bottom-24 md:bottom-8 group"
      style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {/* Tooltip — appears on hover/focus-within. Positioned to the right
          of the button so it stays on-screen even at the viewport edge. */}
      <span
        role="tooltip"
        className={
          "pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-3 whitespace-nowrap " +
          "px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] font-medium " +
          "bg-[color:var(--charcoal-deep)] text-[color:var(--ivory)] " +
          "shadow-[0_8px_24px_-12px_rgba(0,0,0,0.4)] " +
          "opacity-0 translate-x-1 transition-all duration-300 " +
          "group-hover:opacity-100 group-hover:translate-x-0 " +
          "group-focus-within:opacity-100 group-focus-within:translate-x-0"
        }
      >
        Chat with a local
      </span>

      <a
        href={whatsappHref()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with a local on WhatsApp"
        className={
          "relative inline-flex h-14 w-14 items-center justify-center rounded-full " +
          "bg-[color:var(--teal)] text-[color:var(--ivory)] " +
          "shadow-[0_10px_30px_-12px_rgba(41,91,97,0.55)] " +
          "ring-1 ring-[color:var(--gold)]/40 " +
          "transition-all duration-500 hover:-translate-y-0.5 hover:bg-[color:var(--teal-2)] " +
          "hover:shadow-[0_18px_38px_-14px_rgba(201,169,106,0.55)] hover:ring-[color:var(--gold)]/80 " +
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] " +
          (mounted ? "opacity-100 scale-100" : "opacity-0 scale-90")
        }
      >
        {/* Live "available now" pulse — gold dot, subtle ping */}
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 inline-flex h-3 w-3"
        >
          <span className="absolute inline-flex h-full w-full rounded-full bg-[color:var(--gold)] opacity-70 animate-ping" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-[color:var(--gold)] ring-2 ring-[color:var(--teal)]" />
        </span>

        {/* WhatsApp glyph — official silhouette, single-color so it adopts
            the parent text color (ivory on teal). */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="26"
          height="26"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M16.002 3C9.374 3 4 8.373 4 15c0 2.39.703 4.617 1.91 6.49L4 29l7.71-1.86A11.93 11.93 0 0 0 16.002 27C22.63 27 28 21.627 28 15S22.63 3 16.002 3Zm0 21.6a9.55 9.55 0 0 1-4.86-1.33l-.348-.207-4.575 1.103 1.124-4.466-.227-.36A9.6 9.6 0 1 1 16.002 24.6Zm5.515-7.2c-.302-.152-1.787-.882-2.064-.983-.277-.1-.479-.151-.681.151-.201.302-.78.983-.957 1.184-.176.202-.353.227-.655.076-.302-.151-1.275-.47-2.428-1.498-.898-.8-1.503-1.788-1.68-2.09-.176-.302-.018-.465.133-.616.137-.135.302-.353.453-.529.151-.176.201-.302.302-.504.1-.202.05-.378-.025-.529-.076-.151-.681-1.643-.933-2.252-.246-.591-.496-.51-.681-.52l-.58-.011c-.202 0-.529.076-.806.378-.277.302-1.058 1.034-1.058 2.524 0 1.49 1.083 2.93 1.234 3.131.151.202 2.13 3.252 5.16 4.561.722.312 1.285.498 1.724.637.724.23 1.383.198 1.904.12.581-.087 1.787-.731 2.04-1.437.252-.706.252-1.31.176-1.437-.075-.126-.277-.202-.58-.353Z"/>
        </svg>
      </a>
    </div>
  );
}
