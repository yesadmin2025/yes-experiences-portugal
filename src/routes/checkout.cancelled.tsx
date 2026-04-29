import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/checkout/cancelled")({
  component: CheckoutCancelledPage,
  head: () => ({
    meta: [
      { title: "Checkout cancelled — YES Experiences Portugal" },
      {
        name: "description",
        content:
          "No worries — your booking was not completed. You can try again or speak with a local.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function CheckoutCancelledPage() {
  return (
    <main className="min-h-[80vh] bg-background flex items-center justify-center px-6 py-24">
      <div className="max-w-xl text-center space-y-8">
        <h1 className="font-display text-4xl md:text-5xl text-foreground tracking-tight">
          No payment was taken.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          You stepped out of the checkout before it completed — no card was
          charged. Your details are still here whenever you want to pick up
          where you left off, or you can speak to a local first.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
          >
            Back to home
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-border text-foreground font-medium hover:bg-accent transition-colors"
          >
            Speak to a local
          </Link>
        </div>
      </div>
    </main>
  );
}
