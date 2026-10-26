
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!username.trim() && !password) {
      setError("Please enter your username and password.");
      return;
    }

    if (!username.trim()) {
      setError("Please enter your username.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    // Demo only: connect your authentication service here.
    navigate("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-5 py-12 text-white">
      <div className="w-full max-w-md">
        {/* Brand */}
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

        {/* Login card */}
        <section className="rounded-2xl border border-white/10 bg-[#111114] p-7 shadow-2xl shadow-black/30 sm:p-9">
          <div className="mb-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
              Welcome back
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight">
              Sign in to your account
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/50">
              Your next unforgettable experience is waiting.
            </p>
          </div>

          <form onSubmit={handleLogin}>
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
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#09090b] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-white/80"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#09090b] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
              />
            </div>

            <div className="mb-6 flex justify-end">
              <Link
                to="/resetpassword"
                className="text-sm font-semibold text-violet-400 transition hover:text-violet-300"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <p
                role="alert"
                className="mb-5 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-300"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-violet-500 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-violet-950/20 transition duration-300 hover:-translate-y-0.5 hover:bg-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:ring-offset-2 focus:ring-offset-[#111114]"
            >
              Login →
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-white/35">NEW TO EVENTHIVE?</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            onClick={() => navigate("/register")}
            className="w-full rounded-xl border border-white/10 px-5 py-3.5 text-sm font-semibold text-white/80 transition hover:border-violet-400/40 hover:bg-violet-500/5 hover:text-white"
          >
            Create an account
          </button>
        </section>

        <p className="mt-6 text-center text-xs text-white/30">
          EventHive · Discover. Connect. Experience.
        </p>
      </div>
    </main>
  );
}