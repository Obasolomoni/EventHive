import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#09090b] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-lg font-bold shadow-lg shadow-violet-600/20">
                E
              </div>

              <span className="text-xl font-bold tracking-tight">
                Event<span className="text-violet-400">Hive</span>
              </span>
            </Link>

            <p className="mt-4 max-w-md text-sm leading-7 text-zinc-400">
              Discover exciting events, create unforgettable experiences, and
              connect with the people who make every celebration special.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300">
              <span className="h-2 w-2 rounded-full bg-violet-400" />
              Made for unforgettable moments
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Explore
            </h3>

            <ul className="mt-5 space-y-3 text-sm text-zinc-400">
              <li>
                <Link
                  to="/event"
                  className="transition hover:text-violet-400"
                >
                  Browse Events
                </Link>
              </li>
              <li>
                <Link
                  to="/vendors"
                  className="transition hover:text-violet-400"
                >
                  Vendors & Entertainers
                </Link>
              </li>
              <li>
                <Link
                  to="/create"
                  className="transition hover:text-violet-400"
                >
                  Create an Event
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Your Account
            </h3>

            <ul className="mt-5 space-y-3 text-sm text-zinc-400">
              <li>
                <Link
                  to="/login"
                  className="transition hover:text-violet-400"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="transition hover:text-violet-400"
                >
                  Create Account
                </Link>
              </li>
              <li>
                <Link
                  to="/resetpassword"
                  className="transition hover:text-violet-400"
                >
                  Reset Password
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} EventHive. All rights reserved.
          </p>

          <p className="text-xs text-zinc-600">
            Built to bring people together.
          </p>
        </div>
      </div>
    </footer>
  );
}