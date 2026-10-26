
import { useParams, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

export default function Tickets() {
  const { ticketId } = useParams();

  let tickets = [];

  try {
    tickets = JSON.parse(localStorage.getItem("eventTickets") || "[]");
  } catch {
    tickets = [];
  }

  const ticket = tickets.find((t) => t.ticketId === ticketId);

  if (!ticket) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-5 text-center text-white">
        <div>
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-3xl text-violet-400">
            ?
          </div>

          <h1 className="text-3xl font-extrabold">Ticket not found</h1>

          <p className="mt-3 text-sm leading-6 text-white/50">
            This ticket doesn't exist in your saved demo bookings.
          </p>

          <Link
            to="/event"
            className="mt-7 inline-flex rounded-xl bg-violet-500 px-6 py-3 font-bold text-white transition hover:bg-violet-400"
          >
            Browse Events
          </Link>
        </div>
      </main>
    );
  }

  const price = Number(ticket.amount) || 0;

  return (
    <main className="min-h-screen bg-[#09090b] px-5 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-lg">
        {/* Success heading */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-3xl text-emerald-400">
            ✓
          </div>

          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
            Your EventHive pass
          </p>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Your ticket is ready!
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/50">
            Your unique demo QR code has been generated.
          </p>
        </div>

        {/* Ticket card */}
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#111114] shadow-2xl shadow-black/30">
          {/* Ticket header */}
          <div className="relative overflow-hidden bg-violet-500 px-6 py-7 text-white sm:px-8">
            <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full border-[30px] border-white/10" />

            <div className="relative flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                  EventHive
                </p>

                <h2 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">
                  {ticket.eventName}
                </h2>
              </div>

              <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold">
                DEMO
              </span>
            </div>

            <p className="relative mt-5 text-sm text-white/75">
              Digital event ticket
            </p>
          </div>

          {/* QR code */}
          <div className="px-6 py-8 text-center sm:px-8">
            <div className="mx-auto inline-flex rounded-2xl bg-white p-4 shadow-lg shadow-black/20">
              <QRCodeSVG
                value={ticket.ticketId}
                size={220}
                level="H"
                includeMargin
              />
            </div>

            <p className="mt-4 text-sm text-white/45">
              Unique QR code for this demo ticket
            </p>
          </div>

          {/* Perforated divider */}
          <div className="relative flex items-center">
            <div className="-ml-3 h-6 w-6 shrink-0 rounded-full border border-white/10 bg-[#09090b]" />
            <div className="mx-1 flex-1 border-t-2 border-dashed border-white/10" />
            <div className="-mr-3 h-6 w-6 shrink-0 rounded-full border border-white/10 bg-[#09090b]" />
          </div>

          {/* Ticket details */}
          <div className="px-6 py-6 sm:px-8">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  Ticket price
                </p>

                <p className="mt-2 text-lg font-extrabold text-violet-300">
                  {price > 0
                    ? `₦${price.toLocaleString("en-NG")}`
                    : "Free"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  Booking status
                </p>

                <p className="mt-2 text-sm font-bold text-amber-300">
                  Demo only
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                Ticket ID
              </p>

              <p className="mt-2 break-all font-mono text-sm leading-6 text-white/80">
                {ticket.ticketId}
              </p>

              <button
                type="button"
                onClick={() =>
                  navigator.clipboard?.writeText(ticket.ticketId)
                }
                className="mt-3 text-xs font-semibold text-violet-400 transition hover:text-violet-300"
              >
                Copy ticket ID
              </button>
            </div>
          </div>

          {/* Demo warning */}
          <div className="mx-5 mb-5 rounded-xl border border-amber-400/15 bg-amber-400/5 p-4 sm:mx-8">
            <p className="text-xs font-bold text-amber-300">
              DEMO TICKET — PAYMENT NOT VERIFIED
            </p>

            <p className="mt-2 text-xs leading-5 text-white/50">
              This ticket was generated by the demo checkout. No payment has
              been verified, and this QR code is not proof of a paid booking.
            </p>
          </div>
        </section>

        {/* Bottom actions */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            to="/event"
            className="rounded-xl bg-violet-500 px-5 py-3.5 text-center text-sm font-bold text-white transition hover:bg-violet-400"
          >
            Browse More Events
          </Link>

          <Link
            to="/"
            className="rounded-xl border border-white/10 px-5 py-3.5 text-center text-sm font-semibold text-white/75 transition hover:border-violet-400/40 hover:bg-white/5 hover:text-white"
          >
            Back to Home
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-white/25">
          EventHive · Discover. Connect. Experience.
        </p>
      </div>
    </main>
  );
}
