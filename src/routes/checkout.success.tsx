import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/checkout/success")({
  component: CheckoutSuccessPage,
  head: () => ({
    meta: [
      { title: "Booking confirmed — YES Experiences Portugal" },
      {
        name: "description",
        content:
          "Your booking is confirmed. We'll be in touch with the final details.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function CheckoutSuccessPage() {
  return (
    <main className="min-h-[80vh] bg-background flex items-center justify-center px-6 py-24">
      <div className="max-w-xl text-center space-y-8">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-foreground tracking-tight">
          Your booking is confirmed.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Thank you. We've received your payment and a confirmation email is on
          its way. A local will reach out within one business day with the
          final pickup details and any last questions.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
          >
            Back to home
          </Link>
          <Link
            to="/experiences"
            className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-border text-foreground font-medium hover:bg-accent transition-colors"
          >
            Explore more experiences
          </Link>
        </div>
      </div>
    </main>
  );
}
