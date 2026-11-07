import { useEffect } from "react";
import { Toaster } from "sonner";
import { useLibrary } from "@/lib/library-store";
import { applyTheme } from "@/lib/theme";

export function ThemeSync() {
  const theme = useLibrary((state) => state.theme);

  useEffect(() => {
    const persistApi = useLibrary.persist;
    const sync = () => applyTheme(useLibrary.getState().theme);
    if (persistApi.hasHydrated()) sync();
    const unsub = persistApi.onFinishHydration(sync);
    void persistApi.rehydrate();
    return unsub;
  }, []);

  useEffect(() => {
    if (!useLibrary.persist.hasHydrated()) return;
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (useLibrary.getState().theme === "system") applyTheme("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!import.meta.env.PROD) return;
    if (!("serviceWorker" in navigator)) return;
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return;
    void navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return <Toaster position="top-center" theme={theme === "system" ? "system" : theme} />;
}
