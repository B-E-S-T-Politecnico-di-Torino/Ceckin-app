import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import FullScreenLoader from "../components/FullScreenLoader";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) return <FullScreenLoader text="Caricamento sessione…" />;
  if (!session) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

