import { supabase } from "../lib/supabase";

export default function UnauthorizedPage() {
  return (
    <div style={{ padding: 24, maxWidth: 560, margin: "0 auto" }}>
      <h2>ACCESS DENIED</h2>
      <p>You are not authorized to access this page. Please contact it@bestorino.com if you think this is a mistake.</p>
      <button onClick={() => supabase.auth.signOut()} style={{ padding: "10px 14px" }}>
        Logout
      </button>
    </div>
  );
}
