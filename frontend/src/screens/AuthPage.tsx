"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";

const USERNAME_REGEX = /^\w{3,30}$/;

export default function AuthPage() {
  const router = useRouter();
  const { login, register } = useUser();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function submitSignIn() {
    setError(null);
    try {
      await login(email, password);
      router.push("/");
    } catch (e) {
      const code = (e as Error).message;
      setError(code === "INVALID_CREDENTIALS" ? "Wrong email or password" : "Sign in failed");
    }
  }

  async function submitSignUp() {
    setError(null);
    if (!USERNAME_REGEX.test(username)) return setError("Username must be 3-30 chars (letters/numbers/_)");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (password !== confirmPassword) return setError("Passwords do not match");

    try {
      await register(username, email, password);
      router.push("/");
    } catch (e) {
      const code = (e as Error).message;
      if (code === "USERNAME_TAKEN") setError("Username is already taken");
      else if (code === "EMAIL_TAKEN") setError("Email is already registered");
      else setError("Sign up failed");
    }
  }

  return (
    <section className="card mx-auto max-w-xl p-6">
      <div className="mb-4 flex gap-2">
        <button className={`glassBtn ${tab === "signin" ? "!bg-white/20" : ""}`} onClick={() => setTab("signin")}>Sign In</button>
        <button className={`glassBtn ${tab === "signup" ? "!bg-white/20" : ""}`} onClick={() => setTab("signup")}>Sign Up</button>
      </div>

      {tab === "signin" ? (
        <div className="space-y-3">
          <input className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="flex gap-2">
            <input className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2" type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="glassBtn" onClick={() => setShowPassword((v) => !v)}>{showPassword ? "Hide" : "Show"}</button>
          </div>
          <button className="pillAction" onClick={submitSignIn}>Sign In</button>
        </div>
      ) : (
        <div className="space-y-3">
          <input className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2" type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2" type={showPassword ? "text" : "password"} placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <button className="pillAction" onClick={submitSignUp}>Sign Up</button>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
    </section>
  );
}
