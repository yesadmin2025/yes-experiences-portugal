/**
 * YES experiences Portugal — Signature Tours.
 *
 * Single source of truth used in three places:
 *   1. /experiences and /day-tours — as ready-to-explore Signature tours
 *   2. /tours/$tourId — full Signature Experience pages (story + structure)
 *   3. /builder seeds — same tours opened as a tailorable starting point
 *
 * `seed` is a Partial<BuilderState> patch the builder applies when the user
 * clicks "Tailor this experience". Keep ids in sync with builder.tsx options
 * (regionOpts, durationOpts, styleOpts, highlightOpts, paceOpts, tierOpts).
 *
 * Content is native YES copy. No external sources are referenced or linked.
 */

import expWine from "@/assets/exp-wine.jpg";
import expCoastal from "@/assets/exp-coastal.jpg";
import expGastronomy from "@/assets/exp-gastronomy.jpg";
import expNature from "@/assets/exp-nature.jpg";
import expRomantic from "@/assets/exp-romantic.jpg";
import expStreet from "@/assets/exp-street.jpg";

export type TourSeed = {
  region?: string;
  duration?: string;
  styles?: string[];
  highlights?: string[];
  pace?: string;
  tier?: string;
  groupType?: string;
  guests?: string;
};

/** A single stop along a Signature tour. The `imageTheme` maps to one of the
 *  six curated photo assets so every stop gets a consistent visual cue
 *  without generating dozens of bespoke images. */
export type TourStop = {
  label: string;
  story: string;
  imageTheme: "wine" | "coastal" | "gastronomy" | "nature" | "romantic" | "street";
};

export type SignatureTour = {
  id: string;
  title: string;
  region: string;       // display label
  duration: string;     // display label
  durationHours: string;
  priceFrom: number;    // EUR — guide price, final cost confirmed on enquiry
  theme: string;
  /** One-line card teaser. */
  blurb: string;
  /** 2–3 sentence emotional opening for the detail page. */
  intro: string;
  fitsBest: string;     // "Couples · families · slow travelers"
  /** Short pace cues used on cards and as the simple stop list in tailor form. */
  pace: string[];
  /** Story-driven stop sequence shown on the Signature page. */
  stops: TourStop[];
  /** Bullet highlights — what makes this day memorable. */
  highlights: string[];
  /** What's included in the experience. */
  included: string[];
  /** Who this experience suits best. */
  idealFor: string[];
  /** Optional planning notes (season, mobility, kids, etc.). */
  notes: string[];
  img: string;
  /** Internal reference — used by the importer to match live image assets and
   *  by the admin tools. NOT shown to visitors and never linked externally. */
  bookingUrl: string;
  /** Deprecated — kept for type compatibility with older importer code. */
  tripadvisorUrl?: string;
  seed: TourSeed;       // pre-fills the builder
};

/**
 * Deprecated — kept only so older imports compile. The site no longer links to
 * any external review platform from tour pages.
 */
export function tripadvisorHrefFor(tour: SignatureTour): string {
  return tour.tripadvisorUrl ?? "";
}

export function findTour(id: string): SignatureTour | undefined {
  return signatureTours.find((t) => t.id === id);
}

