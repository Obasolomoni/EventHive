
import { useParams, useNavigate } from "react-router-dom";

export default function Payments({ events }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const event = events?.find((e) => String(e.id) === id);

  function simulatePayment() {
    if (!event) return;

    const ticketId = crypto.randomUUID();

    const ticket = {
      ticketId,
      eventId: event.id,
      eventName: event.eventName,
      amount: Number(event.eventPrice) || 0,
      status: "demo",
      createdAt: new Date().toISOString(),
    };

    const tickets = JSON.parse(
      localStorage.getItem("eventTickets") || "[]"
    );

    tickets.push(ticket);

    localStorage.setItem("eventTickets", JSON.stringify(tickets));

    navigate(`/ticket/${ticketId}`);
  }

  if (!event) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-5 text-center text-white">
        <div>
          <h1 className="text-3xl font-extrabold">Event not found</h1>
          <p className="mt-3 text-white/50">
            We couldn't find the event you're trying to book.
          </p>
          <button
            onClick={() => navigate("/event")}
            className="mt-6 rounded-xl bg-violet-500 px-6 py-3 font-bold transition hover:bg-violet-400"
          >
            Explore Events
          </button>
        </div>
      </main>
    );
  }

  const price = Number(event.eventPrice) || 0;

  return (
    <main className="min-h-screen bg-[#09090b] px-5 py-10 text-white sm:px-8 sm:py-16">
      <div className="mx-auto max-w-5xl">
        {/* Back button and heading */}
        <button
          onClick={() => navigate(`/event/${event.id}`)}
          className="mb-8 text-sm font-medium text-white/55 transition hover:text-violet-300"
        >
          ← Back to event details
        </button>

        <div className="mb-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
            Secure your spot
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Complete your booking
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/50 sm:text-base">
            Review your event details before confirming your demo booking.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px] lg:gap-8">
          {/* Event summary */}
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#111114]">
            <div className="relative h-56 bg-white/5 sm:h-72">
              <img
                src={
                  event.eventImage ||
                  "https://placehold.co/1000x500/18181b/a78bfa?text=EventHive"
                }
                alt={event.eventName}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

              {event.eventCategory && (
                <span className="absolute bottom-4 left-5 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-xs font-semibold backdrop-blur-md">
                  {event.eventCategory}
                </span>
              )}
            </div>

            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-extrabold">
                {event.eventName}
              </h2>

              <p className="mt-3 text-sm leading-7 text-white/55">
                {event.eventDescription || "Join us for this event."}
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white/[0.04] p-4">
                  <p className="text-xs text-white/40">DATE</p>
                  <p className="mt-2 text-sm font-semibold">
                    {event.eventDate || "To be announced"}
                  </p>
                </div>

                <div className="rounded-xl bg-white/[0.04] p-4">
                  <p className="text-xs text-white/40">TIME</p>
                  <p className="mt-2 text-sm font-semibold">
                    {event.eventTime || "To be announced"}
                  </p>
                </div>

                <div className="rounded-xl bg-white/[0.04] p-4 sm:col-span-2">
                  <p className="text-xs text-white/40">LOCATION</p>
                  <p className="mt-2 text-sm font-semibold">
                    {event.eventLocation || "To be announced"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Booking summary */}
          <aside className="h-fit rounded-2xl border border-white/10 bg-[#111114] p-6 sm:p-7 lg:sticky lg:top-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-xl text-violet-300">
                ✓
              </div>
              <div>
                <h2 className="font-bold">Booking summary</h2>
                <p className="mt-1 text-xs text-white/40">
                  Review your total
                </p>
              </div>
            </div>

            <div className="my-6 border-t border-white/10" />

            <div className="flex items-start justify-between gap-4 text-sm">
              <span className="text-white/50">Event ticket</span>
              <span className="max-w-[60%] text-right font-semibold">
                {event.eventName}
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between text-sm">
              <span className="text-white/50">Quantity</span>
              <span className="font-semibold">1 ticket</span>
            </div>

            <div className="my-6 border-t border-white/10" />

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-white/60">Total</span>
              <span className="text-2xl font-extrabold text-violet-300">
                {price > 0
                  ? `₦${price.toLocaleString("en-NG")}`
                  : "Free"}
              </span>
            </div>

            <div className="mt-6 rounded-xl border border-amber-400/15 bg-amber-400/5 p-4">
              <p className="text-xs font-bold text-amber-300">
                DEMO CHECKOUT
              </p>
              <p className="mt-2 text-xs leading-5 text-white/50">
                This is a demonstration. No money will be charged, and this
                does not verify a real payment.
              </p>
            </div>

            <button
              onClick={simulatePayment}
              className="mt-6 w-full rounded-xl bg-violet-500 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-violet-950/20 transition duration-300 hover:-translate-y-0.5 hover:bg-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:ring-offset-2 focus:ring-offset-[#111114]"
            >
              {price > 0 ? "Simulate Payment →" : "Claim Demo Ticket →"}
            </button>

            <button
              onClick={() => navigate(`/event/${event.id}`)}
              className="mt-3 w-full rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              Cancel booking
            </button>

            <p className="mt-5 text-center text-xs leading-5 text-white/30">
              Your demo ticket will be available on the next screen.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
