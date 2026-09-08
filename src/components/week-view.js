"use client";

import { eventsOnDay, formatTime, isPastDay, isSameDay, WEEKDAY_SHORT, weekDays } from "@/lib/dates";
import { eventColor } from "@/lib/event-colors";

export function WeekView({ cursor, events, onSelectDay, onSelectEvent }) {
  const today = new Date();
  const days = weekDays(cursor);

  return (
    <div className="week-grid">
      {days.map((day) => {
        const dayEvents = eventsOnDay(events, day);
        const isToday = isSameDay(day, today);
        const classes = [
          "week-col",
          isToday ? "is-today" : "",
          !isToday && isPastDay(day, today) ? "is-past" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <section key={day.toISOString()} className={classes}>
            <button
              type="button"
              className="week-col-head"
              onClick={() => onSelectDay(day)}
            >
              <span>{WEEKDAY_SHORT[(day.getDay() + 6) % 7]}</span>
              <strong>{day.getDate()}</strong>
              {isToday ? <em className="today-label">Bugün</em> : null}
            </button>
            <div className="week-col-body">
              {dayEvents.length === 0 ? (
                <p className="muted empty-day">Etkinlik yok</p>
              ) : (
                dayEvents.slice(0, 5).map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    className="event-chip"
                    style={{ "--event": eventColor(event.color) }}
                    onClick={() => onSelectEvent(event)}
                  >
                    <span className="event-chip-title">{event.title}</span>
                    <span className="event-chip-meta">
                      {event.all_day ? "Tüm gün" : formatTime(event.starts_at)}
                    </span>
                  </button>
                ))
              )}
              {dayEvents.length > 5 ? (
                <button
                  type="button"
                  className="more-link"
                  onClick={() => onSelectDay(day)}
                >
                  +{dayEvents.length - 5} daha
                </button>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
