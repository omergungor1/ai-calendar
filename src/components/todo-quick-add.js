"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";

export function TodoQuickAdd({ onClose, onSubmit, saving, error }) {
  const [title, setTitle] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const next = title.trim();
    if (!next) return;
    await onSubmit(next);
  }

  return (
    <Modal title="Yapılacak ekle" center onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="field">
          Başlık
          <input
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Örn. Market alışverişi"
          />
        </label>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex-1" disabled={saving}>
            {saving ? "Ekleniyor..." : "Ekle"}
          </button>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Vazgeç
          </button>
        </div>
      </form>
    </Modal>
  );
}
