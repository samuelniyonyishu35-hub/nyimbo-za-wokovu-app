import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Heart, Home, Settings } from "lucide-react";
import type { ReactNode } from "react";

const TABS = [
  { to: "/", label: "Accueil", icon: Home, match: (path: string) => path === "/" },
  {
    to: "/recueils",
    label: "Recueils",
    icon: BookOpen,
    match: (path: string) => path.startsWith("/recueil"),
  },
  { to: "/favoris", label: "Favoris", icon: Heart, match: (path: string) => path === "/favoris" },
  {
    to: "/reglages",
    label: "Réglages",
    icon: Settings,
    match: (path: string) => path === "/reglages",
  },
] as const;

export function Shell({
  children,
  hideNav = false,
}: {
  children: ReactNode;
  hideNav?: boolean;
}) {
  return (
    <div className="relative min-h-dvh">
      <div className="atmosphere" aria-hidden="true" />
      <div className={hideNav ? "relative z-10 without-nav" : "relative z-10 with-nav"}>
        <div className="mx-auto w-full max-w-2xl px-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <a
            href="#contenu"
            className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-fg"
          >
            Aller au contenu
          </a>
          <div id="contenu">{children}</div>
        </div>
      </div>
      {hideNav ? null : <TabBar />}
    </div>
  );
}

function TabBar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="glass mx-auto flex max-w-2xl items-stretch gap-1 p-1.5">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              aria-current={active ? "page" : undefined}
              className={
                "pressable flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-3xl text-xs font-semibold " +
                (active ? "bg-primary text-primary-fg" : "text-muted")
              }
            >
              <Icon className="size-5" strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function PageIntro({
  kicker,
  title,
  subtitle,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-5">
      {kicker ? (
        <p className="mb-2 text-xs font-bold tracking-widest text-primary uppercase">{kicker}</p>
      ) : null}
      <h1 className="font-display text-4xl leading-none font-medium text-fg sm:text-5xl">{title}</h1>
      {subtitle ? <p className="mt-3 max-w-md text-base leading-relaxed text-muted">{subtitle}</p> : null}
    </header>
  );
}
