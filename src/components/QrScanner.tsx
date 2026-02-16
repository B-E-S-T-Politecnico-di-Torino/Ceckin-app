import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QrScanner({
  enabled,
  onCode,
  onError,
}: {
  enabled: boolean;
  onCode: (text: string) => void;
  onError?: (msg: string) => void;
}) {
  const idRef = useRef(`qr-${Math.random().toString(16).slice(2)}`);
  const qrRef = useRef<Html5Qrcode | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    qrRef.current = new Html5Qrcode(idRef.current);
    return () => {
      // cleanup hard
      qrRef.current?.stop().catch(() => {});
      try {
        qrRef.current?.clear();
      } catch {
  // ignore
    }

      qrRef.current = null;
    };
  }, []);

  useEffect(() => {
    const qr = qrRef.current;
    if (!qr) return;

    const start = async () => {
      if (running) return;
      try {
        setRunning(true);
        await qr.start(
          { facingMode: "environment" },
          {
            fps: 12,
            qrbox: { width: 260, height: 260 },
            aspectRatio: 1.0,
          },
          (decodedText) => onCode(decodedText),
          () => {} // ignore per-frame decode errors
        );
      } catch (e: any) {
        setRunning(false);
        onError?.(e?.message ?? "Camera error");
      }
    };

    const stop = async () => {
      if (!running) return;
      try {
        await qr.stop();
      } catch {
        // ignore
      } finally {
        setRunning(false);
      }
    };

    if (enabled) start();
    else stop();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return (
    <div className="card stack">
      <div style={{ fontWeight: 800 }}>Scanner QR</div>
      <div className="p">
        Consent access to the camera and scan the QR code.
      </div>
      <div
        id={idRef.current}
        style={{
          width: "100%",
          maxWidth: 420,
          margin: "0 auto",
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid var(--border)",
        }}
      />
      <div className="p" style={{ textAlign: "center" }}>
        {enabled ? "Scanner on" : "Scanner off"}
      </div>
    </div>
  );
}
