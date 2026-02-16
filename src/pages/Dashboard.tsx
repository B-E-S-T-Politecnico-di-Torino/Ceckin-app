import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom"; // <--- IMPORTANTE
import AppShell from "../components/AppShell";
import { supabase } from "../lib/supabase";
import FullScreenLoader from "../components/FullScreenLoader";

type Role = "OPERATOR" | "ADMIN";

export default function Dashboard() {
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("operators")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error(error);
        setRole(null);
      } else {
        setRole((data?.role as Role) ?? null);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <FullScreenLoader text="Loading..." />;

  // CORREZIONE 1: Usa il componente Navigate invece di window.location
  // Questo mantiene la navigazione gestita dal router interno
  if (!role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <AppShell title="Dashboard">
      <div className="grid">
        {/* CORREZIONE 2: Usa Link invece di <a> */}
        {/* React Router trasformerà automaticamente "/scan" in "/checkin/scan" */}
        <Link className="tile tile-accent" to="/scan">
          <div className="tile-title">CHECK-IN</div>
          <div className="tile-sub">
            Scan QR or insert student number.
          </div>
        </Link>

        {role === "ADMIN" ? (
          /* CORREZIONE 3: Usa Link anche qui */
          <Link className="tile" to="/deposit">
            <div className="tile-title">DEPOSIT</div>
            <div className="tile-sub">
              Admin area, limited access.
            </div>
          </Link>
        ) : (
          <div className="tile" style={{ opacity: 0.6 }}>
            <div className="tile-title">DEPOSIT</div>
            <div className="tile-sub">Admin area, access denied.</div>
          </div>
        )}
      </div>
    </AppShell>
  );
}