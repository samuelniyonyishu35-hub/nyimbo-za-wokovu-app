import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Shell } from "@/components/shell";
import { SongRow } from "@/components/song-list";
import { parseSongId, songId, type Song } from "@/lib/hymns";
import { useLibrary, useLibraryReady } from "@/lib/library-store";

export const Route = createFileRoute("/signets")({
  component: SignetsPage,
  head: () => ({ meta: [{ title: "Signets — Nyimbo za Wokovu" }] }),
});

function SignetsPage() {
  const ready = useLibraryReady();
  const bookmarks = useLibrary((state) => state.bookmarks);
  const notes = useLibrary((state) => state.notes);
  const marked = ready
    ? bookmarks.flatMap((id) => {
        const song = parseSongId(id);
        return song ? [song] : [];
      })
    : [];
  const notedOnly = ready
    ? Object.entries(notes).flatMap(([id, text]) => {
        if (!text.trim() || bookmarks.includes(id)) return [];
        const song = parseSongId(id);
        return song ? [{ song, text }] : [];
      })
    : [];

  return (
    <Shell>
      <Link to="/" className="pressable mb-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary">
        <ChevronLeft className="size-5" aria-hidden="true" />
        Accueil
      </Link>
      <header className="mb-4">
        <h1 className="font-display text-4xl leading-none font-medium">Signets</h1>
        <p className="mt-3 text-base text-muted">Marque-pages et notes, conservés sur cet appareil.</p>
      </header>
      {marked.length === 0 ? (
        <p className="surface px-4 py-8 text-center text-muted">
          Aucun signet. Dans un chant, touchez le marque-page.
        </p>
      ) : (
        <ul className="surface overflow-hidden">
          {marked.map((song) => (
            <SongRow
              key={songId(song)}
              song={song}
              showCollection
              detail={notePreview(notes[songId(song)])}
            />
          ))}
        </ul>
      )}
      {notedOnly.length > 0 ? (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-bold tracking-wide uppercase">Notes sans signet</h2>
          <ul className="surface overflow-hidden">
            {notedOnly.map((item) => (
              <SongRow key={songId(item.song)} song={item.song as Song} showCollection detail={notePreview(item.text)} />
            ))}
          </ul>
        </section>
      ) : null}
    </Shell>
  );
}

function notePreview(text: string | undefined): string | undefined {
  const trimmed = text?.trim();
  if (!trimmed) return undefined;
  return trimmed.length > 80 ? `${trimmed.slice(0, 80)}…` : trimmed;
}
