
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Frontend validation only.
    // Connect your password reset API or Firebase Auth here.
    setError(
      "Password reset is not connected yet. Connect your authentication service to reset your password."
    );
  };

  return (
    <>
      <Navbar />

      <main className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-[#09090b] px-5 py-12 text-white">
        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-3xl text-violet-300">
              🔐
            </div>

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
              Account recovery
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Reset your password
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/50">
              Create a new password to get back to your EventHive account.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/10 bg-[#111114] p-6 shadow-2xl shadow-black/20 sm:p-8"
          >
            <div className="mb-5">
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-white/80"
              >
                New password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/10 bg-[#09090b] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />

              <p className="mt-2 text-xs text-white/35">
                Use at least 8 characters.
              </p>
            </div>

            <div className="mb-5">
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-white/80"
              >
                Confirm password
              </label>

              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/10 bg-[#09090b] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm leading-6 text-red-300"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="mb-5 rounded-xl border border-green-400/20 bg-green-500/10 p-3 text-sm text-green-300"
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-violet-500 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-violet-950/20 transition duration-300 hover:-translate-y-0.5 hover:bg-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:ring-offset-2 focus:ring-offset-[#111114]"
            >
              Reset Password →
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-4 w-full rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/60 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              Back to Login
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-white/30">
            EventHive · Your next experience starts here.
          </p>
        </div>
      </main>
    </>
  );
}