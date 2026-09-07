"use client";

import { EVENT_COLORS } from "@/lib/event-colors";
import { IconClose } from "@/components/icons";

export function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="sheet-backdrop" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`sheet ${wide ? "sheet-wide" : ""}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-handle" />
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Kapat"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ColorPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {EVENT_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          aria-label={color.label}
          onClick={() => onChange(color.value)}
          className={`h-8 w-8 rounded-full border-2 ${
            value === color.value ? "border-stone-900 scale-110" : "border-transparent"
          }`}
          style={{ background: color.value }}
        />
      ))}
    </div>
  );
}
