import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { ArrowRight, MessageCircle, Plus, X, Clock, MapPin, Calendar, Users } from "lucide-react";
import { signatureTours, type SignatureTour } from "@/data/signatureTours";
import { whatsappHref } from "@/components/WhatsAppFab";
import { useImportedTourImages } from "@/hooks/use-imported-tour-images";
import multiDay from "@/assets/multi-day.jpg";

export const Route = createFileRoute("/multi-day")({
  head: () => ({
    meta: [
      { title: "Multi-Day Journeys — YES experiences Portugal" },
      {
        name: "description",
        content:
          "Build a multi-day Portugal journey by picking one of our Signature tours for each day. We tailor and confirm with you.",
      },
      { property: "og:title", content: "Multi-Day Portugal Journeys" },
      {
        property: "og:description",
        content:
          "Pick a Signature tour for each day. We refine pace, transfers and stays and confirm everything by WhatsApp.",
      },
    ],
  }),
  component: MultiDayPage,
});

type DaySlot = { tourId: string | null };

const MAX_DAYS = 7;

function MultiDayPage() {
  const { resolveImg } = useImportedTourImages();
  const [days, setDays] = useState<DaySlot[]>([
    { tourId: null },
    { tourId: null },
    { tourId: null },
  ]);
  const [pickerOpenFor, setPickerOpenFor] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [notes, setNotes] = useState("");

  const filledDays = days.filter((d) => d.tourId);
  const total = useMemo(
    () =>
      filledDays.reduce((sum, d) => {
        const t = signatureTours.find((x) => x.id === d.tourId);
        return sum + (t?.priceFrom ?? 0);
      }, 0),
    [filledDays],
  );

  const setDayTour = (i: number, tourId: string) => {
    setDays((prev) => prev.map((d, idx) => (idx === i ? { tourId } : d)));
    setPickerOpenFor(null);
  };
  const clearDay = (i: number) =>
    setDays((prev) => prev.map((d, idx) => (idx === i ? { tourId: null } : d)));
  const removeDay = (i: number) => setDays((prev) => prev.filter((_, idx) => idx !== i));
  const addDay = () => setDays((prev) => (prev.length >= MAX_DAYS ? prev : [...prev, { tourId: null }]));

  const message = useMemo(() => {
    const lines = [
      `Hi! I'd like a ${days.length}-day Portugal journey.`,
      `• Start date: ${startDate || "flexible"}`,
      `• Guests: ${guests}`,
      "",
      ...days.map((d, i) => {
        const t = signatureTours.find((x) => x.id === d.tourId);
        return `Day ${i + 1}: ${t ? `${t.title} (${t.region})` : "open — surprise me"}`;
      }),
      "",
      notes ? `Notes: ${notes}` : "",
      `Estimated from €${total} per guest, before stays & transfers.`,
    ].filter(Boolean);
    return lines.join("\n");
  }, [days, startDate, guests, notes, total]);

  return (
    <SiteLayout>
      <section className="relative pt-32 pb-12 overflow-hidden">
        <img src={multiDay} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-[color:var(--ivory)]/70" />
        <div className="container-x relative text-center">
          <span className="eyebrow">Designed Across Days</span>
          <h1 className="serif text-4xl md:text-6xl mt-5 leading-tight">
            Multi-Day <span className="italic text-[color:var(--teal)]">Portugal Journeys</span>
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-[color:var(--charcoal-soft)]">
            Pick one of our Signature tours for each day. We handle pace, transfers and stays —
            and confirm everything with you on WhatsApp.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container-x max-w-3xl">
          {/* Trip basics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Start date" icon={<Calendar size={14} />}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-transparent border border-[color:var(--border)] px-3 py-2.5 text-sm focus:outline-none focus:border-[color:var(--gold)]"
              />
            </Field>
            <Field label="Guests" icon={<Users size={14} />}>
              <div className="flex items-center border border-[color:var(--border)]">
                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  className="px-3 py-2.5 text-lg leading-none text-[color:var(--charcoal-soft)] hover:text-[color:var(--charcoal)]"
                  aria-label="Fewer guests"
                >
                  −
                </button>
                <span className="flex-1 text-center text-sm">{guests}</span>
                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.min(12, g + 1))}
                  className="px-3 py-2.5 text-lg leading-none text-[color:var(--charcoal-soft)] hover:text-[color:var(--charcoal)]"
                  aria-label="More guests"
                >
                  +
                </button>
              </div>
            </Field>
          </div>

          {/* Day rail */}
          <ol className="mt-8 space-y-3">
            {days.map((d, i) => {
              const t = d.tourId ? signatureTours.find((x) => x.id === d.tourId) ?? null : null;
              return (
                <li
                  key={i}
                  className="border border-[color:var(--border)] bg-[color:var(--card)] p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
                      Day {i + 1}
                    </span>
                    {days.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDay(i)}
                        className="text-xs text-[color:var(--charcoal-soft)] hover:text-[color:var(--charcoal)] inline-flex items-center gap-1"
                        aria-label={`Remove day ${i + 1}`}
                      >
                        <X size={12} /> Remove
                      </button>
                    )}
                  </div>

                  {t ? (
                    <DayCard
                      tour={t}
                      img={resolveImg(t, "sm")}
                      onChange={() => setPickerOpenFor(i)}
                      onClear={() => clearDay(i)}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPickerOpenFor(i)}
                      className="mt-3 w-full border border-dashed border-[color:var(--border)] hover:border-[color:var(--gold)] px-4 py-6 text-sm text-[color:var(--charcoal-soft)] hover:text-[color:var(--charcoal)] inline-flex items-center justify-center gap-2"
                    >
                      <Plus size={14} /> Pick a tour for day {i + 1}
                    </button>
                  )}
                </li>
              );
            })}
          </ol>

          {days.length < MAX_DAYS && (
            <button
              type="button"
              onClick={addDay}
              className="mt-3 w-full border border-[color:var(--border)] hover:border-[color:var(--gold)] px-4 py-3 text-sm inline-flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Add another day
            </button>
          )}

          {/* Notes */}
          <div className="mt-8">
            <Field label="Anything else?">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Pace, allergies, anniversary, hotels you love…"
                className="w-full bg-transparent border border-[color:var(--border)] px-3 py-2.5 text-sm focus:outline-none focus:border-[color:var(--gold)] resize-none"
              />
            </Field>
          </div>

          {/* Submit */}
          <div className="mt-8 border-t border-[color:var(--border)] pt-6">
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-[11px] uppercase tracking-[0.25em] text-[color:var(--charcoal-soft)]">
                Estimate · {filledDays.length} of {days.length} days
              </span>
              <span className="serif text-2xl text-[color:var(--teal)]">
                from €{total}
              </span>
            </div>
            <a
              href={whatsappHref(message)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-[color:var(--ivory)] px-5 py-3.5 text-sm tracking-wide transition-all"
            >
              <MessageCircle size={16} /> Send my journey on WhatsApp
            </a>
            <p className="mt-2 text-[11px] text-[color:var(--charcoal-soft)] text-center">
              We confirm pace, transfers and stays before any payment.
            </p>
          </div>
        </div>
      </section>

      {pickerOpenFor !== null && (
        <TourPicker
          dayIndex={pickerOpenFor}
          onClose={() => setPickerOpenFor(null)}
          onPick={(id) => setDayTour(pickerOpenFor, id)}
        />
      )}
    </SiteLayout>
  );
}

