import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import {
  buildFavoriteTitle,
  createFavorite,
  createGroup,
  createTag,
  loadFavorites,
  loadGroups,
  loadTags,
  saveFavorites,
  searchFavorites,
  updateFavorite,
  type PromptFavorite
} from "../src/lib/favorites";

describe("favorites persistence", () => {
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

  it("loads and saves favorites in localStorage", () => {
    const favorites: PromptFavorite[] = [
      {
        id: "1",
        title: "A",
        content: "Prompt",
        groupId: "group-code",
        tags: ["tag-review"],
        createdAt: "2026-04-24T00:00:00.000Z",
        updatedAt: "2026-04-24T00:00:00.000Z"
      }
    ];

    saveFavorites(favorites);

    expect(loadFavorites()).toEqual(favorites);
  });

  it("returns an empty list when no favorites exist", () => {
    expect(loadFavorites()).toEqual([]);
  });

  it("creates a default favorite draft title", () => {
    expect(buildFavoriteTitle("Compare GPT and Gemini behavior")).toBe(
      "Compare GPT and Gemini..."
    );
  });

  it("creates a favorite record with generated metadata", () => {
    const favorite = createFavorite("  Compare model behavior  ", "group-code", [
      "tag-review"
    ]);

    expect(favorite.title).toBe("Compare model behavior");
    expect(favorite.content).toBe("Compare model behavior");
    expect(favorite.groupId).toBe("group-code");
    expect(favorite.tags).toEqual(["tag-review"]);
    expect(favorite.id).toMatch(/^favorite-/);
    expect(favorite.createdAt).toMatch(/^2026-/);
    expect(favorite.updatedAt).toBe(favorite.createdAt);
  });

  it("migrates old favorites into the new shape", () => {
    window.localStorage.setItem(
      "ai-desk:favorites",
      JSON.stringify([
        {
          id: "old-1",
          title: "Old",
          content: "Legacy prompt",
          createdAt: "2026-04-23T00:00:00.000Z"
        }
      ])
    );

    expect(loadFavorites()).toEqual([
      {
        id: "old-1",
        title: "Old",
        content: "Legacy prompt",
        groupId: null,
        tags: [],
        createdAt: "2026-04-23T00:00:00.000Z",
        updatedAt: "2026-04-23T00:00:00.000Z"
      }
    ]);
  });

  it("loads preset groups and empty tags by default", () => {
    expect(loadGroups().map((group) => group.name)).toEqual([
      "Writing",
      "Code",
      "Translation",
      "General"
    ]);
    expect(loadTags()).toEqual([]);
  });

  it("creates groups, tags, and updated favorite metadata", () => {
    const group = createGroup("Review Flow", []);
    const tag = createTag("Needs polish", []);
    const favorite = updateFavorite(createFavorite("Prompt"), {
      groupId: group.id,
      tags: [tag.id]
    });

    expect(group.id).toMatch(/^group-review-flow-/);
    expect(tag.id).toMatch(/^tag-needs-polish-/);
    expect(favorite.groupId).toBe(group.id);
    expect(favorite.tags).toEqual([tag.id]);
    expect(favorite.updatedAt).toBe("2026-04-24T00:00:00.000Z");
  });

  it("filters favorites by query, group, and tag", () => {
    const favorites: PromptFavorite[] = [
      {
        id: "1",
        title: "Code review",
        content: "Find risk in this diff",
        groupId: "group-code",
        tags: ["tag-review"],
        createdAt: "2026-04-24T00:00:00.000Z",
        updatedAt: "2026-04-24T00:00:00.000Z"
      },
      {
        id: "2",
        title: "Translate",
        content: "Translate into Chinese",
        groupId: "group-translation",
        tags: ["tag-writing"],
        createdAt: "2026-04-24T00:00:00.000Z",
        updatedAt: "2026-04-24T00:00:00.000Z"
      }
    ];

    expect(searchFavorites(favorites, { query: "code" }).map((f) => f.id)).toEqual([
      "1"
    ]);
    expect(
      searchFavorites(favorites, { groupId: "group-translation" }).map(
        (f) => f.id
      )
    ).toEqual(["2"]);
    expect(searchFavorites(favorites, { tagId: "tag-review" }).map((f) => f.id)).toEqual([
      "1"
    ]);
    expect(searchFavorites(favorites, {}).map((f) => f.id)).toEqual(["1", "2"]);
  });
});
