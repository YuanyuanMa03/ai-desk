# AI Desk Prompt Experience Upgrade Design

**Date:** 2026-04-24
**Status:** Approved
**Approach:** Incremental Enhancement (Option A)

## Overview

Upgrade AI Desk's Prompt management and fill-flow experience. Build on existing components rather than rewrite. No new dependencies.

## Module 1: Data Model Upgrade

### New Types

```ts
interface PromptGroup {
  id: string;
  name: string;
  color: string;
  order: number;
}

interface PromptTag {
  id: string;
  name: string;
  color: string;
}

interface Favorite {
  id: string;
  title: string;
  prompt: string;
  groupId: string | null;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}
```

### Storage

- Keys: `ai-desk-groups`, `ai-desk-tags`, `ai-desk-favorites`
- Version key: `ai-desk-data-version` for migration
- Old favorites (no groupId/tags) auto-migrate to "Ungrouped" group

### Presets

- Groups: Writing, Code, Translation, General
- Tags: User-created on demand

## Module 2: Prompt Library UI (FavoritesPanel -> PromptLibrary)

### Search Bar

- Fixed at panel top
- Real-time full-text search (title + prompt body)
- Group filter dropdown on the right
- Highlighted match text in results

### Group Sidebar (within panel)

- Narrow left column showing group list
- "All" option to show all prompts
- Right-click/long-press to rename, delete, change color
- "New Group" button at bottom

### Tag System

- Tag pills on each prompt card
- Click tag to filter by tag
- Tag selector when saving a prompt (preset + custom input)
- Tag filter section in the panel

### Prompt Card

- Shows: title, 2-line preview, tags, group, updated time
- Actions: Use (fill Composer), Edit, Delete, Move to group
- Compact layout, hover to reveal action buttons

## Module 3: Fill Flow Feedback

### Copy Toast

- Green checkmark animation, auto-dismiss after 1.5s
- Text: "Prompt copied to clipboard"
- Appears at Composer bottom

### WebView Paste Hint Bar

- Floats at WebView bottom when clipboard has recently copied content
- Text: "Press Ctrl/Cmd + V to paste Prompt"
- Glassmorphism semi-transparent style
- Auto-fade after 3s or on user interaction
- Triggered by `lastCopiedAt` timestamp check

### Composer Placeholder

- Empty state: "Enter Prompt... (Enter for newline)"
- Filled state: character count at bottom

## Constraints

- No new dependencies
- Continue using localStorage
- Maintain glassmorphism visual style
- Backward-compatible data migration
- All changes in existing files where possible
