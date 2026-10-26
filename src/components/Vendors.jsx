import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const vendorCategories = [
  {
    name: "DJs & Music",
    description: "DJs, sound engineers, and music professionals.",
    icon: "🎧",
  },
  {
    name: "Catering",
    description: "Caterers, chefs, and food vendors for your event.",
    icon: "🍽️",
  },
  {
    name: "Photography",
    description: "Photographers and videographers for every moment.",
    icon: "📸",
  },
  {
    name: "Decor & Styling",
    description: "Beautiful decorations and event styling services.",
    icon: "✨",
  },
  {
    name: "Venues",
    description: "Find the perfect space for your next event.",
    icon: "🏛️",
  },
  {
    name: "Entertainment",
    description: "Musicians, MCs, performers, and more.",
    icon: "🎤",
  },
];

export default function Vendors() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleNotify = (e) => {
    e.preventDefault();

    if (!email.trim()) return;

    setSubmitted(true);
    setEmail("");
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#09090b] text-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-600/20 blur-[120px]" />

          <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
              The EventHive Marketplace
            </span>

            <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Meet the people who make
              <span className="block text-violet-400">
                unforgettable events.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
              Discover talented DJs, caterers, photographers, decorators, and
              event professionals to bring your next celebration to life.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="#categories"
                className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-6 py-3.5 font-semibold text-white transition hover:bg-violet-500"
              >
                Explore Categories
                <span className="ml-2">↓</span>
              </a>

              <Link
                to="/event"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold text-zinc-200 transition hover:border-violet-500/40 hover:bg-white/10"
              >
                Browse Events
              </Link>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section
          id="categories"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        >
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
                Find your perfect match
              </p>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Explore vendor categories
              </h2>

              <p className="mt-3 max-w-2xl text-zinc-400">
                Everything you need to plan an amazing event, all in one place.
              </p>
            </div>

            <span className="w-fit rounded-lg border border-white/10 bg-[#111114] px-3 py-2 text-sm text-zinc-400">
              6 categories to explore
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {vendorCategories.map((category) => (
              <div
                key={category.name}
                className="group rounded-2xl border border-white/10 bg-[#111114] p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:bg-[#15131b]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-3xl transition group-hover:bg-violet-500/20">
                  {category.icon}
                </div>

                <h3 className="mt-5 text-xl font-semibold">
                  {category.name}
                </h3>

                <p className="mt-3 min-h-12 leading-6 text-zinc-400">
                  {category.description}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-sm text-zinc-500">
                    Coming soon
                  </span>

                  <span className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-transparent p-2 text-lg text-violet-400 transition-all duration-300 group-hover:translate-x-1 group-hover:border-violet-500 group-hover:bg-violet-500/10">
                    →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Coming Soon / Notification Section */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-950/60 via-[#111114] to-[#111114] p-7 sm:p-12">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />

            <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-violet-300">
                  Coming soon
                </span>

                <h2 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
                  Your next great event starts with the right people.
                </h2>

                <p className="mt-4 max-w-xl leading-7 text-zinc-400">
                  We’re preparing a marketplace where you can discover event
                  professionals and connect with the right vendors for your
                  budget and vision.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 sm:p-6">
                {submitted ? (
                  <div className="py-4 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-2xl text-green-400">
                      ✓
                    </div>

                    <h3 className="mt-4 text-lg font-semibold">
                      You’re on the list!
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      Thanks for your interest in EventHive vendors.
                    </p>

                    <p className="mt-3 text-xs text-amber-300">
                      Demo only — your email has not been saved or sent.
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold">
                      Stay in the loop
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      Get ready for the launch of our vendor marketplace.
                    </p>

                    <form onSubmit={handleNotify} className="mt-5">
                      <label
                        htmlFor="vendor-email"
                        className="mb-2 block text-sm font-medium text-zinc-300"
                      >
                        Email address
                      </label>

                      <input
                        id="vendor-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-white/10 bg-[#09090b] px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                      />

                      <button
                        type="submit"
                        className="mt-3 w-full rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-500"
                      >
                        Notify Me
                      </button>
                    </form>

                    <p className="mt-3 text-xs leading-5 text-zinc-500">
                      This is currently a demo form. Connect it to your backend
                      or email service to collect subscriptions.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}