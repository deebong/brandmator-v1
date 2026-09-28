// Portmanteau fusion engine: blends two words into brandable candidates.

const VOWELS = new Set(["a", "e", "i", "o", "u", "y"]);

function isVowel(c: string): boolean {
  return VOWELS.has(c.toLowerCase());
}

// Find the index of the first vowel in a word.
function firstVowelIndex(w: string): number {
  for (let i = 0; i < w.length; i++) if (isVowel(w[i])) return i;
  return -1;
}

// Find the index of the last vowel in a word.
function lastVowelIndex(w: string): number {
  for (let i = w.length - 1; i >= 0; i--) if (isVowel(w[i])) return i;
  return -1;
}

function cap(w: string): string {
  return w.charAt(0).toUpperCase() + w.slice(1);
}

// Remove awkward triple letters and duplicate consonant seams.
function clean(w: string): string {
  let out = w.replace(/(.)\1\1+/g, "$1$1"); // no more than double
  // collapse an accidental double where a vowel meets same vowel oddly
  out = out.replace(/([^aeiouy])\1/g, "$1"); // dedupe repeated consonant at seam
  return out;
}

export interface Fusion {
  word: string;
  parts: [string, string];
  style: string;
}

// Generate multiple blend styles for a pair of words.
export function fusePair(a: string, b: string): Fusion[] {
  a = a.toLowerCase().trim();
  b = b.toLowerCase().trim();
  if (!a || !b) return [];

  const results: { word: string; style: string }[] = [];

  // 1. Head of A + tail of B from B's first vowel
  const bfv = firstVowelIndex(b);
  if (bfv > 0) {
    const alv = lastVowelIndex(a);
    const headEnd = alv >= 0 ? alv + 1 : Math.ceil(a.length / 2);
    results.push({ word: a.slice(0, headEnd) + b.slice(bfv), style: "Classic blend" });
  }

  // 2. First half of A + second half of B
  const half = a.slice(0, Math.ceil(a.length / 2)) + b.slice(Math.floor(b.length / 2));
  results.push({ word: half, style: "Split & merge" });

  // 3. Overlap: if end of A and start of B share letters
  for (let overlap = Math.min(3, a.length - 1, b.length - 1); overlap >= 1; overlap--) {
    if (a.slice(-overlap) === b.slice(0, overlap)) {
      results.push({ word: a + b.slice(overlap), style: "Seamless overlap" });
      break;
    }
  }

  // 4. A + tail of B after its first vowel cluster
  results.push({ word: a + b.slice(bfv >= 0 ? bfv : 1), style: "Prefix fuse" });

  // 5. Head of A up to last vowel + full B
  const alv2 = lastVowelIndex(a);
  if (alv2 >= 0) {
    results.push({ word: a.slice(0, alv2 + 1) + b, style: "Suffix fuse" });
  }

  // 6. Brandify: add a trendy suffix to A
  const suffixes = ["ly", "io", "ify", "sy", "za", "r"];
  const suf = suffixes[Math.floor(Math.random() * suffixes.length)];
  let stem = a;
  if (isVowel(stem[stem.length - 1]) && (suf === "io" || suf === "ify")) {
    stem = stem.slice(0, -1);
  }
  results.push({ word: stem + suf, style: "Trendy suffix" });

  // Normalize, clean, dedupe, filter by length & quality
  const seen = new Set<string>();
  const out: Fusion[] = [];
  for (const r of results) {
    const w = clean(r.word);
    if (w.length < 4 || w.length > 12) continue;
    if (w === a || w === b) continue;
    // must contain at least one vowel
    if (firstVowelIndex(w) === -1) continue;
    if (seen.has(w)) continue;
    seen.add(w);
    out.push({ word: cap(w), parts: [a, b], style: r.style });
  }
  return out;
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Simple deterministic "brand score" 0-100 based on length, vowel balance, flow.
export function brandScore(word: string): number {
  const w = word.toLowerCase();
  let score = 60;
  const len = w.length;
  if (len >= 5 && len <= 8) score += 15;
  else if (len === 4 || len === 9) score += 6;
  else score -= 6;

  const vowels = [...w].filter((c) => VOWELS.has(c)).length;
  const ratio = vowels / len;
  if (ratio >= 0.3 && ratio <= 0.55) score += 12;
  else score -= 5;

  // penalize hard clusters
  if (/[bcdfghjklmnpqrstvwxz]{4,}/.test(w)) score -= 15;
  // reward ending in vowel or common brandy sounds
  if (/(a|o|io|y|ly|ify|el|ia)$/.test(w)) score += 8;
  // pseudo-random flair for variety
  let h = 0;
  for (let i = 0; i < w.length; i++) h = (h * 31 + w.charCodeAt(i)) % 97;
  score += (h % 11) - 5;

  return Math.max(35, Math.min(99, Math.round(score)));
}

const TLDS = [".com", ".io", ".co", ".app", ".ai", ".studio", ".xyz"];
export function suggestTld(word: string): string {
  let h = 0;
  for (let i = 0; i < word.length; i++) h = (h * 17 + word.charCodeAt(i)) % 1000;
  return TLDS[h % TLDS.length];
}