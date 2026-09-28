// Curated short, brandable English words grouped by vibe/category.

export const CATEGORIES: Record<string, string[]> = {
  Tech: [
    "byte", "code", "data", "logic", "cloud", "pixel", "cyber", "nano", "quantum",
    "spark", "grid", "node", "link", "sync", "flux", "core", "chip", "bot", "app",
    "net", "web", "cache", "loop", "stack", "beam", "wave", "signal", "circuit",
    "bit", "dev", "hack", "port", "proxy", "vector", "matrix", "cipher",
  ],
  Nature: [
    "leaf", "root", "bloom", "moss", "fern", "oak", "pine", "river", "stone",
    "cloud", "storm", "rain", "snow", "sun", "moon", "star", "sky", "tide",
    "coral", "reef", "wild", "fox", "wolf", "hawk", "dawn", "dusk", "meadow",
    "bark", "seed", "vine", "petal", "ember", "frost", "grove", "brook",
  ],
  Bold: [
    "bold", "titan", "apex", "prime", "peak", "edge", "rush", "blaze", "surge",
    "force", "power", "iron", "steel", "bolt", "flash", "spark", "nova", "max",
    "ultra", "mega", "hyper", "turbo", "rocket", "thunder", "storm", "vault",
    "forge", "grit", "rally", "drive", "boost", "kick", "punch",
  ],
  Playful: [
    "bubble", "wiggle", "jelly", "pop", "zap", "zoom", "boop", "fizz", "giggle",
    "doodle", "noodle", "pixel", "candy", "fluff", "puff", "snug", "wobble",
    "tickle", "jolly", "merry", "happy", "sunny", "cozy", "quirk", "whim",
    "dazzle", "sprinkle", "twirl", "hop", "skip",
  ],
  Luxury: [
    "gold", "opal", "pearl", "velvet", "silk", "royal", "regal", "noble", "crown",
    "gem", "aura", "lush", "prime", "grand", "crest", "ivory", "amber", "onyx",
    "jade", "luxe", "elite", "vogue", "bloom", "glow", "shine", "grace", "muse",
    "haven", "estate", "manor",
  ],
  Food: [
    "brew", "roast", "bean", "sip", "bite", "crisp", "spice", "honey", "maple",
    "cocoa", "mint", "berry", "citrus", "fresh", "harvest", "grill", "toast",
    "dough", "crust", "melt", "zest", "savor", "feast", "snack", "nibble",
    "sizzle", "batch", "craft", "sweet", "tangy",
  ],
  Wellness: [
    "calm", "zen", "pure", "vital", "glow", "bliss", "flow", "balance", "breath",
    "soul", "mind", "heal", "care", "rest", "renew", "revive", "thrive", "fit",
    "life", "well", "nourish", "restore", "serene", "still", "peace", "gentle",
    "bloom", "root", "earth", "sage",
  ],
};

export const CATEGORY_NAMES = Object.keys(CATEGORIES);

export function allWords(): string[] {
  return Array.from(new Set(Object.values(CATEGORIES).flat()));
}