export const signatureTours: SignatureTour[] = [
  {
    id: "arrabida-boat",
    title: "Arrábida & Sesimbra by Boat",
    region: "Setúbal · Arrábida",
    duration: "Full Day",
    durationHours: "8–9h",
    priceFrom: 139,
    theme: "Coastal",
    blurb:
      "From the Setúbal market at first light to the hidden coves of Arrábida by boat, lunch in Portinho and dusk in Sesimbra.",
    intro:
      "A day told by the sea. We start where the locals do — among fish stalls and fresh bread at the Livramento market — then trade the coast road for a private boat into the turquoise coves of the Arrábida Natural Park. By the time the sun softens, you're walking Sesimbra's harbour with sand still on your feet.",
    fitsBest: "Couples · families · active travelers",
    pace: ["Setúbal market", "Boat in Arrábida", "Sesimbra at dusk"],
    stops: [
      {
        label: "Livramento Market",
        story: "Coffee, pastel de nata and a slow walk past the famous tile-clad fish counters.",
        imageTheme: "gastronomy",
      },
      {
        label: "Arrábida coves by boat",
        story: "Private boat into the park's secret beaches — swim, snorkel or simply drift.",
        imageTheme: "coastal",
      },
      {
        label: "Lunch in Portinho",
        story: "A long lunch by the water — grilled fish, white wine, no rush.",
        imageTheme: "nature",
      },
      {
        label: "Sesimbra at dusk",
        story: "The fishing village glows. Time for a final stroll along the harbour.",
        imageTheme: "coastal",
      },
    ],
    highlights: [
      "Private boat into Arrábida's hidden coves",
      "Local market breakfast in Setúbal",
      "Swim, snorkel or kayak in turquoise water",
      "Seafood lunch by the harbour in Portinho",
      "Golden-hour walk in Sesimbra",
    ],
    included: [
      "Private guide and driver",
      "Hotel pickup and drop-off in Lisbon",
      "Private boat tour in Arrábida",
      "Snorkel gear when sea conditions allow",
      "All transport and tolls",
    ],
    idealFor: [
      "Couples wanting a slow, sea-led day",
      "Active families with older children",
      "Travelers who prefer landscape over cities",
    ],
    notes: [
      "Boat departures depend on sea conditions — your guide reroutes naturally if needed.",
      "Bring swimwear and a light layer for the boat.",
    ],
    img: expCoastal,
    bookingUrl:
      "https://yesexperiences.pt/tour/private-full-day-arrabida-and-sesimbra-with-included-boat-tour-from-lisbon/",
    seed: {
      region: "lisbon",
      duration: "fullday",
      styles: ["coastal", "nature"],
      highlights: ["livramento", "boat", "portinho", "sesimbra", "viewpoint"],
      pace: "balanced",
      tier: "signature",
    },
  },
  {
    id: "wine-setubal",
    title: "Setúbal & Arrábida Wine Day",
    region: "Setúbal · Azeitão",
    duration: "Full Day",
    durationHours: "8–9h",
    priceFrom: 109,
    theme: "Wine",
    blurb:
      "Cross the Tagus, taste at two family wineries in Azeitão, lunch overlooking Arrábida, end at the Livramento market.",
    intro:
      "Wine here isn't a tasting room — it's a family kitchen, a centuries-old cellar, a glass poured by the person who pressed the grapes. We wind from the Cristo Rei viewpoint into Azeitão's small estates, then stretch lunch into the afternoon with the Arrábida hills behind us.",
    fitsBest: "Wine lovers · couples · small groups",
    pace: ["Cristo Rei view", "Two wineries", "Long lunch"],
    stops: [
      {
        label: "Cristo Rei viewpoint",
        story: "First stop above the river — Lisbon laid out, the bridge gleaming below.",
        imageTheme: "romantic",
      },
      {
        label: "Azeitão family winery",
        story: "A small estate, generations deep. Cellar walk and a guided tasting.",
        imageTheme: "wine",
      },
      {
        label: "Long Arrábida lunch",
        story: "Regional plates and pairings, the natural park visible through the windows.",
        imageTheme: "gastronomy",
      },
      {
        label: "Second tasting",
        story: "A different style, a different family — finishing with a Moscatel.",
        imageTheme: "wine",
      },
      {
        label: "Livramento Market",
        story: "Last stop: the prettiest food market in Portugal, just before closing.",
        imageTheme: "street",
      },
    ],
    highlights: [
      "Two private tastings at family-run wineries",
      "Cristo Rei panorama over Lisbon",
      "Long lunch with regional pairings",
      "Visit to the Livramento tile-clad market",
      "All driving and pours handled — you only sip",
    ],
    included: [
      "Private guide and driver",
      "Hotel pickup and drop-off in Lisbon",
      "Two winery tastings",
      "Lunch with paired wines",
      "All tolls and transport",
    ],
    idealFor: [
      "Couples celebrating a small occasion",
      "Wine-curious travelers (no expertise needed)",
      "Friends wanting a relaxed day out of the city",
    ],
    notes: [
      "Designation of origin in Setúbal is famous for Moscatel — your guide tailors the order to your palate.",
    ],
    img: expWine,
    bookingUrl:
      "https://yesexperiences.pt/tour/private-full-day-wine-tour-setubal-arrabida/",
    seed: {
      region: "lisbon",
      duration: "fullday",
      styles: ["wine", "gastronomy"],
      highlights: ["tasting", "livramento", "portinho", "viewpoint"],
      pace: "balanced",
      tier: "signature",
    },
  },
  {
    id: "azeitao-cheese",
    title: "Azeitão Cheese & Wine Workshop",
    region: "Azeitão · Sesimbra",
    duration: "Full Day",
    durationHours: "8–9h",
    priceFrom: 75,
    theme: "Gastronomy",
    blurb:
      "Hands-on cheese making in Azeitão, a private winery tasting next door, then sea air and seafood in Sesimbra.",
    intro:
      "You won't watch — you'll work. In a small Azeitão dairy, hands deep in fresh curd, you shape the cheese that built this village's reputation. The afternoon answers with wine from the next farm and a quiet table by the sea in Sesimbra.",
    fitsBest: "Foodies · couples · curious first-timers",
    pace: ["Cheese workshop", "Winery tasting", "Sesimbra"],
    stops: [
      {
        label: "Hands-on cheese workshop",
        story: "Fresh sheep's milk, a wooden mould, your initials. You take a wheel home.",
        imageTheme: "gastronomy",
      },
      {
        label: "Local winery tasting",
        story: "Three glasses, a quiet patio, a producer who happily talks all afternoon.",
        imageTheme: "wine",
      },
      {
        label: "Sesimbra by the sea",
        story: "A coastal walk, fresh fish, and time slowing down with the tide.",
        imageTheme: "coastal",
      },
    ],
    highlights: [
      "Make your own queijo de Azeitão to take home",
      "Private tasting at a small winery",
      "Lunch or seafood snack in Sesimbra",
      "Meet the people behind both crafts",
    ],
    included: [
      "Private guide and driver",
      "Hotel pickup and drop-off in Lisbon",
      "Cheese-making workshop with materials",
      "Winery tasting",
      "All transport and tolls",
    ],
    idealFor: [
      "Foodies who like to use their hands",
      "Couples and small groups of friends",
      "Anyone curious about Portuguese craft",
    ],
    notes: [
      "Vegetarian-friendly. Vegan or dairy-free guests can join the workshop and skip tastings — let us know in advance.",
    ],
    img: expGastronomy,
    bookingUrl:
      "https://yesexperiences.pt/tour/journey-through-azeitao-a-unique-cheese-making-and-wine-tasting-day-out/",
    seed: {
      region: "lisbon",
      duration: "fullday",
      styles: ["gastronomy", "wine"],
      highlights: ["cheese", "tasting", "sesimbra"],
      pace: "slow",
      tier: "signature",
    },
  },
  {
    id: "tiles-workshop",
    title: "Azulejo Painting & Sesimbra Coast",
    region: "Azeitão · Sesimbra",
    duration: "Full Day",
    durationHours: "7–8h",
    priceFrom: 79,
    theme: "Heritage",
    blurb:
      "Paint your own azulejo in a 16th-century atelier, taste a local wine next door, then unwind in Sesimbra.",
    intro:
      "Five centuries of tile-making in one quiet courtyard. You meet the master, mix the cobalt blue, and paint a single azulejo that becomes yours forever. The rest of the day softens — a glass of local wine, then the salt and sun of Sesimbra.",
    fitsBest: "Couples · creatives · families with teens",
    pace: ["Tile atelier", "Wine tasting", "Sesimbra coast"],
    stops: [
      {
        label: "Tile painting in a 16th-c. atelier",
        story: "Brush, glaze, fire — and a piece of Portugal you'll mail home.",
        imageTheme: "street",
      },
      {
        label: "Wine tasting next door",
        story: "Three Setúbal wines on a shaded patio, the kilns still warm behind you.",
        imageTheme: "wine",
      },
      {
        label: "Sesimbra coast",
        story: "End the day where the fishermen do — a quiet walk, sea air, easy plates.",
        imageTheme: "coastal",
      },
    ],
    highlights: [
      "Paint your own azulejo in a 16th-century atelier",
      "Take home a kiln-fired tile",
      "Tasting of three Setúbal wines",
      "Walk and lunch along Sesimbra's harbour",
    ],
    included: [
      "Private guide and driver",
      "Hotel pickup and drop-off in Lisbon",
      "Tile-painting workshop with all materials and shipping",
      "Wine tasting",
      "All transport and tolls",
    ],
    idealFor: [
      "Couples and creative travelers",
      "Families with teenagers",
      "First-time visitors curious about craft",
    ],
    notes: [
      "Tiles are fired after you leave and shipped to your home address — included.",
    ],
    img: expStreet,
    bookingUrl:
      "https://yesexperiences.pt/tour/tiles-painting-workshop-with-wine-tasting-and-sesimbra-private-tour/",
    seed: {
      region: "lisbon",
      duration: "fullday",
      styles: ["heritage", "wine"],
      highlights: ["tiles", "tasting", "sesimbra"],
      pace: "slow",
      tier: "signature",
    },
  },
  {
    id: "jeep-picnic",
    title: "Arrábida 4×4 & Beach Picnic",
    region: "Arrábida · Sesimbra",
    duration: "Full Day",
    durationHours: "7–8h",
    priceFrom: 99,
    theme: "Nature",
    blurb:
      "Off-road through Arrábida's hidden trails to viewpoints no bus reaches, then a picnic on a quiet cove.",
    intro:
      "The good parts of Arrábida aren't on the postcards. We take an open 4×4 onto the dirt tracks behind the ridge — to the viewpoints locals keep to themselves — then drop down to a quiet cove for a picnic with the park as the backdrop.",
    fitsBest: "Families · friends · adventurers",
    pace: ["4×4 trails", "Hidden beach picnic", "Secret viewpoint"],
    stops: [
      {
        label: "Off-road into Arrábida",
        story: "An open 4×4, dust on the tracks, the sea opening below at every bend.",
        imageTheme: "nature",
      },
      {
        label: "Picnic on a hidden cove",
        story: "Local cheese, bread, fruit, chilled wine — set on a beach you'll have mostly to yourselves.",
        imageTheme: "coastal",
      },
      {
        label: "Secret viewpoint",
        story: "The park's best balcony — kept quiet, never on the bus routes.",
        imageTheme: "nature",
      },
    ],
    highlights: [
      "Open-top 4×4 across Arrábida's back trails",
      "Beach picnic with local produce and wine",
      "Viewpoints reserved for small groups",
      "Stop in Sesimbra on the way back",
    ],
    included: [
      "Private 4×4 with driver-guide",
      "Hotel pickup and drop-off in Lisbon",
      "Beach picnic with local food and wine",
      "All transport and park access",
    ],
    idealFor: [
      "Active couples and friends",
      "Families with kids 6+",
      "Travelers who want fewer crowds, more landscape",
    ],
    notes: [
      "Some trails close in winter rain — your guide chooses the best route on the day.",
    ],
    img: expNature,
    bookingUrl:
      "https://yesexperiences.pt/tour/4x4-jeep-and-beach-private-tour-in-arrabida-sesimbra-with-picnic/",
    seed: {
      region: "lisbon",
      duration: "fullday",
      styles: ["nature", "coastal"],
      highlights: ["jeep", "viewpoint", "portinho"],
      pace: "balanced",
      tier: "signature",
    },
  },
  {
    id: "off-beaten",
    title: "Arrábida 4×4 & Cabo Espichel Cliffs",
    region: "Arrábida · Cabo Espichel",
    duration: "Half Day +",
    durationHours: "6–7h",
    priceFrom: 79,
    theme: "Nature",
    blurb:
      "A 4×4 deep into Arrábida, the dramatic Cabo Espichel cliffs and 150-million-year-old dinosaur footprints.",
    intro:
      "End-of-the-world cliffs and prints left by dinosaurs in the rock. We follow Arrábida's quiet trails out to Cabo Espichel — abandoned pilgrim village, sheer drop to the Atlantic — and walk down to the fossil tracks left when this coast was a riverbank.",
    fitsBest: "Families · curious minds · explorers",
    pace: ["Off-road Arrábida", "Cabo Espichel cliffs", "Dinosaur prints"],
    stops: [
      {
        label: "Off-road through Arrábida",
        story: "Trails through cork oaks and lavender, sea views opening every few minutes.",
        imageTheme: "nature",
      },
      {
        label: "Cabo Espichel cliffs",
        story: "The pilgrim sanctuary on the edge — wind, gulls, and a sheer drop.",
        imageTheme: "coastal",
      },
      {
        label: "Dinosaur footprints",
        story: "Real prints in the cliff face — 150 million years old, surprisingly clear.",
        imageTheme: "nature",
      },
    ],
    highlights: [
      "Open-top 4×4 across Arrábida",
      "End-of-the-world cliffs at Cabo Espichel",
      "Real dinosaur footprints in the rock",
      "Almost no crowds, even in summer",
    ],
    included: [
      "Private 4×4 with driver-guide",
      "Hotel pickup and drop-off in Lisbon",
      "All transport and access",
      "Bottled water on board",
    ],
    idealFor: [
      "Families with curious kids",
      "Travelers who want landscape over villages",
      "Anyone who's already seen Sintra and wants something new",
    ],
    notes: [
      "Walking shoes recommended — the descent to the fossil tracks is short but uneven.",
    ],
    img: expCoastal,
    bookingUrl:
      "https://yesexperiences.pt/tour/private-tour-in-arrabida-sesimbra-and-dinosaur-footprints/",
    seed: {
      region: "lisbon",
      duration: "fullday",
      styles: ["nature"],
      highlights: ["jeep", "dinosaur", "viewpoint"],
      pace: "balanced",
      tier: "signature",
    },
  },
  {
    id: "sintra-cascais",
    title: "Sintra & Cascais — Hidden Gems",
    region: "Lisbon Coast",
    duration: "Full Day",
    durationHours: "8–9h",
    priceFrom: 75,
    theme: "Heritage",
    blurb:
      "Sintra's quieter palaces and forests, the wild westernmost coast, Cascais lanes and a private wine tasting.",
    intro:
      "Sintra without the queues. We slip into the smaller estates, walk the forest paths most visitors never find, then chase the cliffs to Cabo da Roca — the western edge of Europe — before easing into Cascais and a glass of wine in a quiet courtyard.",
    fitsBest: "Couples · culture lovers · first-timers",
    pace: ["Sintra forests", "Westernmost coast", "Cascais tasting"],
    stops: [
      {
        label: "Sintra's hidden estates",
        story: "Quiet gardens, the romantic palaces — without the bus-tour crush.",
        imageTheme: "romantic",
      },
      {
        label: "Cabo da Roca",
        story: "The western edge of Europe. Wind, cliffs, the Atlantic stretched flat.",
        imageTheme: "coastal",
      },
      {
        label: "Cascais courtyard tasting",
        story: "A small bar in the old town, three local wines, no rush to leave.",
        imageTheme: "wine",
      },
    ],
    highlights: [
      "Quieter Sintra route — palaces without the queues",
      "Westernmost point of mainland Europe",
      "Walk through Cascais's old fishing town",
      "Private wine tasting in a local courtyard",
    ],
    included: [
      "Private guide and driver",
      "Hotel pickup and drop-off in Lisbon",
      "Private wine tasting",
      "All transport and tolls",
    ],
    idealFor: [
      "Couples on a first trip to Portugal",
      "Culture lovers who hate tourist queues",
      "Travelers with limited time who want depth, not a rush",
    ],
    notes: [
      "Palace interior tickets are optional — your guide books them on request.",
    ],
    img: expRomantic,
    bookingUrl:
      "https://yesexperiences.pt/tour/hidden-gems-sintra-cascais-private-tour-with-wine-tasting/",
    seed: {
      region: "lisbon",
      duration: "fullday",
      styles: ["heritage", "coastal"],
      highlights: ["tasting", "viewpoint"],
      pace: "balanced",
      tier: "signature",
    },
  },
  {
    id: "evora-alentejo",
    title: "Évora & Alentejo Wine Country",
    region: "Alentejo",
    duration: "Long Day",
    durationHours: "9–11h",
    priceFrom: 149,
    theme: "Wine",
    blurb:
      "Roman temples and the Chapel of Bones in Évora, then Alentejo wineries and a slow lunch in vineyard country.",
    intro:
      "Alentejo unwinds you. Plains of cork oaks, white-washed villages, and a city — Évora — that's quietly held two thousand years of history together. We walk it slowly, then disappear into the wineries that have been quietly making some of Portugal's best reds.",
    fitsBest: "History buffs · wine lovers · couples",
    pace: ["Évora old town", "Chapel of Bones", "Alentejo winery"],
    stops: [
      {
        label: "Évora old town",
        story: "Roman temple, cathedral, narrow streets — a city that earns its UNESCO listing.",
        imageTheme: "street",
      },
      {
        label: "Chapel of Bones",
        story: "Strange, quiet, unforgettable — the monks built it from bones to remember.",
        imageTheme: "street",
      },
      {
        label: "Alentejo winery & lunch",
        story: "A long, vineyard-side lunch with the wines made on the same estate.",
        imageTheme: "wine",
      },
    ],
    highlights: [
      "Walking tour of UNESCO Évora",
      "The famous Chapel of Bones",
      "Tasting and lunch at an Alentejo winery",
      "Drive through cork-oak country",
    ],
    included: [
      "Private guide and driver",
      "Hotel pickup and drop-off in Lisbon",
      "Winery tasting and lunch",
      "All transport and tolls",
    ],
    idealFor: [
      "History and architecture lovers",
      "Couples wanting a quieter, slower day",
      "Travelers chasing the next great Portuguese red",
    ],
    notes: [
      "It's a long day — pickup typically at 8:00, return after 19:00. Worth it.",
    ],
    img: expWine,
    bookingUrl:
      "https://yesexperiences.pt/tour/private-full-day-evora-and-alentejo-wine-tour-from-lisbon/",
    seed: {
      region: "alentejo",
      duration: "fullday",
      styles: ["heritage", "wine"],
      highlights: ["tasting"],
      pace: "balanced",
      tier: "signature",
    },
  },
  {
    id: "tomar-coimbra",
    title: "Tomar & Coimbra — Templar Day",
    region: "Centro",
    duration: "Full Day",
    durationHours: "8–9h",
    priceFrom: 129,
    theme: "Heritage",
    blurb:
      "The Templar Convento de Cristo in Tomar, then Coimbra's ancient university and old town along the Mondego.",
    intro:
      "Two cities, eight centuries, one quiet day inland. Tomar holds the Templar convent that shaped Portugal's discoveries; Coimbra holds the oldest university library in the country. Between them, a slow lunch and a river that has watched it all.",
    fitsBest: "History lovers · couples · culture seekers",
    pace: ["Tomar Templar convent", "Coimbra University", "Old town walk"],
    stops: [
      {
        label: "Convento de Cristo, Tomar",
        story: "The Templar fortress — round church, manueline window, layers of orders.",
        imageTheme: "street",
      },
      {
        label: "Coimbra University",
        story: "The Joanina library, the law students' black capes, the bell over the river.",
        imageTheme: "romantic",
      },
      {
        label: "Old town along the Mondego",
        story: "Steep lanes, a fado bar, an easy walk back to the car as the river turns gold.",
        imageTheme: "street",
      },
    ],
    highlights: [
      "Private visit to Tomar's Templar convent",
      "Coimbra University and the Joanina library",
      "Walk along the Mondego",
      "Lunch in a quiet inland town",
    ],
    included: [
      "Private guide and driver",
      "Hotel pickup and drop-off in Lisbon",
      "All transport and tolls",
    ],
    idealFor: [
      "History and heritage lovers",
      "Couples on a longer Portugal trip",
      "Travelers who already know Sintra and Évora",
    ],
    notes: [
      "Library entry has timed slots — your guide pre-books on the day.",
    ],
    img: expStreet,
    bookingUrl:
      "https://yesexperiences.pt/tour/private-private-full-day-tour-from-lisbon-to-tomar-coimbra/",
    seed: {
      region: "alentejo",
      duration: "fullday",
      styles: ["heritage"],
      highlights: ["viewpoint"],
      pace: "balanced",
      tier: "signature",
    },
  },
  {
    id: "fatima-nazare-obidos",
    title: "Fátima · Nazaré · Óbidos",
    region: "Centro · Coast",
    duration: "Full Day",
    durationHours: "8–9h",
    priceFrom: 75,
    theme: "Heritage",
    blurb:
      "The Sanctuary of Fátima, the giant waves of Nazaré, the medieval lanes of Óbidos and a Ginjinha tasting.",
    intro:
      "Three landmarks, one perfectly composed day. Faith in Fátima, the awe of Nazaré's giant Atlantic waves, and the medieval streets of Óbidos finished off with a small ceramic cup of cherry liqueur.",
    fitsBest: "Pilgrims · couples · families",
    pace: ["Fátima sanctuary", "Nazaré cliffs", "Óbidos & Ginjinha"],
    stops: [
      {
        label: "Sanctuary of Fátima",
        story: "Quiet time at the chapel of apparitions — pilgrims, candles, peace.",
        imageTheme: "street",
      },
      {
        label: "Nazaré cliffs",
        story: "The lighthouse over the canyon that makes the world's biggest waves.",
        imageTheme: "coastal",
      },
      {
        label: "Óbidos & Ginjinha",
        story: "Medieval walls, narrow lanes, cherry liqueur in a chocolate cup.",
        imageTheme: "romantic",
      },
    ],
    highlights: [
      "Time for reflection at the Fátima sanctuary",
      "The famous Nazaré big-wave viewpoint",
      "Walk inside Óbidos's medieval walls",
      "Ginjinha tasting in a chocolate cup",
    ],
    included: [
      "Private guide and driver",
      "Hotel pickup and drop-off in Lisbon",
      "Ginjinha tasting",
      "All transport and tolls",
    ],
    idealFor: [
      "Pilgrims and faith travelers",
      "Families with mixed interests",
      "First-time visitors looking for variety in one day",
    ],
    notes: [
      "Big waves at Nazaré peak in winter — but the cliff view is stunning year-round.",
    ],
    img: expCoastal,
    bookingUrl:
      "https://yesexperiences.pt/tour/private-full-day-tour-from-lisbon-discover-fatima-nazare-and-obidos/",
    seed: {
      region: "alentejo",
      duration: "fullday",
      styles: ["heritage"],
      highlights: ["ginjinha", "viewpoint"],
      pace: "balanced",
      tier: "signature",
    },
  },
  {
    id: "douro-private",
    title: "Douro Valley — Private Full Day",
    region: "Porto · Douro",
    duration: "Full Day",
    durationHours: "9h",
    priceFrom: 350,
    theme: "Wine",
    blurb:
      "Schist terraces, a river cruise on the Douro, two family quintas and lunch with a winemaker.",
    intro:
      "The valley that invented Port wine — and the world's oldest demarcated wine region. We climb between schist terraces, board a small boat on the river itself, and sit down to lunch where the winemaker pours the next glass himself.",
    fitsBest: "Couples · wine lovers · special occasions",
    pace: ["Quinta visit", "River cruise", "Winemaker lunch"],
    stops: [
      {
        label: "First quinta of the day",
        story: "A tour of the cellar, a tasting on the terrace, the river curving below.",
        imageTheme: "wine",
      },
      {
        label: "Douro river cruise",
        story: "An hour on the water — the only way to truly read the terraces.",
        imageTheme: "nature",
      },
      {
        label: "Winemaker lunch",
        story: "Local plates, six glasses, the person who made the wine at your table.",
        imageTheme: "gastronomy",
      },
    ],
    highlights: [
      "Two family-run quintas, off the bus circuit",
      "Private boat ride on the Douro",
      "Lunch with paired wines and the winemaker",
      "Drive through the highest viewpoints of the valley",
    ],
    included: [
      "Private guide and driver",
      "Hotel pickup and drop-off in Porto",
      "Two winery tastings",
      "Boat cruise on the Douro",
      "Lunch with paired wines",
      "All transport and tolls",
    ],
    idealFor: [
      "Couples celebrating something",
      "Wine collectors and serious enthusiasts",
      "Travelers wanting one defining day in Portugal",
    ],
    notes: [
      "Best from late spring to October. In winter, river cruises depend on water levels.",
    ],
    img: expWine,
    bookingUrl:
      "https://yesexperiences.pt/tour/private-douro-valley-full-day-tour/",
    seed: {
      region: "porto",
      duration: "fullday",
      styles: ["wine", "gastronomy"],
      highlights: ["tasting"],
      pace: "slow",
      tier: "atelier",
    },
  },
  {
    id: "braga-guimaraes",
    title: "Braga & Guimarães — Private Day",
    region: "Minho",
    duration: "Full Day",
    durationHours: "9h",
    priceFrom: 275,
    theme: "Heritage",
    blurb:
      "Bom Jesus do Monte in Braga, the birthplace of Portugal in Guimarães — two cities, one slow Minho day.",
    intro:
      "Portugal was born here. We climb the dramatic baroque stairway of Bom Jesus, then walk into Guimarães — the medieval cradle of the country — for narrow lanes, a castle and a long northern lunch.",
    fitsBest: "Heritage travelers · couples · families",
    pace: ["Bom Jesus", "Guimarães castle", "Old quarter"],
    stops: [
      {
        label: "Bom Jesus do Monte",
        story: "The zig-zag baroque stairway, gardens at the top, city laid out below.",
        imageTheme: "romantic",
      },
      {
        label: "Guimarães castle",
        story: "The fortress where Portugal's first king was born — small, mighty, atmospheric.",
        imageTheme: "street",
      },
      {
        label: "Old quarter lunch",
        story: "Stone arcades, a long table, classic northern plates and vinho verde.",
        imageTheme: "gastronomy",
      },
    ],
    highlights: [
      "Bom Jesus do Monte sanctuary",
      "Guimarães's medieval castle and old town",
      "UNESCO-listed historic centre",
      "A long lunch with vinho verde",
    ],
    included: [
      "Private guide and driver",
      "Hotel pickup and drop-off in Porto",
      "All transport and tolls",
    ],
    idealFor: [
      "Heritage travelers",
      "Couples and small groups in the north",
      "Anyone who wants a slow, story-rich day",
    ],
    notes: [
      "Beautiful in any weather — the Minho's green is part of the experience.",
    ],
    img: expStreet,
    bookingUrl:
      "https://yesexperiences.pt/tour/private-braga-guimaraes-full-day/",
    seed: {
      region: "porto",
      duration: "fullday",
      styles: ["heritage"],
      highlights: ["viewpoint"],
      pace: "balanced",
      tier: "atelier",
    },
  },
  {
    id: "porto-city",
    title: "Porto City — Private Full Day",
    region: "Porto",
    duration: "Full Day",
    durationHours: "8–9h",
    priceFrom: 275,
    theme: "Heritage",
    blurb:
      "Ribeira lanes, São Bento, a Port wine cellar in Gaia and a panoramic ride along the Douro.",
    intro:
      "Porto is best read on foot — by the river, through the tile-clad churches, into a Port cellar where the barrels stretch back into the dark. We give the city a full, unhurried day, with a glass at sunset to finish.",
    fitsBest: "First-timers · couples · culture lovers",
    pace: ["Ribeira walk", "Port cellar", "Douro panorama"],
    stops: [
      {
        label: "Ribeira walk",
        story: "Tile facades, riverside cafés, washing lines above narrow lanes.",
        imageTheme: "street",
      },
      {
        label: "Port cellar in Gaia",
        story: "The barrels in the dark, a guided tasting, the city across the water.",
        imageTheme: "wine",
      },
      {
        label: "Douro panorama",
        story: "A panoramic drive and a sunset stop above the bridges.",
        imageTheme: "romantic",
      },
    ],
    highlights: [
      "Walking tour of Ribeira and the historic centre",
      "Visit and tasting in a Gaia Port cellar",
      "São Bento station's tile masterpieces",
      "Sunset viewpoint above the Douro",
    ],
    included: [
      "Private guide and driver",
      "Hotel pickup and drop-off in Porto",
      "Port cellar visit and tasting",
      "All transport",
    ],
    idealFor: [
      "First-time visitors to Porto",
      "Couples and culture lovers",
      "Travelers with one full day to spare",
    ],
    notes: [
      "Best paired with the Douro Valley day for travelers staying 2+ nights in Porto.",
    ],
    img: expGastronomy,
    bookingUrl:
      "https://yesexperiences.pt/tour/touch-tours-porto-city-full-day/",
    seed: {
      region: "porto",
      duration: "fullday",
      styles: ["heritage", "wine"],
      highlights: ["tasting"],
      pace: "balanced",
      tier: "atelier",
    },
  },
  {
    id: "algarve-2day",
    title: "Algarve — Benagil & the Vicentine Coast",
    region: "Algarve",
    duration: "2 Days",
    durationHours: "2 days",
    priceFrom: 349,
    theme: "Coastal",
    blurb:
      "Two days along Portugal's wildest coast: Benagil sea caves by boat, the Vicentine cliffs, hidden beaches.",
    intro:
      "The Algarve most people miss. We trade the resort beaches for the wild Vicentine coast, the Benagil sea caves at the right hour, and quiet coves you reach on foot. Two days, one private guide, one slow rhythm of cliffs and water.",
    fitsBest: "Couples · friends · slow explorers",
    pace: ["Benagil caves", "Vicentine coast", "Sunset cliffs"],
    stops: [
      {
        label: "Benagil sea caves",
        story: "A small boat into the famous cathedral cave — early, before the crowds.",
        imageTheme: "coastal",
      },
      {
        label: "Vicentine coast",
        story: "Wind-shaped cliffs, surf villages, almost-empty beaches at low season.",
        imageTheme: "nature",
      },
      {
        label: "Sunset cliffs",
        story: "A chosen viewpoint over the Atlantic — quiet, golden, ours.",
        imageTheme: "romantic",
      },
    ],
    highlights: [
      "Boat into the Benagil sea cave",
      "Drive along the wild Vicentine coast",
      "Hidden beaches reached on foot",
      "Sunset over the Atlantic from a chosen viewpoint",
    ],
    included: [
      "Private guide and driver for two days",
      "Hotel pickup in Lisbon or the Algarve",
      "Boat tour to Benagil",
      "All transport and tolls",
    ],
    idealFor: [
      "Couples and small groups",
      "Slow travelers who want depth, not a checklist",
      "Anyone who wants the Algarve at its quietest",
    ],
    notes: [
      "Accommodation is not included — we'll happily recommend small hotels we trust.",
    ],
    img: expCoastal,
    bookingUrl:
      "https://yesexperiences.pt/tour/two-day-private-algarve-tour-explore-southwest-coast-and-benagil-caves/",
    seed: {
      region: "algarve",
      duration: "twoday",
      styles: ["coastal", "nature"],
      highlights: ["boat", "viewpoint"],
      pace: "balanced",
      tier: "atelier",
    },
  },
];

/** Encode a tour seed into URL search params for /builder?seed=… */
export function seedToSearchParams(tour: SignatureTour): string {
  const params = new URLSearchParams();
  params.set("tour", tour.id);
  return params.toString();
}

/** Theme → curated photo asset, used by per-stop contextual images. */
export const STOP_THEME_IMG: Record<TourStop["imageTheme"], string> = {
  wine: expWine,
  coastal: expCoastal,
  gastronomy: expGastronomy,
  nature: expNature,
  romantic: expRomantic,
  street: expStreet,
};
