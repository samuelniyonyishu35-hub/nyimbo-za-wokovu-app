import { createFileRoute, Link } from "@tanstack/react-router";
import { Reader } from "@/components/reader";
import { Shell } from "@/components/shell";
import { collectionBySlug, getSong } from "@/lib/hymns";

export const Route = createFileRoute("/chant/$slug/$number")({
  component: ChantPage,
  head: ({ params }) => {
    const song = getSong(params.slug, Number(params.number));
    return {
      meta: [{ title: song ? `${song.number}. ${song.title}` : "Chant" }],
    };
  },
});

function ChantPage() {
  const { slug, number } = Route.useParams();
  const parsed = Number(number);
  const song = Number.isInteger(parsed) ? getSong(slug, parsed) : null;
  if (!song) {
    const info = collectionBySlug(slug);
    return (
      <Shell>
        <p className="surface px-4 py-8 text-center text-muted">Ce chant est introuvable.</p>
        {info ? (
          <Link
            to="/recueil/$slug"
            params={{ slug: info.slug }}
            className="mt-4 inline-flex min-h-11 items-center font-semibold text-primary"
          >
            Retour au recueil
          </Link>
        ) : (
          <Link to="/recueils" className="mt-4 inline-flex min-h-11 items-center font-semibold text-primary">
            Retour aux recueils
          </Link>
        )}
      </Shell>
    );
  }
  return <Reader song={song} />;
}
