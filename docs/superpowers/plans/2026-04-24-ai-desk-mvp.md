# AI Desk MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable Electron + React + TypeScript + Vite MVP for AI Desk that embeds official AI chat web pages, supports copy-and-open prompt actions, compare mode, and local prompt favorites.

**Architecture:** Use Electron for the desktop shell and persistent webview sessions, with a React renderer for layout and local state. Keep stateful logic in small utility modules so favorites persistence and pane selection behavior can be tested independently from the UI.

**Tech Stack:** Electron, React, TypeScript, Vite, Vitest

---

### Task 1: Project Scaffold And Docs

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `README.md`
- Create: `docs/superpowers/specs/2026-04-24-ai-desk-mvp-design.md`
- Create: `docs/superpowers/plans/2026-04-24-ai-desk-mvp.md`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

describe("project scaffold", () => {
  it("loads vitest in node mode", () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL because the project dependencies and test files do not exist yet

- [ ] **Step 3: Write minimal implementation**

```json
{
  "name": "ai-desk",
  "private": true,
  "type": "module"
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS after the scaffold and test setup are installed

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: scaffold ai desk project"
```

### Task 2: Favorites Persistence Helpers

**Files:**
- Create: `src/lib/favorites.ts`
- Create: `tests/favorites.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
it("loads and saves favorites in localStorage", () => {
  const favorites = [{ id: "1", title: "A", content: "Prompt", createdAt: "2026-04-24T00:00:00.000Z" }];
  saveFavorites(favorites);
  expect(loadFavorites()).toEqual(favorites);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/favorites.test.ts`
Expected: FAIL with missing `saveFavorites` and `loadFavorites`

- [ ] **Step 3: Write minimal implementation**

```ts
export function loadFavorites(): PromptFavorite[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/favorites.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/favorites.ts tests/favorites.test.ts
git commit -m "feat: add local favorites persistence"
```

### Task 3: Pane Selection Rules

**Files:**
- Create: `src/lib/app-state.ts`
- Create: `tests/app-state.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
it("switches the primary platform when the action targets a platform", () => {
  const state = createNextPaneState({
    primaryPlatformId: "chatgpt",
    compareEnabled: true,
    secondaryPlatformId: "gemini"
  }, "deepseek");

  expect(state.primaryPlatformId).toBe("deepseek");
  expect(state.secondaryPlatformId).toBe("gemini");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/app-state.test.ts`
Expected: FAIL with missing `createNextPaneState`

- [ ] **Step 3: Write minimal implementation**

```ts
export function createNextPaneState(current: PaneState, targetPlatformId: string): PaneState {
  return { ...current, primaryPlatformId: targetPlatformId };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/app-state.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/app-state.ts tests/app-state.test.ts
git commit -m "feat: add pane selection helpers"
```

### Task 4: Electron Shell And React UI

**Files:**
- Create: `electron/main.cjs`
- Create: `electron/preload.cjs`
- Create: `src/App.tsx`
- Create: `src/App.css`
- Create: `src/config/platforms.ts`
- Create: `src/types/global.d.ts`

- [ ] **Step 1: Write the failing test**

```ts
it("creates a default favorite draft title", () => {
  expect(buildFavoriteTitle("Compare GPT and Gemini behavior")).toBe("Compare GPT and Gemini...");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/favorites.test.ts`
Expected: FAIL because the UI helper does not exist yet

- [ ] **Step 3: Write minimal implementation**

```ts
export function buildFavoriteTitle(content: string): string {
  return content.trim().slice(0, 24) || "Untitled Prompt";
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/favorites.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add electron src tests
git commit -m "feat: build ai desk mvp interface"
```

### Task 5: Verify, Build, And Finalize

**Files:**
- Verify: `package.json`
- Verify: `README.md`
- Verify: `src/App.tsx`

- [ ] **Step 1: Run unit tests**

Run: `npm test`
Expected: PASS with all tests green

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: PASS with Vite renderer output and Electron typecheck/build scripts succeeding

- [ ] **Step 3: Smoke-check requirements**

Run: `git diff --stat`
Expected: shows the intended project files only

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "docs: finalize ai desk mvp"
```
