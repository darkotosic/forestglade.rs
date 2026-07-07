"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Camera,
  Home,
  Info,
  LayoutGrid,
  Mail,
  Menu,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { navigation } from "@/lib/site";

const navigationEnhancements = {
  "/": {
    description: "Pregled projekta i ključnih prednosti",
    icon: Home,
  },
  "/projekti": {
    description: "Razvojni koncept i investicioni okvir",
    icon: Building2,
  },
  "/apartmani": {
    description: "Dostupne jedinice, strukture i površine",
    icon: LayoutGrid,
  },
  "/galerija": {
    description: "Renderi, vizuelni identitet i atmosfera",
    icon: Camera,
  },
  "/o-nama": {
    description: "Tim, standardi i vrednosti kompanije",
    icon: Info,
  },
  "/kontakt": {
    description: "Prodajni upit i zakazivanje prezentacije",
    icon: Mail,
  },
} as const;

const defaultNavigationEnhancement = {
  description: "Saznajte više o Forest Glade ponudi",
  icon: Sparkles,
};

const focusableMenuSelector = "a[href], button:not([disabled])";

function lockDocumentScroll() {
  const scrollY = window.scrollY;
  const previousBodyStyles = {
    overflow: document.body.style.overflow,
    position: document.body.style.position,
    top: document.body.style.top,
    left: document.body.style.left,
    right: document.body.style.right,
    width: document.body.style.width,
  };
  const previousHtmlOverscrollBehavior = document.documentElement.style.overscrollBehavior;

  document.documentElement.style.overscrollBehavior = "none";
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";

  return () => {
    document.documentElement.style.overscrollBehavior = previousHtmlOverscrollBehavior;
    document.body.style.overflow = previousBodyStyles.overflow;
    document.body.style.position = previousBodyStyles.position;
    document.body.style.top = previousBodyStyles.top;
    document.body.style.left = previousBodyStyles.left;
    document.body.style.right = previousBodyStyles.right;
    document.body.style.width = previousBodyStyles.width;
    window.scrollTo(0, scrollY);
  };
}

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => setIsOpen(false), []);
  const openMenu = useCallback(() => setIsOpen(true), []);

  const activeSectionIndex = useMemo(() => {
    const index = navigation.findIndex((item) => (item.href === "/" ? pathname === item.href : pathname.startsWith(item.href)));

    return index >= 0 ? index : 0;
  }, [pathname]);

  const activeSection = navigation[activeSectionIndex] ?? navigation[0];
  const activeSectionNumber = activeSectionIndex + 1;
  const navigationTotal = navigation.length;
  const activeProgress = `${(activeSectionNumber / navigationTotal) * 100}%`;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const unlockDocumentScroll = lockDocumentScroll();
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 50);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = document.querySelectorAll<HTMLElement>(
        `#${CSS.escape(panelId)} ${focusableMenuSelector}`,
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      unlockDocumentScroll();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeMenu, isOpen, panelId]);

  return (
    <div className="lg:hidden">
      <button
        ref={menuButtonRef}
        type="button"
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-label="Otvori glavni meni"
        onClick={openMenu}
        className="group inline-flex h-12 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 text-white shadow-lg shadow-black/10 transition hover:border-gold-300 hover:bg-white/15 hover:text-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-300 focus:ring-offset-2 focus:ring-offset-forest-950"
      >
        <Menu aria-hidden="true" size={23} />
        <span className="hidden text-sm font-semibold sm:inline">Meni</span>
      </button>

      <div
        aria-hidden="true"
        className={`fixed inset-0 z-[60] touch-none bg-forest-950/85 backdrop-blur-md transition-opacity duration-300 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={closeMenu}
      />

      <aside
        id={panelId}
        aria-label="Glavni meni"
        aria-modal="true"
        role="dialog"
        className={`fixed inset-y-0 right-0 z-[70] flex h-dvh w-full max-w-[28rem] transform-gpu flex-col overflow-hidden overscroll-contain border-l border-white/10 bg-forest-950 text-white shadow-2xl transition-transform duration-300 ease-out will-change-transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="relative overflow-hidden border-b border-white/10 px-5 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,162,39,0.22),transparent_34rem)]" aria-hidden="true" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-300">Navigacija</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">Forest Glade</p>
              <p className="mt-2 max-w-[17rem] text-sm leading-6 text-mist-200">
                Brz pristup projektu, apartmanima i prodajnom timu.
              </p>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Zatvori glavni meni"
              onClick={closeMenu}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:border-gold-300 hover:text-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-300 focus:ring-offset-2 focus:ring-offset-forest-950"
            >
              <X aria-hidden="true" size={22} />
            </button>
          </div>

          <div className="relative mt-5 overflow-hidden rounded-2xl border border-gold-300/25 bg-white/[0.06] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-mist-300">Trenutno otvoreno</p>
                <p className="mt-1 font-semibold text-gold-300">{activeSection.label}</p>
              </div>
              <p className="rounded-full border border-gold-300/30 bg-forest-950/40 px-3 py-1 text-sm font-semibold tabular-nums text-gold-300 transition-colors duration-300" aria-label={`Stavka ${activeSectionNumber} od ${navigationTotal}`}>
                {String(activeSectionNumber).padStart(2, "0")}
                <span className="mx-1 text-mist-400">/</span>
                {String(navigationTotal).padStart(2, "0")}
              </p>
            </div>
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
              <div
                className="h-full rounded-full bg-gold-300 transition-[width] duration-500 ease-out"
                style={{ width: activeProgress }}
              />
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain px-4 py-5" aria-label="Mobilna navigacija">
          <div className="grid gap-2">
            {navigation.map((item, index) => {
              const isActive = item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);
              const enhancement = navigationEnhancements[item.href as keyof typeof navigationEnhancements] ?? defaultNavigationEnhancement;
              const Icon = enhancement.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={closeMenu}
                  className={`group grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border p-3.5 transition focus:outline-none focus:ring-2 focus:ring-gold-300 focus:ring-offset-2 focus:ring-offset-forest-950 ${isActive ? "border-gold-300 bg-gold-300 text-forest-950 shadow-lg shadow-gold-300/10" : "border-white/10 bg-white/[0.04] text-mist-100 hover:border-gold-300/70 hover:bg-white/[0.07] hover:text-white"}`}
                >
                  <span className={`flex size-11 items-center justify-center rounded-xl ${isActive ? "bg-forest-950/10" : "bg-white/10 text-gold-300"}`}>
                    <Icon aria-hidden="true" size={20} />
                  </span>
                  <span>
                    <span className="block text-base font-semibold">{item.label}</span>
                    <span className={`mt-0.5 block text-sm leading-5 ${isActive ? "text-forest-900/80" : "text-mist-300"}`}>{enhancement.description}</span>
                  </span>
                  <span className={`text-xs font-semibold tabular-nums transition-colors duration-300 ${isActive ? "text-forest-900/70" : "text-mist-400 group-hover:text-gold-300"}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </div>
  );
}
