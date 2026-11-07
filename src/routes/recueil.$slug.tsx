import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { SearchField, Segmented } from "@/components/search-field";
import { Shell } from "@/components/shell";
import { SongList } from "@/components/song-list";
import { collectionBySlug, groupAlpha, searchSongs, songsAlpha, songsIn } from "@/lib/hymns";

export const Route = createFileRoute("/recueil/$slug")({
  component: CataloguePage,
  head: ({ params }) => {
    const info = collectionBySlug(params.slug);
    return { meta: [{ title: info ? `${info.title}` : "Recueil" }] };
  },
});

function CataloguePage() {
  const { slug } = Route.useParams();
  const info = collectionBySlug(slug);
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState("numero");

  const base = info ? (order === "alpha" ? songsAlpha(info.id) : songsIn(info.id)) : [];
  const hits = useMemo(() => {
    if (!info || !query.trim()) return null;
    return searchSongs(query, info.id).map((hit) => hit.song);
  }, [info, query]);

  if (!info) {
    return (
      <Shell>
        <p className="surface px-4 py-8 text-center text-muted">Ce recueil est introuvable.</p>
        <Link to="/recueils" className="mt-4 inline-flex min-h-11 items-center font-semibold text-primary">
          Retour aux recueils
        </Link>
      </Shell>
    );
  }

  const shown = hits ?? base;
  const groups = order === "alpha" && !hits ? groupAlpha(base) : null;

  return (
    <Shell>
      <Link
        to="/recueils"
        className="pressable mb-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary"
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
        Recueils
      </Link>
      <header className="mb-4">
        <p className="text-xs font-bold tracking-widest text-primary uppercase">Recueil {info.roman}</p>
        <h1 className="font-display mt-1 text-4xl leading-none font-medium">{info.title}</h1>
        <p className="mt-2 text-sm text-muted">{songsIn(info.id).length} chants</p>
      </header>

      <div className="sticky top-2 z-20 mb-4">
        <div className="glass space-y-2 p-2">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Numéro, titre ou parole dans ce recueil"
            label={`Rechercher dans ${info.title}`}
          />
          <Segmented
            value={order}
            onChange={setOrder}
            options={[
              { id: "numero", label: "Numéro" },
              { id: "alpha", label: "A–Z" },
            ]}
          />
          {order === "alpha" && groups ? (
            <div className="flex gap-1 overflow-x-auto px-1 pb-1">
              {groups.map((group) => (
                <a
                  key={group.letter}
                  href={`#lettre-${group.letter}`}
                  className="grid size-11 shrink-0 place-items-center rounded-full text-sm font-bold text-primary"
                >
                  {group.letter}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {hits ? (
        <SongList songs={shown} empty={`Aucun chant pour « ${query.trim()} ».`} />
      ) : groups ? (
        <div className="space-y-4">
          {groups.map((group) => (
            <section key={group.letter} id={`lettre-${group.letter}`}>
              <h2 className="mb-1 px-1 text-sm font-bold text-primary">{group.letter}</h2>
              <SongList songs={group.songs} />
            </section>
          ))}
        </div>
      ) : (
        <SongList songs={shown} />
      )}
    </Shell>
  );
}
