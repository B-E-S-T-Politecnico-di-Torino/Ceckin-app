import "./styles/theme.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import RequireAuth from "./auth/RequireAuth";

import LoginPage from "./pages/LoginPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import Dashboard from "./pages/Dashboard";
import ScanPage from "./pages/ScanPage";
import DepositPage from "./pages/DepositPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      {/* MODIFICA FONDAMENTALE: basename="/checkin"
         Questo impedisce al router di cancellare l'URL al ritorno da Google
         e fa funzionare i refresh della pagina su Aruba.
      */}
      <BrowserRouter basename="/checkin">
        <Routes>
          {/* Pubblica - Corrisponde a www.bestorino.com/checkin/ */}
          <Route path="/" element={<LoginPage />} />
          
          {/* Redirect di sicurezza per vecchi link */}
          <Route path="/login" element={<Navigate to="/" replace />} />

          {/* Pagina non autorizzata */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Rotte Protette */}
          <Route
            path="/app"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/scan"
            element={
              <RequireAuth>
                <ScanPage />
              </RequireAuth>
            }
          />
          <Route
            path="/deposit"
            element={
              <RequireAuth>
                <DepositPage />
              </RequireAuth>
            }
          />
          
          {/* Catch all: se la rotta non esiste, torna alla login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);