import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, Shell } from "@/components/shell";
import { SongList } from "@/components/song-list";
import { parseSongId, type Song } from "@/lib/hymns";
import { useLibrary, useLibraryReady } from "@/lib/library-store";

export const Route = createFileRoute("/favoris")({
  component: FavorisPage,
  head: () => ({ meta: [{ title: "Favoris — Nyimbo za Wokovu" }] }),
});

function FavorisPage() {
  const ready = useLibraryReady();
  const favorites = useLibrary((state) => state.favorites);
  const songs = ready
    ? favorites.flatMap((id) => {
        const song = parseSongId(id);
        return song ? [song] : [];
      })
    : [];

  return (
    <Shell>
      <PageIntro
        kicker="Vos chants"
        title="Favoris"
        subtitle="Ils restent sur cet appareil, même après avoir fermé l'application."
      />
      <SongList
        songs={songs as Song[]}
        showCollection
        empty="Aucun favori pour le moment. Ouvrez un chant et touchez le cœur."
      />
    </Shell>
  );
}
