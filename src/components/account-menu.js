"use client";

import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/auth/actions";
import { IconMenu, IconUser } from "@/components/icons";

export function AccountMenu({ email, onNavigate, inviteCount }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function go(tab) {
    onNavigate(tab);
    setOpen(false);
  }

  return (
    <div className="account-menu" ref={rootRef}>
      <button
        type="button"
        className="account-trigger"
        aria-label="Menü"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <IconMenu className="menu-icon-mobile h-6 w-6" />
        <IconUser className="menu-icon-desktop h-6 w-6" />
      </button>
      {open ? (
        <div className="account-dropdown">
          <p className="account-email">{email}</p>
          <button type="button" onClick={() => go("takvim")}>
            Takvim
          </button>
          <button type="button" onClick={() => go("todos")}>
            Yapılacak listesi
          </button>
          <button type="button" onClick={() => go("ekip")}>
            Ekip
            {inviteCount > 0 ? (
              <span className="menu-badge">{inviteCount}</span>
            ) : null}
          </button>
          <form action={logout}>
            <button type="submit">Çıkış</button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
