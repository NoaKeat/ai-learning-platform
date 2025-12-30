
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Learn from "./pages/Learn";

function isAuthedValue() {
  return Boolean(localStorage.getItem("userId"));
}

export default function App() {
  const [authed, setAuthed] = useState(() => isAuthedValue());

  useEffect(() => {
    const sync = () => setAuthed(isAuthedValue());

    // ✅ אירוע שאנחנו נירה אחרי login/logout (אותו טאאב)
    window.addEventListener("auth-changed", sync);

    // ✅ אירוע מובנה – עובד כשמשנים localStorage מטאב אחר
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("auth-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <Routes>
      {/* Register */}
      <Route
        path="/register"
        element={authed ? <Navigate to="/learn" replace /> : <Register />}
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
