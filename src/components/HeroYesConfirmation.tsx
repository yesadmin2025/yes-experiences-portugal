import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

/**
 * HeroYesConfirmation
 * --------------------------------------------------------------------------
 * Instant, no-form "Yes" micro-interaction that lives directly under the
 * hero CTAs. The moment the visitor hovers, focuses, or taps either CTA
 * (or the confirmation chip itself), it animates in a centered success
 * line — "Yes — we already said it." — that mirrors the premium typography
 * of the brand signature (uppercase, wide tracking, gold accent).
 *
 * No request, no form, no waiting: we listen for the same `data-hero-field`
 * CTAs already in the hero and flip a local visible flag. Once shown, it
 * stays visible (the promise has been made) but politely fades and lifts
 * on first reveal so it reads as a deliberate response, not a tooltip.
 *
 * Reduced-motion: respects prefers-reduced-motion via CSS — the keyframes
 * collapse to an opacity-only fade.
 */
export function HeroYesConfirmation() {
  const [visible, setVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (visible) return;
    const reveal = () => setVisible(true);

    // Find the two hero CTAs by their stable data attribute.
    const ctas = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-hero-field="primaryCta"], [data-hero-field="secondaryCta"]',
      ),
    );
    if (ctas.length === 0) return;

    const events: Array<keyof HTMLElementEventMap> = [
      "pointerenter",
      "focus",
      "touchstart",
    ];
    ctas.forEach((el) => {
      events.forEach((ev) =>
        el.addEventListener(ev, reveal, { once: true, passive: true } as AddEventListenerOptions),
      );
    });

    return () => {
      ctas.forEach((el) => {
        events.forEach((ev) => el.removeEventListener(ev, reveal));
      });
    };
  }, [visible]);

  return (
    <div
      ref={rootRef}
      data-hero-field="yesConfirmation"
      data-visible={visible ? "true" : "false"}
      aria-live="polite"
      className="hero-yes-confirmation mt-5 md:mt-6 flex justify-center"
    >
      <div
        className={[
          "hero-yes-chip inline-flex items-center gap-3 px-4 py-2",
          "transition-all duration-700 ease-out will-change-transform",
          visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-1 pointer-events-none",
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          className="hero-yes-check inline-flex items-center justify-center h-5 w-5 rounded-full"
        >
          <Check size={11} strokeWidth={3} className="text-[color:var(--ink,#0b0b0b)]" />
        </span>
        <span className="hero-yes-text">
          <span className="hero-yes-text-lead">Yes</span>
          <span className="hero-yes-text-sep" aria-hidden="true">
            —
          </span>
          <span className="hero-yes-text-tail">we already said it.</span>
        </span>
      </div>
    </div>
  );
}

export default HeroYesConfirmation;
