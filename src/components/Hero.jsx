import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <main className="min-h-screen overflow-hidden bg-[#09090b] text-white">
        <section className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
          {/* Background glow */}
          <div className="pointer-events-none absolute -left-40 top-10 h-80 w-80 rounded-full bg-violet-600/10 blur-[120px]" />
          <div className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-violet-500/10 blur-[120px]" />

          <div className="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Hero content */}
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />

                <span className="text-xs font-semibold uppercase tracking-widest text-violet-300 sm:text-sm">
                  Your events, your experience
                </span>
              </div>

              <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-5xl md:text-6xl xl:text-7xl">
                Plan, Book &amp;
                <span className="block">Experience Events</span>
                <span className="block text-violet-400">
                  Easily.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
                Discover exciting events, book your tickets with ease,
                and connect with talented entertainers — all in one place.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={() => navigate("/event")}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-violet-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-violet-500 hover:shadow-violet-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b] active:translate-y-0 sm:w-auto cursor-pointer" >
                  Explore Events

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>

                <span className="px-2 text-center text-sm text-zinc-500 sm:text-left">
                  Find something worth experiencing.
                </span>
              </div>

              {/* Features */}
              <div className="mt-10 border-t border-white/10 pt-6">
                <p className="text-sm font-medium text-zinc-200">
                  Everything you need for your next outing.
                </p>

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm text-zinc-400">
                  {[
                    "Discover events",
                    "Easy booking",
                    "Digital tickets",
                  ].map((feature) => (
                    <span
                      key={feature}
                      className="flex items-center gap-2"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/15 text-xs font-bold text-violet-400">
                        ✓
                      </span>
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Hero image */}
            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="absolute -right-3 -top-3 h-24 w-24 rounded-2xl border border-violet-500/20 bg-violet-500/10 sm:-right-4 sm:-top-4 sm:h-32 sm:w-32" />

              <div className="absolute -bottom-3 -left-3 h-24 w-24 rounded-2xl border border-white/10 bg-white/5 sm:-bottom-4 sm:-left-4 sm:h-32 sm:w-32" />

              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111114] shadow-2xl shadow-black/40">
                <img
                  src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=85"
                  alt="A live concert with a crowd enjoying the music"
                  className="h-[300px] w-full object-cover transition-transform duration-700 hover:scale-[1.03] sm:h-[420px] lg:h-[520px]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300 sm:text-sm">
                    Make your next moment count
                  </p>

                  <h2 className="mt-2 max-w-sm text-2xl font-bold leading-tight sm:text-3xl">
                    Great experiences start with one booking.
                  </h2>

                  <div className="mt-4 h-1 w-16 rounded-full bg-violet-500" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}