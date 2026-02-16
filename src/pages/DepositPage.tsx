import { useEffect, useRef, useState } from "react";
import AppShell from "../components/AppShell";
import DepositHistoryPanel from "../components/DepositHistoryPanel";
import { callDeposit } from "../lib/api";
import { supabase } from "../lib/supabase";
import FullScreenLoader from "../components/FullScreenLoader";

type Role = "OPERATOR" | "ADMIN";
type Status = "PAID" | "REFUNDED" | "CANCELLED";
type EventRow = { id: string; name: string; is_active: boolean | null };

const STATUSES: Status[] = ["PAID", "REFUNDED", "CANCELLED"];

export default function DepositPage() {
  const [role, setRole] = useState<Role | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  const [events, setEvents] = useState<EventRow[]>([]);
  const [eventId, setEventId] = useState("");

  const [matricola, setMatricola] = useState("");
  const [status, setStatus] = useState<Status>("PAID");
  const [note, setNote] = useState("");

  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const mRef = useRef<HTMLInputElement | null>(null);
  const lastSubmitRef = useRef<number>(0);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        setRole(null);
        setLoadingRole(false);
        return;
      }

      const { data: opRow } = await supabase
        .from("operators")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      const r = (opRow?.role as Role) ?? null;
      setRole(r);
      setLoadingRole(false);

      if (r !== "ADMIN") return;

      const { data: ev } = await supabase
        .from("events")
        .select("id,name,is_active")
        .order("is_active", { ascending: false })
        .order("name");

      const list = (ev ?? []) as any as EventRow[];
      setEvents(list);

      const active = list.find((e) => e.is_active);
      if (active) setEventId(active.id);

      setTimeout(() => mRef.current?.focus(), 150);
    })();
  }, []);

  const submit = async () => {
    setResult(null);

    const now = Date.now();
    if (now - lastSubmitRef.current < 700) return;
    lastSubmitRef.current = now;

    const m = matricola.trim();
    if (!eventId) {
      setResult({ status: "ERROR", message: "Select an event." });
      return;
    }
    if (!m) return;

    try {
      setBusy(true);

      // backend nuovo: caparra per-evento su participants
      // PAID -> crea/upsert participants automaticamente
      const r = await callDeposit({
        matricola: m,
        new_status: status,
        note: note.trim() || undefined,
        event_id: eventId,
      });

      setResult(r);
      setRefreshKey((k) => k + 1);

      // UX: pulisci note, mantieni matricola se vuoi fare più stati sulla stessa persona?
      // Io consiglio: svuota matricola solo se OK
      if (r?.status === "OK" || r?.status === "NO_CHANGE") {
        setMatricola("");
        setNote("");
      }

      setTimeout(() => mRef.current?.focus(), 50);
    } catch (e: any) {
      setResult({ status: "ERROR", message: e?.message ?? "Errore" });
    } finally {
      setBusy(false);
    }
  };

  if (loadingRole) return <FullScreenLoader text="Loading role…" />;

  if (role !== "ADMIN") {
    return (
      <AppShell title="DEPOSIT" backTo="/">
        <div className="card">
          <div style={{ fontWeight: 800 }}>Only ADMIN</div>
          <div className="p">This section is only available to administrators.</div>
        </div>
      </AppShell>
    );
  }

  const bannerClass =
    result?.status === "OK" || result?.status === "NO_CHANGE" ? "banner ok" :
    result ? "banner err" : "";

  return (
    <AppShell title="DEPOSIT" backTo="/"> 
      <div className="stack">
        {/* FORM */}
        <div className="card stack">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
            <div>
              <div className="h1" style={{ margin: 0 }}>Deposit management</div>
              <div className="p">
                If you set <b>PAID</b>, the participant is inserted/updated in <b>participants</b> for the selected event.
              </div>
            </div>
            <span className="badge" style={{ borderColor: "rgba(255,122,24,0.35)" }}>ADMIN</span>
          </div>

          <div className="row">
            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="p" style={{ marginBottom: 6 }}>Event</div>
              <select
                className="select"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
              >
                <option value="">Select…</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.is_active ? "● " : ""}{e.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="p" style={{ marginBottom: 6 }}>New status</div>
              <select
                className="select"
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="row">
            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="p" style={{ marginBottom: 6 }}>Student number</div>
              <input
                ref={mRef}
                className="input"
                value={matricola}
                onChange={(e) => setMatricola(e.target.value)}
                placeholder="Es. 12345"
                inputMode="numeric"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="done"
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            </div>

            <div style={{ flex: 2, minWidth: 220 }}>
              <div className="p" style={{ marginBottom: 6 }}>Notes (optional)</div>
              <input
                className="input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex. cash/money transfer"
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            </div>
          </div>

          <button
            className="btn btn-accent"
            onClick={submit}
            disabled={busy || !eventId || !matricola.trim()}
          >
            {busy ? "Updating…" : "Update deposit"}
          </button>

          {result && (
            <div className={bannerClass}>
              <div style={{ fontWeight: 800 }}>
                {result.status}
              </div>

              <div className="p">
                {result.message ?? `${result.matricola ?? ""} ${result.full_name ?? ""}`.trim()}
              </div>

              {(result.from_status || result.to_status) && (
                <div style={{ marginTop: 8 }}>
                  <span className="badge">{result.from_status ?? "?"}</span>{" "}
                  <span style={{ color: "var(--muted)" }}>→</span>{" "}
                  <span className="badge" style={{ borderColor: "rgba(255,122,24,0.45)" }}>
                    {result.to_status ?? "?"}
                  </span>
                </div>
              )}

              {result.participant_id && (
                <div className="p" style={{ marginTop: 6 }}>
                  participant_id: {result.participant_id}
                </div>
              )}
            </div>
          )}
        </div>

        {/* HISTORY */}
        <DepositHistoryPanel
          limit={30}
          matricolaFilter={matricola.trim() ? matricola.trim() : undefined}
          refreshKey={refreshKey}
        />
      </div>
    </AppShell>
  );
}
