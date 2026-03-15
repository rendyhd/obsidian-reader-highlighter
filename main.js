var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ReaderHighlighterPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  enabled: true
};
var BLOCK_TAGS = /* @__PURE__ */ new Set([
  "P",
  "LI",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "TD",
  "TH",
  "BLOCKQUOTE"
]);
function isBlockElement(el) {
  return el.nodeType === Node.ELEMENT_NODE && BLOCK_TAGS.has(el.tagName);
}
function findBlockAncestor(node) {
  let cur = node;
  while (cur) {
    if (isBlockElement(cur)) return cur;
    cur = cur.parentNode;
  }
  return null;
}
var BLOCK_SELECTOR = "p,li,h1,h2,h3,h4,h5,h6,td,th,blockquote";
function getSelectionContexts(sel) {
  if (!sel.rangeCount) return [];
  const range = sel.getRangeAt(0);
  const fullText = sel.toString();
  if (!fullText || !fullText.trim()) return [];
  const startBlock = findBlockAncestor(range.startContainer);
  const endBlock = findBlockAncestor(range.endContainer);
  if (!startBlock || !endBlock) return [];
  const previewEl = startBlock.closest(".markdown-preview-view");
  if (!previewEl) return [];
  if (startBlock === endBlock) {
    const ctx = buildBlockContext(
      startBlock,
      range.startContainer,
      range.startOffset,
      range.endContainer,
      range.endOffset
    );
    return ctx ? [ctx] : [];
  }
  const allBlocks = Array.from(previewEl.querySelectorAll(BLOCK_SELECTOR));
  const startIdx = allBlocks.indexOf(startBlock);
  const endIdx = allBlocks.indexOf(endBlock);
  if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) {
    const ctx = buildBlockContext(
      startBlock,
      range.startContainer,
      range.startOffset,
      null,
      null
    );
    return ctx ? [ctx] : [];
  }
  const results = [];
  for (let i = startIdx; i <= endIdx; i++) {
    const block = allBlocks[i];
    let ctx;
    if (i === startIdx) {
      ctx = buildBlockContext(block, range.startContainer, range.startOffset, null, null);
    } else if (i === endIdx) {
      ctx = buildBlockContext(block, null, null, range.endContainer, range.endOffset);
    } else {
      ctx = buildBlockContext(block, null, null, null, null);
    }
    if (ctx) results.push(ctx);
  }
  return results;
}
function buildBlockContext(block, startNode, startOff, endNode, endOff) {
  var _a;
  let prefix;
  let selectedText;
  let suffix;
  try {
    if (startNode && startOff !== null && endNode && endOff !== null) {
      const pr = document.createRange();
      pr.setStart(block, 0);
      pr.setEnd(startNode, startOff);
      prefix = pr.toString();
      const sr = document.createRange();
      sr.setStart(startNode, startOff);
      sr.setEnd(endNode, endOff);
      selectedText = sr.toString();
      const sf = document.createRange();
      sf.setStart(endNode, endOff);
      sf.setEndAfter(block);
      suffix = sf.toString();
    } else if (startNode && startOff !== null) {
      const pr = document.createRange();
      pr.setStart(block, 0);
      pr.setEnd(startNode, startOff);
      prefix = pr.toString();
      const sr = document.createRange();
      sr.setStart(startNode, startOff);
      sr.setEndAfter(block);
      selectedText = sr.toString();
      suffix = "";
    } else if (endNode && endOff !== null) {
      prefix = "";
      const sr = document.createRange();
      sr.setStart(block, 0);
      sr.setEnd(endNode, endOff);
      selectedText = sr.toString();
      const sf = document.createRange();
      sf.setStart(endNode, endOff);
      sf.setEndAfter(block);
      suffix = sf.toString();
    } else {
      prefix = "";
      selectedText = (_a = block.textContent) != null ? _a : "";
      suffix = "";
    }
  } catch (e) {
    return null;
  }
  if (!selectedText || !selectedText.trim()) return null;
  return { selectedText, prefix, suffix };
}
function stripMarkdown(line) {
  const stripped = [];
  const charMap = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === "%" && line[i + 1] === "%") {
      const end = line.indexOf("%%", i + 2);
      if (end !== -1) {
        i = end + 2;
        continue;
      }
    }
    if (line[i] === "<") {
      const end = line.indexOf(">", i + 1);
      if (end !== -1) {
        i = end + 1;
        continue;
      }
    }
    if (line[i] === "`") {
      i++;
      while (i < line.length && line[i] !== "`") {
        stripped.push(line[i]);
        charMap.push(i);
        i++;
      }
      if (i < line.length) i++;
      continue;
    }
    if (line[i] === "[" && line[i + 1] === "[") {
      const end = line.indexOf("]]", i + 2);
      if (end !== -1) {
        const inner = line.substring(i + 2, end);
        const pipeIdx = inner.indexOf("|");
        const display = pipeIdx !== -1 ? inner.substring(pipeIdx + 1) : inner;
        const displayStart = pipeIdx !== -1 ? i + 2 + pipeIdx + 1 : i + 2;
        for (let j = 0; j < display.length; j++) {
          stripped.push(display[j]);
          charMap.push(displayStart + j);
        }
        i = end + 2;
        continue;
      }
    }
    if (line[i] === "[") {
      const closeBracket = line.indexOf("]", i + 1);
      if (closeBracket !== -1 && line[closeBracket + 1] === "(") {
        const closeParen = line.indexOf(")", closeBracket + 2);
        if (closeParen !== -1) {
          for (let j = i + 1; j < closeBracket; j++) {
            stripped.push(line[j]);
            charMap.push(j);
          }
          i = closeParen + 1;
          continue;
        }
      }
    }
    if (line[i] === "~" && line[i + 1] === "~" || line[i] === "=" && line[i + 1] === "=" || line[i] === "*" && line[i + 1] === "*" || line[i] === "_" && line[i + 1] === "_") {
      i += 2;
      continue;
    }
    if ((line[i] === "*" || line[i] === "_") && line[i + 1] !== line[i]) {
      i++;
      continue;
    }
    stripped.push(line[i]);
    charMap.push(i);
    i++;
  }
  return { stripped: stripped.join(""), charMap };
}
function locateInSource(content, ctx) {
  const lines = content.split("\n");
  const fullNeedle = ctx.prefix + ctx.selectedText + ctx.suffix;
  const r1 = findNeedleInLines(lines, fullNeedle, ctx.prefix.length, ctx.selectedText.length);
  if (r1) return r1;
  if (ctx.suffix) {
    const r2 = findNeedleInLines(lines, ctx.prefix + ctx.selectedText, ctx.prefix.length, ctx.selectedText.length);
    if (r2) return r2;
  }
  if (ctx.prefix || ctx.suffix) {
    const r3 = findSelectedWithScoring(lines, ctx);
    if (r3) return r3;
  }
  return findNeedleInLines(lines, ctx.selectedText, 0, ctx.selectedText.length);
}
function findNeedleInLines(lines, needle, prefixLen, selectedLen) {
  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const { stripped, charMap } = stripMarkdown(lines[lineIdx]);
    const pos = stripped.indexOf(needle);
    if (pos === -1) continue;
    const selStart = pos + prefixLen;
    const selEnd = selStart + selectedLen;
    if (selStart >= charMap.length || selEnd > charMap.length) continue;
    return {
      lineIndex: lineIdx,
      startOffset: charMap[selStart],
      endOffset: charMap[selEnd - 1] + 1
    };
  }
  return null;
}
function findSelectedWithScoring(lines, ctx) {
  let bestScore = -1;
  let bestLoc = null;
  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const { stripped, charMap } = stripMarkdown(lines[lineIdx]);
    let searchFrom = 0;
    while (true) {
      const pos = stripped.indexOf(ctx.selectedText, searchFrom);
      if (pos === -1) break;
      const selEnd = pos + ctx.selectedText.length;
      if (pos >= charMap.length || selEnd > charMap.length) {
        searchFrom = pos + 1;
        continue;
      }
      let score = 0;
      const before = stripped.substring(0, pos);
      const after = stripped.substring(selEnd);
      if (ctx.prefix && before.endsWith(ctx.prefix)) score += 10;
      if (ctx.suffix && after.startsWith(ctx.suffix)) score += 10;
      if (score > bestScore) {
        bestScore = score;
        bestLoc = {
          lineIndex: lineIdx,
          startOffset: charMap[pos],
          endOffset: charMap[selEnd - 1] + 1
        };
      }
      searchFrom = pos + 1;
    }
  }
  return bestLoc;
}
function isInsideHighlight(line, pos) {
  let count = 0;
  for (let i = 0; i <= pos - 2; i++) {
    if (line[i] === "=" && line[i + 1] === "=") {
      count++;
      i++;
    }
  }
  return count % 2 === 1;
}
function hasMarkersBetween(line, start, end) {
  for (let i = start; i < end - 1; i++) {
    if (line[i] === "=" && line[i + 1] === "=") {
      return true;
    }
  }
  return false;
}
var ReaderHighlighterPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.activePopup = null;
    this.dismissHandler = null;
    this.selChangeTimer = null;
  }
  async onload() {
    await this.loadSettings();
    this.registerDomEvent(document, "mouseup", (evt) => {
      this.handleMouseUp(evt);
    });
    this.registerDomEvent(
      document,
      "touchend",
      (evt) => {
        setTimeout(() => this.handleTouchEnd(evt), 100);
      },
      { passive: true }
    );
    this.registerDomEvent(document, "selectionchange", () => {
      if (this.selChangeTimer) clearTimeout(this.selChangeTimer);
      this.selChangeTimer = setTimeout(() => {
        this.handleSelectionChange();
      }, 600);
    });
    this.addSettingTab(new ReaderHighlighterSettingTab(this.app, this));
  }
  onunload() {
    this.dismissPopup();
    if (this.selChangeTimer) clearTimeout(this.selChangeTimer);
  }
  // Desktop: mouseup handles both highlight and mark-click popup
  handleMouseUp(evt) {
    if (!this.settings.enabled) return;
    const target = evt.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest(".rh-popup")) return;
    this.dismissPopup();
    if (!target.closest(".markdown-preview-view")) return;
    const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    if (!view || view.getMode() !== "preview") return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      const markEl = target.closest("mark");
      if (markEl) this.showPopup(evt, markEl, view);
      return;
    }
    this.handleSelection(sel, view);
  }
  // Mobile: touchend only handles tap-on-mark popup (not highlighting)
  handleTouchEnd(evt) {
    if (!this.settings.enabled) return;
    const target = evt.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest(".rh-popup")) return;
    this.dismissPopup();
    if (!target.closest(".markdown-preview-view")) return;
    const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    if (!view || view.getMode() !== "preview") return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      const markEl = target.closest("mark");
      if (markEl) this.showPopup(evt, markEl, view);
    }
  }
  // Mobile: fires after selection stabilizes (600ms debounce)
  handleSelectionChange() {
    if (!this.settings.enabled) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const anchor = sel.anchorNode;
    if (!anchor) return;
    const anchorEl = anchor.nodeType === Node.ELEMENT_NODE ? anchor : anchor.parentElement;
    if (!anchorEl || !anchorEl.closest(".markdown-preview-view")) return;
    const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    if (!view || view.getMode() !== "preview") return;
    this.handleSelection(sel, view);
  }
  handleSelection(sel, view) {
    const contexts = getSelectionContexts(sel);
    if (contexts.length === 0) return;
    const file = view.file;
    if (!file) return;
    this.app.vault.process(file, (content) => {
      const locations = [];
      for (const ctx of contexts) {
        const loc = locateInSource(content, ctx);
        if (loc) {
          locations.push(loc);
        } else {
          console.log("[RH] no match for:", ctx.selectedText.substring(0, 50));
        }
      }
      if (locations.length === 0) return content;
      locations.sort((a, b) => {
        if (a.lineIndex !== b.lineIndex) return b.lineIndex - a.lineIndex;
        return b.startOffset - a.startOffset;
      });
      const lines = content.split("\n");
      for (const loc of locations) {
        const line = lines[loc.lineIndex];
        let start = loc.startOffset;
        let end = loc.endOffset;
        while (start < end && line[start] === " ") start++;
        while (end > start && line[end - 1] === " ") end--;
        if (start >= end) continue;
        const before = line.substring(0, start);
        const after = line.substring(end);
        if (before.endsWith("==") && after.startsWith("==")) {
          lines[loc.lineIndex] = before.substring(0, before.length - 2) + line.substring(start, end) + after.substring(2);
        } else if (isInsideHighlight(line, start) || isInsideHighlight(line, end) || hasMarkersBetween(line, start, end)) {
          console.log("[RH] skipping: overlaps existing highlight on line", loc.lineIndex);
        } else {
          lines[loc.lineIndex] = before + "==" + line.substring(start, end) + "==" + after;
        }
      }
      return lines.join("\n");
    });
    sel.removeAllRanges();
  }
  // -----------------------------------------------------------------
  // Highlight remove popup
  // -----------------------------------------------------------------
  showPopup(evt, markEl, view) {
    const popup = document.createElement("div");
    popup.className = "rh-popup";
    const btn = document.createElement("button");
    btn.className = "rh-popup-btn";
    btn.textContent = "Remove highlight";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.removeHighlight(markEl, view);
      this.dismissPopup();
    });
    popup.appendChild(btn);
    document.body.appendChild(popup);
    this.activePopup = popup;
    let clientX, clientY;
    if (evt instanceof MouseEvent) {
      clientX = evt.clientX;
      clientY = evt.clientY;
    } else {
      const touch = evt.changedTouches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    }
    const rect = popup.getBoundingClientRect();
    let left = clientX - rect.width / 2;
    let top = clientY - rect.height - 10;
    left = Math.max(4, Math.min(left, window.innerWidth - rect.width - 4));
    if (top < 4) top = clientY + 20;
    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
    this.dismissHandler = (e) => {
      if (e.target instanceof HTMLElement && e.target.closest(".rh-popup")) return;
      this.dismissPopup();
    };
    setTimeout(() => {
      document.addEventListener("mousedown", this.dismissHandler);
      document.addEventListener("touchstart", this.dismissHandler);
    }, 10);
  }
  dismissPopup() {
    if (this.activePopup) {
      this.activePopup.remove();
      this.activePopup = null;
    }
    if (this.dismissHandler) {
      document.removeEventListener("mousedown", this.dismissHandler);
      document.removeEventListener("touchstart", this.dismissHandler);
      this.dismissHandler = null;
    }
  }
  removeHighlight(markEl, view) {
    const file = view.file;
    if (!file) return;
    const marks = this.collectConnectedMarks(markEl);
    const contexts = [];
    for (const mark of marks) {
      const ctx = this.buildMarkContext(mark);
      if (ctx) contexts.push(ctx);
    }
    if (contexts.length === 0) return;
    this.app.vault.process(file, (content) => {
      const locations = [];
      for (const ctx of contexts) {
        const loc = locateInSource(content, ctx);
        if (loc) locations.push(loc);
      }
      if (locations.length === 0) return content;
      locations.sort((a, b) => {
        if (a.lineIndex !== b.lineIndex) return b.lineIndex - a.lineIndex;
        return b.startOffset - a.startOffset;
      });
      const lines = content.split("\n");
      for (const loc of locations) {
        const line = lines[loc.lineIndex];
        const before = line.substring(0, loc.startOffset);
        const after = line.substring(loc.endOffset);
        if (before.endsWith("==") && after.startsWith("==")) {
          lines[loc.lineIndex] = before.substring(0, before.length - 2) + line.substring(loc.startOffset, loc.endOffset) + after.substring(2);
        }
      }
      return lines.join("\n");
    });
  }
  /** Build a SelectionContext from a <mark> element. */
  buildMarkContext(markEl) {
    var _a;
    const text = (_a = markEl.textContent) != null ? _a : "";
    if (!text) return null;
    const block = findBlockAncestor(markEl);
    if (!block) return null;
    try {
      const pr = document.createRange();
      pr.setStart(block, 0);
      pr.setEndBefore(markEl);
      const prefix = pr.toString();
      const sf = document.createRange();
      sf.setStartAfter(markEl);
      sf.setEndAfter(block);
      const suffix = sf.toString();
      return { selectedText: text, prefix, suffix };
    } catch (e) {
      return null;
    }
  }
  /**
   * Starting from the clicked <mark>, walk backward/forward through
   * adjacent blocks to find connected highlights.
   *
   * Two marks are "connected" when one ends at the end of its block
   * and the next starts at the beginning of its block (the pattern
   * produced by a multi-paragraph highlight selection).
   */
  collectConnectedMarks(markEl) {
    const marks = [markEl];
    let cur = markEl;
    while (true) {
      const block = findBlockAncestor(cur);
      if (!block) break;
      try {
        const r = document.createRange();
        r.setStart(block, 0);
        r.setEndBefore(cur);
        if (r.toString().trim()) break;
      } catch (e) {
        break;
      }
      const prevBlock = this.getAdjacentBlock(block, "prev");
      if (!prevBlock) break;
      const lastMark = this.getEdgeMark(prevBlock, "last");
      if (!lastMark) break;
      try {
        const r = document.createRange();
        r.setStartAfter(lastMark);
        r.setEndAfter(prevBlock);
        if (r.toString().trim()) break;
      } catch (e) {
        break;
      }
      marks.unshift(lastMark);
      cur = lastMark;
    }
    cur = markEl;
    while (true) {
      const block = findBlockAncestor(cur);
      if (!block) break;
      try {
        const r = document.createRange();
        r.setStartAfter(cur);
        r.setEndAfter(block);
        if (r.toString().trim()) break;
      } catch (e) {
        break;
      }
      const nextBlock = this.getAdjacentBlock(block, "next");
      if (!nextBlock) break;
      const firstMark = this.getEdgeMark(nextBlock, "first");
      if (!firstMark) break;
      try {
        const r = document.createRange();
        r.setStart(nextBlock, 0);
        r.setEndBefore(firstMark);
        if (r.toString().trim()) break;
      } catch (e) {
        break;
      }
      marks.push(firstMark);
      cur = firstMark;
    }
    return marks;
  }
  /** Get the previous or next block-level sibling within the preview. */
  getAdjacentBlock(block, dir) {
    var _a;
    const preview = block.closest(".markdown-preview-view");
    if (!preview) return null;
    const all = Array.from(preview.querySelectorAll(BLOCK_SELECTOR));
    const idx = all.indexOf(block);
    if (idx === -1) return null;
    return (_a = all[dir === "prev" ? idx - 1 : idx + 1]) != null ? _a : null;
  }
  /** Get the first or last <mark> element in a block. */
  getEdgeMark(block, edge) {
    const marks = block.querySelectorAll("mark");
    if (marks.length === 0) return null;
    return edge === "first" ? marks[0] : marks[marks.length - 1];
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var ReaderHighlighterSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("Enable highlighting").setDesc("Toggle select-to-highlight in reading mode.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.enabled).onChange(async (value) => {
        this.plugin.settings.enabled = value;
        await this.plugin.saveSettings();
      })
    );
  }
};
