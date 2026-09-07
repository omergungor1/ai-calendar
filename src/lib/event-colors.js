export const EVENT_COLORS = [
  { id: "teal", value: "#0f766e", label: "Teal" },
  { id: "orange", value: "#ea580c", label: "Turuncu" },
  { id: "violet", value: "#7c3aed", label: "Mor" },
  { id: "rose", value: "#e11d48", label: "Gül" },
  { id: "sky", value: "#0284c7", label: "Mavi" },
  { id: "amber", value: "#d97706", label: "Amber" },
  { id: "lime", value: "#65a30d", label: "Yeşil" },
  { id: "slate", value: "#57534e", label: "Taş" },
];

export function eventColor(value) {
  return EVENT_COLORS.find((color) => color.value === value)?.value || EVENT_COLORS[0].value;
}
