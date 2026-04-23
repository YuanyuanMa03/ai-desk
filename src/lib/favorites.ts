const STORAGE_KEY = "ai-desk:favorites";

export type PromptFavorite = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export function buildFavoriteTitle(content: string): string {
  const normalized = content.trim().replace(/\s+/g, " ");

  if (!normalized) {
    return "Untitled Prompt";
  }

  if (normalized.length <= 23) {
    return normalized;
  }

  return `${normalized.slice(0, 23).trimEnd()}...`;
}

export function createFavorite(content: string): PromptFavorite {
  const normalized = content.trim().replace(/\s+/g, " ");
  const now = new Date().toISOString();

  return {
    id: `favorite-${Date.now()}`,
    title: buildFavoriteTitle(normalized),
    content: normalized,
    createdAt: now
  };
}

export function loadFavorites(): PromptFavorite[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as PromptFavorite[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFavorites(favorites: PromptFavorite[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}
