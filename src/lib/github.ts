// Minimal GitHub Contents API client used by the admin editor.
// The Personal Access Token lives ONLY in the visitor's browser localStorage.

const TOKEN_KEY = "gh:pat";
const REPO_KEY = "gh:repo"; // format: owner/name
const BRANCH_KEY = "gh:branch"; // default: main

export type GhConfig = { token: string; repo: string; branch: string };

export function getConfig(): GhConfig | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(TOKEN_KEY);
  const repo = localStorage.getItem(REPO_KEY);
  const branch = localStorage.getItem(BRANCH_KEY) || "main";
  if (!token || !repo) return null;
  return { token, repo, branch };
}

export function saveConfig(cfg: GhConfig) {
  localStorage.setItem(TOKEN_KEY, cfg.token);
  localStorage.setItem(REPO_KEY, cfg.repo);
  localStorage.setItem(BRANCH_KEY, cfg.branch || "main");
}

export function clearConfig() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REPO_KEY);
  localStorage.removeItem(BRANCH_KEY);
}

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

async function api(cfg: GhConfig, path: string, init?: RequestInit) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${cfg.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getFileSha(cfg: GhConfig, filePath: string): Promise<string | null> {
  try {
    const data = await api(
      cfg,
      `/repos/${cfg.repo}/contents/${filePath}?ref=${encodeURIComponent(cfg.branch)}`,
    );
    return data?.sha ?? null;
  } catch {
    return null;
  }
}

export async function putFile(
  cfg: GhConfig,
  filePath: string,
  content: string,
  message: string,
): Promise<void> {
  const sha = await getFileSha(cfg, filePath);
  await api(cfg, `/repos/${cfg.repo}/contents/${filePath}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: utf8ToBase64(content),
      branch: cfg.branch,
      ...(sha ? { sha } : {}),
    }),
  });
}

export async function deleteFile(
  cfg: GhConfig,
  filePath: string,
  message: string,
): Promise<void> {
  const sha = await getFileSha(cfg, filePath);
  if (!sha) return;
  await api(cfg, `/repos/${cfg.repo}/contents/${filePath}`, {
    method: "DELETE",
    body: JSON.stringify({ message, sha, branch: cfg.branch }),
  });
}

export async function verifyRepo(cfg: GhConfig): Promise<{ ok: boolean; error?: string }> {
  try {
    await api(cfg, `/repos/${cfg.repo}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
