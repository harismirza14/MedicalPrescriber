import React, { useState, useId, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CalendarCheck,
  Stethoscope,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { loginUser } from "../store/authSlice";
import { useTheme } from "../context/Theme";

function FloatingField({
  label,
  type = "text",
  icon: Icon,
  value,
  onChange,
  error,
  required,
  autoComplete,
  disabled,
}) {
  const id = useId();
  const errorId = useId();
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const active = focused || value.length > 0;

  return (
    <div className="relative">
      <div
        className={`relative rounded-xl border bg-white dark:bg-slate-800 transition-all duration-200 ${
          error
            ? "border-red-400 ring-2 ring-red-100 dark:ring-red-900/50"
            : focused
            ? "border-blue-500 ring-2 ring-blue-100 dark:ring-blue-500/30"
            : "border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500"
        } ${disabled ? "opacity-60" : ""}`}
      >
        <Icon
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] transition-colors ${
            focused
              ? "text-blue-600 dark:text-blue-400"
              : "text-slate-400 dark:text-slate-500"
          }`}
        />
        <input
          id={id}
          type={isPassword && show ? "text" : type}
          value={value}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className="w-full bg-transparent pl-11 pr-11 pt-5 pb-2 text-sm text-slate-800 dark:text-white outline-none disabled:cursor-not-allowed [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_#fff] dark:[&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_#1e293b] [-webkit-text-fill-color:inherit] dark:[-webkit-text-fill-color:white]"
        />
        <label
          htmlFor={id}
          className={`absolute left-11 transition-all duration-200 pointer-events-none ${
            active
              ? "top-2 text-[11px] font-medium text-blue-600 dark:text-blue-400"
              : "top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-slate-500"
          }`}
        >
          {label}
        </label>
        {isPassword && (
          <button
            type="button"
            disabled={disabled}
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow((s) => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed"
          >
            {show ? (
              <EyeOff className="h-[18px] w-[18px]" />
            ) : (
              <Eye className="h-[18px] w-[18px]" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p
          id={errorId}
          className="mt-1.5 ml-1 text-xs text-red-500 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function PulseLine() {
  return (
    <svg viewBox="0 0 400 80" className="w-full h-16" preserveAspectRatio="none">
      <motion.path
        d="M0 40 H120 L140 40 L155 10 L175 70 L190 40 H400"
        fill="none"
        stroke="url(#pulseGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          duration: 2.2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 1.2,
        }}
      />
      <defs>
        <linearGradient id="pulseGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#93C5FD" stopOpacity="0" />
          <stop offset="50%" stopColor="#5EEAD4" />
          <stop offset="100%" stopColor="#93C5FD" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({});
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const { loading, error: authError } = useSelector((state) => state.auth);
  const { theme } = useTheme();

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  const errors = useMemo(() => {
    const e = {};
    if (!userId.trim()) e.userId = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(userId)) e.userId = "Email is invalid";
    if (!password.trim()) e.password = "Password is required";
    return e;
  }, [userId, password]);

  const isValid = Object.keys(errors).length === 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ userId: true, password: true });
    setError(null);
    if (!isValid) return;
    dispatch(loginUser({ userId: userId.trim(), password }));
  };

  const handleUserIdChange = (e) => {
    setUserId(e.target.value);
    if (error) setError(null);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError(null);
  };

  const trustPoints = [
    { icon: ShieldCheck, text: "HIPAA-compliant data handling" },
    { icon: CalendarCheck, text: "Same-day appointment scheduling" },
    { icon: Stethoscope, text: "Direct messaging with your care team" },
  ];

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500">
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_1px_1px,_white_1px,_transparent_0)] bg-[size:24px_24px]" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <Stethoscope className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">MediCare</span>
          </div>
          <div className="max-w-sm">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight">
              Your care, coordinated in one place.
            </h1>
            <p className="mt-3 text-blue-100 text-sm leading-relaxed">
              Book visits, message your providers, and keep records straight — built for patients, doctors, and staff alike.
            </p>
            <div className="mt-8 -ml-1"><PulseLine /></div>
            <ul className="mt-6 space-y-3">
              {trustPoints.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-blue-50">
                  <Icon className="h-4 w-4 shrink-0 text-cyan-200" /> {text}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-blue-200/80">© {new Date().getFullYear()} MediCare Health Systems</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-800 dark:text-white">MediCare</span>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-slate-900/60 p-8 relative">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Welcome back</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to access your dashboard.</p>
            {error && (
              <div role="alert" className="mt-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <FloatingField
                label="Email address"
                type="email"
                icon={Mail}
                value={userId}
                onChange={handleUserIdChange}
                error={touched.userId ? errors.userId : null}
                autoComplete="email"
                required
                disabled={loading}
              />
              <FloatingField
                label="Password"
                type="password"
                icon={Lock}
                value={password}
                onChange={handlePasswordChange}
                error={touched.password ? errors.password : null}
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="group w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-800 to-cyan-500 py-3 px-6 text-base font-medium text-white shadow-md shadow-blue-500/20 transition-all duration-150 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-px active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Signing in…
                  </>
                ) : (
                  <>Sign In <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" /></>
                )}
              </button>
            </form>
          </div>
          <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
            By Signing in, you agree to MediCare's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}