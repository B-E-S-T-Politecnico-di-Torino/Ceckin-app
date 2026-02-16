import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import logo from "../assets/bestorino_colorato2.png";
import { useAuth } from "../auth/AuthProvider";
import FullScreenLoader from "../components/FullScreenLoader";

export default function LoginPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  const [checkingOperator, setCheckingOperator] = useState(false);
  const [isOperator, setIsOperator] = useState(false);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (loading) return;

      if (!session?.user?.id) {
        if (!alive) return;
        setIsOperator(false);
        return;
      }

      if (!alive) return;
      setCheckingOperator(true);

      const { data, error } = await supabase
        .from("operators")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!alive) return;
      setCheckingOperator(false);

      if (error) {
        console.error("operators check error:", error);
        setIsOperator(false);
        return;
      }

      const ok = !!data;
      setIsOperator(ok);

      if (ok) navigate("/app");
    };

    run();

    return () => {
      alive = false;
    };
  }, [session, loading, navigate]);

  const login = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { 
      // Aggiungi lo slash finale e assicurati che sia identico 
      // a quello inserito in Supabase e Google Cloud
      redirectTo: "https://www.bestorino.com/checkin/",
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  if (error) alert(error.message);
};

  const handleRegistration = async () => {
    if (!session) {
      alert("Not authenticated");
      return;
    }

    setCheckingOperator(true);
    const { data, error } = await supabase.rpc("register_me");
    setCheckingOperator(false);

    if (error) {
      alert(error.message);
      return;
    }

    console.log("registered:", data?.[0]);
    navigate("/app");
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return <FullScreenLoader text="Loading..." />;
  if (session && checkingOperator) return <FullScreenLoader text="Verifying permissions…" />;
  if (session && isOperator) return <FullScreenLoader text="Accessing app…" />;

  return (
    <div style={{ minHeight: "100vh", padding: 20 }}>
      <div style={{ textAlign: "right", marginBottom: "40px" }}>
        <img src={logo} alt="BEST Torino" style={{ height: 60, width: "auto" }} />
      </div>

      <div
        style={{
          maxWidth: 400,
          margin: "100px auto",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <h1 style={{ fontSize: "2rem", margin: 0 }}>BEST Check-in</h1>
        <p style={{ color: "#EAEFEF" }}>Only @bestorino.com accounts admitted.</p>

        <button
          onClick={login}
          disabled={!!session}
          style={{
            width: "100%",
            padding: "14px 14px",
            backgroundColor: "#ff9b51",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: !!session ? "not-allowed" : "pointer",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            transition: "transform 0.2s ease",
            opacity: !!session ? 0.85 : 1,
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Sign in with Google
        </button>

        {session && !isOperator && (
          <button
            onClick={handleRegistration}
            style={{
              width: "100%",
              padding: "14px 14px",
              backgroundColor: "#84934A",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              transition: "transform 0.2s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Sign up with Google
          </button>
        )}

        {session && (
          <button
            onClick={logout}
            style={{
              width: "100%",
              padding: "12px 14px",
              backgroundColor: "#EAEFEF",
              color: "#111",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.95rem",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 4px 6px rgba(0,0,0,0.08)",
            }}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
