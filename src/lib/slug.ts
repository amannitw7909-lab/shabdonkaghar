// Very small slugifier that handles Devanagari by transliterating to a fallback,
// and produces URL-safe ASCII slugs.
const DEVA_MAP: Record<string, string> = {
  अ: "a", आ: "aa", इ: "i", ई: "ee", उ: "u", ऊ: "oo",
  ए: "e", ऐ: "ai", ओ: "o", औ: "au", अं: "an", अः: "ah",
  क: "k", ख: "kh", ग: "g", घ: "gh", ङ: "ng",
  च: "ch", छ: "chh", ज: "j", झ: "jh", ञ: "ny",
  ट: "t", ठ: "th", ड: "d", ढ: "dh", ण: "n",
  त: "t", थ: "th", द: "d", ध: "dh", न: "n",
  प: "p", फ: "ph", ब: "b", भ: "bh", म: "m",
  य: "y", र: "r", ल: "l", व: "v",
  श: "sh", ष: "sh", स: "s", ह: "h",
  "ा": "a", "ि": "i", "ी": "ee", "ु": "u", "ू": "oo",
  "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ं": "n", "ः": "h",
  "्": "", "ँ": "n", "़": "",
};

export function slugify(input: string): string {
  const transliterated = Array.from(input)
    .map((c) => DEVA_MAP[c] ?? c)
    .join("");
  return transliterated
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
