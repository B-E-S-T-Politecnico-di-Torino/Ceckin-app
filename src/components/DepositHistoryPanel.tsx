import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Row = {
  log_id: string;
  created_at: string;
  from_status: string;
  to_status: string;
  note: string | null;
  matricola: string;
  full_name: string;
  changed_by: string;
};

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString([], { year: "2-digit", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function DepositHistoryPanel({
  limit = 30,
  matricolaFilter,
  refreshKey,
}: {
  limit?: number;
  matricolaFilter?: string;
  refreshKey?: number;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);

    let q = supabase
      .from("v_deposit_feed")
      .select("log_id,created_at,from_status,to_status,note,matricola,full_name,changed_by")
      .order("created_at", { ascending: false })
      .limit(limit);

    const m = (matricolaFilter ?? "").trim();
    if (m) q = q.eq("matricola", m);

    const { data, error } = await q;
    if (!error && data) setRows(data as any);

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matricolaFilter, refreshKey]);

  return (
    <div className="card stack">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 800 }}>Deposit history</div>
          <div className="p">Last {limit} changes{matricolaFilter?.trim() ? ` for student ${matricolaFilter.trim()}` : ""}</div>
        </div>
        <button className="btn" onClick={load} disabled={loading}>
          {loading ? "Updating…" : "Refresh"}
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "var(--muted)", textAlign: "left" }}>
              <th style={{ padding: "8px 6px" }}>When</th>
              <th style={{ padding: "8px 6px" }}>Student id</th>
              <th style={{ padding: "8px 6px" }}>Name</th>
              <th style={{ padding: "8px 6px" }}>From → To</th>
              <th style={{ padding: "8px 6px" }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.log_id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "10px 6px", whiteSpace: "nowrap" }}>{fmtDateTime(r.created_at)}</td>
                <td style={{ padding: "10px 6px", fontWeight: 800 }}>{r.matricola}</td>
                <td style={{ padding: "10px 6px" }}>{r.full_name}</td>
                <td style={{ padding: "10px 6px" }}>
                  <span className="badge">{r.from_status}</span>{" "}
                  <span style={{ color: "var(--muted)" }}>→</span>{" "}
                  <span className="badge" style={{ borderColor: "rgba(255,122,24,0.45)" }}>{r.to_status}</span>
                </td>
                <td style={{ padding: "10px 6px", color: "var(--muted)" }}>{r.note ?? ""}</td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={5} style={{ padding: "10px 6px", color: "var(--muted)" }}>
                  No changes registered.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
