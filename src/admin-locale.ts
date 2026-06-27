/**
 * Admin UI locale from the EmDash `emdash-locale` cookie.
 *
 * Widgets use this when options omit an explicit locale so labels track the
 * signed-in admin language.
 */
import { useEffect, useState } from "react";
import { DEFAULT_LOCALE, normalizeLocale } from "./i18n";

const LOCALE_COOKIE_NAME = "emdash-locale";

/** Reads the current admin locale from `document.cookie`, with SSR-safe fallback. */
export function readAdminLocale(fallback = DEFAULT_LOCALE): string {
  const normalizedFallback = normalizeLocale(fallback);

  if (typeof document === "undefined") return normalizedFallback;

  const cookieLocale = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LOCALE_COOKIE_NAME}=`))
    ?.slice(LOCALE_COOKIE_NAME.length + 1);

  if (!cookieLocale) return normalizedFallback;

  try {
    return normalizeLocale(decodeURIComponent(cookieLocale)) || normalizedFallback;
  } catch {
    return normalizedFallback;
  }
}

/** Reactive admin locale that resyncs on focus and a short polling interval. */
export function useAdminLocale(fallback = DEFAULT_LOCALE): string {
  const [locale, setLocale] = useState(() => readAdminLocale(fallback));

  useEffect(() => {
    function syncLocale() {
      setLocale(readAdminLocale(fallback));
    }

    syncLocale();
    window.addEventListener("focus", syncLocale);
    const interval = window.setInterval(syncLocale, 1000);

    return () => {
      window.removeEventListener("focus", syncLocale);
      window.clearInterval(interval);
    };
  }, [fallback]);

  return locale;
}
