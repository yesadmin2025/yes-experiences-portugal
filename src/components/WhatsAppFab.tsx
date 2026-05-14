import { MessageCircle } from "lucide-react";
import { useState } from "react";

const WA_NUMBER = "351911889992"; // +351 911 889 992

/** Build a wa.me deep link with a pre-filled message. */
export function whatsappHref(message: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

const DEFAULT_TEXT = "Olá! Estou a montar a minha experiência e gostaria de uma sugestão.";

export function WhatsAppFab() {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="hidden lg:flex fixed bottom-5 right-5 z-50 items-center gap-3">
      {/* Tooltip */}
      <div
        className={`pointer-events-none transition-all duration-200 ${
          hovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
        }`}
      >
        <div className="bg-[color:var(--charcoal)] text-[color:var(--ivory)] text-[11px] uppercase tracking-[0.18em] px-3 py-2 whitespace-nowrap shadow-lg">
          A local is one message away
        </div>
      </div>
      <a
        href={whatsappHref(DEFAULT_TEXT)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="A local is one message away — chat on WhatsApp"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--teal)] text-[color:var(--ivory)] shadow-[0_8px_28px_-8px_rgba(0,0,0,0.35)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_-8px_rgba(41,91,97,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--gold)]"
      >
        <MessageCircle className="h-6 w-6" strokeWidth={1.75} />
        <span className="sr-only">A local is one message away</span>
      </a>
    </div>
  );
}
