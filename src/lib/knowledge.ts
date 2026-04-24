const KNOWLEDGE_KEY = "ai-desk:knowledge-items";
const KNOWLEDGE_MIGRATION_KEY = "ai-desk:knowledge-migrated-from-prompts";
const LEGACY_FAVORITES_KEY = "ai-desk:favorites";

export type KnowledgeItem = {
  id: string;
  title: string;
  content: string;
  spaceId: string;
  platformId: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeSpace = {
  id: string;
  name: string;
  description: string;
};

export type KnowledgeDraft = {
  title: string;
  content: string;
  spaceId?: string;
  platformId?: string | null;
  tags?: string[];
};

export type KnowledgeSearchFilters = {
  query?: string;
  spaceId?: string | null;
  platformId?: string | null;
  tag?: string | null;
};

type LegacyFavorite = {
  id?: string;
  title?: string;
  content?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export const DEFAULT_KNOWLEDGE_SPACE_ID = "space-inbox";
export const LEGACY_PROMPT_SPACE_ID = "space-workflows";

export const DEFAULT_KNOWLEDGE_SPACES: KnowledgeSpace[] = [
  {
    id: "space-inbox",
    name: "收件箱",
    description: "临时想法、待整理资料和随手记录。"
  },
  {
    id: "space-platforms",
    name: "平台经验",
    description: "不同 AI 平台的能力、限制和最佳使用场景。"
  },
  {
    id: "space-workflows",
    name: "工作流",
    description: "可复用 Prompt 流程、对比流程和检查清单。"
  },
  {
    id: "space-projects",
    name: "项目",
    description: "围绕具体项目沉淀的结论、决策和上下文。"
  },
  {
    id: "space-resources",
    name: "资源",
    description: "链接、资料来源、工具清单和外部参考。"
  }
];

export function createKnowledgeItem(draft: KnowledgeDraft): KnowledgeItem {
  const now = new Date().toISOString();
  const content = normalizeText(draft.content);
  const title = normalizeText(draft.title) || buildKnowledgeTitle(content);

  return {
    id: `knowledge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    content,
    spaceId: draft.spaceId || DEFAULT_KNOWLEDGE_SPACE_ID,
    platformId: draft.platformId || null,
    tags: normalizeTags(draft.tags ?? []),
    createdAt: now,
    updatedAt: now
  };
}

export function loadKnowledgeItems(): KnowledgeItem[] {
  const storedItems = readKnowledgeItems();

  if (window.localStorage.getItem(KNOWLEDGE_MIGRATION_KEY)) {
    return storedItems;
  }

  window.localStorage.setItem(KNOWLEDGE_MIGRATION_KEY, "1");

  if (storedItems.length > 0) {
    return storedItems;
  }

  const migratedItems = migrateLegacyPromptFavorites();

  if (migratedItems.length > 0) {
    saveKnowledgeItems(migratedItems);
  }

  return migratedItems;
}

export function saveKnowledgeItems(items: KnowledgeItem[]): void {
  window.localStorage.setItem(KNOWLEDGE_KEY, JSON.stringify(items));
}

export function searchKnowledgeItems(
  items: KnowledgeItem[],
  filters: KnowledgeSearchFilters
): KnowledgeItem[] {
  const query = normalizeText(filters.query ?? "").toLowerCase();

  return items.filter((item) => {
    const matchesQuery =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query) ||
      item.tags.some((tag) => tag.toLowerCase().includes(query));
    const matchesSpace =
      filters.spaceId === undefined || item.spaceId === filters.spaceId;
    const matchesPlatform =
      filters.platformId === undefined || item.platformId === filters.platformId;
    const matchesTag = !filters.tag || item.tags.includes(filters.tag);

    return matchesQuery && matchesSpace && matchesPlatform && matchesTag;
  });
}

export function getKnowledgeTags(items: KnowledgeItem[]): string[] {
  return Array.from(new Set(items.flatMap((item) => item.tags))).sort((a, b) =>
    a.localeCompare(b)
  );
}

export function exportKnowledgeAsMarkdown(
  items: KnowledgeItem[],
  options: {
    platformNames?: Record<string, string>;
    spaces?: KnowledgeSpace[];
  } = {}
): string {
  const platformNames = options.platformNames ?? {};
  const spaceById = new Map(
    (options.spaces ?? DEFAULT_KNOWLEDGE_SPACES).map((space) => [space.id, space])
  );
  const exportedAt = new Date().toISOString();

  const body = items
    .map((item) => {
      const spaceName = spaceById.get(item.spaceId)?.name ?? "未分区";
      const platformName = item.platformId
        ? platformNames[item.platformId] ?? item.platformId
        : "未绑定平台";
      const tags = item.tags.length > 0 ? item.tags.join(", ") : "无";

      return [
        `## ${escapeMarkdownHeading(item.title)}`,
        "",
        `- Space: ${spaceName}`,
        `- Platform: ${platformName}`,
        `- Tags: ${tags}`,
        `- Updated: ${item.updatedAt}`,
        "",
        item.content || "_No content_"
      ].join("\n");
    })
    .join("\n\n---\n\n");

  return [
    "# AI Desk Knowledge Export",
    "",
    `Exported at: ${exportedAt}`,
    `Items: ${items.length}`,
    "",
    "---",
    "",
    body || "_No knowledge items yet._",
    ""
  ].join("\n");
}

