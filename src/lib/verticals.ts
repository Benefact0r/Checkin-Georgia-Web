import type { Vertical } from "./api";

// =============================================================================
// Frontend vertical config — drives the morphing admin forms + public pages.
// Mirrors the backend spec in API/src/verticals.ts.
// =============================================================================

export type ResourceKind = "staff" | "table" | "seat" | "queue" | "room";

export type AttrFieldType =
  | "text"
  | "number"
  | "select"
  | "tags" // comma/enter list → string[]
  | "boolean"
  | "music"
  | "menu";

export interface AttrField {
  key: string;
  label: string;
  type: AttrFieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface VerticalConfig {
  key: Vertical;
  label: string; // Georgian
  icon: string;
  /** The bookable unit for this vertical. */
  resourceKind: ResourceKind;
  resourceLabel: string; // singular, Georgian
  resourceLabelPlural: string;
  /** staff-like resources show role / serves / phone / bio. */
  staffLike: boolean;
  /** table-like resources show seats (capacity) + area. */
  tableLike: boolean;
  attrFields: AttrField[];
}

const PRICE_RANGE: AttrField = {
  key: "priceRange",
  label: "ფასების დონე",
  type: "select",
  options: [
    { value: "$", label: "$" },
    { value: "$$", label: "$$" },
    { value: "$$$", label: "$$$" },
    { value: "$$$$", label: "$$$$" },
  ],
};
const AMENITIES: AttrField = {
  key: "amenities",
  label: "კეთილმოწყობა",
  type: "tags",
  placeholder: "wifi, parking, card, accessible…",
};
const SERVES: AttrField = {
  key: "serves",
  label: "ვისთვის",
  type: "select",
  options: [
    { value: "unisex", label: "უნისექს" },
    { value: "men", label: "მამაკაცი" },
    { value: "women", label: "ქალი" },
  ],
};
const DRESS: AttrField = {
  key: "dressCode",
  label: "დრეს-კოდი",
  type: "select",
  options: [
    { value: "casual", label: "Casual" },
    { value: "smart_casual", label: "Smart casual" },
    { value: "formal", label: "Formal" },
  ],
};
const MUSIC: AttrField = { key: "music", label: "მუსიკა", type: "music" };
const MENU: AttrField = { key: "menu", label: "მენიუ", type: "menu" };

export const VERTICAL_CONFIG: Record<Vertical, VerticalConfig> = {
  salon: {
    key: "salon",
    label: "სალონი",
    icon: "💇",
    resourceKind: "staff",
    resourceLabel: "თანამშრომელი",
    resourceLabelPlural: "თანამშრომლები",
    staffLike: true,
    tableLike: false,
    attrFields: [SERVES, AMENITIES, PRICE_RANGE],
  },
  spa: {
    key: "spa",
    label: "სპა და სხეული",
    icon: "💆",
    resourceKind: "room",
    resourceLabel: "ოთახი / თერაპევტი",
    resourceLabelPlural: "ოთახები / თერაპევტები",
    staffLike: true,
    tableLike: false,
    attrFields: [
      SERVES,
      { key: "couples", label: "წყვილების სერვისი", type: "boolean" },
      AMENITIES,
      PRICE_RANGE,
    ],
  },
  restaurant: {
    key: "restaurant",
    label: "რესტორანი",
    icon: "🍽️",
    resourceKind: "table",
    resourceLabel: "მაგიდა",
    resourceLabelPlural: "მაგიდები",
    staffLike: false,
    tableLike: true,
    attrFields: [
      { key: "cuisines", label: "სამზარეულო", type: "tags", placeholder: "Georgian, European…" },
      { key: "chef", label: "შეფ-მზარეული", type: "text" },
      MUSIC,
      DRESS,
      MENU,
      AMENITIES,
      PRICE_RANGE,
    ],
  },
  bar: {
    key: "bar",
    label: "ბარი",
    icon: "🍸",
    resourceKind: "table",
    resourceLabel: "მაგიდა",
    resourceLabelPlural: "მაგიდები",
    staffLike: false,
    tableLike: true,
    attrFields: [MUSIC, DRESS, { key: "ageLimit", label: "ასაკობრივი ზღვარი", type: "number" }, MENU, AMENITIES, PRICE_RANGE],
  },
  night_club: {
    key: "night_club",
    label: "ღამის კლუბი",
    icon: "🪩",
    resourceKind: "table",
    resourceLabel: "მაგიდა / VIP",
    resourceLabelPlural: "მაგიდები / VIP",
    staffLike: false,
    tableLike: true,
    attrFields: [MUSIC, DRESS, { key: "ageLimit", label: "ასაკობრივი ზღვარი", type: "number" }, MENU, AMENITIES, PRICE_RANGE],
  },
  cafe: {
    key: "cafe",
    label: "კაფე",
    icon: "☕",
    resourceKind: "table",
    resourceLabel: "მაგიდა",
    resourceLabelPlural: "მაგიდები",
    staffLike: false,
    tableLike: true,
    attrFields: [MENU, AMENITIES, PRICE_RANGE],
  },
};

export const VERTICAL_LIST = Object.values(VERTICAL_CONFIG);

export const AREA_OPTIONS = [
  { value: "indoor", label: "შიდა" },
  { value: "outdoor", label: "გარე" },
  { value: "terrace", label: "ტერასა" },
  { value: "vip", label: "VIP" },
  { value: "bar", label: "ბარი" },
];
