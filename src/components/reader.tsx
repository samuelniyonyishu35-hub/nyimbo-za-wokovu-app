import { useNavigate } from "@tanstack/react-router";
import {
  ALargeSmall,
  AlignLeft,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Copy,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  Share2,
} from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Shell } from "@/components/shell";
import { FavoriteButton } from "@/components/song-list";
import {
  collectionInfo,
  neighbors,
  shareText,
  slugOf,
  songId,
  songsIn,
  stanzasOf,
  type Song,
} from "@/lib/hymns";
import { useLibrary, useLibraryReady } from "@/lib/library-store";
import { copyText } from "@/lib/theme";

export function Reader({ song }: { song: Song }) {
  const navigate = useNavigate();
  const ready = useLibraryReady();
  const id = songId(song);
  const info = collectionInfo(song.collection);
  const { prev, next } = neighbors(song);
  const [full, setFull] = useState(false);
  const fontSize = useLibrary((state) => state.fontSize);
  const lineHeight = useLibrary((state) => state.lineHeight);
  const setFontSize = useLibrary((state) => state.setFontSize);
  const setLineHeight = useLibrary((state) => state.setLineHeight);
  const bookmarked = useLibrary((state) => state.bookmarks.includes(id));
  const toggleBookmark = useLibrary((state) => state.toggleBookmark);
  const note = useLibrary((state) => state.notes[id] ?? "");
  const setNote = useLibrary((state) => state.setNote);
  const visit = useLibrary((state) => state.visit);

  useEffect(() => {
    if (!ready) return;
    visit(id);
  }, [ready, id, visit]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  function go(target: Song) {
    void navigate({
      to: "/chant/$slug/$number",
      params: { slug: slugOf(target.collection), number: String(target.number) },
      replace: true,
    });
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea")) return;
      if (event.key === "ArrowLeft" && prev) go(prev);
      if (event.key === "ArrowRight" && next) go(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // go is recreated each render and only closes over navigate, which is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prev, next]);

  const gesture = useSwipe(
    () => {
      if (prev) go(prev);
    },
    () => {
      if (next) go(next);
    },
  );

  async function onCopy() {
    const ok = await copyText(shareText(song));
    toast(ok ? "Paroles copiées" : "Impossible de copier");
  }

  async function onShare() {
    const text = shareText(song);
    const title = `${song.number}. ${song.title}`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    const ok = await copyText(text);
    toast(ok ? "Partage indisponible — paroles copiées" : "Impossible de partager");
  }

  const total = songsIn(song.collection).length;

  return (
    <Shell hideNav={full}>
      <article
        onPointerDown={gesture.onPointerDown}
        onPointerUp={gesture.onPointerUp}
        onPointerCancel={gesture.reset}
      >
        <header className="glass sticky top-3 z-20 mb-6 px-3 py-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => void navigate({ to: "/recueil/$slug", params: { slug: info.slug } })}
              className="pressable inline-flex min-h-11 items-center gap-0.5 rounded-full pr-2 text-sm font-semibold text-primary"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
              Recueil
            </button>
            <p className="min-w-0 flex-1 truncate text-center text-xs font-bold tracking-widest text-muted uppercase">
              {info.title}
            </p>
            <FavoriteButton id={id} />
            <button
              type="button"
              disabled={!ready}
              aria-pressed={bookmarked}
              aria-label={bookmarked ? "Retirer le signet" : "Poser un signet"}
              onClick={() => toggleBookmark(id)}
              className="pressable grid size-11 place-items-center rounded-full text-primary disabled:opacity-40"
            >
              <Bookmark className="size-5" fill={bookmarked ? "currentColor" : "none"} aria-hidden="true" />
            </button>
          </div>
          <p className="mt-1 text-center text-sm font-semibold text-primary tabular-nums">
            N° {song.number}
            <span className="text-muted"> sur {total}</span>
          </p>
          <h1 className="font-display mt-1 text-center text-3xl leading-tight font-medium text-fg">{song.title}</h1>
          {full ? (
            <div className="mt-2 flex justify-center">
              <TextButton onClick={() => setFull(false)} icon={<Minimize2 className="size-4" />}>
                Quitter le plein écran
              </TextButton>
            </div>
          ) : (
            <>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <div className="flex items-center rounded-full bg-segment p-1">
                  <IconButton label="Réduire le texte" onClick={() => setFontSize(fontSize - 0.05)}>
                    <Minus className="size-4" />
                  </IconButton>
                  <span className="inline-flex min-w-14 items-center justify-center gap-1 px-1 text-sm font-semibold tabular-nums">
                    <ALargeSmall className="size-4 text-primary" aria-hidden="true" />
                    {Math.round(fontSize * 16)}
                  </span>
                  <IconButton label="Agrandir le texte" onClick={() => setFontSize(fontSize + 0.05)}>
                    <Plus className="size-4" />
                  </IconButton>
                </div>
                <div className="flex items-center rounded-full bg-segment p-1">
                  <IconButton label="Resserrer les lignes" onClick={() => setLineHeight(lineHeight - 0.1)}>
                    <AlignLeft className="size-4" />
                  </IconButton>
                  <span className="min-w-10 text-center text-sm font-semibold tabular-nums">{lineHeight.toFixed(1)}</span>
                  <IconButton label="Écarter les lignes" onClick={() => setLineHeight(lineHeight + 0.1)}>
                    <Plus className="size-4" />
                  </IconButton>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-1">
                <TextButton onClick={() => void onCopy()} icon={<Copy className="size-4" />}>
                  Copier
                </TextButton>
                <TextButton onClick={() => void onShare()} icon={<Share2 className="size-4" />}>
                  Partager
                </TextButton>
                <TextButton onClick={() => setFull(true)} icon={<Maximize2 className="size-4" />}>
                  Plein écran
                </TextButton>
              </div>
            </>
          )}
        </header>

        <div className="lyrics text-fg" style={{ fontSize: `${fontSize}rem`, lineHeight }} lang="sw">
          {stanzasOf(song.lyrics).map((stanza, index) => (
            <p key={index} className="stanza">
              {stanza}
            </p>
          ))}
        </div>

        {full ? null : (
          <section className="surface mt-8 p-4">
            <label className="block">
              <span className="text-sm font-bold text-fg">Note personnelle</span>
              <span className="mt-0.5 block text-sm text-muted">Gardée sur cet appareil seulement.</span>
              <textarea
                className="note-input mt-3 min-h-24"
                value={ready ? note : ""}
                disabled={!ready}
                placeholder="Un rappel, un couplet à revoir…"
                onChange={(event) => setNote(id, event.target.value)}
              />
            </label>
          </section>
        )}

        <div className={"fixed inset-x-0 z-30 px-4 " + (full ? "pager-flush" : "pager-raised")}>
          <div className="glass mx-auto flex max-w-2xl gap-1 p-1.5">
            <button
              type="button"
              disabled={!prev}
              onClick={() => prev && go(prev)}
              className="pressable inline-flex min-h-12 flex-1 items-center justify-center gap-1 rounded-3xl text-sm font-semibold text-fg disabled:opacity-35"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
              Précédent
            </button>
            <button
              type="button"
              disabled={!next}
              onClick={() => next && go(next)}
              className="pressable inline-flex min-h-12 flex-1 items-center justify-center gap-1 rounded-3xl bg-primary text-sm font-semibold text-primary-fg disabled:opacity-35"
            >
              Suivant
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </article>
    </Shell>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="pressable grid size-11 place-items-center rounded-full text-fg"
    >
      {children}
    </button>
  );
}

function TextButton({ children, icon, onClick }: { children: string; icon: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pressable inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-fg"
    >
      {icon}
      {children}
    </button>
  );
}

function useSwipe(onPrev: () => void, onNext: () => void) {
  const start = useRef<{ x: number; y: number; t: number } | null>(null);
  const prevRef = useRef(onPrev);
  const nextRef = useRef(onNext);
  prevRef.current = onPrev;
  nextRef.current = onNext;

  function reset() {
    start.current = null;
  }

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const target = event.target;
    if (target instanceof Element && target.closest("button, a, input, textarea, label")) return;
    start.current = { x: event.clientX, y: event.clientY, t: Date.now() };
  }

  function onPointerUp(event: PointerEvent<HTMLElement>) {
    if (!start.current) return;
    const dx = event.clientX - start.current.x;
    const dy = event.clientY - start.current.y;
    const elapsed = Date.now() - start.current.t;
    start.current = null;
    if (elapsed > 700) return;
    if (Math.abs(dx) < 72 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
    if (dx < 0) nextRef.current();
    else prevRef.current();
  }

  return { onPointerDown, onPointerUp, reset };
}
