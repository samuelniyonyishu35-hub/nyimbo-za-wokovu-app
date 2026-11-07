import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "system";

type LibraryState = {
  theme: ThemeMode;
  fontSize: number;
  lineHeight: number;
  favorites: string[];
  bookmarks: string[];
  history: { id: string; at: number }[];
  notes: Record<string, string>;
  setTheme: (theme: ThemeMode) => void;
  setFontSize: (fontSize: number) => void;
  setLineHeight: (lineHeight: number) => void;
  toggleFavorite: (id: string) => void;
  toggleBookmark: (id: string) => void;
  setNote: (id: string, note: string) => void;
  visit: (id: string) => void;
  clearHistory: () => void;
};

const memory = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export const useLibrary = create<LibraryState>()(
  persist(
    (set) => ({
      theme: "system",
      fontSize: 1.125,
      lineHeight: 1.65,
      favorites: [],
      bookmarks: [],
      history: [],
      notes: {},
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize: clamp(Math.round(fontSize * 20) / 20, 0.95, 1.7) }),
      setLineHeight: (lineHeight) => set({ lineHeight: clamp(Math.round(lineHeight * 20) / 20, 1.35, 2.1) }),
      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((item) => item !== id)
            : [id, ...state.favorites],
        })),
      toggleBookmark: (id) =>
        set((state) => ({
          bookmarks: state.bookmarks.includes(id)
            ? state.bookmarks.filter((item) => item !== id)
            : [id, ...state.bookmarks],
        })),
      setNote: (id, note) =>
        set((state) => {
          const notes = { ...state.notes };
          if (note.trim()) notes[id] = note;
          else delete notes[id];
          return { notes };
        }),
      visit: (id) =>
        set((state) => ({
          history: [{ id, at: Date.now() }, ...state.history.filter((item) => item.id !== id)].slice(0, 50),
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "nyimbo-za-wokovu",
      skipHydration: true,
      storage: createJSONStorage(() => (typeof window === "undefined" ? memory : localStorage)),
      partialize: (state) => ({
        theme: state.theme,
        fontSize: state.fontSize,
        lineHeight: state.lineHeight,
        favorites: state.favorites,
        bookmarks: state.bookmarks,
        history: state.history,
        notes: state.notes,
      }),
    },
  ),
);

export function useLibraryReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const persistApi = useLibrary.persist;
    if (persistApi.hasHydrated()) setReady(true);
    return persistApi.onFinishHydration(() => setReady(true));
  }, []);
  return ready;
}
