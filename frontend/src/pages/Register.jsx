import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/apiClient";
import { setUser } from "../utils/storage";

import UnexpectedErrorAlert from "@/components/common/UnexpectedErrorAlert";
import { isUnexpectedError, isValidationError, getValidationFieldErrors } from "@/api/apiErrors";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { Loader2, BookOpen, AlertCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Register() {
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
    name: "",
    phone: location?.state?.phone ?? "",
  });

  const [errors, setErrors] = useState({ name: "", phone: "", general: "" });
  const [unexpectedError, setUnexpectedError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const next = { name: "", phone: "", general: "" };
    let ok = true;

    if (!form.name || form.name.trim().length < 2) {
      next.name = "Name must be at least 2 characters";
      ok = false;
    }

    const phoneRegex = /^05\d{8}$/;
    if (!form.phone || !phoneRegex.test(form.phone.trim())) {
      next.phone = "Phone must be in format 05XXXXXXXX";
      ok = false;
    }

    setErrors(next);
    return ok;
  }

  const onChangeField = (field) => (e) => {
    const value = e.target.value;
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  async function onSubmit(e) {
    e.preventDefault();

    setUnexpectedError(null);
    setErrors({ name: "", phone: "", general: "" });

    if (!validate()) return;

    setSubmitting(true);
    try {
      const data = await api.register({
        name: form.name.trim(),
        phone: form.phone.trim(),
      });

      setUser({
        id: data?.id ?? data?.userId ?? data?.Id,
        name: data?.name ?? data?.Name ?? form.name.trim(),
        phone: data?.phone ?? data?.Phone ?? form.phone.trim(),
      });

      navigate("/learn");
    } catch (err) {
      const status = err?.status;
      const code = err?.code;

      // ✅ EXPECTED: already exists => redirect to login
      if (status === 409 && code === "PHONE_ALREADY_EXISTS") {
        navigate("/login", {
          replace: true,
          state: {
            phone: form.phone.trim(),
            flash: { message: "You already have an account. Redirecting to Log In…" },
          },
        });
        return;
      }

      // ✅ EXPECTED: validation => map field errors if present
      if (isValidationError(err)) {
        const fieldErrors = getValidationFieldErrors(err);
        if (fieldErrors) {
          setErrors((p) => ({
            ...p,
            name: fieldErrors?.name?.[0] ?? "",
            phone: fieldErrors?.phone?.[0] ?? "",
            general: "",
          }));
          return;
        }
        setErrors((p) => ({ ...p, general: "Please check your input and try again." }));
        return;
      }

      // ❌ UNEXPECTED ONLY: network / 5xx
      if (isUnexpectedError(err)) {
        setUnexpectedError(err);
        return;
      }

      // ✅ Other expected-ish errors
      setErrors((p) => ({
        ...p,
        general: err?.message || `Registration failed (HTTP ${status ?? "?"})`,
      }));
    } finally {
      setSubmitting(false);
    }
  }

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
          <p className="text-slate-500 mt-1">AI-powered personalized learning</p>
        </div>

        <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center">Sign Up</CardTitle>
            <CardDescription className="text-center">Enter your details to begin your learning journey</CardDescription>
          </CardHeader>

          <CardContent>
            {flash?.message && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <Alert className="mb-6 border-indigo-200 bg-indigo-50">
                  <AlertDescription className="text-slate-700">{flash.message}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* ❌ only unexpected errors */}
            <UnexpectedErrorAlert error={unexpectedError} />

            {/* ✅ expected general errors only */}
            {errors.general && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-medium">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={onChangeField("name")}
                  disabled={submitting}
                  className={`h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors ${
                    errors.name ? "border-red-300 focus:ring-red-200" : "focus:ring-indigo-200"
                  }`}
                />
                {errors.name && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500 mt-1">
                    {errors.name}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-700 font-medium">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="05XXXXXXXX"
                  value={form.phone}
                  onChange={onChangeField("phone")}
                  disabled={submitting}
                  className={`h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors ${
                    errors.phone ? "border-red-300 focus:ring-red-200" : "focus:ring-indigo-200"
                  }`}
                />
                {errors.phone && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500 mt-1">
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
                    Creating account...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start Learning
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login", { state: { phone: form.phone.trim() } })}
                  className="text-indigo-600 hover:text-indigo-700 font-medium underline underline-offset-4"
                >
                  Log in
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
