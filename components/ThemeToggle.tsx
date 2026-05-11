"use client"

import * as React from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  compact?: boolean;
  collapsed?: boolean;
}

export function ThemeToggle({ compact, collapsed }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label="Basculer le thème"
        className={cn(
          'flex items-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors duration-150',
          collapsed
            ? 'justify-center h-8 w-8 mx-auto'
            : 'gap-2.5 h-8 w-full px-2.5 text-[13px]'
        )}
      >
        <SunIcon className="size-4 shrink-0 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <MoonIcon className="absolute size-4 shrink-0 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        {!collapsed && <span>Thème</span>}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Basculer le thème"
      className="relative flex size-8 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted transition-colors"
      style={{ borderColor: 'var(--border)' }}
    >
      <SunIcon className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Basculer le thème</span>
    </button>
  )
}

