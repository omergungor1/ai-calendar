"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  formatWeekRange,
  MONTH_NAMES,
  startOfMonth,
} from "@/lib/dates";
import { IconPlus, IconTodo } from "@/components/icons";
import { WeekView } from "@/components/week-view";
import { MonthView } from "@/components/month-view";
import { YearView } from "@/components/year-view";
import { Modal } from "@/components/modal";
import { EventForm } from "@/components/event-form";
import { EventDetail } from "@/components/event-detail";
import { DayEvents } from "@/components/day-events";
import { AiAddSheet } from "@/components/ai-add-sheet";
import { TodosView } from "@/components/todos-view";
import { TeamView } from "@/components/team-view";
import { AccountMenu } from "@/components/account-menu";
import { TodoQuickAdd } from "@/components/todo-quick-add";

function profileMap(list) {
  return Object.fromEntries((list || []).map((item) => [item.id, item]));
}

export function CalendarApp({ user, profile }) {
  const supabase = useMemo(() => createClient(), []);
  const [tab, setTab] = useState("takvim");
  const [view, setView] = useState("week");
  const [cursor, setCursor] = useState(() => new Date());
  const [ownerId, setOwnerId] = useState(user.id);
  const [events, setEvents] = useState([]);
  const [todos, setTodos] = useState([]);
  const [invites, setInvites] = useState([]);
  const [profiles, setProfiles] = useState({ [user.id]: profile });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sheet, setSheet] = useState(null);
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef(null);

  const mine = ownerId === user.id;
  const myEmail = (user.email || "").toLowerCase();

  const loadTeam = useCallback(async () => {
    const { data } = await supabase
      .from("friend_invites")
      .select("*")
      .order("created_at", { ascending: false });
    const rows = data || [];
    setInvites(rows);
    const ids = [
      ...new Set(
        rows.flatMap((row) => [row.inviter_id, row.invitee_id]).filter(Boolean)
      ),
    ];
    if (!ids.length) return;
    const { data: people } = await supabase
      .from("profiles")
      .select("id, display_name, email")
      .in("id", ids);
    setProfiles((current) => ({ ...current, ...profileMap(people) }));
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;

    supabase
      .from("events")
      .select("*")
      .eq("user_id", ownerId)
      .order("starts_at", { ascending: true })
      .then(({ data, error: loadError }) => {
        if (cancelled) return;
        if (loadError) {
          setError(loadError.message);
          return;
        }
        setEvents(data || []);
      });

    return () => {
      cancelled = true;
    };
  }, [ownerId, supabase]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      supabase
        .from("todos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("friend_invites")
        .select("*")
        .order("created_at", { ascending: false }),
    ]).then(async ([todoResult, inviteResult]) => {
      if (cancelled) return;
      setTodos(todoResult.data || []);
      const rows = inviteResult.data || [];
      setInvites(rows);
      const ids = [
        ...new Set(
          rows.flatMap((row) => [row.inviter_id, row.invitee_id]).filter(Boolean)
        ),
      ];
      if (!ids.length) return;
      const { data: people } = await supabase
        .from("profiles")
        .select("id, display_name, email")
        .in("id", ids);
      if (!cancelled) {
        setProfiles((current) => ({ ...current, ...profileMap(people) }));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [supabase, user.id]);

  useEffect(() => {
    return () => window.clearTimeout(toastTimerRef.current);
  }, []);

  const incoming = invites
    .filter(
      (row) =>
        row.status === "pending" &&
        (row.invitee_id === user.id || row.invitee_email === myEmail)
    )
    .map((row) => ({
      ...row,
      inviter_name: profiles[row.inviter_id]?.display_name || row.inviter_id,
    }));

  const outgoing = invites.filter((row) => row.inviter_id === user.id);
  const friends = invites
    .filter((row) => row.status === "accepted")
    .map((row) => {
      const friendId =
        row.inviter_id === user.id ? row.invitee_id : row.inviter_id;
      return profiles[friendId] || { id: friendId, display_name: "Arkadaş" };
    })
    .filter((row, index, list) => row.id && list.findIndex((item) => item.id === row.id) === index);

  const ownerLabel =
    ownerId === user.id
      ? "Benim takvimim"
      : profiles[ownerId]?.display_name || "Arkadaş takvimi";

  const heading =
    view === "week"
      ? formatWeekRange(cursor)
      : view === "month"
        ? `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`
        : String(cursor.getFullYear());

  function shift(direction) {
    const next = new Date(cursor);
    if (view === "week") next.setDate(next.getDate() + direction * 7);
    if (view === "month") next.setMonth(next.getMonth() + direction);
    if (view === "year") next.setFullYear(next.getFullYear() + direction);
    setCursor(next);
  }

  async function createEvent(payload) {
    setBusy(true);
    setError("");
    const { data, error: saveError } = await supabase
      .from("events")
      .insert({ ...payload, user_id: user.id })
      .select("*")
      .single();
    setBusy(false);
    if (saveError) {
      setError(saveError.message);
      return false;
    }
    if (ownerId === user.id) {
      setEvents((current) =>
        [...current, data].sort(
          (a, b) => new Date(a.starts_at) - new Date(b.starts_at)
        )
      );
    }
    setSheet(null);
    setTab("takvim");
    setOwnerId(user.id);
    setCursor(new Date(data.starts_at));
    return true;
  }

  async function updateEvent(id, payload) {
    setBusy(true);
    const { data, error: saveError } = await supabase
      .from("events")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();
    setBusy(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setEvents((current) => current.map((item) => (item.id === id ? data : item)));
    setSheet(null);
  }

  async function deleteEvent(event) {
    if (!window.confirm("Bu etkinlik silinsin mi?")) return;
    const { error: saveError } = await supabase.from("events").delete().eq("id", event.id);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setEvents((current) => current.filter((item) => item.id !== event.id));
    setSheet(null);
  }

  async function addTodo(title) {
    setBusy(true);
    setError("");
    const { data, error: saveError } = await supabase
      .from("todos")
      .insert({ user_id: user.id, title, status: "pending" })
      .select("*")
      .single();
    setBusy(false);
    if (saveError) {
      setError(saveError.message);
      return false;
    }
    setTodos((current) => [data, ...current]);
    return true;
  }

  async function updateTodo(id, status) {
    const completed_at = status === "done" ? new Date().toISOString() : null;
    const { data, error: saveError } = await supabase
      .from("todos")
      .update({ status, completed_at })
      .eq("id", id)
      .select("*")
      .single();
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setTodos((current) => current.map((item) => (item.id === id ? data : item)));
  }

  async function inviteFriend(email) {
    if (email.toLowerCase() === myEmail) {
      setError("Kendini davet edemezsin.");
      return false;
    }
    setBusy(true);
    setError("");
    const { error: saveError } = await supabase.from("friend_invites").insert({
      inviter_id: user.id,
      invitee_email: email.toLowerCase(),
    });
    setBusy(false);
    if (saveError) {
      setError(
        saveError.code === "23505"
          ? "Bu adrese zaten bekleyen bir davet var."
          : saveError.message
      );
      return false;
    }
    await loadTeam();
    return true;
  }

  async function respondInvite(id, status) {
    const { error: saveError } = await supabase
      .from("friend_invites")
      .update({ status, invitee_id: user.id })
      .eq("id", id);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    await loadTeam();
  }

  async function cancelInvite(id) {
    const { error: saveError } = await supabase
      .from("friend_invites")
      .delete()
      .eq("id", id);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    await loadTeam();
  }

  function showToast(message) {
    setToast(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(""), 3200);
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>{tab === "takvim" ? heading : tab === "todos" ? "Yapılacaklar" : "Ekip"}</h1>
          {tab === "takvim" && !mine ? (
            <p className="muted">{ownerLabel} · salt okunur</p>
          ) : null}
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="account-trigger"
            aria-label="Yapılacak ekle"
            onClick={() => {
              setError("");
              setSheet({ type: "todo" });
            }}
          >
            <IconTodo className="h-6 w-6" />
          </button>
          <AccountMenu
            email={user.email}
            displayName={profile?.display_name}
            userId={user.id}
            inviteCount={incoming.length}
            friends={friends}
            selectedOwnerId={ownerId}
            onNavigate={setTab}
            onSelectOwner={(id) => {
              setOwnerId(id);
              setTab("takvim");
              setView("week");
            }}
          />
        </div>
      </header>

      {tab === "takvim" ? (
        <div className="toolbar">
          <div className="seg">
            <button
              type="button"
              className={view === "week" ? "is-active" : ""}
              onClick={() => setView("week")}
            >
              Hafta
            </button>
            <button
              type="button"
              className={view === "month" ? "is-active" : ""}
              onClick={() => setView("month")}
            >
              Ay
            </button>
            <button
              type="button"
              className={view === "year" ? "is-active" : ""}
              onClick={() => setView("year")}
            >
              Yıl
            </button>
          </div>
          <div className="nav-shift">
            <button type="button" className="btn-ghost" onClick={() => shift(-1)}>
              ‹
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setCursor(new Date());
                setView("week");
              }}
            >
              Bugün
            </button>
            <button type="button" className="btn-ghost" onClick={() => shift(1)}>
              ›
            </button>
          </div>
        </div>
      ) : null}

      {incoming.length > 0 && tab === "takvim" ? (
        <button type="button" className="invite-banner" onClick={() => setTab("ekip")}>
          {incoming.length} davet bekliyor
        </button>
      ) : null}

      <main className="app-main">
        {error && tab !== "ekip" ? <p className="error-text">{error}</p> : null}

        {tab === "takvim" && view === "week" ? (
          <WeekView
            cursor={cursor}
            events={events}
            onSelectDay={(day) => setSheet({ type: "day", day })}
            onSelectEvent={(event) => setSheet({ type: "detail", event })}
          />
        ) : null}
        {tab === "takvim" && view === "month" ? (
          <MonthView
            cursor={cursor}
            events={events}
            onSelectDay={(day) => setSheet({ type: "day", day })}
            onSelectEvent={(event) => setSheet({ type: "detail", event })}
          />
        ) : null}
        {tab === "takvim" && view === "year" ? (
          <YearView
            cursor={cursor}
            onSelectMonth={(month) => {
              setCursor(startOfMonth(month));
              setView("month");
            }}
            onSelectYear={(year) => setCursor(new Date(year, 0, 1))}
          />
        ) : null}
        {tab === "todos" ? (
          <TodosView todos={todos} onUpdate={updateTodo} />
        ) : null}
        {tab === "ekip" ? (
          <TeamView
            user={user}
            incoming={incoming}
            outgoing={outgoing}
            friends={friends}
            selectedOwnerId={ownerId}
            onSelectOwner={(id) => {
              setOwnerId(id);
              setTab("takvim");
              setView("week");
            }}
            onInvite={inviteFriend}
            onRespond={respondInvite}
            onCancel={cancelInvite}
            busy={busy}
            error={error}
          />
        ) : null}
      </main>

      <button
        type="button"
        className="fab"
        aria-label="Hızlı ekle"
        onClick={() => setSheet({ type: "choose", day: cursor })}
      >
        <IconPlus className="h-8 w-8" />
      </button>

      {sheet?.type === "choose" ? (
        <Modal title="Hızlı ekle" onClose={() => setSheet(null)}>
          <div className="choose-grid">
            <button
              type="button"
              className="choose-card"
              onClick={() => setSheet({ type: "ai" })}
            >
              <strong>Bas ekle</strong>
              <span>Konuş, AI başlık ve tarihi ayarlasın</span>
            </button>
            <button
              type="button"
              className="choose-card"
              onClick={() => setSheet({ type: "manual", day: sheet.day })}
            >
              <strong>Manuel ekle</strong>
              <span>Saatlik, günlük veya daha uzun</span>
            </button>
            <button
              type="button"
              className="choose-card"
              onClick={() => setSheet({ type: "todo" })}
            >
              <strong>Yapılacak ekle</strong>
              <span>Günden bağımsız görev ekle</span>
            </button>
          </div>
          {!mine ? (
            <p className="muted">Yeni etkinlik senin takvimine eklenir.</p>
          ) : null}
        </Modal>
      ) : null}

      {sheet?.type === "todo" ? (
        <TodoQuickAdd
          onClose={() => setSheet(null)}
          saving={busy}
          error={error}
          onSubmit={async (title) => {
            const ok = await addTodo(title);
            if (ok) {
              setSheet(null);
              showToast("Yapılacak eklendi");
            }
          }}
        />
      ) : null}

      {sheet?.type === "ai" ? (
        <AiAddSheet
          onClose={() => setSheet(null)}
          onCreated={(event) => {
            if (ownerId === user.id) {
              setEvents((current) =>
                [...current, event].sort(
                  (a, b) => new Date(a.starts_at) - new Date(b.starts_at)
                )
              );
            } else {
              setOwnerId(user.id);
            }
            setCursor(new Date(event.starts_at));
            setView("week");
            setTab("takvim");
            setSheet({ type: "detail", event });
          }}
        />
      ) : null}

      {sheet?.type === "manual" ? (
        <Modal title="Manuel ekle" onClose={() => setSheet(null)}>
          <EventForm
            defaultDay={sheet.day}
            submitLabel="Ekle"
            saving={busy}
            error={error}
            onCancel={() => setSheet(null)}
            onSubmit={createEvent}
          />
        </Modal>
      ) : null}

      {sheet?.type === "edit" ? (
        <Modal title="Etkinliği düzenle" onClose={() => setSheet(null)}>
          <EventForm
            initialEvent={sheet.event}
            submitLabel="Kaydet"
            saving={busy}
            error={error}
            onCancel={() => setSheet(null)}
            onSubmit={(payload) => updateEvent(sheet.event.id, payload)}
          />
        </Modal>
      ) : null}

      {sheet?.type === "detail" ? (
        <EventDetail
          event={sheet.event}
          canEdit={sheet.event.user_id === user.id}
          onClose={() => setSheet(null)}
          onEdit={() => setSheet({ type: "edit", event: sheet.event })}
          onDelete={() => deleteEvent(sheet.event)}
        />
      ) : null}

      {sheet?.type === "day" ? (
        <DayEvents
          day={sheet.day}
          events={events}
          onClose={() => setSheet(null)}
          onSelectEvent={(event) => setSheet({ type: "detail", event })}
        />
      ) : null}

      {toast ? (
        <div className="app-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
