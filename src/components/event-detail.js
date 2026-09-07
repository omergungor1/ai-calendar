"use client";

import { formatEventWhen } from "@/lib/dates";
import { eventColor } from "@/lib/event-colors";
import { Modal } from "@/components/modal";

export function EventDetail({ event, canEdit, onClose, onEdit, onDelete }) {
  return (
    <Modal title="Etkinlik" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <span
            className="mt-1 h-4 w-4 shrink-0 rounded-full"
            style={{ background: eventColor(event.color) }}
          />
          <div>
            <h3 className="text-xl font-semibold">{event.title}</h3>
            <p className="mt-1 text-sm text-stone-600">{formatEventWhen(event)}</p>
          </div>
        </div>
        {event.location ? (
          <p className="text-sm text-stone-700">{event.location}</p>
        ) : null}
        {event.description ? (
          <p className="whitespace-pre-wrap text-sm leading-6 text-stone-700">
            {event.description}
          </p>
        ) : null}
        {canEdit ? (
          <div className="flex gap-2">
            <button type="button" className="btn-primary flex-1" onClick={onEdit}>
              Düzenle
            </button>
            <button type="button" className="btn-danger" onClick={onDelete}>
              Sil
            </button>
          </div>
        ) : (
          <p className="muted">Bu takvim salt okunur.</p>
        )}
      </div>
    </Modal>
  );
}
