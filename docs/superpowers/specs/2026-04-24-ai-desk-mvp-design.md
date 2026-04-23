# AI Desk MVP Design

## Goal

Build a local-first desktop AI aggregation workbench named AI Desk with Electron + React + TypeScript + Vite. The MVP embeds official web chat pages for multiple AI platforms, provides a unified prompt staging area, and stores only local prompt favorites.

## Product Boundaries

- No API reverse engineering.
- No login bypass.
- No cookie collection or upload.
- No account sharing.
- No automatic bulk sending.
- Login state stays inside Electron-local webview sessions only.
- Prompt drafts and favorites stay in renderer localStorage for the MVP.

## MVP Scope

### Platforms

- ChatGPT: `https://chatgpt.com`
- Gemini: `https://gemini.google.com`
- DeepSeek: `https://chat.deepseek.com`
- 豆包: `https://www.doubao.com/chat`
- Kimi: `https://www.kimi.com`
- 通义千问: `https://tongyi.aliyun.com/qianwen`

### UI Regions

- Left platform navigation for built-in providers.
- Top prompt bar with a shared prompt textarea and action buttons.
- Center content area with one or two Electron `webview` panes.
- Right favorites sidebar with CRUD actions.

### Core Interaction

The prompt bar provides “copy and open platform” actions. Clicking an action copies the prompt text to the system clipboard, then switches the active platform in the main pane. The user manually pastes and sends in the official page.

### Compare Mode

- Left pane always shows the current primary platform.
- Right pane is optional and chosen from a selector.
- Both panes render side by side when compare mode is enabled.
- Top-bar platform actions target the chosen platform directly and do not distinguish left vs. right focus.

## Architecture

### Electron Shell

- `electron/main.cjs` creates the BrowserWindow.
- `electron/preload.cjs` exposes a minimal API for clipboard writes and app metadata.
- BrowserWindow enables `webviewTag` and keeps `contextIsolation` on.

### Renderer

- React handles all layout, UI state, and localStorage persistence.
- Platform metadata lives in `src/config/platforms.ts`.
- Lightweight local utilities handle favorites persistence and pane selection rules.
- Each platform uses a stable `webview` `partition` such as `persist:ai-desk-chatgpt`.

### Persistence

- Favorites: renderer `localStorage`.
- Login sessions: Electron persistent partitions attached to webviews.

## Why Copy Instead Of Auto Send

The MVP deliberately stops at copy-to-clipboard plus navigation because automated DOM injection and auto-send behavior is brittle, platform-specific, and risks crossing the product boundaries around login/session behavior and automation. Manual paste keeps the flow explicit and compliant with the stated constraints.

## File Layout

- `package.json`: scripts and dependencies
- `electron/main.cjs`: Electron main process
- `electron/preload.cjs`: secure bridge
- `src/App.tsx`: main UI shell
- `src/App.css`: layout and visual design
- `src/main.tsx`: React entry
- `src/config/platforms.ts`: provider config
- `src/lib/favorites.ts`: localStorage favorites helpers
- `src/lib/app-state.ts`: pane and platform state helpers
- `src/types/global.d.ts`: preload API and webview typings
- `tests/*.test.ts`: unit tests for core renderer logic
- `README.md`: setup and roadmap

## Success Criteria

- App starts in dev mode with Electron and Vite together.
- Prompt can be typed, copied, and platform-switched from the top bar.
- Single-pane and compare mode both render correctly.
- Favorites can be saved, reused, and deleted locally.
- Tests cover favorites persistence helpers and pane-switch behavior.