function DayCard({
  tour,
  img,
  onChange,
  onClear,
}: {
  tour: SignatureTour;
  img: { src: string; srcSet?: string; sizes?: string };
  onChange: () => void;
  onClear: () => void;
}) {
  return (
    <div className="mt-3 flex gap-4">
      <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 overflow-hidden">
        <img {...img} alt={tour.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="serif text-lg leading-tight">{tour.title}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.2em] text-[color:var(--charcoal-soft)]">
          <span className="inline-flex items-center gap-1"><MapPin size={11} /> {tour.region}</span>
          <span className="inline-flex items-center gap-1"><Clock size={11} /> {tour.durationHours}</span>
          <span className="text-[color:var(--teal)]">€{tour.priceFrom}+</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs">
          <button
            type="button"
            onClick={onChange}
            className="text-[color:var(--teal)] hover:underline"
          >
            Change
          </button>
          <Link
            to="/tours/$tourId"
            params={{ tourId: tour.id }}
            className="text-[color:var(--charcoal-soft)] hover:text-[color:var(--charcoal)] inline-flex items-center gap-1"
          >
            View <ArrowRight size={11} />
          </Link>
          <button
            type="button"
            onClick={onClear}
            className="text-[color:var(--charcoal-soft)] hover:text-[color:var(--charcoal)]"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

function TourPicker({
  dayIndex,
  onClose,
  onPick,
}: {
  dayIndex: number;
  onClose: () => void;
  onPick: (tourId: string) => void;
}) {
  const { resolveImg } = useImportedTourImages();
  const [q, setQ] = useState("");
  const filtered = signatureTours.filter((t) =>
    [t.title, t.region, t.theme].join(" ").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Pick a tour for day ${dayIndex + 1}`}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[color:var(--charcoal)]/60"
      onClick={onClose}
    >
      <div
        className="bg-[color:var(--ivory)] w-full sm:max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[color:var(--border)] p-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--gold)]">
              Day {dayIndex + 1}
            </span>
            <h3 className="serif text-xl">Pick a Signature tour</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 text-[color:var(--charcoal-soft)] hover:text-[color:var(--charcoal)]"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4 border-b border-[color:var(--border)]">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by region, theme or name…"
            className="w-full bg-transparent border border-[color:var(--border)] px-3 py-2.5 text-sm focus:outline-none focus:border-[color:var(--gold)]"
          />
        </div>
        <ul className="overflow-y-auto p-4 space-y-2">
          {filtered.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => onPick(t.id)}
                className="w-full flex gap-3 p-2 text-left hover:bg-[color:var(--sand)]/60 transition-colors"
              >
                <img
                  {...resolveImg(t, "sm")}
                  alt=""
                  loading="lazy"
                  className="w-16 h-16 object-cover flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="serif text-base leading-tight truncate">{t.title}</p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--charcoal-soft)] mt-1 truncate">
                    {t.region} · {t.durationHours}
                  </p>
                </div>
                <span className="text-[color:var(--teal)] text-sm self-center">€{t.priceFrom}+</span>
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="text-sm text-[color:var(--charcoal-soft)] p-4 text-center">
              No tours match "{q}". Try a different search.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-[color:var(--charcoal-soft)] mb-1.5">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}
