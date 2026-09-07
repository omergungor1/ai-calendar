"use client";

import { useState } from "react";

export function TeamView({
  user,
  incoming,
  outgoing,
  friends,
  selectedOwnerId,
  onSelectOwner,
  onInvite,
  onRespond,
  onCancel,
  busy,
  error,
}) {
  const [email, setEmail] = useState("");

  async function handleInvite(event) {
    event.preventDefault();
    const next = email.trim();
    if (!next) return;
    const ok = await onInvite(next);
    if (ok) setEmail("");
  }

  return (
    <div className="panel">
      <form className="todo-add" onSubmit={handleInvite}>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Arkadaşının e-postası"
        />
        <button type="submit" className="btn-primary" disabled={busy}>
          Davet et
        </button>
      </form>
      {error ? <p className="error-text">{error}</p> : null}
      <p className="muted">
        Davet, aynı e-posta ile kayıtlı hesabın Ekip bölümüne düşer.
      </p>

      <section className="stack-block">
        <h3>Gelen davetler</h3>
        {incoming.length === 0 ? (
          <p className="muted">Bekleyen davet yok.</p>
        ) : (
          <ul className="stack-list">
            {incoming.map((invite) => (
              <li key={invite.id} className="stack-row">
                <span>{invite.inviter_name || invite.inviter_id}</span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => onRespond(invite.id, "accepted")}
                  >
                    Onayla
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => onRespond(invite.id, "declined")}
                  >
                    Reddet
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="stack-block">
        <h3>Onaylı takvimler</h3>
        <div className="owner-list">
          <button
            type="button"
            className={`owner-chip ${selectedOwnerId === user.id ? "is-active" : ""}`}
            onClick={() => onSelectOwner(user.id)}
          >
            Benim takvimim
          </button>
          {friends.map((friend) => (
            <button
              key={friend.id}
              type="button"
              className={`owner-chip ${selectedOwnerId === friend.id ? "is-active" : ""}`}
              onClick={() => onSelectOwner(friend.id)}
            >
              {friend.display_name || friend.email}
            </button>
          ))}
        </div>
        {friends.length === 0 ? (
          <p className="muted">Onaylanan arkadaşın takvimini burada görürsün.</p>
        ) : null}
      </section>

      <section className="stack-block">
        <h3>Gönderilen davetler</h3>
        {outgoing.length === 0 ? (
          <p className="muted">Giden davet yok.</p>
        ) : (
          <ul className="stack-list">
            {outgoing.map((invite) => (
              <li key={invite.id} className="stack-row">
                <span>
                  {invite.invitee_email}
                  <small className="ml-2 text-stone-500">{invite.status}</small>
                </span>
                {invite.status === "pending" ? (
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => onCancel(invite.id)}
                  >
                    İptal
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
