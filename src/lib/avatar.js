export function avatarLetter(name, email) {
  const source = String(name || email || "?").trim();
  return source.charAt(0).toLocaleUpperCase("tr-TR") || "?";
}

const AVATAR_COLORS = [
  "#0f766e",
  "#ea580c",
  "#7c3aed",
  "#e11d48",
  "#0284c7",
  "#d97706",
  "#65a30d",
];

export function avatarColor(seed) {
  const value = String(seed || "");
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
