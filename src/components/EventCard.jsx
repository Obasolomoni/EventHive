import { useNavigate } from "react-router-dom";

export default function EventCard({ events }) {
  const navigate = useNavigate();

  if (!events) return null;

  // Featured event for the trending banner
  const featuredEvent = events[0];

  const formatPrice = (price) => {
    return Number(price) > 0
      ? `₦${Number(price).toLocaleString("en-NG")}`
      : "Free";
  };

  return (
    <section className="min-h-screen bg-[#09090b] px-5 py-12 text-white sm:px-8 sm:py-16 lg:px-12">
      <div className="mx-auto max-w-7xl">

        {/* Section heading */}
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-violet-400">
              Discover your next experience
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Explore <span className="text-violet-400">Events</span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/55 sm:text-base">
              Find the moments, people, and experiences worth showing up for.
            </p>
          </div>

          <button
            onClick={() => navigate("/create")}
            className="w-fit rounded-xl bg-violet-500 px-5 py-3 text-sm font-bold transition duration-300 hover:-translate-y-0.5 hover:bg-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
          >
            + Create Event
          </button>
        </div>

        {/* Trending / Featured Event Banner */}
        {featuredEvent && (
          <div className="mb-14">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-xl">
                ↗
              </span>

              <div>
                <h2 className="text-xl font-bold sm:text-2xl">
                  Trending <span className="text-violet-400">Events</span>
                </h2>
                <p className="mt-1 text-sm text-white/45">
                  Find your next unforgettable experience.
                </p>
              </div>
            </div>

            <article className="group relative isolate min-h-[400px] overflow-hidden rounded-3xl border border-white/10 bg-[#111114] sm:min-h-[440px] lg:min-h-[480px]">
              {/* Banner image */}
              <img
                src={
                  featuredEvent.eventImage ||
                  "https://placehold.co/1600x800/18181b/a78bfa?text=EventHive"
                }
                alt={featuredEvent.eventName || "Featured event"}
                className="absolute inset-0 -z-20 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
              />

              {/* Dark overlays */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/75 to-black/10" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

              {/* Featured badge */}
              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-violet-400/30 bg-black/50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-violet-300 backdrop-blur-md sm:left-8 sm:top-8">
                <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
                Featured Event
              </div>

              {/* Banner content */}
              <div className="flex min-h-[400px] flex-col justify-end p-5 sm:min-h-[440px] sm:p-8 lg:min-h-[480px] lg:p-12">
                {featuredEvent.eventCategory && (
                  <span className="mb-4 w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md">
                    {featuredEvent.eventCategory}
                  </span>
                )}

                <h2 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-6xl">
                  {featuredEvent.eventName}
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                  {featuredEvent.eventDescription ||
                    "Discover this experience and find out what makes it special."}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-white/75">
                  <span className="flex items-center gap-2">
                    <span className="text-violet-300">📍</span>
                    {featuredEvent.eventLocation || "Location TBA"}
                  </span>

                  <span className="flex items-center gap-2">
                    <span className="text-violet-300">📅</span>
                    {featuredEvent.eventDate || "Date TBA"}
                  </span>

                  <span className="flex items-center gap-2">
                    <span className="text-violet-300">◷</span>
                    {featuredEvent.eventTime || "Time TBA"}
                  </span>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() =>
                      navigate(`/event/${featuredEvent.id}`)
                    }
                    className="inline-flex items-center gap-3 rounded-xl bg-violet-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-950/30 transition duration-300 hover:-translate-y-0.5 hover:bg-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                  >
                    Explore Event
                    <span aria-hidden="true">→</span>
                  </button>

                  <div>
                    <p className="text-xs text-white/50">Tickets from</p>
                    <p className="mt-1 text-lg font-extrabold text-white">
                      {formatPrice(featuredEvent.eventPrice)}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        )}

        {/* Empty state */}
        {events.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-20 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-3xl text-violet-300">
              ✦
            </div>

            <h2 className="text-xl font-bold">No events yet</h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/50">
              Be the first to create an event and give people something to look
              forward to.
            </p>

            <button
              onClick={() => navigate("/create")}
              className="mt-6 rounded-xl bg-violet-500 px-6 py-3 text-sm font-bold transition hover:bg-violet-400 cursor-pointer"
            >
              Create your first event
            </button>
          </div>
        ) : (
          <>
            {/* All events heading */}
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold sm:text-2xl">
                  All <span className="text-violet-400">Events</span>
                </h2>
                <p className="mt-1 text-sm text-white/45">
                  Discover what's happening.
                </p>
              </div>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70">
                {events.length} {events.length === 1 ? "event" : "events"}
              </span>
            </div>

            {/* Event grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <article
                  key={event.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#111114] transition duration-300 hover:-translate-y-1 hover:border-violet-400/40 hover:shadow-xl hover:shadow-violet-950/20"
                >
                  {/* Event image */}
                  <div className="relative h-56 overflow-hidden bg-white/5">
                    <img
                      src={
                        event.eventImage ||
                        "https://placehold.co/800x500/18181b/a78bfa?text=EventHive"
                      }
                      alt={event.eventName || "Event"}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />

                    {event.eventCategory && (
                      <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                        {event.eventCategory}
                      </span>
                    )}

                    <span className="absolute bottom-4 left-4 text-sm font-semibold text-white/90">
                      📍 {event.eventLocation || "Location to be announced"}
                    </span>

                    {/* See Details: appears on hover, focus, and touch */}
                    <button
                      onClick={() => navigate(`/event/${event.id}`)}
                      aria-label={`See details for ${event.eventName}`}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-100 transition duration-300 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-400  cursor-pointer"
                    >
                      <span className="inline-flex translate-y-0 items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-bold text-white shadow-xl transition duration-300 sm:translate-y-3 sm:group-hover:translate-y-0 sm:group-focus-within:translate-y-0 cursor-pointer">
                        See Details <span aria-hidden="true">→</span>
                      </span>
                    </button>
                  </div>

                  {/* Event details */}
                  <div className="p-5">
                    <h3 className="line-clamp-1 text-xl font-bold tracking-tight transition group-hover:text-violet-300">
                      {event.eventName}
                    </h3>

                    <p className="mt-2 line-clamp-2 min-h-[48px] text-sm leading-6 text-white/55">
                      {event.eventDescription || "More details coming soon."}
                    </p>

                    <div className="my-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-white/[0.04] p-3">
                        <p className="mb-1 text-xs text-white/40">DATE</p>
                        <p className="text-sm font-semibold text-white/85">
                          {event.eventDate || "TBA"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white/[0.04] p-3">
                        <p className="mb-1 text-xs text-white/40">TIME</p>
                        <p className="text-sm font-semibold text-white/85">
                          {event.eventTime || "TBA"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                      <div>
                        <p className="text-xs text-white/40">Ticket price</p>
                        <p className="mt-1 text-lg font-extrabold text-violet-300">
                          {formatPrice(event.eventPrice)}
                        </p>
                      </div>

                      <span className="text-xs font-medium text-white/35">
                        View image to explore
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}