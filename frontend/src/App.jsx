import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Learn from "./pages/Learn";
import Admin from "./pages/Admin";


function isAuthedValue() {
  return Boolean(localStorage.getItem("userId"));
}


function hasAdminAccess() {
  const envKey = import.meta?.env?.VITE_ADMIN_KEY;
  const storedKey = localStorage.getItem("adminKey");
  return Boolean((envKey && String(envKey).trim()) || (storedKey && String(storedKey).trim()));
}

export default function App() {
  const [authed, setAuthed] = useState(() => isAuthedValue());

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

  const defaultRoute = useMemo(() => (authed ? "/learn" : "/register"), [authed]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to={defaultRoute} replace />} />

      <Route
        path="/register"
        element={authed ? <Navigate to="/learn" replace /> : <Register />}
      />

      <Route
        path="/login"
        element={authed ? <Navigate to="/learn" replace /> : <Login />}
      />

      <Route
        path="/learn"
        element={authed ? <Learn /> : <Navigate to="/register" replace />}
      />

      <Route
        path="/admin"
        element={
          authed && adminAccess ? (
            <Admin />
          ) : (
            <Navigate to={authed ? "/learn" : "/login"} replace />
          )
        }
      />

      <Route path="*" element={<Navigate to={defaultRoute} replace />} />
    </Routes>
  );
}
