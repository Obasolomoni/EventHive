
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

export default function EventDetails({ events }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const event = events?.find((e) => String(e.id) === id);

  if (!event) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-[80vh] items-center justify-center bg-[#09090b] px-5 text-center text-white">
          <div>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-3xl text-violet-400">
              !
            </div>

            <h1 className="text-3xl font-extrabold">Event not found</h1>

            <p className="mt-3 text-white/50">
              This event may have been removed or is no longer available.
            </p>

            <button
              onClick={() => navigate("/event")}
              className="mt-7 rounded-xl bg-violet-500 px-6 py-3 font-bold transition hover:bg-violet-400"
            >
              Explore Events
            </button>
          </div>
        </main>
      </>
    );
  }

  const price = Number(event.eventPrice) || 0;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#09090b] px-5 py-8 text-white sm:px-8 sm:py-12 lg:px-12">
        <div className="mx-auto max-w-7xl">
          {/* Back navigation */}
          <button
            onClick={() => navigate("/event")}
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/60 transition hover:text-violet-300"
          >
            <span aria-hidden="true">←</span> Back to events
          </button>

          {/* Event hero image */}
          <div className="relative h-[280px] overflow-hidden rounded-2xl border border-white/10 bg-[#111114] sm:h-[380px] lg:h-[480px]">
            <img
              src={
                event.eventImage ||
                "https://placehold.co/1400x800/18181b/a78bfa?text=EventHive"
              }
              alt={event.eventName}
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" />

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
              {event.eventCategory && (
                <span className="mb-4 inline-flex rounded-full border border-violet-300/30 bg-violet-500/20 px-4 py-1.5 text-xs font-bold text-violet-200 backdrop-blur-md">
                  {event.eventCategory}
                </span>
              )}

              <h1 className="max-w-4xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {event.eventName}
              </h1>

              <p className="mt-3 flex items-center gap-2 text-sm text-white/75 sm:text-base">
                <span aria-hidden="true">⌖</span>
                {event.eventLocation || "Location to be announced"}
              </p>
            </div>
          </div>

          {/* Event content and booking panel */}
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] lg:gap-12">
            {/* About the event */}
            <section className="min-w-0">
              <h2 className="text-2xl font-bold tracking-tight">
                About this event
              </h2>

              <p className="mt-4 whitespace-pre-line text-sm leading-8 text-white/60 sm:text-base">
                {event.eventDescription || "More information coming soon."}
              </p>

              <div className="mt-10">
                <h2 className="text-2xl font-bold tracking-tight">
                  Event information
                </h2>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-[#111114] p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-violet-400">
                      Date
                    </p>
                    <p className="mt-2 font-semibold">
                      {event.eventDate || "To be announced"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#111114] p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-violet-400">
                      Time
                    </p>
                    <p className="mt-2 font-semibold">
                      {event.eventTime || "To be announced"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#111114] p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-violet-400">
                      Location
                    </p>
                    <p className="mt-2 font-semibold">
                      {event.eventLocation || "To be announced"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#111114] p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-violet-400">
                      Available capacity
                    </p>
                    <p className="mt-2 font-semibold">
                      {event.eventCapacity
                        ? `${Number(event.eventCapacity).toLocaleString("en-NG")} people`
                        : "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Booking card */}
            <aside className="h-fit rounded-2xl border border-white/10 bg-[#111114] p-6 lg:sticky lg:top-28">
              <p className="text-sm font-medium text-white/50">
                Ticket price
              </p>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-violet-300">
                  {price > 0
                    ? `₦${price.toLocaleString("en-NG")}`
                    : "Free"}
                </span>
                {price > 0 && (
                  <span className="text-sm text-white/40">/ ticket</span>
                )}
              </div>

              <div className="my-6 border-t border-white/10" />

              <div className="space-y-4 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-white/45">Date</span>
                  <span className="text-right font-medium">
                    {event.eventDate || "TBA"}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-white/45">Time</span>
                  <span className="text-right font-medium">
                    {event.eventTime || "TBA"}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-white/45">Category</span>
                  <span className="text-right font-medium">
                    {event.eventCategory || "General"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/payments/${event.id}`)}
                className="mt-7 w-full rounded-xl bg-violet-500 px-5 py-4 font-bold text-white shadow-lg shadow-violet-950/20 transition duration-300 hover:-translate-y-0.5 hover:bg-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:ring-offset-2 focus:ring-offset-[#111114]"
              >
                {price > 0 ? "Book & Get Ticket" : "Get Free Ticket"}
                <span className="ml-2" aria-hidden="true">→</span>
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-white/35">
                {price > 0
                  ? "Review your booking before proceeding to payment."
                  : "Continue to claim your ticket."}
              </p>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}