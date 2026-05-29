"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

export interface NavItem {
  label: string;
  href: string;
  desc?: string;
  icon?: string;
  highlight?: boolean;
}

interface NavDropdownProps {
  label: string;
  items: NavItem[];
}

export function NavDropdown({ label, items }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-md
                   text-[13px] text-white/55 hover:text-white/90
                   hover:bg-white/6 transition-all duration-150 font-medium"
      >
        {label}
        <ChevronDown
          className={`size-3 opacity-50 transition-transform duration-200
                      ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2
                     bg-[#0d1117]/95 backdrop-blur-xl
                     border border-white/[0.08] rounded-2xl
                     shadow-2xl shadow-black/60 p-2 min-w-[220px] z-50
                     animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl
                          transition-all duration-150
                          ${
                            item.highlight
                              ? "text-[#B01817] hover:bg-[#B01817]/10 font-semibold"
                              : "text-white/65 hover:text-white hover:bg-white/[0.06]"
                          }`}
            >
              {item.icon && (
                <span className="text-base mt-0.5 shrink-0">{item.icon}</span>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-snug">
                  {item.label}
                </span>
                {item.desc && (
                  <span className="text-xs text-white/35 mt-0.5">
                    {item.desc}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
