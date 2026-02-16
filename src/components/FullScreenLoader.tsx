import { useEffect } from "react";
import logo from "../assets/bestorino_colorato2.png";

export default function FullScreenLoader({ text = "LOADING" }: { text?: string }) {
  // blocca scroll mentre il loader è visibile
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,             // più alto, a prova di modali/portals
        background: "#0f1115",
        padding: 20,
        pointerEvents: "all",        // cattura i click
        overflow: "hidden",          // evita scroll interno accidentale
        transform: "translateZ(0)",  // aiuta contro flicker GPU
      }}
      aria-busy="true"
      aria-live="polite"
    >
      <div style={{ textAlign: "center", marginBottom: "120px" }}>
        <img src={logo} alt="BEST Torino" style={{ height: 200, width: "auto" }} />
      </div>

      <div
        style={{
          maxWidth: 400,
          margin: "100px auto",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          color: "#EAEFEF",
        }}
      >
        <h1 style={{ fontSize: "2rem", margin: 0 }}>PLEASE WAIT</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>{text}</p>

        <div
          style={{
            marginTop: 10,
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: "4px solid rgba(234,239,239,0.25)",
            borderTop: "4px solid rgba(234,239,239,0.95)",
            animation: "spin 1s linear infinite",
          }}
        />

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
