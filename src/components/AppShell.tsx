import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import logo from "../assets/bestorino_bianco.png";

type Role = "OPERATOR" | "ADMIN";

interface AppShellProps {
  title: string;
  backTo?: string; // es: "/"
  children: React.ReactNode;
}

export default function AppShell({ title, backTo, children }: AppShellProps) {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("Operatore");
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (!u) return;

      setFullName(
        u.user_metadata?.full_name ||
        u.user_metadata?.name ||
        u.email ||
        "Operatore"
      );

      const { data: op } = await supabase
        .from("operators")
        .select("role")
        .eq("id", u.id)
        .maybeSingle();

      setRole((op?.role as Role) ?? null);
    };
    run();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="container">
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        {/* SINISTRA: freccia + titolo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {backTo && (
            <button
              onClick={() => navigate(backTo)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
              }}
              aria-label="Back"
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          <h1 style={{ margin: 0, fontSize: "1.5rem", color: "white" }}>{title}</h1>
        </div>

        {/* DESTRA: logo statico */}
        <img
          src={logo}
          alt="BEST Torino"
          style={{ height: 60, width: "auto" }}
        />
      </div>

      {/* USER BAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#BFC9D1",
          padding: "10px 15px",
          borderRadius: "12px",
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* NOME E COGNOME - COLORE MODIFICATO QUI */}
          <span 
            className="badge" 
            style={{ 
              color: "#25343F", 
              fontWeight: "bold",
              border: "1px solid rgba(37, 52, 63, 0.2)" 
            }}
          >
            {fullName}
          </span>

          {role && (
            <span
              className="badge"
              style={{
                borderColor: "#414a19",
                color: "#414a19",
                backgroundColor: "rgba(255, 155, 81, 0.1)",
                fontWeight: "bold"
              }}
            >
              {role}
            </span>
          )}
        </div>

        <button 
          className="btn btn-outline" 
          onClick={logout}
          style={{ padding: "6px 12px", fontSize: "0.85rem" }}
        >
          Logout
        </button>
      </div>

      <hr style={{ margin: "20px 0", border: "0", borderTop: "1px solid rgba(255,255,255,0.1)" }} />

      <main>{children}</main>
    </div>
  );
}