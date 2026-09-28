import { useState, useCallback, useEffect } from "react";
import { CATEGORIES, CATEGORY_NAMES, allWords } from "./words";
import { fusePair, pick, shuffle, brandScore, suggestTld, type Fusion } from "./fuse";

interface Brand {
  id: string;
  word: string;
  parts: [string, string];
  style: string;
  tld: string;
  score: number;
}

let counter = 0;
function toBrand(f: Fusion): Brand {
  return {
    id: `${f.word}-${counter++}`,
    word: f.word,
    parts: f.parts,
    style: f.style,
    tld: suggestTld(f.word),
    score: brandScore(f.word),
  };
}

function wordsForCats(cats: string[]): string[] {
  if (cats.length === 0) return allWords();
  const set = new Set<string>();
  cats.forEach((c) => CATEGORIES[c]?.forEach((w) => set.add(w)));
  return Array.from(set);
}

function generateBatch(cats: string[], count: number): Brand[] {
  const pool = wordsForCats(cats);
  const out: Brand[] = [];
  const seen = new Set<string>();
  let attempts = 0;
  while (out.length < count && attempts < count * 30) {
    attempts++;
    const a = pick(pool);
    const b = pick(pool);
    if (a === b) continue;
    const fusions = fusePair(a, b);
    if (fusions.length === 0) continue;
    const f = pick(fusions);
    if (seen.has(f.word.toLowerCase())) continue;
    seen.add(f.word.toLowerCase());
    out.push(toBrand(f));
  }
  return out.sort((x, y) => y.score - x.score);
}

const CAT_STYLES: Record<string, string> = {
  Tech: "from-sky-500 to-indigo-500",
  Nature: "from-emerald-500 to-teal-500",
  Bold: "from-orange-500 to-red-500",
  Playful: "from-pink-500 to-fuchsia-500",
  Luxury: "from-amber-500 to-yellow-600",
  Food: "from-rose-500 to-orange-400",
  Wellness: "from-green-500 to-lime-500",
};

