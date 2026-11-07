import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Shell } from "@/components/shell";
import { SongRow } from "@/components/song-list";
import { parseSongId, songId } from "@/lib/hymns";
import { useLibrary, useLibraryReady } from "@/lib/library-store";
import { relativeTime } from "@/lib/time";

export const Route = createFileRoute("/historique")({
  component: HistoriquePage,
  head: () => ({ meta: [{ title: "Récents — Nyimbo za Wokovu" }] }),
});

function HistoriquePage() {
  const ready = useLibraryReady();
  const history = useLibrary((state) => state.history);
  const rows = ready
    ? history.flatMap((item) => {
        const song = parseSongId(item.id);
        return song ? [{ song, at: item.at }] : [];
      })
    : [];

  return (
    <Shell>
      <Link to="/" className="pressable mb-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary">
        <ChevronLeft className="size-5" aria-hidden="true" />
        Accueil
      </Link>
      <header className="mb-4">
        <h1 className="font-display text-4xl leading-none font-medium">Récents</h1>
        <p className="mt-3 text-base text-muted">Les derniers chants ouverts sur cet appareil.</p>
      </header>
      {rows.length === 0 ? (
        <p className="surface px-4 py-8 text-center text-muted">L'historique est vide.</p>
      ) : (
        <ul className="surface overflow-hidden">
          {rows.map((item) => (
            <SongRow key={`${songId(item.song)}-${item.at}`} song={item.song} detail={relativeTime(item.at)} />
          ))}
        </ul>
      )}
    </Shell>
  );
}
