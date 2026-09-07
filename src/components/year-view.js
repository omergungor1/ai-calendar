"use client";

import { isSameMonth, MONTH_NAMES, startOfMonth } from "@/lib/dates";

export function YearView({ cursor, onSelectMonth, onSelectYear }) {
  const year = cursor.getFullYear();
  const years = [year - 2, year - 1, year, year + 1, year + 2];
  const today = new Date();

  return (
    <div className="year-wrap">
      <div className="year-list">
        {years.map((item) => (
          <button
            key={item}
            type="button"
            className={`year-pill ${item === year ? "is-active" : ""}`}
            onClick={() => onSelectYear(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="year-grid">
        {MONTH_NAMES.map((name, index) => {
          const monthDate = startOfMonth(new Date(year, index, 1));
          const current = isSameMonth(monthDate, today);
          return (
            <button
              key={name}
              type="button"
              className={`year-month ${current ? "is-today" : ""}`}
              onClick={() => onSelectMonth(monthDate)}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
