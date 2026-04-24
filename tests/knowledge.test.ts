import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_KNOWLEDGE_SPACE_ID,
  DEFAULT_KNOWLEDGE_SPACES,
  createKnowledgeItem,
  exportKnowledgeAsMarkdown,
  getKnowledgeTags,
  loadKnowledgeItems,
  saveKnowledgeItems,
  searchKnowledgeItems,
  type KnowledgeItem
} from "../src/lib/knowledge";

describe("knowledge persistence", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-24T00:00:00.000Z"));
    const storage = new Map<string, string>();

    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        clear: () => storage.clear(),
        getItem: (key: string) => storage.get(key) ?? null,
        key: (index: number) => Array.from(storage.keys())[index] ?? null,
        removeItem: (key: string) => storage.delete(key),
        setItem: (key: string, value: string) => storage.set(key, value),
        get length() {
          return storage.size;
        }
      }
    });

    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("loads and saves knowledge items in localStorage", () => {
    const items: KnowledgeItem[] = [
      {
        id: "1",
        title: "Kimi long document flow",
        content: "Use Kimi for Chinese long-document summaries.",
        spaceId: "space-platforms",
        platformId: "kimi",
        tags: ["long-doc", "cn"],
        createdAt: "2026-04-24T00:00:00.000Z",
        updatedAt: "2026-04-24T00:00:00.000Z"
      }
    ];

    saveKnowledgeItems(items);

    expect(loadKnowledgeItems()).toEqual(items);
  });

  it("returns an empty list when no knowledge exists", () => {
    expect(loadKnowledgeItems()).toEqual([]);
  });

  it("creates a knowledge record with normalized metadata", () => {
    const item = createKnowledgeItem({
      title: "  DeepSeek code review  ",
      content: "  Use for code and math checks.  ",
      spaceId: "space-platforms",
      platformId: "deepseek",
      tags: ["code", " code ", "math"]
    });

    expect(item.title).toBe("DeepSeek code review");
    expect(item.content).toBe("Use for code and math checks.");
    expect(item.spaceId).toBe("space-platforms");
    expect(item.platformId).toBe("deepseek");
    expect(item.tags).toEqual(["code", "math"]);
    expect(item.id).toMatch(/^knowledge-/);
    expect(item.createdAt).toBe("2026-04-24T00:00:00.000Z");
    expect(item.updatedAt).toBe(item.createdAt);
  });

  it("migrates old prompt favorites into knowledge items once", () => {
    window.localStorage.setItem(
      "ai-desk:favorites",
      JSON.stringify([
        {
          id: "old-1",
          title: "Old prompt",
          content: "Legacy prompt content",
          tags: ["review"],
          createdAt: "2026-04-23T00:00:00.000Z"
        }
      ])
    );

    expect(loadKnowledgeItems()).toEqual([
      {
        id: "knowledge-migrated-old-1",
        title: "Old prompt",
        content: "Legacy prompt content",
        spaceId: "space-workflows",
        platformId: null,
        tags: ["review", "旧 Prompt"],
        createdAt: "2026-04-23T00:00:00.000Z",
        updatedAt: "2026-04-23T00:00:00.000Z"
      }
    ]);

    window.localStorage.setItem("ai-desk:favorites", JSON.stringify([]));

    expect(loadKnowledgeItems()).toHaveLength(1);
  });

  it("filters knowledge by query, platform, and tag", () => {
    const items: KnowledgeItem[] = [
      {
        id: "1",
        title: "Code review",
        content: "Find risk in this diff",
        spaceId: "space-workflows",
        platformId: "chatgpt",
        tags: ["code", "review"],
        createdAt: "2026-04-24T00:00:00.000Z",
        updatedAt: "2026-04-24T00:00:00.000Z"
      },
      {
        id: "2",
        title: "Long document",
        content: "Summarize Chinese reports",
        spaceId: "space-platforms",
        platformId: "kimi",
        tags: ["long-doc"],
        createdAt: "2026-04-24T00:00:00.000Z",
        updatedAt: "2026-04-24T00:00:00.000Z"
      }
    ];

    expect(searchKnowledgeItems(items, { query: "code" }).map((item) => item.id)).toEqual([
      "1"
    ]);
    expect(
      searchKnowledgeItems(items, { spaceId: "space-platforms" }).map(
        (item) => item.id
      )
    ).toEqual(["2"]);
    expect(
      searchKnowledgeItems(items, { platformId: "kimi" }).map((item) => item.id)
    ).toEqual(["2"]);
    expect(searchKnowledgeItems(items, { tag: "review" }).map((item) => item.id)).toEqual([
      "1"
    ]);
    expect(getKnowledgeTags(items)).toEqual(["code", "long-doc", "review"]);
  });

  it("defaults blank space and exports markdown", () => {
    const item = createKnowledgeItem({
      title: "Untyped note",
      content: "Remember this",
      platformId: null
    });

    expect(item.spaceId).toBe(DEFAULT_KNOWLEDGE_SPACE_ID);

    const markdown = exportKnowledgeAsMarkdown([item], {
      spaces: DEFAULT_KNOWLEDGE_SPACES
    });

    expect(markdown).toContain("# AI Desk Knowledge Export");
    expect(markdown).toContain("## Untyped note");
    expect(markdown).toContain("- Space: 收件箱");
    expect(markdown).toContain("Remember this");
  });
});
