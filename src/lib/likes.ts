// Global like counter via Abacus (abacus.jasoncameron.dev) — free, no signup.
// Local "already liked" flag lives in localStorage as a soft guard.

const NAMESPACE = "shayri-lovable";
const BASE = "https://abacus.jasoncameron.dev";

function likedKey(slug: string) {
  return `liked:${slug}`;
}

export function hasLiked(slug: string): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(likedKey(slug)) === "1";
}

export async function getCount(slug: string): Promise<number> {
  try {
    const res = await fetch(`${BASE}/get/${NAMESPACE}/${slug}`);
    if (!res.ok) {
      // First-time key: create it silently.
      const created = await fetch(`${BASE}/create/${NAMESPACE}/${slug}?initializer=0`);
      if (!created.ok) return 0;
      const data = await created.json();
      return Number(data?.value ?? 0);
    }
    const data = await res.json();
    return Number(data?.value ?? 0);
  } catch {
    return 0;
  }
}

export async function incrementLike(slug: string): Promise<number> {
  const res = await fetch(`${BASE}/hit/${NAMESPACE}/${slug}`);
  const data = await res.json();
  if (typeof window !== "undefined") {
    window.localStorage.setItem(likedKey(slug), "1");
  }
  return Number(data?.value ?? 0);
}
