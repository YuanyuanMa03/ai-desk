const STORAGE_KEY = "ai-desk:favorites";
const GROUPS_KEY = "ai-desk:groups";
const TAGS_KEY = "ai-desk:tags";
const DATA_VERSION_KEY = "ai-desk:data-version";
const CURRENT_DATA_VERSION = 2;

export type PromptGroup = {
  id: string;
  name: string;
  color: string;
  order: number;
};

export type PromptTag = {
  id: string;
  name: string;
  color: string;
};

export type PromptFavorite = {
  id: string;
  title: string;
  content: string;
  groupId: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type FavoriteSearchFilters = {
  query?: string;
  groupId?: string | null;
  tagId?: string | null;
};

export const DEFAULT_GROUPS: PromptGroup[] = [
  { id: "group-writing", name: "Writing", color: "#2f80ed", order: 10 },
  { id: "group-code", name: "Code", color: "#27ae60", order: 20 },
  { id: "group-translation", name: "Translation", color: "#9b51e0", order: 30 },
  { id: "group-general", name: "General", color: "#f2994a", order: 40 }
];

const DEFAULT_COLORS = [
  "#2f80ed",
  "#27ae60",
  "#9b51e0",
  "#f2994a",
  "#eb5757",
  "#00a3a3"
];

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

export function createFavorite(
  content: string,
  groupId: string | null = null,
  tags: string[] = []
): PromptFavorite {
  const normalized = content.trim().replace(/\s+/g, " ");
  const now = new Date().toISOString();

  return {
    id: `favorite-${Date.now()}`,
    title: buildFavoriteTitle(normalized),
    content: normalized,
    groupId,
    tags,
    createdAt: now,
    updatedAt: now
  };
}

export function createGroup(name: string, groups: PromptGroup[]): PromptGroup {
  const normalized = name.trim().replace(/\s+/g, " ");
  const maxOrder = groups.reduce((order, group) => Math.max(order, group.order), 0);

  return {
    id: `group-${slugify(normalized)}-${Date.now()}`,
    name: normalized,
    color: DEFAULT_COLORS[groups.length % DEFAULT_COLORS.length],
    order: maxOrder + 10
  };
}

export function createTag(name: string, existingTags: PromptTag[]): PromptTag {
  const normalized = name.trim().replace(/\s+/g, " ");

  return {
    id: `tag-${slugify(normalized)}-${Date.now()}`,
    name: normalized,
    color: DEFAULT_COLORS[existingTags.length % DEFAULT_COLORS.length]
  };
}

export function loadGroups(): PromptGroup[] {
  const raw = window.localStorage.getItem(GROUPS_KEY);

  if (!raw) {
    saveGroups(DEFAULT_GROUPS);
    return DEFAULT_GROUPS;
  }

  try {
    const parsed = JSON.parse(raw) as PromptGroup[];
    return Array.isArray(parsed)
      ? parsed
          .filter((group) => group.id && group.name)
          .sort((a, b) => a.order - b.order)
      : DEFAULT_GROUPS;
  } catch {
    return DEFAULT_GROUPS;
  }
}

export function saveGroups(groups: PromptGroup[]): void {
  window.localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
}

export function loadTags(): PromptTag[] {
  const raw = window.localStorage.getItem(TAGS_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as PromptTag[];
    return Array.isArray(parsed) ? parsed.filter((tag) => tag.id && tag.name) : [];
  } catch {
    return [];
  }
}

export function saveTags(tags: PromptTag[]): void {
  window.localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
}

export function migrateFavoritesData(): void {
  const version = window.localStorage.getItem(DATA_VERSION_KEY);

  if (version === String(CURRENT_DATA_VERSION)) {
    return;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<PromptFavorite>[];
      const migrated = Array.isArray(parsed)
        ? parsed
            .map((favorite) => normalizeFavorite(favorite))
            .filter((favorite): favorite is PromptFavorite => Boolean(favorite))
        : [];

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    } catch {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
  }

  if (!window.localStorage.getItem(GROUPS_KEY)) {
    saveGroups(DEFAULT_GROUPS);
  }

  if (!window.localStorage.getItem(TAGS_KEY)) {
    saveTags([]);
  }

  window.localStorage.setItem(DATA_VERSION_KEY, String(CURRENT_DATA_VERSION));
}

export function loadFavorites(): PromptFavorite[] {
  migrateFavoritesData();
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PromptFavorite>[];
    return Array.isArray(parsed)
      ? parsed
          .map((favorite) => normalizeFavorite(favorite))
          .filter((favorite): favorite is PromptFavorite => Boolean(favorite))
      : [];
  } catch {
    return [];
  }
}

export function saveFavorites(favorites: PromptFavorite[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

export function searchFavorites(
  favorites: PromptFavorite[],
  filters: FavoriteSearchFilters
): PromptFavorite[] {
  const query = filters.query?.trim().toLowerCase() ?? "";

  return favorites.filter((favorite) => {
    const matchesQuery =
      !query ||
      favorite.title.toLowerCase().includes(query) ||
      favorite.content.toLowerCase().includes(query);
    const matchesGroup =
      filters.groupId === undefined || favorite.groupId === filters.groupId;
    const matchesTag =
      !filters.tagId || favorite.tags.includes(filters.tagId);

    return matchesQuery && matchesGroup && matchesTag;
  });
}

export function updateFavorite(
  favorite: PromptFavorite,
  patch: Partial<Pick<PromptFavorite, "title" | "content" | "groupId" | "tags">>
): PromptFavorite {
  return {
    ...favorite,
    ...patch,
    updatedAt: new Date().toISOString()
  };
}

function normalizeFavorite(
  favorite: Partial<PromptFavorite>
): PromptFavorite | null {
  if (!favorite.id || !favorite.content) {
    return null;
  }

  const createdAt = favorite.createdAt ?? new Date().toISOString();

  return {
    id: favorite.id,
    title: favorite.title || buildFavoriteTitle(favorite.content),
    content: favorite.content,
    groupId: favorite.groupId ?? null,
    tags: Array.isArray(favorite.tags) ? favorite.tags : [],
    createdAt,
    updatedAt: favorite.updatedAt ?? createdAt
  };
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
