import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Learn from "./pages/Learn";
import Admin from "./pages/Admin";

/**
 * ✅ Auth = userId exists
 */
function isAuthedValue() {
  return Boolean(localStorage.getItem("userId"));
}

/**
 * ✅ Admin access (production-like):
 * - In dev: easiest is VITE_ADMIN_KEY (recommended)
 * - Or localStorage "adminKey" if you prefer to paste it manually in the browser
 *
 * You can change this logic to whatever your [AdminKey] attribute expects.
 */
function hasAdminAccess() {
  const envKey = import.meta?.env?.VITE_ADMIN_KEY;
  const storedKey = localStorage.getItem("adminKey");
  return Boolean((envKey && String(envKey).trim()) || (storedKey && String(storedKey).trim()));
}

export default function App() {
  const [authed, setAuthed] = useState(() => isAuthedValue());

  // keep admin access reactive too (in case you set localStorage adminKey)
  const [adminAccess, setAdminAccess] = useState(() => hasAdminAccess());

  useEffect(() => {
    const sync = () => {
      setAuthed(isAuthedValue());
      setAdminAccess(hasAdminAccess());
    };

    window.addEventListener("auth-changed", sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("auth-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // ✅ default landing
  const defaultRoute = useMemo(() => (authed ? "/learn" : "/register"), [authed]);

  return (
    <Routes>
      {/* Default */}
      <Route path="/" element={<Navigate to={defaultRoute} replace />} />

      {/* Register */}
      <Route
        path="/register"
        element={authed ? <Navigate to="/learn" replace /> : <Register />}
      />

      {/* Login */}
      <Route
        path="/login"
        element={authed ? <Navigate to="/learn" replace /> : <Login />}
      />

      {/* Learn (protected) */}
      <Route
        path="/learn"
        element={authed ? <Learn /> : <Navigate to="/register" replace />}
      />

      {/* ✅ Admin (protected + hidden from normal flow) */}
      <Route
        path="/admin"
        element={
          authed && adminAccess ? (
            <Admin />
          ) : (
            // if user is not logged in -> go login/register
            // if logged in but not admin -> keep them in learn (so they won't "discover" admin)
            <Navigate to={authed ? "/learn" : "/login"} replace />
          )
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={defaultRoute} replace />} />
    </Routes>
  );
}
