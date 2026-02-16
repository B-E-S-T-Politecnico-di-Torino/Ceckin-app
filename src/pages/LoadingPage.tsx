import logo from "../assets/bestorino_colorato2.png";

export default function LoadingPage() {
  return (
    <div style={{ minHeight: "100vh", padding: 20 }}>
      <div style={{ textAlign: "center", marginBottom: "200px" }}>
        <img src={logo} alt="BEST Torino" style={{ height: 60, width: "auto" }} />
      </div>

      <div
        style={{
          maxWidth: 400,
          margin: "140px auto",
          textAlign: "center",
          color: "#EAEFEF",
        }}
      >
        <p style={{ marginTop: 16, opacity: 0.9 }}>LOADING...</p>

        {/* spinner semplice */}
        <div
          style={{
            margin: "26px auto 0",
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
