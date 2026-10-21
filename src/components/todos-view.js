"use client";

import { useState } from "react";
import { IconArchive, IconCheck } from "@/components/icons";

export function TodosView({ todos, onUpdate }) {
  const [tab, setTab] = useState("pending");

  const pending = todos.filter((item) => item.status === "pending");
  const done = todos.filter((item) => item.status === "done");
  const archived = todos.filter((item) => item.status === "archived");
  const list = tab === "pending" ? pending : tab === "done" ? done : archived;

  return (
    <div className="panel">
      <p className="muted">Bekleyenler her zaman bu listede durur.</p>

      <div className="seg">
        <button
          type="button"
          className={tab === "pending" ? "is-active" : ""}
          onClick={() => setTab("pending")}
        >
          Bekleyenler ({pending.length})
        </button>
        <button
          type="button"
          className={tab === "done" ? "is-active" : ""}
          onClick={() => setTab("done")}
        >
          Tamamlananlar ({done.length})
        </button>
        <button
          type="button"
          className={tab === "archived" ? "is-active" : ""}
          onClick={() => setTab("archived")}
        >
          Arşiv ({archived.length})
        </button>
      </div>

      {list.length === 0 ? (
        <p className="muted">Bu bölüm boş.</p>
      ) : (
        <ul className="todo-list">
          {list.map((item) => (
            <li key={item.id} className="todo-item">
              <span className={item.status === "done" ? "line-through opacity-70" : ""}>
                {item.title}
              </span>
              <span className="todo-actions">
                {item.status !== "done" ? (
                  <button
                    type="button"
                    className="icon-button"
                    aria-label="Tamamla"
                    onClick={() => onUpdate(item.id, "done")}
                  >
                    <IconCheck className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="text-xs font-medium"
                    onClick={() => onUpdate(item.id, "pending")}
                  >
                    Geri al
                  </button>
                )}
                {item.status !== "archived" ? (
                  <button
                    type="button"
                    className="icon-button"
                    aria-label="Arşivle"
                    onClick={() => onUpdate(item.id, "archived")}
                  >
                    <IconArchive className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="text-xs font-medium"
                    onClick={() => onUpdate(item.id, "pending")}
                  >
                    Aç
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
