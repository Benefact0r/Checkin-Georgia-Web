// Tbilisi districts — English key (stored on venues) → Georgian label.
// Single source for the landing filters, venue cards, and preference capture.
export const DISTRICT_LABELS: Record<string, string> = {
  Vake: "ვაკე",
  Saburtalo: "საბურთალო",
  Vera: "ვერა",
  Mtatsminda: "მთაწმინდა",
  Sololaki: "სოლოლაკი",
  "Old Tbilisi": "ძველი თბილისი",
  Marjanishvili: "მარჯანიშვილი",
  Chugureti: "ჩუღურეთი",
  Isani: "ისანი",
  Didube: "დიდუბე",
  Gldani: "გლდანი",
};

export const districtLabel = (key: string): string => DISTRICT_LABELS[key] ?? key;

export const ALL_DISTRICTS = Object.keys(DISTRICT_LABELS);
