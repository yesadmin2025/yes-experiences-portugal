import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import {
  ArrowRight,
  MessageCircle,
  Plus,
  X,
  Clock,
  MapPin,
  Calendar,
  Users,
  Wine,
  Compass,
  Heart,
  Landmark,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { signatureTours, type SignatureTour } from "@/data/signatureTours";
import { whatsappHref } from "@/components/WhatsAppFab";
import { useImportedTourImages } from "@/hooks/use-imported-tour-images";
import multiDay from "@/assets/multi-day.jpg";
import expWine from "@/assets/exp-wine.jpg";
import expCoastal from "@/assets/exp-coastal.jpg";
import expNature from "@/assets/exp-nature.jpg";
import expRomantic from "@/assets/exp-romantic.jpg";
import expGastronomy from "@/assets/exp-gastronomy.jpg";
import catCorporate from "@/assets/cat-corporate.jpg";

export const Route = createFileRoute("/multi-day")({
  head: () => ({
    meta: [
      { title: "Multi-Day Journeys Across Portugal — YES Experiences" },
      {
        name: "description",
        content:
          "Private multi-day Portugal journeys, shaped around your rhythm and guided by local knowledge. Realistic regional routes — confirmed in real time.",
      },
      { property: "og:title", content: "Multi-Day Journeys Across Portugal" },
      {
        property: "og:description",
        content:
          "Shape each day around your rhythm, with local knowledge guiding the route.",
      },
      { property: "og:image", content: multiDay },
      { property: "twitter:image", content: multiDay },
    ],
  }),
  component: MultiDayPage,
});

/* ============================================================
   Journey styles — cinematic editorial cards
   ============================================================ */

type JourneyStyle = {
  id: string;
  title: string;
  line: string;
  arc: string;
  image: string;
  icon: typeof Wine;
  builderHint: string; // params we can hint to the Studio
};

const JOURNEY_STYLES: JourneyStyle[] = [
  {
    id: "wine-coast",
    title: "Wine & Coast",
    line: "Family wineries by morning, the Atlantic by sunset.",
    arc: "Lisbon → Arrábida → Setúbal → Comporta",
    image: expWine,
    icon: Wine,
    builderHint: "wine-coast",
  },
  {
    id: "hidden-portugal",
    title: "Hidden Portugal",
    line: "Quiet villages, secret viewpoints, roads only locals know.",
    arc: "Sintra hills → Arrábida back roads → coastal Alentejo",
    image: expNature,
    icon: Compass,
    builderHint: "hidden",
  },
  {
    id: "family-journey",
    title: "Family Journey",
    line: "A rhythm that works for everyone — beaches, boats, gentle days.",
    arc: "Lisbon → Sesimbra → Comporta",
    image: expCoastal,
    icon: Users,
    builderHint: "family",
  },
  {
    id: "romantic-journey",
    title: "Romantic Journey",
    line: "Long lunches, sunset moments, a single beautiful table at the end of the day.",
    arc: "Sintra → Arrábida → Comporta",
    image: expRomantic,
    icon: Heart,
    builderHint: "romantic",
  },
  {
    id: "culture-food",
    title: "Culture & Food",
    line: "Markets at dawn, hand-painted tiles, dishes that tell a story.",
    arc: "Lisbon → Évora → Alentejo countryside",
    image: expGastronomy,
    icon: Landmark,
    builderHint: "culture-food",
  },
  {
    id: "corporate-incentive",
    title: "Corporate / Incentive",
    line: "Premium logistics, private flow, memorable moments for the whole group.",
    arc: "Lisbon base → curated regional days",
    image: catCorporate,
    icon: Briefcase,
    builderHint: "corporate",
  },
];

/* ============================================================
   Day-by-day picker (kept as a secondary tool, below the editorial)
   ============================================================ */

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
      {/* ============ HERO ============ */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
        <img
          src={multiDay}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/70" />
        <div className="container-x relative text-center text-white">
          <span className="text-[10px] uppercase tracking-[0.32em] text-[color:var(--gold-soft)]">
            Designed across days
          </span>
          <h1 className="serif text-[34px] md:text-6xl mt-4 leading-[1.08] max-w-3xl mx-auto">
            Multi-Day Journeys
            <br className="hidden sm:block" />{" "}
            <span className="italic text-[color:var(--gold-soft)]">Across Portugal</span>
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-[14px] md:text-[15px] text-white/85 italic leading-relaxed">
            Shape each day around your rhythm, with local knowledge guiding the route.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-2.5 justify-center items-stretch sm:items-center max-w-md mx-auto">
            <Link
              to="/builder"
              className="inline-flex items-center justify-center gap-2 bg-[color:var(--ivory)] text-[color:var(--charcoal)] px-7 py-3.5 text-[11px] uppercase tracking-[0.22em] hover:bg-white transition-colors"
            >
              Start Planning Your Journey <ArrowRight size={14} />
            </Link>
            <a
              href={whatsappHref("Hi! I'd like to plan a multi-day Portugal journey.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-white/40 text-white px-7 py-3.5 text-[11px] uppercase tracking-[0.22em] hover:bg-white/10 transition-colors"
            >
              <MessageCircle size={13} /> Chat with a local
            </a>
          </div>
          <p className="mt-5 text-[10px] uppercase tracking-[0.28em] text-white/65">
            Real routes · realistic pace · instant confirmation
          </p>
        </div>
      </section>

      {/* ============ CONCEPT ============ */}
      <section className="py-14 md:py-20 bg-[color:var(--sand)]">
        <div className="container-x max-w-3xl text-center">
          <span className="eyebrow">The idea</span>
          <h2 className="t-h2 mt-4 text-[color:var(--charcoal)]">
            Built from <span className="italic text-[color:var(--teal)]">real regional days</span>,
            not country-wide checklists.
          </h2>
          <p className="mt-5 text-[14px] md:text-[15px] text-[color:var(--charcoal-soft)] leading-relaxed">
            A multi-day journey isn't a sprint. We compose it from realistic regional day blocks —
            routes locals actually drive, stops that breathe, meals at the right hour. Each day flows
            into the next so the journey feels lived, not ticked off.
          </p>
          <ul className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              { k: "Realistic", v: "Driving times, opening hours, the rhythm of each region." },
              { k: "Regional", v: "We anchor a region per chapter — not a city per night." },
              { k: "Refined", v: "Pace, meals and stays adjusted with you, in real time." },
            ].map((it) => (
              <li
                key={it.k}
                className="border-l-2 border-[color:var(--gold)]/50 pl-4 py-1"
              >
                <p className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold)]">
                  {it.k}
                </p>
                <p className="mt-1.5 text-[13px] text-[color:var(--charcoal-soft)] italic leading-relaxed">
                  {it.v}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ JOURNEY STYLES ============ */}
      <section className="py-14 md:py-20">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">Journey styles</span>
            <h2 className="t-h2 mt-4 text-[color:var(--charcoal)]">
              Choose a <span className="italic text-[color:var(--teal)]">starting feeling</span>.
            </h2>
            <p className="mt-3 text-[13px] md:text-[14px] text-[color:var(--charcoal-soft)] italic">
              Six directions to begin from — each shaped by real regions and pace. Your local guide
              refines the rest.
            </p>
          </div>

          <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {JOURNEY_STYLES.map((j) => (
              <li key={j.id}>
                <Link
                  to="/builder"
                  search={{ journey: j.builderHint } as never}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-sm ring-1 ring-[color:var(--border)] hover:ring-[color:var(--teal)]/50 transition-all"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.05]"
                    style={{ backgroundImage: `url(${j.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2 py-1 bg-black/40 backdrop-blur-sm text-white/90 text-[10px] uppercase tracking-[0.22em]">
                    <j.icon size={11} className="text-[color:var(--gold-soft)]" />
                    Journey
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                    <h3 className="serif text-[20px] md:text-[22px] text-white leading-tight">
                      {j.title}
                    </h3>
                    <p className="mt-1.5 text-[12.5px] text-white/85 italic leading-snug">
                      {j.line}
                    </p>
                    <p className="mt-2.5 text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold-soft)] flex items-center gap-1.5">
                      <MapPin size={10} /> {j.arc}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ SAMPLE FLOW MAP ============ */}
      <section className="py-14 md:py-20 bg-[color:var(--charcoal-deep)] text-[color:var(--ivory)]">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[10px] uppercase tracking-[0.32em] text-[color:var(--gold-soft)]">
              An example flow
            </span>
            <h2 className="t-h2 mt-4 text-white">
              How a <span className="italic text-[color:var(--gold-soft)]">5-day journey</span> can move.
            </h2>
            <p className="mt-3 text-[13px] md:text-[14px] text-white/70 italic">
              A schematic — your real route is shaped with you, around your rhythm and the season.
            </p>
          </div>

          <SampleJourneyMap />
        </div>
      </section>

      {/* ============ BUILDER INTEGRATION ============ */}
      <section className="py-14 md:py-20">
        <div className="container-x max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
            <div>
              <span className="eyebrow">Studio Builder</span>
              <h2 className="t-h2 mt-4 text-[color:var(--charcoal)]">
                Open the Studio
                <br />
                <span className="italic text-[color:var(--teal)]">in multi-day mode</span>.
              </h2>
              <p className="mt-4 text-[14px] text-[color:var(--charcoal-soft)] leading-relaxed">
                Set a duration, a region, a rhythm — and watch the journey appear in real time on the
                map and timeline. Adjust days, swap stops, slow the pace. Confirm when it feels right.
              </p>
              <ul className="mt-5 space-y-2 text-[13px] text-[color:var(--charcoal-soft)]">
                {[
                  "Realistic regional day blocks",
                  "Live map with your route drawn day by day",
                  "Storytelling timeline that updates as you build",
                  "Instant confirmation — no forms, no waiting",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <Sparkles size={13} className="text-[color:var(--gold)] mt-1 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/builder"
                className="mt-7 inline-flex items-center gap-2 bg-[color:var(--teal)] hover:bg-[color:var(--teal-2)] text-[color:var(--ivory)] px-6 py-3.5 text-[11px] uppercase tracking-[0.22em] transition-colors"
              >
                Build Your Multi-Day Journey <ArrowRight size={13} />
              </Link>
            </div>
            <div className="relative aspect-[4/5] md:aspect-[4/5] rounded-sm overflow-hidden ring-1 ring-[color:var(--border)] order-first md:order-last">
              <img
                src={expCoastal}
                alt="A coastal day on a Portugal multi-day journey"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold-soft)]">
                  Day three · sample
                </p>
                <p className="serif text-[18px] mt-1 leading-tight">
                  Arrábida coast, lunch at Portinho, slow drive into the Alentejo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HUMAN GUIDANCE ============ */}
      <section className="py-12 md:py-16 bg-[color:var(--sand)]">
        <div className="container-x max-w-2xl text-center">
          <MessageCircle size={20} className="mx-auto text-[color:var(--teal)]" />
          <h2 className="serif text-[22px] md:text-3xl mt-3 leading-tight text-[color:var(--charcoal)]">
            A local can refine the route <span className="italic text-[color:var(--teal)]">in real time</span>.
          </h2>
          <p className="mt-3 text-[13px] md:text-[14px] text-[color:var(--charcoal-soft)] italic leading-relaxed">
            Tell us what you have in mind — a season, a celebration, a place you've been dreaming of —
            and a local will shape the journey with you, message by message.
          </p>
          <a
            href={whatsappHref("Hi! I'd love a local's help shaping a multi-day Portugal journey.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center gap-2 bg-[color:var(--charcoal)] hover:bg-[color:var(--charcoal-deep)] text-[color:var(--ivory)] px-6 py-3.5 text-[11px] uppercase tracking-[0.22em] transition-colors"
          >
            <MessageCircle size={13} /> Ask a local
          </a>
        </div>
      </section>

      {/* ============ DAY-BY-DAY PICKER (secondary tool) ============ */}
      <section className="py-14 md:py-20">
        <div className="container-x max-w-3xl">
          <div className="text-center">
            <span className="eyebrow">Or build day by day</span>
            <h2 className="serif text-[24px] md:text-3xl mt-4 leading-tight text-[color:var(--charcoal)]">
              Pick a <span className="italic text-[color:var(--teal)]">Signature</span> for each day.
            </h2>
            <p className="mt-3 text-[13px] text-[color:var(--charcoal-soft)] italic">
              A faster way to sketch a journey from tours we already run. We'll refine the flow with you.
            </p>
          </div>

          {/* Trip basics */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <ol className="mt-6 space-y-3">
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

          {/* Confirm */}
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
              <MessageCircle size={16} /> Confirm with a local
            </a>
            <p className="mt-2 text-[11px] text-[color:var(--charcoal-soft)] text-center">
              Secure booking directly on our website through our integrated booking system.
            </p>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="py-16 md:py-24 bg-[color:var(--charcoal)] text-[color:var(--ivory)]">
        <div className="container-x max-w-2xl text-center">
          <span className="text-[10px] uppercase tracking-[0.32em] text-[color:var(--gold-soft)]">
            Ready when you are
          </span>
          <h2 className="serif text-[28px] md:text-5xl mt-4 leading-[1.1]">
            Whatever you have in mind,
            <br />
            <span className="italic text-[color:var(--gold-soft)]">we say yes.</span>
          </h2>
          <Link
            to="/builder"
            className="mt-7 inline-flex items-center justify-center gap-2 bg-[color:var(--ivory)] text-[color:var(--charcoal)] px-7 py-3.5 text-[11px] uppercase tracking-[0.22em] hover:bg-white transition-colors"
          >
            Build Your Multi-Day Journey <ArrowRight size={13} />
          </Link>
          <p className="mt-4 text-[10px] uppercase tracking-[0.28em] text-white/55">
            Instant confirmation · designed by locals
          </p>
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

/* ============================================================
   Sample journey map — schematic, not a fake exact route
   ============================================================ */

const SAMPLE_DAYS: { day: number; label: string; place: string; line: string; x: number; y: number }[] = [
  { day: 1, label: "Lisbon · arrival", place: "Lisbon", line: "Tagus light, tiles, an evening table by the river.", x: 30, y: 52 },
  { day: 2, label: "Sintra hills", place: "Sintra", line: "Mossy gardens, palaces in mist, a quiet lunch in the village.", x: 22, y: 48 },
  { day: 3, label: "Arrábida coast", place: "Arrábida", line: "Family wineries, Portinho da Arrábida, the sea writing the day.", x: 36, y: 60 },
  { day: 4, label: "Coastal Alentejo", place: "Comporta", line: "Rice fields, cork oaks, dunes that stretch into evening.", x: 40, y: 70 },
  { day: 5, label: "Évora & countryside", place: "Évora", line: "A walled city, long lunch under vines, a slow farewell.", x: 56, y: 64 },
];

function SampleJourneyMap() {
  const [active, setActive] = useState<number>(0);
  const cur = SAMPLE_DAYS[active];

  // Build a connecting path between pins
  const path = SAMPLE_DAYS.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-5 items-stretch">
      {/* MAP */}
      <div className="lg:col-span-3 relative aspect-[4/5] sm:aspect-[16/12] lg:aspect-auto rounded-sm overflow-hidden ring-1 ring-white/10 bg-[color:var(--charcoal)]">
        {/* Stylized Portugal canvas */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
        >
          {/* sea */}
          <rect x="0" y="0" width="100" height="100" fill="#0a1f24" />
          {/* schematic Portugal blob */}
          <path
            d="M18 20 L48 16 L62 24 L66 38 L60 52 L62 66 L52 80 L40 88 L28 84 L20 70 L16 52 L14 36 Z"
            fill="#1a3338"
            stroke="rgba(201,169,106,0.25)"
            strokeWidth="0.4"
          />
          {/* route path */}
          <path
            d={path}
            fill="none"
            stroke="rgba(201,169,106,0.85)"
            strokeWidth="0.6"
            strokeDasharray="1.5 1.2"
            strokeLinecap="round"
          />
        </svg>

        {/* Pins (HTML over SVG so they stay crisp & tappable) */}
        {SAMPLE_DAYS.map((p, i) => {
          const isActive = i === active;
          return (
            <button
              key={p.day}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Day ${p.day}: ${p.label}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <span
                className={`relative grid place-items-center h-8 w-8 rounded-full transition-all ${
                  isActive
                    ? "bg-[color:var(--gold)] text-[color:var(--charcoal-deep)] scale-110 shadow-[0_6px_20px_rgba(201,169,106,0.55)]"
                    : "bg-[color:var(--ivory)]/95 text-[color:var(--charcoal)] group-hover:bg-[color:var(--gold)]/80"
                }`}
              >
                <span className="serif text-[12px] font-semibold">{p.day}</span>
                {isActive && (
                  <span className="absolute inset-0 rounded-full bg-[color:var(--gold)]/40 animate-ping" />
                )}
              </span>
            </button>
          );
        })}

        <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/40 backdrop-blur-sm text-white/85 text-[10px] uppercase tracking-[0.22em]">
          Sample · 5 days
        </div>
        <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/40 backdrop-blur-sm text-white/70 text-[10px] uppercase tracking-[0.22em]">
          Schematic — not exact
        </div>
      </div>

      {/* DAY DETAILS */}
      <div className="lg:col-span-2 flex flex-col">
        <div className="flex-1 bg-white/[0.04] border border-white/10 p-5 md:p-6 rounded-sm">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold-soft)]">
            Day {cur.day} · {cur.place}
          </p>
          <h3 className="serif text-[22px] md:text-2xl text-white mt-2 leading-tight">
            {cur.label}
          </h3>
          <p className="mt-3 text-[13.5px] text-white/75 italic leading-relaxed border-l-2 border-[color:var(--gold)]/50 pl-3">
            {cur.line}
          </p>

          <ol className="mt-5 space-y-1.5">
            {SAMPLE_DAYS.map((p, i) => (
              <li key={p.day}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  className={`w-full text-left text-[12px] uppercase tracking-[0.18em] py-1.5 px-2 rounded-sm flex items-center gap-2 transition-colors ${
                    i === active
                      ? "bg-white/10 text-white"
                      : "text-white/55 hover:text-white/85"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      i === active ? "bg-[color:var(--gold)]" : "bg-white/30"
                    }`}
                  />
                  Day {p.day} — {p.place}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Day card + picker (kept from previous version)
   ============================================================ */

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
