import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { PageIntro, Shell } from "@/components/shell";
import { COLLECTIONS, songsIn } from "@/lib/hymns";

export const Route = createFileRoute("/recueils")({
  component: RecueilsPage,
  head: () => ({ meta: [{ title: "Recueils — Nyimbo za Wokovu" }] }),
});

function RecueilsPage() {
  return (
    <Shell>
      <PageIntro
        kicker="Deux livres distincts"
        title="Recueils"
        subtitle="Nyimbo za Mungu et Nyimbo za Wokovu restent séparés, avec leurs propres numéros."
      />
      <div className="grid gap-3">
        {COLLECTIONS.map((collection) => {
          const songs = songsIn(collection.id);
          const count = songs.length;
          return (
            <Link
              key={collection.id}
              to="/recueil/$slug"
              params={{ slug: collection.slug }}
              className="glass pressable block p-5"
            >
              <div className="flex items-center gap-4">
                <span className="font-display grid size-16 shrink-0 place-items-center rounded-3xl bg-primary text-3xl text-primary-fg">
                  {collection.roman}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-display block text-3xl leading-none font-medium text-fg">{collection.title}</span>
                  <span className="mt-2 block text-sm text-muted">
                    {count} chants · du n° {songs[0]?.number ?? 1} au n° {songs[count - 1]?.number ?? count}
                  </span>
                </span>
                <ChevronRight className="size-5 text-muted" aria-hidden="true" />
              </div>
            </Link>
          );
        })}
      </div>
    </Shell>
  );
}
