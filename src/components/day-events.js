"use client";

import { eventsOnDay, formatDayHeading, formatTime } from "@/lib/dates";
import { eventColor } from "@/lib/event-colors";
import { Modal } from "@/components/modal";

export function DayEvents({ day, events, onClose, onSelectEvent }) {
  const list = eventsOnDay(events, day);

  return (
    <Modal title={formatDayHeading(day)} onClose={onClose}>
      {list.length === 0 ? (
        <p className="muted">Bu günde etkinlik yok.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.map((event) => (
            <li key={event.id}>
              <button
                type="button"
                className="day-item"
                onClick={() => onSelectEvent(event)}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: eventColor(event.color) }}
                />
                <span className="flex-1 text-left">
                  <strong>{event.title}</strong>
                  <span className="block text-xs text-stone-500">
                    {event.all_day ? "Tüm gün" : formatTime(event.starts_at)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