export default function App() {
  const [selected, setSelected] = useState<string[]>(["Tech"]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [saved, setSaved] = useState<Brand[]>([]);
  const [wordA, setWordA] = useState("");
  const [wordB, setWordB] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [tab, setTab] = useState<"results" | "saved">("results");

  const generate = useCallback(() => {
    setSpinning(true);
    setTab("results");
    setTimeout(() => {
      setBrands(generateBatch(selected, 12));
      setSpinning(false);
    }, 350);
  }, [selected]);

  useEffect(() => {
    setBrands(generateBatch(["Tech"], 12));
  }, []);

  const toggleCat = (c: string) => {
    setSelected((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const fuseCustom = () => {
    if (!wordA.trim() || !wordB.trim()) return;
    const fusions = fusePair(wordA, wordB);
    setBrands(shuffle(fusions).map(toBrand).sort((a, b) => b.score - a.score));
    setTab("results");
  };

  const copyName = (b: Brand) => {
    const full = b.word.toLowerCase() + b.tld;
    navigator.clipboard?.writeText(full);
    setCopied(b.id);
    setTimeout(() => setCopied(null), 1200);
  };

  const toggleSave = (b: Brand) => {
    setSaved((prev) =>
      prev.some((s) => s.word === b.word)
        ? prev.filter((s) => s.word !== b.word)
        : [...prev, b]
    );
  };

  const isSaved = (b: Brand) => saved.some((s) => s.word === b.word);

  const list = tab === "results" ? brands : saved;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-fuchsia-500/40">
      {/* background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-5 py-10 sm:py-16">
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Brandable name lab
          </div>
          <h1 className="bg-gradient-to-r from-fuchsia-400 via-violet-300 to-cyan-300 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-6xl">
            FuseName
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400 sm:text-base">
            Smash two words together to invent catchy, brandable domain names for
            your next startup, product, or side project.
          </p>
        </header>

        {/* Category picker */}
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Vibe
            </h2>
            <button
              onClick={() => setSelected([])}
              className="text-xs text-slate-500 transition hover:text-slate-300"
            >
              clear (use all)
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_NAMES.map((c) => {
              const active = selected.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => toggleCat(c)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    active
                      ? `border-transparent bg-gradient-to-r ${CAT_STYLES[c]} text-white shadow-lg shadow-black/30`
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </section>

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={spinning}
          className="group mb-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-600 px-6 py-4 text-lg font-bold text-white shadow-xl shadow-fuchsia-900/40 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-70"
        >
          <span className={spinning ? "animate-spin" : "transition group-hover:rotate-180"}>
            ⚡
          </span>
          {spinning ? "Fusing words…" : "Generate Brand Names"}
        </button>

        {/* Custom fuse */}
        <section className="mb-10 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <h3 className="mb-3 text-sm font-semibold text-slate-300">
            🧪 Fuse your own two words
          </h3>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={wordA}
              onChange={(e) => setWordA(e.target.value)}
              placeholder="e.g. spark"
              className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-500 focus:border-fuchsia-400"
            />
            <div className="flex items-center justify-center text-slate-500">+</div>
            <input
              value={wordB}
              onChange={(e) => setWordB(e.target.value)}
              placeholder="e.g. cloud"
              onKeyDown={(e) => e.key === "Enter" && fuseCustom()}
              className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-500 focus:border-fuchsia-400"
            />
            <button
              onClick={fuseCustom}
              className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/20"
            >
              Fuse
            </button>
          </div>
        </section>

        {/* Tabs */}
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={() => setTab("results")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === "results" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Results
          </button>
          <button
            onClick={() => setTab("saved")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === "saved" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            ♥ Shortlist{" "}
            {saved.length > 0 && (
              <span className="ml-1 rounded-full bg-fuchsia-500 px-1.5 text-xs">
                {saved.length}
              </span>
            )}
          </button>
        </div>

        {/* Grid */}
        {list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 py-16 text-center text-slate-500">
            {tab === "saved"
              ? "No favorites yet — tap the heart on names you love."
              : "Pick a vibe and hit generate!"}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((b) => (
              <div
                key={b.id}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-5 backdrop-blur transition hover:border-white/25 hover:shadow-xl hover:shadow-black/40"
              >
                <div className="mb-1 flex items-start justify-between">
                  <div className="text-2xl font-extrabold tracking-tight text-white">
                    {b.word}
                    <span className="text-fuchsia-400">{b.tld}</span>
                  </div>
                  <button
                    onClick={() => toggleSave(b)}
                    className={`text-lg transition ${
                      isSaved(b) ? "text-fuchsia-400" : "text-slate-600 hover:text-slate-300"
                    }`}
                    title="Save to shortlist"
                  >
                    {isSaved(b) ? "♥" : "♡"}
                  </button>
                </div>

                <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
                  <span className="rounded bg-white/5 px-1.5 py-0.5">{b.parts[0]}</span>
                  <span>+</span>
                  <span className="rounded bg-white/5 px-1.5 py-0.5">{b.parts[1]}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full ${
                          b.score >= 80
                            ? "bg-emerald-400"
                            : b.score >= 65
                            ? "bg-amber-400"
                            : "bg-rose-400"
                        }`}
                        style={{ width: `${b.score}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-300">{b.score}</span>
                  </div>
                  <button
                    onClick={() => copyName(b)}
                    className="rounded-lg bg-white/10 px-3 py-1 text-xs font-medium transition hover:bg-white/20"
                  >
                    {copied === b.id ? "Copied!" : "Copy"}
                  </button>
                </div>

                <span className="pointer-events-none absolute right-3 top-16 text-[10px] uppercase tracking-wider text-slate-600">
                  {b.style}
                </span>
              </div>
            ))}
          </div>
        )}

        <footer className="mt-16 text-center text-xs text-slate-600">
          FuseName · Brand scores & domain availability are heuristic suggestions.
          Always verify before you buy. Made with ⚡
        </footer>
      </div>
    </div>
  );
}