import { useEffect, useMemo, useRef, useState } from "react";
import AppShell from "../components/AppShell";
import { supabase } from "../lib/supabase";
import { callScan } from "../lib/api";
import HistoryPanel from "../components/HistoryPanel";
import QrScanner from "../components/QrScanner";


type EventRow = { id: string; name: string; is_active: boolean | null };
type ActionTypeRow = { code: string };

export default function ScanPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [actions, setActions] = useState<ActionTypeRow[]>([]);
  const [eventId, setEventId] = useState("");
  const [actionCode, setActionCode] = useState("CHECKIN");
  const [matricola, setMatricola] = useState("");

  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const lastSubmitRef = useRef<number>(0);

  const [refreshKey, setRefreshKey] = useState(0);

  const [scannerOn, setScannerOn] = useState(false);
  const lastQrRef = useRef<string>("");
  const lastQrTimeRef = useRef<number>(0);

  const activeEventName = useMemo(() => {
    const e = events.find((x) => x.id === eventId);
    return e ? e.name : "";
  }, [events, eventId]);

  useEffect(() => {
    (async () => {
      const { data: ev } = await supabase
        .from("events")
        .select("id,name,is_active")
        .order("is_active", { ascending: false })
        .order("name");

      const { data: at } = await supabase
        .from("action_types")
        .select("code")
        .order("code");

      setEvents((ev ?? []) as any);
      setActions((at ?? []) as any);

      const active = (ev ?? []).find((e: any) => e.is_active);
      if (active) setEventId(active.id);

      setTimeout(() => inputRef.current?.focus(), 150);
    })();
  }, []);

  // submit accetta anche una matricola “forzata” (utile per QR)
  const submit = async (forcedMatricola?: string) => {
    const now = Date.now();
    if (now - lastSubmitRef.current < 700) return; // blocca doppi tap
    lastSubmitRef.current = now;

    setResult(null);

    const m = (forcedMatricola ?? matricola).trim();
    if (!m || !eventId || !actionCode) return;

    try {
      setBusy(true);
      const r = await callScan({ matricola: m, event_id: eventId, action_code: actionCode });
      setResult(r);
      setRefreshKey((k) => k + 1);

      setMatricola("");
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (e: any) {
      setResult({ status: "ERROR", message: e?.message ?? "Errore" });
    } finally {
      setBusy(false);
    }
  };

  const bannerClass =
    result?.status === "OK" ? "banner ok" :
    result?.status === "ALREADY_DONE" ? "banner warn" :
    result ? "banner err" : "";

  return (
    <AppShell title="Check-in" backTo="/">
      <div className="stack">
        {/* CARD 1 — IMPOSTAZIONI */}
        <div className="card stack">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
            <div>
              <div className="h1" style={{ margin: 0 }}>Settings</div>
              <div className="p">Select event and action type.</div>
            </div>
            {eventId && (
              <span className="badge" style={{ borderColor: "rgba(255,122,24,0.35)" }}>
                {activeEventName || "Event selected"}
              </span>
            )}
          </div>

          <div className="row">
            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="p" style={{ marginBottom: 6 }}>Event</div>
              <select
                className="select"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
              >
                <option value="">Select...</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.is_active ? "● " : ""}{e.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="p" style={{ marginBottom: 6 }}>Action type</div>
              <select
                className="select"
                value={actionCode}
                onChange={(e) => setActionCode(e.target.value)}
              >
                {actions.map((a) => (
                  <option key={a.code} value={a.code}>{a.code}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <div className="p">
              {eventId ? "Ready to scan." : "Select an event before scanning."}
            </div>

            <button
              className={`btn ${scannerOn ? "" : "btn-accent"}`}
              onClick={() => setScannerOn((v) => !v)}
              disabled={!eventId}
              style={{ minWidth: 160 }}
            >
              {scannerOn ? "Disable scanner" : "Enable scanner"}
            </button>
          </div>
        </div>

        {/* CARD 2 — SCANNER */}
        {scannerOn && (
          <div className="stack">
            <QrScanner
              enabled={scannerOn}
              onCode={(text) => {
                const m = text.trim();

                // anti-doppia lettura
                const now = Date.now();
                if (m === lastQrRef.current && now - lastQrTimeRef.current < 1200) return;
                lastQrRef.current = m;
                lastQrTimeRef.current = now;

                // spegni scanner e invia SUBITO usando forcedMatricola (evita race con setState)
                setScannerOn(false);
                setMatricola(m);
                submit(m);
              }}
              onError={(msg) => setResult({ status: "ERROR", message: msg })}
            />
          </div>
        )}

        {/* CARD 3 — INSERIMENTO MANUALE + RISULTATO */}
        <div className="card stack">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
            <div>
              <div className="h1" style={{ margin: 0 }}>Manual input</div>
              <div className="p">Use this if the QR is damaged or the camera doesn't work.</div>
            </div>
            <span className="badge">Action: {actionCode}</span>
          </div>

          <div className="row">
            <input
              ref={inputRef}
              className="input"
              value={matricola}
              onChange={(e) => setMatricola(e.target.value)}
              placeholder="Student number (e.g. 12345)"
              inputMode="numeric"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="done"
              onKeyDown={(e) => e.key === "Enter" && submit()}
              style={{ flex: 1, minWidth: 220 }}
            />

            <button
              className="btn btn-accent"
              onClick={() => submit()}
              disabled={busy || !matricola.trim() || !eventId}
              style={{ minWidth: 140 }}
            >
              {busy ? "Sending…" : "Confirm"}
            </button>
          </div>

          {result && (
            <div className={bannerClass}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 800 }}>
                    {result.status}
                    {typeof result.activated === "boolean" && ` • activated=${result.activated}`}
                  </div>
                  <div className="p">
                    {result.message ?? `${result.matricola ?? ""} ${result.full_name ?? ""}`.trim()}
                  </div>
                </div>
                {result.action_code && <span className="badge">{result.action_code}</span>}
              </div>
            </div>
          )}
        </div>

        {/* CARD 4 — STORICO */}
        <HistoryPanel eventId={eventId} limit={30} refreshKey={refreshKey} />
      </div>
    </AppShell>
  );
}
