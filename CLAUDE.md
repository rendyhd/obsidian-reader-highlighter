# CLAUDE.md

## Project Overview

**Reader Highlighter** is an Obsidian plugin that provides instant text highlighting in reading mode. Select text to highlight it using `==text==` markdown syntax. Select highlighted text again to remove the highlight. No buttons, no menus, no popups.

## Development Commands

- `npm install` - Install dependencies
- `npm run build` - Production build
- `npm run dev` - Development watch mode

## Architecture

Single source file (`main.ts`, ~300 lines):

1. **Event handling**: `mouseup` (desktop) + `touchend` with 400ms delay (mobile), registered via `registerDomEvent()`
2. **Triple guard**: target inside `.markdown-preview-view`, active view in `preview` mode, non-empty selection
3. **Context extraction**: `getSelectionContext()` captures prefix/suffix text from DOM block ancestor
4. **Source matching**: `stripMarkdown()` builds char map, `locateInSource()` finds exact position using context + block ordinal
5. **File modification**: `vault.process()` for atomic read-modify-write
6. **Toggle**: detects existing `==` markers and removes them

## Key Files

- `main.ts` - Entire plugin source
- `main.js` - Built output (committed for BRAT)
- `manifest.json` - Plugin metadata (id: `reader-highlighter`)
- `esbuild.config.mjs` - Build config
- `styles.css` - Flash animation for visual feedback

## Plugin ID

`reader-highlighter` (v1.0.0)
