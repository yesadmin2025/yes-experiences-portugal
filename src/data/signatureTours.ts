/**
 * Real Yes!experiences Portugal tours.
 *
 * Single source of truth used in TWO places:
 *   1. /experiences and /day-tours — as ready-to-book Signature tours
 *   2. /builder seeds — same tours opened as a tailorable starting point
 *
 * `seed` is a Partial<BuilderState> patch the builder applies when the user
 * clicks "Tailor this experience". Keep ids in sync with builder.tsx options
 * (regionOpts, durationOpts, styleOpts, highlightOpts, paceOpts, tierOpts).
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

export type SignatureTour = {
  id: string;
  title: string;
  region: string;       // display label
  duration: string;     // display label
  durationHours: string;
  priceFrom: number;    // EUR
  theme: string;
  blurb: string;
  fitsBest: string;     // "Couples · families · slow travelers"
  pace: string[];       // 3 short cues for the card
  img: string;
  bookingUrl: string;   // direct yesexperiences.pt URL
  seed: TourSeed;       // pre-fills the builder
};

export const signatureTours: SignatureTour[] = [
  {
    id: "arrabida-boat",
    title: "Arrábida & Sesimbra · Boat Tour",
    region: "Setúbal · Arrábida",
    duration: "Full Day",
    durationHours: "8–9h",
    priceFrom: 139,
    theme: "Coastal",
    blurb:
      "Setúbal market at dawn, a boat through Arrábida's hidden coves, kayak or snorkel, lunch in Portinho, finish in Sesimbra.",
    fitsBest: "Couples · families · active travelers",
    pace: ["Setúbal market", "Boat in Arrábida", "Sesimbra at dusk"],
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
    title: "Setúbal & Arrábida Wine Tour",
    region: "Setúbal · Azeitão",
    duration: "Full Day",
    durationHours: "8–9h",
    priceFrom: 109,
    theme: "Wine",
    blurb:
      "April 25th Bridge, Cristo Rei, Arrábida coastal views, two family wineries, a long lunch and the Livramento market.",
    fitsBest: "Wine lovers · couples · small groups",
    pace: ["Cristo Rei view", "Two wineries", "Long lunch"],
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
      "Hands-on cheese making in Azeitão, a private winery tasting, then the fishing village of Sesimbra by the sea.",
    fitsBest: "Foodies · couples · curious first-timers",
    pace: ["Cheese workshop", "Winery tasting", "Sesimbra"],
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
    title: "Tiles Painting Workshop & Sesimbra",
    region: "Azeitão · Sesimbra",
    duration: "Full Day",
    durationHours: "7–8h",
    priceFrom: 79,
    theme: "Heritage",
    blurb:
      "Paint your own azulejo in a 16th-century atelier, taste a local wine, then unwind in Sesimbra by the sea.",
    fitsBest: "Couples · creatives · families with teens",
    pace: ["Tile atelier", "Wine tasting", "Sesimbra coast"],
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
    title: "Arrábida & Sesimbra · 4×4 Jeep + Picnic",
    region: "Arrábida · Sesimbra",
    duration: "Full Day",
    durationHours: "7–8h",
    priceFrom: 99,
    theme: "Nature",
    blurb:
      "Off-road through Arrábida's hidden trails, a beach picnic in a quiet cove, viewpoints no bus reaches.",
    fitsBest: "Families · friends · adventurers",
    pace: ["4×4 trails", "Hidden beach picnic", "Secret viewpoint"],
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
    title: "Off the Beaten Path · 4×4 + Dinosaur Prints",
    region: "Arrábida · Cabo Espichel",
    duration: "Half Day +",
    durationHours: "6–7h",
    priceFrom: 79,
    theme: "Nature",
    blurb:
      "A 4×4 deep into Arrábida, the dramatic Cabo Espichel cliffs and 150-million-year-old dinosaur footprints.",
    fitsBest: "Families · curious minds · explorers",
    pace: ["Off-road Arrábida", "Cabo Espichel cliffs", "Dinosaur prints"],
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
    title: "Sintra & Cascais Hidden Gems",
    region: "Lisbon Coast",
    duration: "Full Day",
    durationHours: "8–9h",
    priceFrom: 75,
    theme: "Heritage",
    blurb:
      "Sintra's quieter palaces and forests, the wild westernmost coast, Cascais lanes and a private wine tasting.",
    fitsBest: "Couples · culture lovers · first-timers",
    pace: ["Sintra forests", "Westernmost coast", "Cascais tasting"],
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
    title: "Évora & Alentejo Wine Tour",
    region: "Alentejo",
    duration: "Long Day",
    durationHours: "9–11h",
    priceFrom: 149,
    theme: "Wine",
    blurb:
      "Roman temples and the Chapel of Bones in Évora, then Alentejo wineries and a slow lunch in vineyard country.",
    fitsBest: "History buffs · wine lovers · couples",
    pace: ["Évora old town", "Chapel of Bones", "Alentejo winery"],
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
    title: "Tomar & Coimbra",
    region: "Centro",
    duration: "Full Day",
    durationHours: "8–9h",
    priceFrom: 129,
    theme: "Heritage",
    blurb:
      "The Templar Convento de Cristo in Tomar, then Coimbra's ancient university and old town along the Mondego.",
    fitsBest: "History lovers · couples · culture seekers",
    pace: ["Tomar Templar convent", "Coimbra University", "Old town walk"],
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
    fitsBest: "Pilgrims · couples · families",
    pace: ["Fátima sanctuary", "Nazaré cliffs", "Óbidos & Ginjinha"],
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
    title: "Douro Valley · Private Full Day",
    region: "Porto · Douro",
    duration: "Full Day",
    durationHours: "9h",
    priceFrom: 350,
    theme: "Wine",
    blurb:
      "Schist terraces, a river cruise on the Douro, two family quintas and lunch with a winemaker.",
    fitsBest: "Couples · wine lovers · special occasions",
    pace: ["Quinta visit", "River cruise", "Winemaker lunch"],
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
    title: "Braga & Guimarães · Private",
    region: "Minho",
    duration: "Full Day",
    durationHours: "9h",
    priceFrom: 275,
    theme: "Heritage",
    blurb:
      "Bom Jesus do Monte in Braga, the birthplace of Portugal in Guimarães — two cities, one slow Minho day.",
    fitsBest: "Heritage travelers · couples · families",
    pace: ["Bom Jesus", "Guimarães castle", "Old quarter"],
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
    title: "Porto City · Private Full Day",
    region: "Porto",
    duration: "Full Day",
    durationHours: "8–9h",
    priceFrom: 275,
    theme: "Heritage",
    blurb:
      "Ribeira lanes, São Bento, a Port wine cellar in Gaia and a panoramic ride along the Douro.",
    fitsBest: "First-timers · couples · culture lovers",
    pace: ["Ribeira walk", "Port cellar", "Douro panorama"],
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
    title: "Algarve · Benagil & Vicentine Coast",
    region: "Algarve",
    duration: "2 Days",
    durationHours: "2 days",
    priceFrom: 349,
    theme: "Coastal",
    blurb:
      "Two days along Portugal's wildest coast: Benagil sea caves by boat, the Vicentine cliffs, hidden beaches.",
    fitsBest: "Couples · friends · slow explorers",
    pace: ["Benagil caves", "Vicentine coast", "Sunset cliffs"],
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
