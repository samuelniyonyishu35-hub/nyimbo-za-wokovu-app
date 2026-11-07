import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Clock3, ChevronRight } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { PageIntro, Shell } from "@/components/shell";
import { SearchField } from "@/components/search-field";
import { SongList, SongRow } from "@/components/song-list";
import { COLLECTIONS, SONG_TOTAL, parseSongId, searchSongs, songId, songsIn, type Song } from "@/lib/hymns";
import { useLibrary, useLibraryReady } from "@/lib/library-store";
import { relativeTime } from "@/lib/time";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({ meta: [{ title: "Nyimbo za Wokovu" }] }),
});

function Home() {
  const [query, setQuery] = useState("");
  const ready = useLibraryReady();
  const favorites = useLibrary((state) => state.favorites);
  const history = useLibrary((state) => state.history);
  const bookmarks = useLibrary((state) => state.bookmarks);
  const hits = useMemo(() => (query.trim() ? searchSongs(query) : []), [query]);

  return (
    <Shell>
      <PageIntro
        kicker="Recueil de chants"
        title="Nyimbo za Wokovu"
        subtitle={`${SONG_TOTAL} chants des deux recueils, dans l'application. La recherche, les favoris et les paroles marchent sans connexion.`}
      />
      <SearchField value={query} onChange={setQuery} placeholder="Numéro, titre ou parole" label="Rechercher un chant" />

      {query.trim() ? (
        <section className="mt-4">
          <p className="mb-2 text-sm font-semibold text-muted">
            {hits.length === 0
              ? "Aucun chant"
              : hits.length > 60
                ? `60 premiers résultats sur ${hits.length}`
                : `${hits.length} chant${hits.length > 1 ? "s" : ""}`}
          </p>
          <SongList
            songs={hits.slice(0, 60).map((hit) => hit.song)}
            showCollection
            empty={`Aucun chant pour « ${query.trim()} ».`}
          />
        </section>
      ) : (
        <>
          <section className="mt-5 grid gap-3">
            {COLLECTIONS.map((collection) => {
              const count = songsIn(collection.id).length;
              return (
                <Link
                  key={collection.id}
                  to="/recueil/$slug"
                  params={{ slug: collection.slug }}
                  className="glass pressable block p-4"
                >
                  <div className="flex items-start gap-4">
                    <span className="font-display grid size-14 shrink-0 place-items-center rounded-2xl bg-primary text-2xl text-primary-fg">
                      {collection.roman}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold tracking-widest text-primary uppercase">
                        Recueil {collection.roman}
                      </span>
                      <span className="font-display mt-1 block text-2xl leading-tight font-medium text-fg">
                        {collection.title}
                      </span>
                      <span className="mt-1 block text-sm text-muted">
                        {count} chants · n° 1 à {count}
                      </span>
                    </span>
                    <ChevronRight className="mt-4 size-5 shrink-0 text-muted" aria-hidden="true" />
                  </div>
                </Link>
              );
            })}
          </section>

          <section className="mt-8">
            <SectionLink to="/historique" icon={<Clock3 className="size-4" />} label="Récents" />
            <RecentList ready={ready} ids={history.slice(0, 4)} />
          </section>

          <section className="mt-6">
            <SectionLink to="/favoris" label="Favoris" count={ready ? favorites.length : 0} />
            <IdList
              ready={ready}
              ids={favorites.slice(0, 3)}
              empty="Touchez le cœur d'un chant pour le retrouver ici."
            />
          </section>

          <section className="mt-6">
            <SectionLink
              to="/signets"
              icon={<Bookmark className="size-4" />}
              label="Signets"
              count={ready ? bookmarks.length : 0}
            />
            <IdList
              ready={ready}
              ids={bookmarks.slice(0, 3)}
              empty="Un signet garde un chant sous la main, avec une note si vous voulez."
            />
          </section>
        </>
      )}
    </Shell>
  );
}

function SectionLink({
  to,
  label,
  icon,
  count,
}: {
  to: "/historique" | "/favoris" | "/signets";
  label: string;
  icon?: ReactNode;
  count?: number;
}) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h2 className="inline-flex items-center gap-2 text-sm font-bold tracking-wide text-fg uppercase">
        {icon}
        {label}
        {typeof count === "number" ? <span className="font-semibold text-muted tabular-nums">{count}</span> : null}
      </h2>
      <Link to={to} className="inline-flex min-h-11 items-center px-1 text-sm font-semibold text-primary">
        Tout voir
      </Link>
    </div>
  );
}

function RecentList({ ready, ids }: { ready: boolean; ids: { id: string; at: number }[] }) {
  const rows = ready
    ? ids.flatMap((item) => {
        const song = parseSongId(item.id);
        return song ? [{ song, at: item.at }] : [];
      })
    : [];
  if (rows.length === 0) {
    return <p className="surface px-4 py-6 text-sm text-muted">Les chants ouverts récemment s'afficheront ici.</p>;
  }
  return (
    <ul className="surface overflow-hidden">
      {rows.map((item) => (
        <SongRow key={songId(item.song)} song={item.song} detail={relativeTime(item.at)} />
      ))}
    </ul>
  );
}

function IdList({ ready, ids, empty }: { ready: boolean; ids: string[]; empty: string }) {
  const songs = ready ? ids.flatMap((id) => {
    const song = parseSongId(id);
    return song ? [song] : [];
  }) : [];
  if (songs.length === 0) {
    return <p className="surface px-4 py-6 text-sm text-muted">{empty}</p>;
  }
  return (
    <ul className="surface overflow-hidden">
      {songs.map((song) => (
        <SongRow key={songId(song)} song={song} showCollection />
      ))}
    </ul>
  );
}