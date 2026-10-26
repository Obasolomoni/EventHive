
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Frontend demo only.
    // Connect Firebase Authentication or your backend here.
    setError(
      "Registration is not connected yet. Connect your authentication service to create an account."
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-5 py-12 text-white">
      <div className="w-full max-w-md">
        {/* EventHive brand */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mx-auto mb-8 flex items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          aria-label="EventHive home"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500 text-xl font-black shadow-lg shadow-violet-950/40">
            E
          </span>

          <span className="text-2xl font-extrabold tracking-tight">
            Event<span className="text-violet-400">Hive</span>
          </span>
        </button>

        {/* Registration card */}
        <section className="rounded-2xl border border-white/10 bg-[#111114] p-7 shadow-2xl shadow-black/30 sm:p-9">
          <div className="mb-7">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
              Join the community
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight">
              Create your account
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/50">
              Discover events, book tickets, and make unforgettable memories.
            </p>
          </div>

          <form onSubmit={handleRegister}>
            {/* Username */}
            <div className="mb-5">
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-semibold text-white/80"
              >
                Username
              </label>

              <input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#09090b] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
                required
              />
            </div>

            {/* Email */}
            <div className="mb-5">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-white/80"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#09090b] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
                required
              />
            </div>

            {/* Password */}
            <div className="mb-5">
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-white/80"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                className="w-full rounded-xl border border-white/10 bg-[#09090b] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
                required
              />

              <p className="mt-2 text-xs text-white/35">
                Use at least 8 characters.
              </p>
            </div>

            {/* Confirm password */}
            <div className="mb-6">
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
                placeholder="Enter your password again"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                className="w-full rounded-xl border border-white/10 bg-[#09090b] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
                required
              />
            </div>

            {error && (
              <p
                role="alert"
                className="mb-5 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm leading-6 text-red-300"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-violet-500 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-violet-950/20 transition duration-300 hover:-translate-y-0.5 hover:bg-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:ring-offset-2 focus:ring-offset-[#111114]"
            >
              Create Account →
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-white/35">ALREADY A MEMBER?</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <Link
            to="/login"
            className="block w-full rounded-xl border border-white/10 px-5 py-3.5 text-center text-sm font-semibold text-white/80 transition hover:border-violet-400/40 hover:bg-violet-500/5 hover:text-white"
          >
            Sign in to EventHive
          </Link>
        </section>

        <p className="mt-6 text-center text-xs text-white/30">
          EventHive · Discover. Connect. Experience.
        </p>
      </div>
    </main>
  );
}
