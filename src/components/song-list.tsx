import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { collectionInfo, slugOf, songId, type Song } from "@/lib/hymns";
import { useLibrary, useLibraryReady } from "@/lib/library-store";

export function SongList({
  songs,
  showCollection = false,
  empty,
}: {
  songs: Song[];
  showCollection?: boolean;
  empty?: string;
}) {
  if (songs.length === 0) {
    return <p className="surface px-4 py-8 text-center text-muted">{empty ?? "Aucun chant."}</p>;
  }
  return (
    <ul className="surface overflow-hidden">
      {songs.map((song) => (
        <SongRow key={songId(song)} song={song} showCollection={showCollection} />
      ))}
    </ul>
  );
}

export function SongRow({
  song,
  showCollection = false,
  detail,
}: {
  song: Song;
  showCollection?: boolean;
  detail?: string;
}) {
  const info = collectionInfo(song.collection);
  return (
    <li className="song-row flex items-stretch">
      <Link
        to="/chant/$slug/$number"
        params={{ slug: slugOf(song.collection), number: String(song.number) }}
        className="flex min-h-14 min-w-0 flex-1 items-center gap-3 px-3 py-2.5"
      >
        <span className="w-11 shrink-0 text-center text-base font-bold text-primary tabular-nums">
          {song.number}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base leading-snug font-semibold tracking-tight text-fg">
            {song.title}
          </span>
          {showCollection || detail ? (
            <span className="mt-0.5 block text-sm text-muted">{detail ?? info.title}</span>
          ) : null}
        </span>
      </Link>
      <FavoriteButton id={songId(song)} />
    </li>
  );
}

export function FavoriteButton({ id }: { id: string }) {
  const ready = useLibraryReady();
  const active = useLibrary((state) => state.favorites.includes(id));
  const toggle = useLibrary((state) => state.toggleFavorite);
  return (
    <button
      type="button"
      disabled={!ready}
      aria-pressed={active}
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      onClick={() => toggle(id)}
      className="pressable grid w-12 shrink-0 place-items-center text-primary disabled:opacity-40"
    >
      <Heart className="size-5" fill={active ? "currentColor" : "none"} aria-hidden="true" />
    </button>
  );
}
