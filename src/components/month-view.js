"use client";

import {
  eventsOnDay,
  isSameDay,
  isSameMonth,
  monthGrid,
  WEEKDAY_SHORT,
} from "@/lib/dates";
import { eventColor } from "@/lib/event-colors";

export function MonthView({ cursor, events, onSelectDay, onSelectEvent }) {
  const today = new Date();
  const days = monthGrid(cursor);

  return (
    <div className="month-wrap">
      <div className="month-weekdays">
        {WEEKDAY_SHORT.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="month-grid">
        {days.map((day) => {
          const dayEvents = eventsOnDay(events, day);
          const inMonth = isSameMonth(day, cursor);
          const classes = [
            "month-cell",
            inMonth ? "" : "is-outside",
            isSameDay(day, today) ? "is-today" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={day.toISOString()}
              type="button"
              className={classes}
              onClick={() => onSelectDay(day)}
            >
              <span className="month-date">{day.getDate()}</span>
              <span className="month-count">
                {dayEvents.length ? `${dayEvents.length} etkinlik` : ""}
              </span>
              <span className="month-chips">
                {dayEvents.slice(0, 3).map((event) => (
                  <span
                    key={event.id}
                    className="month-chip"
                    style={{ background: eventColor(event.color) }}
                    onClick={(clickEvent) => {
                      clickEvent.stopPropagation();
                      onSelectEvent(event);
                    }}
                  >
                    {event.title}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
