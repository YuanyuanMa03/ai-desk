# AI Desk Vision Workspace UI Redesign

## Goal

Redesign the current AI Desk MVP into a more refined Apple-inspired desktop experience with a visual direction closer to visionOS and iPadOS. The interface should feel like an AI-native desktop tool rather than an admin panel, while preserving the existing MVP behaviors and compliance boundaries.

## Product Direction

### Visual Theme

- Apple-adjacent aesthetic with soft translucency, layered surfaces, restrained color, and generous spacing.
- Closer to visionOS / iPadOS than a traditional macOS productivity dashboard.
- Light-first palette with silver, mist blue, frosted white, and subtle graphite accents.
- Calm visual hierarchy: the chat canvas remains dominant, navigation and utilities feel secondary.

### Interaction Theme

- Prompt entry should move from the top toolbar to a bottom floating dock.
- The prompt dock should resemble an AI chat composer rather than a form or command palette.
- Favorites remain always visible on the right, but as a lighter translucent utility panel.
- Platform switching remains explicit and visible, but the left rail should feel like a floating source switcher rather than a heavy sidebar.

## Non-Goals

- No changes to session storage boundaries.
- No DOM automation or auto-send behavior.
- No new persistence layer beyond localStorage.
- No new product features beyond layout and presentation refinements tied to the current MVP.

## Functional Behavior To Preserve

- Platform list and switching behavior remain unchanged.
- “Copy and open platform” still writes to clipboard and switches the main platform.
- Compare mode still shows a second platform pane side by side.
- Favorites still support save, reuse, and delete.
- Prompt data still lives locally in renderer state and favorites in localStorage.

## Design Concept

### 1. Vision Workspace Shell

Replace the current “three-column admin workspace” feeling with a spatial layout:

- Left: floating platform selector rail
- Center: dominant workspace canvas
- Right: translucent favorites utility panel
- Bottom center: floating prompt dock

The main visual emphasis should stay on the central webview canvas. Supporting controls should appear to orbit around it rather than compete with it.

### 2. Bottom Minimal Dock Composer

The prompt input becomes a persistent floating dock near the bottom center of the viewport.

#### Structure

- Compact glass dock shell
- Main multi-line prompt input in the center
- Left side: compare toggle and current workspace mode controls
- Right side: save favorite action and quick platform actions

#### Behavior

- Dock is always visible, not hidden behind an expansion interaction
- Visual mass stays compact enough that the webview remains the primary content
- Input supports multi-line text but should feel like a conversational composer, not a settings textarea

#### Rationale

This change makes the interface read as an AI conversation tool first, instead of a dashboard with a form attached.

### 3. Floating Platform Rail

The current left sidebar becomes lighter and more sculpted:

- narrower visual footprint
- translucent container
- platform items styled more like compact source chips/cards
- stronger active state, weaker idle state

The rail should remain legible and clickable, but it should not dominate the workspace.

### 4. Main Webview Canvas

The central webview region becomes the visual anchor:

- larger, calmer canvas
- more pronounced corner radius
- subtle glass border and soft depth shadow
- cleaner title strip with fewer heavy dividers

#### Single-pane mode

- one large canvas with room to breathe

#### Compare mode

- two parallel floating canvases
- no hard split line
- spacing should feel like two adjacent boards in a shared workspace

### 5. Favorites Utility Panel

The favorites panel remains always visible on the right, but changes from a solid sidebar to a light translucent utility surface.

#### Characteristics

- visually secondary to the central workspace
- lighter background opacity
- tighter card rhythm
- calmer controls and typography

#### Internal layout

- header
- title input
- save button
- scrollable favorite list

The panel should feel like a utility tray, not a second application column.

## Layout Specification

### Desktop

- Three-zone spatial shell:
  - left floating rail
  - center workspace
  - right utility panel
- Bottom dock overlaps the lower area of the center workspace without obstructing the entire content

### Medium widths

- Right favorites panel may collapse below the workspace if width gets constrained
- Bottom dock remains centered and persistent

### Narrow widths

- Compare mode stacks vertically
- Favorites panel moves below main content
- Bottom dock remains fixed and usable

## Visual System

### Color

- Base background: cool off-white / silver mist
- Accent washes: very subtle blue and pearl tones
- Text: graphite and deep slate
- Buttons: translucent material first, strong fills only for active or primary emphasis

Avoid:

- heavy beige dashboard tones
- loud gradients
- saturated platform-colored blocks
- overly dark glass that pushes the app toward “cyber” aesthetics

### Surfaces

- frosted glass panels
- fine borders with low-contrast highlights
- layered shadowing with minimal blur bloom
- soft corner radii throughout

### Typography

- more restrained scale
- compact headings
- quiet labels
- reduce “section heading” weight where it feels dashboard-like

### Motion

- subtle hover and active transitions
- no exaggerated motion or ornamental animation

## Component Changes

### App Shell

- Keep the existing React state topology
- Reorganize visual hierarchy and DOM grouping to support the new bottom dock layout

### Prompt Composer

- Move prompt input section to a new bottom dock region
- Group action buttons more intentionally
- Replace current broad toolbar feeling with conversational composer feel

### Platform Buttons

- Make them compact, elegant, and material-driven
- Active state should be clear but not loud

### Utility Buttons

- Unify button system around glass / material styling
- Keep destructive delete action distinct but visually controlled

## Engineering Scope

### Files Expected To Change

- `src/App.tsx`
- `src/App.css`

### Optional Small Supporting Changes

- `src/config/platforms.ts` only if label metadata is needed for richer UI presentation

No architecture rewrite is required. This is a layout and styling redesign on top of the existing MVP behaviors.

## Testing And Verification

### Functional verification

- prompt still copies to clipboard
- target platform still becomes active after copy action
- compare mode still toggles correctly
- favorites still save, load, use, and delete

### UI verification

- dock remains visible and usable at desktop sizes
- webview area remains dominant
- right utility panel remains readable but visually lighter than the center
- compare mode still looks balanced
- responsive layout does not break on narrower widths

## Implementation Recommendation

Make this redesign as an in-place refactor of `App.tsx` and `App.css`, preserving the current state logic and tested helper modules. The design goal is not more features; it is a cleaner spatial hierarchy and a more premium AI-native desktop feel.
