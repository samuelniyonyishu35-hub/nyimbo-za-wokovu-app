import { createFileRoute, Link } from "@tanstack/react-router";
import { Monitor, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { PageIntro, Shell } from "@/components/shell";
import { COLLECTIONS, SONG_TOTAL, songsIn, stanzasOf } from "@/lib/hymns";
import { useLibrary, useLibraryReady, type ThemeMode } from "@/lib/library-store";

export const Route = createFileRoute("/reglages")({
  component: ReglagesPage,
  head: () => ({ meta: [{ title: "Réglages — Nyimbo za Wokovu" }] }),
});

const THEMES: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Clair", icon: Sun },
  { id: "dark", label: "Sombre", icon: Moon },
  { id: "system", label: "Système", icon: Monitor },
];

function ReglagesPage() {
  const ready = useLibraryReady();
  const theme = useLibrary((state) => state.theme);
  const setTheme = useLibrary((state) => state.setTheme);
  const fontSize = useLibrary((state) => state.fontSize);
  const lineHeight = useLibrary((state) => state.lineHeight);
  const setFontSize = useLibrary((state) => state.setFontSize);
  const setLineHeight = useLibrary((state) => state.setLineHeight);
  const historyCount = useLibrary((state) => state.history.length);
  const clearHistory = useLibrary((state) => state.clearHistory);
  const [confirmClear, setConfirmClear] = useState(false);
  const sample = songsIn("NYIMBO_ZA_MUNGU")[1];
  const sampleText = sample ? stanzasOf(sample.lyrics)[0] : "";

  return (
    <Shell>
      <PageIntro
        kicker="Lecture"
        title="Réglages"
        subtitle="Le thème, la taille du texte et l'interligne s'appliquent à tous les chants."
      />

      <section className="surface p-4">
        <h2 className="text-sm font-bold tracking-wide uppercase">Apparence</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {THEMES.map((item) => {
            const Icon = item.icon;
            const active = theme === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                disabled={!ready}
                onClick={() => setTheme(item.id)}
                className={
                  "pressable flex min-h-16 flex-col items-center justify-center gap-1 rounded-3xl text-sm font-semibold " +
                  (active ? "bg-primary text-primary-fg" : "bg-segment text-fg")
                }
              >
                <Icon className="size-5" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="surface mt-3 p-4">
        <h2 className="text-sm font-bold tracking-wide uppercase">Texte</h2>
        <label className="mt-4 block">
          <span className="flex items-center justify-between text-sm font-semibold">
            Taille
            <span className="text-primary tabular-nums">{Math.round(fontSize * 16)}</span>
          </span>
          <input
            className="mt-2"
            type="range"
            min={0.95}
            max={1.7}
            step={0.05}
            value={fontSize}
            disabled={!ready}
            onChange={(event) => setFontSize(Number(event.target.value))}
          />
        </label>
        <label className="mt-4 block">
          <span className="flex items-center justify-between text-sm font-semibold">
            Interligne
            <span className="text-primary tabular-nums">{lineHeight.toFixed(2)}</span>
          </span>
          <input
            className="mt-2"
            type="range"
            min={1.35}
            max={2.1}
            step={0.05}
            value={lineHeight}
            disabled={!ready}
            onChange={(event) => setLineHeight(Number(event.target.value))}
          />
        </label>
        <p className="lyrics mt-4 text-fg" style={{ fontSize: `${fontSize}rem`, lineHeight }} lang="sw">
          {sampleText}
        </p>
      </section>

      <section className="surface mt-3 p-4">
        <h2 className="text-sm font-bold tracking-wide uppercase">Sur cet appareil</h2>
        <p className="mt-2 text-sm text-muted">{ready ? `${historyCount} chants dans l'historique.` : "Chargement…"}</p>
        <button
          type="button"
          className="pressable mt-3 min-h-11 rounded-full px-1 text-sm font-semibold text-danger"
          onClick={() => {
            if (!confirmClear) {
              setConfirmClear(true);
              return;
            }
            clearHistory();
            setConfirmClear(false);
          }}
        >
          {confirmClear ? "Confirmer l'effacement de l'historique" : "Effacer l'historique"}
        </button>
        <div className="mt-4 flex gap-4 text-sm font-semibold">
          <Link to="/signets" className="min-h-11 text-primary">
            Signets et notes
          </Link>
          <Link to="/historique" className="min-h-11 text-primary">
            Historique
          </Link>
        </div>
      </section>

      <section className="surface mt-3 p-4">
        <h2 className="text-sm font-bold tracking-wide uppercase">Recueils</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {COLLECTIONS.map((collection) => (
            <li key={collection.id} className="flex items-center justify-between gap-3">
              <span>{collection.title}</span>
              <span className="font-semibold text-primary tabular-nums">{songsIn(collection.id).length}</span>
            </li>
          ))}
          <li className="flex items-center justify-between gap-3 border-t border-line pt-2 font-semibold">
            <span>Total</span>
            <span className="text-primary tabular-nums">{SONG_TOTAL}</span>
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Paroles d'origine, sans résumé ni reformulation. Pour garder l'application sur l'écran d'accueil du
          téléphone : menu du navigateur, puis Ajouter à l'écran d'accueil. Après une première ouverture, les
          chants restent disponibles sans Internet.
        </p>
      </section>
    </Shell>
  );
}
