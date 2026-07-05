"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { navigation } from "@/lib/site";

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (event.key === "Tab") {
        const focusableElements = document.querySelectorAll<HTMLElement>(
          `#${CSS.escape(panelId)} a[href], #${CSS.escape(panelId)} button:not([disabled])`,
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
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, panelId]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-label="Otvori glavni meni"
        onClick={() => setIsOpen(true)}
        className="inline-flex size-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white shadow-lg shadow-black/10 transition hover:border-gold-300 hover:text-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-300 focus:ring-offset-2 focus:ring-offset-forest-950"
      >
        <Menu aria-hidden="true" size={23} />
      </button>

      <div
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-[60] bg-forest-950/80 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        id={panelId}
        aria-label="Glavni meni"
        className={`fixed right-0 top-0 z-[70] flex h-dvh w-full max-w-sm flex-col border-l border-white/10 bg-forest-950 px-6 py-5 text-white shadow-2xl transition-transform duration-300 ease-out sm:max-w-md ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-300">Navigacija</p>
            <p className="mt-1 text-lg font-semibold">Forest Glade</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Zatvori glavni meni"
            onClick={() => setIsOpen(false)}
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:border-gold-300 hover:text-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-300 focus:ring-offset-2 focus:ring-offset-forest-950"
          >
            <X aria-hidden="true" size={22} />
          </button>
        </div>

        <nav className="mt-10 grid gap-3" aria-label="Mobilna navigacija">
          {navigation.map((item) => {
            const isActive = item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setIsOpen(false)}
                className={`rounded-2xl border px-5 py-4 text-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-gold-300 focus:ring-offset-2 focus:ring-offset-forest-950 ${isActive ? "border-gold-300 bg-gold-300 text-forest-950" : "border-white/10 bg-white/[0.04] text-mist-100 hover:border-gold-300 hover:text-gold-300"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm uppercase tracking-[0.25em] text-mist-300">Prodaja</p>
          <Link
            href="/kontakt"
            onClick={() => setIsOpen(false)}
            className="mt-4 block rounded-full bg-gold-300 px-5 py-3 text-center font-semibold text-forest-950 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-gold-300 focus:ring-offset-2 focus:ring-offset-forest-950"
          >
            Zakažite prezentaciju
          </Link>
        </div>
      </aside>
    </div>
  );
}
