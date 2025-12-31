import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Learn from "./pages/Learn";

function isAuthedValue() {
  return Boolean(localStorage.getItem("userId"));
}

export default function App() {
  const [authed, setAuthed] = useState(() => isAuthedValue());

  useEffect(() => {
    const sync = () => setAuthed(isAuthedValue());

    window.addEventListener("auth-changed", sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("auth-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <Routes>
      {/* default: go to register if not authed, else learn */}
      <Route path="/" element={<Navigate to={authed ? "/learn" : "/register"} replace />} />

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

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to={authed ? "/learn" : "/register"} replace />}
      />
    </Routes>
  );
}
