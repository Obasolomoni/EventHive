
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] px-5 py-12 text-white">
      {/* Background decoration */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[100px]" />

      <section className="relative z-10 w-full max-w-lg text-center">
        {/* Brand */}
        <button
          onClick={() => navigate("/")}
          className="mx-auto mb-12 flex items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          aria-label="EventHive home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500 text-lg font-black">
            E
          </span>

          <span className="text-xl font-extrabold tracking-tight">
            Event<span className="text-violet-400">Hive</span>
          </span>
        </button>

        {/* Error code */}
        <div className="relative mb-6">
          <h1 className="select-none text-8xl font-black leading-none tracking-tighter text-white/[0.04] sm:text-[10rem]">
            404
          </h1>

          <p className="absolute inset-0 flex items-center justify-center text-6xl font-black tracking-tight text-violet-400 sm:text-8xl">
            404
          </p>
        </div>

        <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
          Wrong turn, bro
        </p>

        <h2 className="text-2xl font-extrabold sm:text-3xl">
          Looks like you're off the guest list.
        </h2>

        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-white/50 sm:text-base">
          The page you're looking for doesn't exist or may have been moved.
          Let's get you back to the good stuff.
        </p>

        {/* Actions */}
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={() => navigate("/")}
            className="rounded-xl bg-violet-500 px-6 py-3.5 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-300"
          >
            ← Back to Home
          </button>

          <button
            onClick={() => navigate("/event")}
            className="rounded-xl border border-white/10 px-6 py-3.5 text-sm font-semibold text-white/80 transition duration-300 hover:border-violet-400/40 hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-300"
          >
            Explore Events →
          </button>
        </div>

        <p className="mt-12 text-xs text-white/25">
          EventHive · Discover. Connect. Experience.
        </p>
      </section>
    </main>
  );
}