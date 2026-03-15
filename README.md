# Reader Highlighter

**Turn your reading into active learning.** Select any text in Obsidian's reading mode and it's instantly highlighted — no buttons, no popups, no extra clicks. Your highlights are stored as native `==markdown==` syntax, so they work everywhere Obsidian does.

Built for readers, researchers, and anyone who wants to mark up notes without leaving reading mode.

---

## Why Reader Highlighter?

Obsidian's reading mode is great for focused reading, but there's no built-in way to highlight text without switching to edit mode. Reader Highlighter bridges that gap:

- **Stay in reading mode** — highlight without breaking your flow
- **Nothing to learn** — if you can select text, you can highlight
- **Your notes stay clean** — highlights use standard `==text==` syntax, not custom metadata
- **Works on mobile** — long-press to select, highlight happens automatically

## Features

**Select to highlight**
Drag to select text in reading mode. That's it — the text is highlighted immediately.

**Tap to remove**
Click or tap any existing highlight to see a small "Remove highlight" button. One tap and it's gone.

**Multi-paragraph support**
Select across paragraph boundaries. Each paragraph gets its own highlight, and removing one removes all connected highlights from that selection.

**Toggle with re-selection**
Select already-highlighted text to remove the highlight. No need for the popup if you prefer selecting.

**Markdown native**
All highlights are stored as `==highlighted text==` in your markdown files. They're visible in source mode, portable to other editors, and rendered by any tool that supports the highlight syntax.

**Desktop and mobile**
Works with mouse selection on desktop and long-press selection on mobile. Touch targets are optimized for finger tapping.

## Usage

### Highlighting text
1. Open any note in **Reading mode** (the book icon in the top-right, or `Cmd/Ctrl+E` to toggle)
2. Select text by clicking and dragging (desktop) or long-pressing and adjusting handles (mobile)
3. Release — the text is highlighted instantly

### Removing a highlight
**Option A — Tap the highlight:**
1. Click or tap on any highlighted text
2. A small "Remove highlight" button appears above
3. Click it to remove

**Option B — Re-select:**
1. Select the exact highlighted text again
2. The highlight is toggled off

### Settings
Go to **Settings > Community plugins > Reader Highlighter**:
- **Enable highlighting** — master on/off toggle

## Installation

### BRAT (recommended for now)

Reader Highlighter is not yet listed in the Obsidian Community Plugin directory — that requires a review and approval process. In the meantime, [BRAT](https://github.com/TfTHacker/obsidian42-brat) (Beta Reviewers Auto-update Tester) lets you install plugins directly from GitHub and receive automatic updates.

1. Install [BRAT](https://obsidian.md/plugins?id=obsidian42-brat) from the Community Plugin directory
2. In BRAT settings, click **"Add Beta plugin"**
3. Paste this repo URL: `rendyhd/obsidian-reader-highlighter`
4. Click **Add Plugin**, then enable **Reader Highlighter** in Community plugins

Once the plugin is accepted into the Obsidian Community directory, you'll be able to install it directly from **Settings > Community plugins > Browse** without BRAT.

### Manual installation
1. Go to the [Releases](https://github.com/rendyhd/obsidian-reader-highlighter/releases) page
2. Download `main.js`, `manifest.json`, and `styles.css` from the latest release
3. Create a folder called `reader-highlighter` inside your vault's `.obsidian/plugins/` directory
4. Move the downloaded files into that folder
5. Restart Obsidian and enable **Reader Highlighter** in **Settings > Community plugins**

## Releases

This project uses GitHub Releases. When a new version is tagged, a GitHub Action automatically builds the plugin and publishes the release with the required files (`main.js`, `manifest.json`, `styles.css`). BRAT picks up new releases automatically.

## Compatibility

- Obsidian **v1.0.0+** (desktop and mobile)
- Works in **Reading mode** only (does not interfere with Live Preview or Source mode)
- Highlights are stored as standard `==text==` markdown — no proprietary format

## License

[MIT](LICENSE)
