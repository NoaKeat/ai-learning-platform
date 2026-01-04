import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/apiClient";
import { setUser } from "../utils/storage";

import UnexpectedErrorAlert from "@/components/common/UnexpectedErrorAlert";
import { isUnexpectedError, isValidationError } from "@/api/apiErrors";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { Loader2, BookOpen, AlertCircle, LogIn } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialFlash = useMemo(() => location?.state?.flash ?? null, [location?.state]);
  const [flash, setFlash] = useState(initialFlash);

  useEffect(() => {
    if (!flash?.message) return;
    const t = setTimeout(() => setFlash(null), 5000);
    return () => clearTimeout(t);
  }, [flash]);

  const [form, setForm] = useState({
    phone: location?.state?.phone ?? "",
  });

  const [errors, setErrors] = useState({ phone: "", general: "" });
  const [unexpectedError, setUnexpectedError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const next = { phone: "", general: "" };
    let ok = true;

    const phoneRegex = /^05\d{8}$/;
    if (!form.phone || !phoneRegex.test(form.phone.trim())) {
      next.phone = "Phone must be in format 05XXXXXXXX";
      ok = false;
    }

    setErrors(next);
    return ok;
  }

  async function onSubmit(e) {
    e.preventDefault();

    setUnexpectedError(null);
    setErrors({ phone: "", general: "" });

    if (!validate()) return;

    setSubmitting(true);
    try {
      const data = await api.login({ phone: form.phone.trim() });

      const user = data?.user;
      const token = data?.token;

      if (token) localStorage.setItem("token", token);

      setUser({
        id: user?.id ?? user?.userId ?? user?.Id,
        name: user?.name ?? user?.Name ?? "",
        phone: user?.phone ?? user?.Phone ?? form.phone.trim(),
      });

      navigate("/learn");
    } catch (err) {
      const status = err?.status;
      const code = err?.code;

      if (status === 404 && code === "USER_NOT_FOUND") {
        navigate("/register", {
          replace: true,
          state: {
            phone: form.phone.trim(),
            flash: { message: "No account found for this phone. Redirecting to Sign Up…" },
          },
        });
        return;
      }

      if (isValidationError(err)) {
        setErrors((p) => ({ ...p, general: "Please check your input and try again." }));
        return;
      }

      if (isUnexpectedError(err)) {
        setUnexpectedError(err);
        return;
      }

      setErrors((p) => ({
        ...p,
        general: err?.message || `Login failed (HTTP ${status ?? "?"})`,
      }));
    } finally {
      setSubmitting(false);
    }
  }

  const phoneErrorId = "phone-error";
  const generalErrorId = "login-general-error";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200 mb-4"
          >
            <BookOpen className="w-8 h-8 text-white" />
          </motion.div>

          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Learning Platform</h1>
          <p className="text-slate-500 mt-1">Log in with your phone</p>
        </div>

        <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center">Log In</CardTitle>
            <CardDescription className="text-center">Enter your phone to continue</CardDescription>
          </CardHeader>

          <CardContent>
            {flash?.message && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <Alert className="mb-6 border-indigo-200 bg-indigo-50">
                  <AlertDescription className="text-slate-700">{flash.message}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <UnexpectedErrorAlert error={unexpectedError} />

            {errors.general && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50" aria-live="polite">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription id={generalErrorId}>{errors.general}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <form onSubmit={onSubmit} className="space-y-5" noValidate>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-700 font-medium">
                  Phone Number
                </Label>

                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="05XXXXXXXX"
                  value={form.phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm((p) => ({ ...p, phone: value }));
                    if (errors.phone) setErrors((p) => ({ ...p, phone: "" }));
                  }}
                  disabled={submitting}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? phoneErrorId : undefined}
                  className={`h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors ${
                    errors.phone ? "border-red-300 focus:ring-red-200" : "focus:ring-indigo-200"
                  }`}
                />

                {errors.phone && (
                  <motion.p
                    id={phoneErrorId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-red-500 mt-1"
                    aria-live="polite"
                  >
                    {errors.phone}
                  </motion.p>
                )}
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-lg shadow-indigo-200 transition-all duration-200"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Continue
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-slate-500">
                New here?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register", { state: { phone: form.phone.trim() } })}
                  className="text-indigo-600 hover:text-indigo-700 font-medium underline underline-offset-4"
                >
                  Sign up
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
