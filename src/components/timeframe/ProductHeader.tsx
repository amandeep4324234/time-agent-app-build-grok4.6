import { Link, useRouterState } from "@tanstack/react-router";
import { Calendar, LayoutDashboard, MessageSquareText, PlayCircle, Settings } from "lucide-react";
import { COPY } from "@/lib/timeframe/copy";
import { cn } from "@/lib/cn";

const NAV = [
  { to: "/app", label: COPY.navDashboard, icon: LayoutDashboard },
  { to: "/week", label: COPY.navWeek, icon: Calendar },
  { to: "/block", label: COPY.navBlock, icon: PlayCircle },
  { to: "/debrief", label: COPY.navDebrief, icon: MessageSquareText },
] as const;

export function ProductHeader({ live = false }: { live?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-base/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-3 md:px-6">
        <Link
          to="/"
          className="tf-label shrink-0 text-fg-3 no-underline hover:text-fg"
        >
          {COPY.navSite}
        </Link>
        <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto" aria-label="Product">
          {NAV.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            const blockLive = item.to === "/block" && live;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex h-11 items-center gap-2 rounded-full px-3 text-sm no-underline transition-colors duration-150",
                  active
                    ? "bg-raised text-fg"
                    : "text-fg-3 hover:text-fg",
                  blockLive && "text-accent",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="size-4" strokeWidth={1.6} />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <Link
          to="/onboarding"
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-fg-3 no-underline hover:text-fg"
          aria-label="Settings"
        >
          <Settings className="size-4" strokeWidth={1.6} />
        </Link>
      </div>
    </header>
  );
}

export function SkipLink() {
  return (
    <a
      href="#content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-raised focus:px-3 focus:py-2"
    >
      Skip to content
    </a>
  );
}
