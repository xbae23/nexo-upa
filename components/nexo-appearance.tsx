"use client";

import { createContext, useContext, useLayoutEffect, useState, type ComponentProps, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { featureFlags } from "@/lib/feature-flags";
import { Toaster as BaseToaster } from "@/components/ui/sonner";

type Theme = "dark" | "light";
type Appearance = { enabled: boolean; theme: Theme; toggle: () => void };
const STORAGE_KEY = "nexo-upa-appearance-2026";
const AppearanceContext = createContext<Appearance>({
  enabled: false,
  theme: "light",
  toggle: () => {},
});

export function NexoAppearanceProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(featureFlags.design2026);
  const [theme, setTheme] = useState<Theme>("dark");

  useLayoutEffect(() => {
    setEnabled(
      featureFlags.design2026 &&
        new URLSearchParams(window.location.search).get("nexo2026") !== "legacy",
    );
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "dark" || saved === "light") setTheme(saved);
      else setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    } catch {
      setTheme("dark");
    }
  }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("nexo-2026", enabled);
    if (enabled) {
      root.dataset.theme = theme;
      root.style.colorScheme = theme;
    } else {
      delete root.dataset.theme;
      root.style.colorScheme = "";
    }
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute(
      "content",
      enabled ? (theme === "dark" ? "#101b15" : "#ffffff") : "#087f4f",
    );
  }, [enabled, theme]);

  function toggle() {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      try { window.localStorage.setItem(STORAGE_KEY, next); } catch { /* Preference is optional. */ }
      return next;
    });
  }

  return (
    <AppearanceContext.Provider value={{ enabled, theme, toggle }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function AppearanceButton() {
  const { enabled, theme, toggle } = useContext(AppearanceContext);
  if (!enabled) return null;
  const dark = theme === "dark";
  return (
    <button
      className="appearance-button"
      type="button"
      aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={dark ? "Modo claro" : "Modo oscuro"}
      onClick={toggle}
    >
      {dark ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
    </button>
  );
}

export function NexoToaster(props: ComponentProps<typeof BaseToaster>) {
  const { enabled, theme } = useContext(AppearanceContext);
  return <BaseToaster {...props} theme={enabled ? theme : props.theme} />;
}
