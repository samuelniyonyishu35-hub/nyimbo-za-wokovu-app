import catalogue from "@/data/catalogue.json";

export type CollectionId = "NYIMBO_ZA_MUNGU" | "NYIMBO_ZA_WOKOVU";

export type Song = {
  collection: CollectionId;
  number: number;
  title: string;
  lyrics: string;
};

export type CollectionInfo = {
  id: CollectionId;
  slug: "mungu" | "wokovu";
  title: string;
  roman: string;
  expected: number;
};

export const COLLECTIONS: readonly CollectionInfo[] = [
  {
    id: "NYIMBO_ZA_MUNGU",
    slug: "mungu",
    title: "NYIMBO ZA MUNGU",
    roman: "I",
    expected: 327,
  },
  {
    id: "NYIMBO_ZA_WOKOVU",
    slug: "wokovu",
    title: "NYIMBO ZA WOKOVU",
    roman: "II",
    expected: 300,
  },
];

const ALL: Song[] = catalogue.songs.map((song) => ({
  collection: song.collection as CollectionId,
  number: song.number,
  title: song.title,
  lyrics: song.lyrics.replace(/\r\n/g, "\n"),
}));

const bySlug = new Map(COLLECTIONS.map((c) => [c.slug, c]));
const byId = new Map(COLLECTIONS.map((c) => [c.id, c]));

const songsByCollection = new Map<CollectionId, Song[]>();
for (const info of COLLECTIONS) {
  const list = ALL.filter((s) => s.collection === info.id).sort((a, b) => a.number - b.number);
  songsByCollection.set(info.id, list);
}

const byKey = new Map<string, Song>();
for (const song of ALL) byKey.set(`${song.collection}:${song.number}`, song);

export const SONG_TOTAL = ALL.length;

export function collectionBySlug(slug: string): CollectionInfo | null {
  return bySlug.get(slug as CollectionInfo["slug"]) ?? null;
}

export function collectionInfo(id: CollectionId): CollectionInfo {
  const info = byId.get(id);
  if (!info) throw new Error(`Recueil inconnu: ${id}`);
  return info;
}

export function slugOf(id: CollectionId): CollectionInfo["slug"] {
  return collectionInfo(id).slug;
}

export function songsIn(id: CollectionId): Song[] {
  return songsByCollection.get(id) ?? [];
}

export function songId(song: Pick<Song, "collection" | "number">): string {
  return `${slugOf(song.collection)}:${song.number}`;
}

export function getSong(slug: string, number: number): Song | null {
  const info = collectionBySlug(slug);
  if (!info || !Number.isInteger(number)) return null;
  return byKey.get(`${info.id}:${number}`) ?? null;
}

export function parseSongId(id: string): Song | null {
  const cut = id.indexOf(":");
  if (cut < 0) return null;
  const slug = id.slice(0, cut);
  const number = Number(id.slice(cut + 1));
  return getSong(slug, number);
}

export function neighbors(song: Song): { prev: Song | null; next: Song | null } {
  const list = songsIn(song.collection);
  const index = list.findIndex((item) => item.number === song.number);
  return {
    prev: index > 0 ? (list[index - 1] ?? null) : null,
    next: index >= 0 && index < list.length - 1 ? (list[index + 1] ?? null) : null,
  };
}

export function norm(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/['’ʼ`]/g, "")
    .replace(/[-‐‑–—]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function letterOf(title: string): string {
  const ch = norm(title)[0] ?? "#";
  return ch >= "a" && ch <= "z" ? ch.toUpperCase() : "#";
}

const alphaCache = new Map<CollectionId, Song[]>();

export function songsAlpha(id: CollectionId): Song[] {
  const cached = alphaCache.get(id);
  if (cached) return cached;
  const sorted = [...songsIn(id)].sort(
    (a, b) => norm(a.title).localeCompare(norm(b.title), "fr", { sensitivity: "base" }) || a.number - b.number,
  );
  alphaCache.set(id, sorted);
  return sorted;
}

export type AlphaGroup = { letter: string; songs: Song[] };

export function groupAlpha(list: Song[]): AlphaGroup[] {
  const groups: AlphaGroup[] = [];
  for (const song of list) {
    const letter = letterOf(song.title);
    const last = groups[groups.length - 1];
    if (!last || last.letter !== letter) groups.push({ letter, songs: [song] });
    else last.songs.push(song);
  }
  return groups;
}

type IndexedSong = { song: Song; titleN: string; lyricsN: string };
let index: IndexedSong[] | null = null;

function getIndex(): IndexedSong[] {
  if (!index) {
    index = ALL.map((song) => ({
      song,
      titleN: norm(song.title),
      lyricsN: norm(song.lyrics),
    }));
  }
  return index;
}

export type SearchHit = { song: Song; score: number };

export function searchSongs(query: string, collection?: CollectionId): SearchHit[] {
  const q = query.trim();
  if (!q) return [];
  const numeric = /^\d+$/.test(q);
  const nq = norm(q);
  const words = nq.split(" ").filter(Boolean);
  if (!numeric && words.length === 0) return [];

  const hits: SearchHit[] = [];
  const short = !numeric && !nq.includes(" ") && nq.length < 3;
  for (const row of getIndex()) {
    if (collection && row.song.collection !== collection) continue;
    let score = 0;
    if (numeric) {
      const ns = String(row.song.number);
      if (ns === q) score = 1000;
      else if (ns.startsWith(q)) score = 640 - Math.min(ns.length, 6);
    } else if (short) {
      if (row.titleN.startsWith(nq)) score = 860;
      else if (nq.length > 1 && row.titleN.includes(nq)) score = 620;
    } else if (row.titleN === nq) {
      score = 960;
    } else if (row.titleN.startsWith(nq)) {
      score = 860;
    } else if (words.every((word) => row.titleN.includes(word))) {
      score = 700;
    } else if (words.every((word) => row.titleN.includes(word) || row.lyricsN.includes(word))) {
      score = words.some((word) => row.titleN.includes(word)) ? 520 : 360;
    }
    if (score) hits.push({ song: row.song, score });
  }

  hits.sort((a, b) => b.score - a.score || a.song.number - b.song.number || a.song.collection.localeCompare(b.song.collection));
  return hits;
}

export function shareText(song: Song): string {
  const info = collectionInfo(song.collection);
  return `${song.number}. ${song.title}\n${info.title}\n\n${song.lyrics}`;
}

export function stanzasOf(lyrics: string): string[] {
  const parts = lyrics.split(/\n[ \t]*\n/).map((part) => part.replace(/^\n+|\n+$/g, ""));
  const cleaned = parts.filter((part) => part.trim().length > 0);
  return cleaned.length > 0 ? cleaned : [lyrics];
}
