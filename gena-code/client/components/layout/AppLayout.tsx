import { Link, NavLink, useLocation } from "react-router-dom";
import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() =>
    document.documentElement.classList.contains("dark"),
  );
  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setDark(saved === "dark");
  }, []);
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setDark((v) => !v)}
      className="rounded-md border border-border px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
    >
      {dark ? "Light" : "Dark"}
    </button>
  );
}

function PrivacyBadge() {
  return (
    <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 text-xs text-secondary-foreground">
      Local-first • Private
    </span>
  );
}

function Brand() {
  return (
    <Link to="/" className="group inline-flex items-center gap-2">
      <div className="h-7 w-7 rounded-md bg-gradient-to-br from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] shadow-sm" />
      <span className="text-lg font-extrabold tracking-tight">ClickMem</span>
    </Link>
  );
}

function Header() {
  const { pathname } = useLocation();
  const nav = useMemo(
    () => [
      { to: "/", label: "Dashboard" },
     
      { to: "/settings", label: "Settings" },
    ],
    [],
  );
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Brand />
          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2 text-sm font-medium",
                    isActive || pathname === n.to
                      ? "text-foreground bg-secondary"
                      : "text-foreground/70 hover:text-foreground hover:bg-accent",
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <PrivacyBadge />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container flex flex-col items-center justify-between gap-3 py-6 md:h-16 md:flex-row">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} ClickMem. Your private memory assistant.
        </p>
        <div className="inline-flex items-center gap-3 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground">
            Privacy
          </a>
          <a href="#" className="hover:text-foreground">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[radial-gradient(40rem_40rem_at_120%_-10%,hsl(var(--brand-end)/0.08),transparent_60%),radial-gradient(32rem_32rem_at_-10%_-10%,hsl(var(--brand-start)/0.10),transparent_60%)]">
      <Header />
      <main className="container py-8 md:py-10">{children}</main>
      <Footer />
    </div>
  );
}
