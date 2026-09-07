"use client";

import { useState } from "react";
import {
  allDayRange,
  defaultTimedRange,
  fromDateAndTime,
  toDateInput,
  toTimeInput,
} from "@/lib/dates";
import { EVENT_COLORS } from "@/lib/event-colors";
import { ColorPicker } from "@/components/modal";

export function EventForm({
  initialEvent,
  defaultDay,
  submitLabel = "Kaydet",
  onSubmit,
  onCancel,
  saving,
  error,
}) {
  const timed = defaultTimedRange(defaultDay || new Date());
  const initialStart = initialEvent ? new Date(initialEvent.starts_at) : timed.start;
  const initialEnd = initialEvent ? new Date(initialEvent.ends_at) : timed.end;
  const initialKind = initialEvent
    ? initialEvent.all_day
      ? toDateInput(initialStart) === toDateInput(initialEnd)
        ? "all-day"
        : "multi-day"
      : "timed"
    : "timed";

  const [kind, setKind] = useState(initialKind);
  const [title, setTitle] = useState(initialEvent?.title || "");
  const [description, setDescription] = useState(initialEvent?.description || "");
  const [location, setLocation] = useState(initialEvent?.location || "");
  const [color, setColor] = useState(initialEvent?.color || EVENT_COLORS[0].value);
  const [startDate, setStartDate] = useState(toDateInput(initialStart));
  const [endDate, setEndDate] = useState(toDateInput(initialEnd));
  const [startTime, setStartTime] = useState(toTimeInput(initialStart));
  const [endTime, setEndTime] = useState(toTimeInput(initialEnd));

  function handleSubmit(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    let startsAt;
    let endsAt;
    let allDay = false;

    if (kind === "timed") {
      startsAt = fromDateAndTime(startDate, startTime);
      endsAt = fromDateAndTime(startDate, endTime);
      if (endsAt <= startsAt) {
        endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);
      }
    } else if (kind === "all-day") {
      const range = allDayRange(startDate, startDate);
      startsAt = range.start;
      endsAt = range.end;
      allDay = true;
    } else {
      const range = allDayRange(startDate, endDate < startDate ? startDate : endDate);
      startsAt = range.start;
      endsAt = range.end;
      allDay = true;
    }

    onSubmit({
      title: cleanTitle,
      description: description.trim() || null,
      location: location.trim() || null,
      color,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      all_day: allDay,
    });
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="seg">
        {[
          ["timed", "Saatlik"],
          ["all-day", "Tüm gün"],
          ["multi-day", "Birkaç gün"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={kind === value ? "is-active" : ""}
            onClick={() => setKind(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <label className="field">
        Başlık
        <input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Örn. Dişçi randevusu"
        />
      </label>

      {kind === "timed" ? (
        <div className="grid-2">
          <label className="field">
            Tarih
            <input
              type="date"
              required
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>
          <div className="grid-2">
            <label className="field">
              Başlangıç
              <input
                type="time"
                required
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
              />
            </label>
            <label className="field">
              Bitiş
              <input
                type="time"
                required
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
              />
            </label>
          </div>
        </div>
      ) : null}

      {kind === "all-day" ? (
        <label className="field">
          Tarih
          <input
            type="date"
            required
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </label>
      ) : null}

      {kind === "multi-day" ? (
        <div className="grid-2">
          <label className="field">
            Başlangıç
            <input
              type="date"
              required
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>
          <label className="field">
            Bitiş
            <input
              type="date"
              required
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </label>
        </div>
      ) : null}

      <label className="field">
        Açıklama
        <textarea
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="İsteğe bağlı not"
        />
      </label>

      <label className="field">
        Konum
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="İsteğe bağlı"
        />
      </label>

      <div className="field">
        Renk
        <ColorPicker value={color} onChange={setColor} />
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1" disabled={saving}>
          {saving ? "Kaydediliyor..." : submitLabel}
        </button>
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Vazgeç
        </button>
      </div>
    </form>
  );
}