function readKnowledgeItems(): KnowledgeItem[] {
  const raw = window.localStorage.getItem(KNOWLEDGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as Partial<KnowledgeItem>[];
    return Array.isArray(parsed)
      ? parsed
          .map((item) => normalizeKnowledgeItem(item))
          .filter((item): item is KnowledgeItem => Boolean(item))
      : [];
  } catch {
    return [];
  }
}

function migrateLegacyPromptFavorites(): KnowledgeItem[] {
  const raw = window.localStorage.getItem(LEGACY_FAVORITES_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as LegacyFavorite[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((favorite) => favorite.content)
      .map((favorite) => {
        const content = normalizeText(favorite.content ?? "");
        const createdAt = favorite.createdAt ?? new Date().toISOString();

        return {
          id: `knowledge-migrated-${favorite.id ?? Date.now()}`,
          title: normalizeText(favorite.title ?? "") || buildKnowledgeTitle(content),
          content,
          spaceId: LEGACY_PROMPT_SPACE_ID,
          platformId: null,
          tags: normalizeTags([...(favorite.tags ?? []), "旧 Prompt"]),
          createdAt,
          updatedAt: favorite.updatedAt ?? createdAt
        };
      });
  } catch {
    return [];
  }
}

function normalizeKnowledgeItem(
  item: Partial<KnowledgeItem>
): KnowledgeItem | null {
  if (!item.id || (!item.content && !item.title)) {
    return null;
  }

  const createdAt = item.createdAt ?? new Date().toISOString();
  const content = normalizeText(item.content ?? "");

  return {
    id: item.id,
    title: normalizeText(item.title ?? "") || buildKnowledgeTitle(content),
    content,
    spaceId: item.spaceId || DEFAULT_KNOWLEDGE_SPACE_ID,
    platformId: item.platformId || null,
    tags: normalizeTags(item.tags ?? []),
    createdAt,
    updatedAt: item.updatedAt ?? createdAt
  };
}

function buildKnowledgeTitle(content: string): string {
  const normalized = normalizeText(content);

  if (!normalized) {
    return "Untitled note";
  }

  return normalized.length > 24 ? `${normalized.slice(0, 24).trimEnd()}...` : normalized;
}

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeTags(tags: string[]): string[] {
  return Array.from(
    new Set(
      tags
        .map((tag) => normalizeText(tag))
        .filter(Boolean)
    )
  );
}

function escapeMarkdownHeading(value: string): string {
  return value.replace(/^#+\s*/, "").replace(/\n/g, " ").trim();
}
