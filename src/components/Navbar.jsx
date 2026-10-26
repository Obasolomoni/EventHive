
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const navItems = [
    { label: "Events", path: "/event" },
    { label: "Vendors", path: "/vendors" },
  ];

  const linkClass = (path) =>
    `relative text-sm font-medium transition-colors duration-200 hover:text-violet-300 cursor-pointer ${
      location.pathname === path
        ? "text-violet-300"
        : "text-white/75"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#09090b]/95 text-white shadow-lg shadow-black/10 backdrop-blur-xl">
      <nav className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* Brand */}
        <button
          onClick={() => goTo("/")}
          className="group flex items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          aria-label="EventHive home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500 text-lg font-black shadow-lg shadow-violet-950/40 transition duration-300 group-hover:rotate-6 group-hover:bg-violet-400 cursor-pointer">
            E
          </span>

          <span className="text-xl font-extrabold tracking-tight cursor-pointer">
            Event<span className="text-violet-400">Hive</span>
          </span>
        </button>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-9 md:flex">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => goTo(item.path)}
              className={linkClass(item.path)}
            >
              {item.label}

              {location.pathname === item.path && (
                <span className="absolute -bottom-2.5 left-0 h-0.5 w-full rounded-full bg-violet-400" />
              )}
            </button>
          ))}

          <button
            onClick={() => goTo("/create")}
            className="rounded-lg bg-violet-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-violet-950/20 transition duration-300 hover:-translate-y-0.5 hover:bg-violet-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b] cursor-pointer"
            >
            + Create Event
          </button>

          <button
            onClick={() => goTo("/login")}
            className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80 transition duration-200 hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
            >
            Logout
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 transition hover:bg-white/10 md:hidden"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
        >
          <span className="text-2xl leading-none">
            {menuOpen ? "×" : "☰"}
          </span>
        </button>
      </nav>

      {/* Mobile navigation */}
      <div
        id="mobile-nav"
        className={`grid overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
          menuOpen
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-1 border-t border-white/10 px-5 py-4 sm:px-8">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => goTo(item.path)}
                tabIndex={menuOpen ? 0 : -1}
                className={`block w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition hover:bg-white/5 ${
                  location.pathname === item.path
                    ? "bg-violet-500/10 text-violet-300"
                    : "text-white/75"
                }`}
              >
                {item.label}
              </button>
            ))}

            <button
              onClick={() => goTo("/create")}
              tabIndex={menuOpen ? 0 : -1}
              className="mt-2 w-full rounded-lg bg-violet-500 px-4 py-3 text-left text-sm font-bold transition hover:bg-violet-400"
            >
              + Create Event
            </button>

            <button
              onClick={() => goTo("/login")}
              tabIndex={menuOpen ? 0 : -1}
              className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-white/70 transition hover:bg-red-500/10 hover:text-red-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
