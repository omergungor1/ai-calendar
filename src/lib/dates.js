const WEEKDAY_SHORT = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTH_NAMES = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

export { WEEKDAY_SHORT, MONTH_NAMES };

export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(date, amount) {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

export function startOfWeek(date) {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function endOfWeek(date) {
  return endOfDay(addDays(startOfWeek(date), 6));
}

export function startOfMonth(date) {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
}

export function endOfMonth(date) {
  return endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

export function startOfYear(date) {
  return new Date(date.getFullYear(), 0, 1);
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function isPastDay(date, today = new Date()) {
  return startOfDay(date).getTime() < startOfDay(today).getTime();
}

export function weekDays(date) {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function monthGrid(date) {
  const start = startOfWeek(startOfMonth(date));
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export function pad(value) {
  return String(value).padStart(2, "0");
}

export function toDateInput(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function toTimeInput(date) {
  const d = new Date(date);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function toLocalDateTimeInput(date) {
  return `${toDateInput(date)}T${toTimeInput(date)}`;
}

export function fromDateAndTime(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr || "00:00"}:00`);
}

export function allDayRange(startDateStr, endDateStr) {
  const start = new Date(`${startDateStr}T00:00:00`);
  const end = endOfDay(new Date(`${endDateStr}T00:00:00`));
  return { start, end };
}

export function eventOnDay(event, day) {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);
  const start = new Date(event.starts_at);
  const end = new Date(event.ends_at);
  return start <= dayEnd && end >= dayStart;
}

export function eventsOnDay(events, day) {
  return (events || [])
    .filter((event) => eventOnDay(event, day))
    .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
}

export function formatDayHeading(date) {
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function formatWeekRange(date) {
  const start = startOfWeek(date);
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${start.getDate()}–${end.getDate()} ${MONTH_NAMES[start.getMonth()]}`;
  }
  return `${start.getDate()} ${MONTH_NAMES[start.getMonth()]} – ${end.getDate()} ${MONTH_NAMES[end.getMonth()]}`;
}

export function formatTime(date) {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatEventWhen(event) {
  const start = new Date(event.starts_at);
  const end = new Date(event.ends_at);
  const sameDay = isSameDay(start, end);

  if (event.all_day) {
    if (sameDay || toDateInput(start) === toDateInput(end)) {
      return `${formatDayHeading(start)} · Tüm gün`;
    }
    return `${toDateInput(start)} – ${toDateInput(end)} · Tüm gün`;
  }

  if (sameDay) {
    return `${formatDayHeading(start)} · ${formatTime(start)}–${formatTime(end)}`;
  }

  return `${formatDayHeading(start)} ${formatTime(start)} – ${formatDayHeading(end)} ${formatTime(end)}`;
}

export function defaultTimedRange(day = new Date()) {
  const start = new Date(day);
  if (isSameDay(start, new Date())) {
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);
  } else {
    start.setHours(9, 0, 0, 0);
  }
  const end = new Date(start);
  end.setHours(end.getHours() + 1);
  return { start, end };
}
