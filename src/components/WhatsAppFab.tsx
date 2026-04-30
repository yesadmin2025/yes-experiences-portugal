import { MessageCircle } from "lucide-react";

const WA_NUMBER = "351911889992"; // +351 911 889 992
const WA_TEXT = "Olá! Estou a montar a minha experiência e gostaria de uma sugestão.";

export function WhatsAppFab() {
  const href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_TEXT)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="A local is one message away — chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#295B61] text-[#FAF8F3] shadow-[0_8px_28px_-8px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A96A]"
    >
      <MessageCircle className="h-6 w-6" strokeWidth={1.75} />
      <span className="sr-only">A local is one message away</span>
    </a>
  );
}
