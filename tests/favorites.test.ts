import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import {
  buildFavoriteTitle,
  createFavorite,
  loadFavorites,
  saveFavorites,
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
        createdAt: "2026-04-24T00:00:00.000Z"
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
    const favorite = createFavorite("  Compare model behavior  ");

    expect(favorite.title).toBe("Compare model behavior");
    expect(favorite.content).toBe("Compare model behavior");
    expect(favorite.id).toMatch(/^favorite-/);
    expect(favorite.createdAt).toMatch(/^2026-/);
  });
});
