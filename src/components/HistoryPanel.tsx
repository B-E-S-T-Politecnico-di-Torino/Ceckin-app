import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Row = {
  action_id: string;
  created_at: string;
  action_code: string;
  matricola: string;
  full_name: string;
  operator_id: string;
};

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function HistoryPanel({
  eventId,
  limit = 30,
  refreshKey,
}: {
  eventId: string;
  limit?: number;
  refreshKey?: number; // cambia per forzare reload
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!eventId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("v_actions_feed")
      .select("action_id,created_at,action_code,matricola,full_name,operator_id")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!error && data) setRows(data as any);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, refreshKey]);

  return (
    <div className="card stack">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 800 }}>History</div>
          <div className="p">Last {limit} actions for the selected event</div>
        </div>
        <button className="btn" onClick={load} disabled={loading || !eventId}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "var(--muted)", textAlign: "left" }}>
              <th style={{ padding: "8px 6px" }}>When</th>
              <th style={{ padding: "8px 6px" }}>Action</th>
              <th style={{ padding: "8px 6px" }}>Student number</th>
              <th style={{ padding: "8px 6px" }}>Name</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.action_id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "10px 6px", whiteSpace: "nowrap" }}>{fmtTime(r.created_at)}</td>
                <td style={{ padding: "10px 6px" }}>
                  <span className="badge">{r.action_code}</span>
                </td>
                <td style={{ padding: "10px 6px", fontWeight: 700 }}>{r.matricola}</td>
                <td style={{ padding: "10px 6px" }}>{r.full_name}</td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={4} style={{ padding: "10px 6px", color: "var(--muted)" }}>
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
