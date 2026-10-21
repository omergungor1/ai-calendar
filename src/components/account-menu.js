"use client";

import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/auth/actions";
import { IconMenu } from "@/components/icons";
import { avatarColor, avatarLetter } from "@/lib/avatar";

export function AccountMenu({
  email,
  displayName,
  userId,
  inviteCount,
  friends,
  selectedOwnerId,
  onNavigate,
  onSelectOwner,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const rootRef = useRef(null);
  const letter = avatarLetter(displayName, email);
  const color = avatarColor(userId || email);

  useEffect(() => {
    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setMenuOpen(false);
        setUserOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function go(tab) {
    onNavigate(tab);
    setMenuOpen(false);
    setUserOpen(false);
  }

  function pickCalendar(id) {
    onSelectOwner(id);
    setMenuOpen(false);
    setUserOpen(false);
  }

  return (
    <div className="account-menu" ref={rootRef}>
      <button
        type="button"
        className="account-trigger"
        aria-label="Menü"
        aria-expanded={menuOpen}
        onClick={() => {
          setMenuOpen((value) => !value);
          setUserOpen(false);
        }}
      >
        <IconMenu className="h-6 w-6" />
      </button>
      <button
        type="button"
        className="user-avatar"
        aria-label="Hesap ve takvimler"
        aria-expanded={userOpen}
        style={{ background: color }}
        onClick={() => {
          setUserOpen((value) => !value);
          setMenuOpen(false);
        }}
      >
        {letter}
      </button>

      {menuOpen ? (
        <div className="account-dropdown">
          <div className="account-identity">
            <p className="account-email">{displayName || email}</p>
            {displayName && email ? (
              <p className="account-email-sub">{email}</p>
            ) : null}
          </div>
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

      {userOpen ? (
        <div className="account-dropdown">
          <div className="account-identity">
            <p className="account-email">{displayName || email}</p>
            {displayName && email ? (
              <p className="account-email-sub">{email}</p>
            ) : null}
          </div>
          <p className="menu-section">Takvimler</p>
          <button
            type="button"
            className={selectedOwnerId === userId ? "is-active" : ""}
            onClick={() => pickCalendar(userId)}
          >
            Benim takvimim
          </button>
          {friends.map((friend) => (
            <button
              key={friend.id}
              type="button"
              className={selectedOwnerId === friend.id ? "is-active" : ""}
              onClick={() => pickCalendar(friend.id)}
            >
              {friend.display_name || friend.email}
            </button>
          ))}
          {friends.length === 0 ? (
            <p className="menu-empty">Henüz onaylı ekip yok.</p>
          ) : null}
          <button type="button" onClick={() => go("ekip")}>
            Ekibi yönet
          </button>
        </div>
      ) : null}
    </div>
  );
}
