# AI Desk Vision Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor AI Desk from a dashboard-like layout into an Apple-inspired visionOS/iPadOS workspace with a bottom floating prompt dock.

**Architecture:** Preserve the existing React state and tested helper modules. Reorganize `App.tsx` into a floating platform rail, central webview canvas, translucent favorites utility panel, and fixed bottom composer dock, then replace the CSS visual system with a light frosted spatial interface.

**Tech Stack:** Electron, React, TypeScript, Vite, Vitest, lucide-react

---

### Task 1: Add Icon Dependency

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] Install `lucide-react` for toolbar and command icons.
- [ ] Run `npm test` to confirm dependency changes do not affect tests.
- [ ] Commit dependency update.

### Task 2: Refactor Renderer Layout

**Files:**
- Modify: `src/App.tsx`

- [ ] Move the prompt composer out of the top workspace area into a bottom dock.
- [ ] Keep platform switching, clipboard copy, compare mode, and favorites handlers unchanged in behavior.
- [ ] Convert text-heavy buttons into icon-led controls with accessible labels and titles.
- [ ] Keep right favorites panel always visible as a utility surface.

### Task 3: Replace Visual System

**Files:**
- Modify: `src/App.css`

- [ ] Replace the beige dashboard palette with cool silver, frosted white, mist blue, and graphite.
- [ ] Style the app shell as a spatial layout with a floating source rail, central canvas, right utility tray, and bottom dock.
- [ ] Ensure compare mode renders as two adjacent floating canvases.
- [ ] Add responsive rules for medium and narrow widths.

### Task 4: Verify And Commit

**Files:**
- Verify: `src/App.tsx`
- Verify: `src/App.css`
- Verify: `package.json`

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Check `git status --short`.
- [ ] Commit the redesign implementation.
