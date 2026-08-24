"use strict";
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

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => PdfToMarkdownPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian10 = require("obsidian");

// src/settings.ts
var import_obsidian2 = require("obsidian");

// src/types.ts
var PDF_TO_MARKDOWN_SETTING_KEYS = [
  "sourceAction",
  "moveFolder",
  "assetLocation",
  "extractImages",
  "imageFormat",
  "imageQuality",
  "maxImageDimension",
  "minImageDimension",
  "renderImageOnlyPages",
  "detectTables",
  "tableOutput",
  "tableMinConfidence",
  "includePageHeadings",
  "removeRepeatedMargins",
  "updateLinks",
  "openAfterConversion"
];
function isPdfToMarkdownSettingKey(value) {
  return PDF_TO_MARKDOWN_SETTING_KEYS.some((key) => key === value);
}
var DEFAULT_SETTINGS = {
  sourceAction: "keep",
  moveFolder: "PDF Archive",
  assetLocation: "note-folder",
  extractImages: true,
  imageFormat: "webp",
  imageQuality: 0.82,
  maxImageDimension: 2200,
  minImageDimension: 96,
  renderImageOnlyPages: true,
  detectTables: true,
  tableOutput: "markdown",
  tableMinConfidence: 0.68,
  includePageHeadings: true,
  removeRepeatedMargins: true,
  updateLinks: true,
  openAfterConversion: true
};
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function clamp(value, minimum, maximum, fallback) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(minimum, Math.min(maximum, value)) : fallback;
}
function oneOf(value, values, fallback) {
  var _a;
  if (typeof value !== "string") return fallback;
  return (_a = values.find((candidate) => candidate === value)) != null ? _a : fallback;
}
function normalizeSettings(value) {
  const saved = isRecord(value) ? value : {};
  return {
    sourceAction: oneOf(saved.sourceAction, ["keep", "trash", "move"], DEFAULT_SETTINGS.sourceAction),
    moveFolder: typeof saved.moveFolder === "string" ? saved.moveFolder : DEFAULT_SETTINGS.moveFolder,
    assetLocation: oneOf(saved.assetLocation, ["note-folder", "vault-default"], DEFAULT_SETTINGS.assetLocation),
    extractImages: typeof saved.extractImages === "boolean" ? saved.extractImages : DEFAULT_SETTINGS.extractImages,
    imageFormat: oneOf(saved.imageFormat, ["webp", "png", "jpeg"], DEFAULT_SETTINGS.imageFormat),
    imageQuality: clamp(saved.imageQuality, 0.45, 1, DEFAULT_SETTINGS.imageQuality),
    maxImageDimension: Math.round(clamp(saved.maxImageDimension, 320, 8e3, DEFAULT_SETTINGS.maxImageDimension)),
    minImageDimension: Math.round(clamp(saved.minImageDimension, 1, 1e3, DEFAULT_SETTINGS.minImageDimension)),
    renderImageOnlyPages: typeof saved.renderImageOnlyPages === "boolean" ? saved.renderImageOnlyPages : DEFAULT_SETTINGS.renderImageOnlyPages,
    detectTables: typeof saved.detectTables === "boolean" ? saved.detectTables : DEFAULT_SETTINGS.detectTables,
    tableOutput: oneOf(saved.tableOutput, ["markdown", "svg", "both"], DEFAULT_SETTINGS.tableOutput),
    tableMinConfidence: clamp(saved.tableMinConfidence, 0.5, 0.9, DEFAULT_SETTINGS.tableMinConfidence),
    includePageHeadings: typeof saved.includePageHeadings === "boolean" ? saved.includePageHeadings : DEFAULT_SETTINGS.includePageHeadings,
    removeRepeatedMargins: typeof saved.removeRepeatedMargins === "boolean" ? saved.removeRepeatedMargins : DEFAULT_SETTINGS.removeRepeatedMargins,
    updateLinks: typeof saved.updateLinks === "boolean" ? saved.updateLinks : DEFAULT_SETTINGS.updateLinks,
    openAfterConversion: typeof saved.openAfterConversion === "boolean" ? saved.openAfterConversion : DEFAULT_SETTINGS.openAfterConversion
  };
}

// src/ui/folder-picker.ts
var import_obsidian = require("obsidian");
var FolderPickerModal = class extends import_obsidian.FuzzySuggestModal {
  constructor(app) {
    super(app);
    this.resolved = false;
    this.resolvePromise = () => void 0;
    this.promise = new Promise((resolve) => {
      this.resolvePromise = resolve;
    });
    this.setPlaceholder("Choose a vault folder");
  }
  getItems() {
    return this.app.vault.getAllFolders(false).sort((a, b) => a.path.localeCompare(b.path));
  }
  getItemText(folder) {
    return folder.path;
  }
  onChooseItem(folder, _evt) {
    this.finish(folder.path);
  }
  onClose() {
    super.onClose();
    if (!this.resolved) this.finish(null);
  }
  request() {
    this.open();
    return this.promise;
  }
  finish(value) {
    if (this.resolved) return;
    this.resolved = true;
    this.resolvePromise(value);
  }
};
function chooseVaultFolder(app) {
  return new FolderPickerModal(app).request();
}

// src/settings.ts
function percent(value) {
  return `${Math.round(value * 100)}%`;
}
var PdfToMarkdownSettingTab = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  getControlValue(key) {
    return isPdfToMarkdownSettingKey(key) ? this.plugin.pluginSettings[key] : void 0;
  }
  async setControlValue(key, value) {
    if (!isPdfToMarkdownSettingKey(key)) {
      throw new Error(`Unknown PDF to Markdown setting: ${key}`);
    }
    this.plugin.pluginSettings = normalizeSettings({
      ...this.plugin.pluginSettings,
      [key]: value
    });
    await this.plugin.saveSettings();
  }
  getSettingDefinitions() {
    const hasImageOutput = () => this.plugin.pluginSettings.extractImages || this.plugin.pluginSettings.renderImageOnlyPages;
    return [
      {
        name: "Local conversion",
        desc: "All conversion happens inside Obsidian. The plugin does not use a server, Python, or other external tools."
      },
      {
        type: "group",
        heading: "Source PDF",
        items: [
          {
            name: "After conversion",
            desc: "Keep the PDF, use Obsidian's Deleted files setting, or move it to a vault folder.",
            control: {
              type: "dropdown",
              key: "sourceAction",
              defaultValue: "keep",
              options: {
                keep: "Leave PDF in place",
                trash: "Use Obsidian Deleted files setting",
                move: "Move PDF to folder"
              }
            }
          },
          {
            name: "PDF move folder",
            desc: "Choose an existing vault folder or type a new vault-relative folder.",
            visible: () => this.plugin.pluginSettings.sourceAction === "move",
            render: (setting) => {
              let folderInput = null;
              setting.addText((text) => {
                folderInput = text;
                text.setPlaceholder("PDF archive").setValue(this.plugin.pluginSettings.moveFolder).onChange(async (value) => {
                  this.plugin.pluginSettings.moveFolder = value;
                  await this.plugin.saveSettings();
                });
              }).addButton((button) => {
                button.setButtonText("Choose").onClick(async () => {
                  const folder = await chooseVaultFolder(this.app);
                  if (folder === null) return;
                  folderInput == null ? void 0 : folderInput.setValue(folder);
                  this.plugin.pluginSettings.moveFolder = folder;
                  await this.plugin.saveSettings();
                });
              });
            }
          }
        ]
      },
      {
        type: "group",
        heading: "Images",
        items: [
          {
            name: "Extract images",
            desc: "Extract embedded PDF images and compress them before they are saved.",
            control: {
              type: "toggle",
              key: "extractImages",
              defaultValue: true
            }
          },
          {
            name: "Asset location",
            desc: "Choose where extracted images, page snapshots, and SVG tables are saved.",
            control: {
              type: "dropdown",
              key: "assetLocation",
              defaultValue: "note-folder",
              options: {
                "note-folder": "Folder with the converted note",
                "vault-default": "Obsidian attachment location"
              }
            }
          },
          {
            name: "Image format",
            desc: "WebP gives small files. PNG keeps lossless detail. JPEG is widely compatible.",
            visible: hasImageOutput,
            control: {
              type: "dropdown",
              key: "imageFormat",
              defaultValue: "webp",
              options: {
                webp: "WebP",
                png: "PNG",
                jpeg: "JPEG"
              }
            }
          },
          {
            name: "Image quality",
            desc: "Set the compression quality for WebP and JPEG images.",
            visible: () => hasImageOutput() && this.plugin.pluginSettings.imageFormat !== "png",
            control: {
              type: "slider",
              key: "imageQuality",
              defaultValue: 0.82,
              min: 0.45,
              max: 1,
              step: 0.01,
              displayFormat: percent
            }
          },
          {
            name: "Maximum image size",
            desc: "The longest image edge in pixels. Large images are scaled down before export.",
            visible: hasImageOutput,
            control: {
              type: "number",
              key: "maxImageDimension",
              defaultValue: 2200,
              min: 320,
              max: 8e3,
              step: 1
            }
          },
          {
            name: "Ignore small images",
            desc: "Images smaller than this width or height are not exported. This removes many icons and bullets.",
            visible: hasImageOutput,
            control: {
              type: "number",
              key: "minImageDimension",
              defaultValue: 96,
              min: 1,
              max: 1e3,
              step: 1
            }
          },
          {
            name: "Keep image-only pages",
            desc: "Render scanned or image-only pages as compressed images. This is not OCR.",
            control: {
              type: "toggle",
              key: "renderImageOnlyPages",
              defaultValue: true
            }
          }
        ]
      },
      {
        type: "group",
        heading: "Tables",
        items: [
          {
            name: "Detect tables",
            desc: "Detect aligned PDF text and export it as clean Markdown, a compact SVG, or both.",
            control: {
              type: "toggle",
              key: "detectTables",
              defaultValue: true
            }
          },
          {
            name: "Table output",
            desc: "Markdown stays editable. SVG keeps the detected table as a small, scalable visual.",
            visible: () => this.plugin.pluginSettings.detectTables,
            control: {
              type: "dropdown",
              key: "tableOutput",
              defaultValue: "markdown",
              options: {
                markdown: "Editable Markdown",
                svg: "Compact SVG",
                both: "Markdown and SVG"
              }
            }
          },
          {
            name: "Table detection confidence",
            desc: "Increase this value if normal columns are detected as tables.",
            visible: () => this.plugin.pluginSettings.detectTables,
            control: {
              type: "slider",
              key: "tableMinConfidence",
              defaultValue: 0.68,
              min: 0.5,
              max: 0.9,
              step: 0.01,
              displayFormat: percent
            }
          }
        ]
      },
      {
        type: "group",
        heading: "Markdown",
        items: [
          {
            name: "Add page headings",
            desc: "Add a page heading for each PDF page. PDF page links can then point to the matching heading.",
            control: {
              type: "toggle",
              key: "includePageHeadings",
              defaultValue: true
            }
          },
          {
            name: "Remove repeated page margins",
            desc: "Remove repeated headers, footers, and page numbers from documents with three or more pages.",
            control: {
              type: "toggle",
              key: "removeRepeatedMargins",
              defaultValue: true
            }
          },
          {
            name: "Update PDF links",
            desc: "Change links that resolve to the PDF so they point to the new note. Existing aliases stay unchanged.",
            control: {
              type: "toggle",
              key: "updateLinks",
              defaultValue: true
            }
          },
          {
            name: "Open converted note",
            desc: "Open the Markdown note after the conversion is applied.",
            control: {
              type: "toggle",
              key: "openAfterConversion",
              defaultValue: true
            }
          }
        ]
      }
    ];
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("p", {
      text: "All conversion happens inside Obsidian. The plugin does not use a server, Python, or other external tools."
    });
    new import_obsidian2.Setting(containerEl).setName("Source PDF").setHeading();
    new import_obsidian2.Setting(containerEl).setName("After conversion").setDesc("Keep the PDF, use Obsidian's Deleted files setting, or move it to a vault folder.").addDropdown((dropdown) => {
      dropdown.addOption("keep", "Leave PDF in place").addOption("trash", "Use Obsidian Deleted files setting").addOption("move", "Move PDF to folder").setValue(this.plugin.pluginSettings.sourceAction).onChange(async (value) => {
        this.plugin.pluginSettings.sourceAction = value;
        await this.plugin.saveSettings();
        this.display();
      });
    });
    if (this.plugin.pluginSettings.sourceAction === "move") {
      let folderInput = null;
      new import_obsidian2.Setting(containerEl).setName("PDF move folder").setDesc("Choose an existing vault folder or type a new vault-relative folder.").addText((text) => {
        folderInput = text;
        text.setPlaceholder("PDF archive").setValue(this.plugin.pluginSettings.moveFolder).onChange(async (value) => {
          this.plugin.pluginSettings.moveFolder = value;
          await this.plugin.saveSettings();
        });
      }).addButton((button) => {
        button.setButtonText("Choose").onClick(async () => {
          const folder = await chooseVaultFolder(this.app);
          if (folder === null) return;
          folderInput == null ? void 0 : folderInput.setValue(folder);
          this.plugin.pluginSettings.moveFolder = folder;
          await this.plugin.saveSettings();
        });
      });
    }
    new import_obsidian2.Setting(containerEl).setName("Images").setHeading();
    new import_obsidian2.Setting(containerEl).setName("Extract images").setDesc("Extract embedded PDF images and compress them before they are saved.").addToggle((toggle) => {
      toggle.setValue(this.plugin.pluginSettings.extractImages).onChange(async (value) => {
        this.plugin.pluginSettings.extractImages = value;
        await this.plugin.saveSettings();
        this.display();
      });
    });
    new import_obsidian2.Setting(containerEl).setName("Asset location").setDesc("Choose where extracted images, page snapshots, and SVG tables are saved.").addDropdown((dropdown) => {
      dropdown.addOption("note-folder", "Folder with the converted note").addOption("vault-default", "Obsidian attachment location").setValue(this.plugin.pluginSettings.assetLocation).onChange(async (value) => {
        this.plugin.pluginSettings.assetLocation = value;
        await this.plugin.saveSettings();
      });
    });
    if (this.plugin.pluginSettings.extractImages || this.plugin.pluginSettings.renderImageOnlyPages) {
      new import_obsidian2.Setting(containerEl).setName("Image format").setDesc("WebP gives small files. PNG keeps lossless detail. JPEG is widely compatible.").addDropdown((dropdown) => {
        dropdown.addOption("webp", "WebP").addOption("png", "PNG").addOption("jpeg", "JPEG").setValue(this.plugin.pluginSettings.imageFormat).onChange(async (value) => {
          this.plugin.pluginSettings.imageFormat = value;
          await this.plugin.saveSettings();
          this.display();
        });
      });
      if (this.plugin.pluginSettings.imageFormat !== "png") {
        new import_obsidian2.Setting(containerEl).setName("Image quality").setDesc(`Current value: ${percent(this.plugin.pluginSettings.imageQuality)}.`).addSlider((slider) => {
          slider.setLimits(45, 100, 1).setValue(Math.round(this.plugin.pluginSettings.imageQuality * 100)).setDynamicTooltip().onChange(async (value) => {
            this.plugin.pluginSettings.imageQuality = value / 100;
            await this.plugin.saveSettings();
          });
        });
      }
      new import_obsidian2.Setting(containerEl).setName("Maximum image size").setDesc("The longest image edge in pixels. Large images are scaled down before export.").addText((text) => {
        text.inputEl.type = "number";
        text.inputEl.min = "320";
        text.inputEl.max = "8000";
        text.setValue(String(this.plugin.pluginSettings.maxImageDimension)).onChange(async (value) => {
          const number = Number.parseInt(value, 10);
          if (Number.isFinite(number)) {
            this.plugin.pluginSettings.maxImageDimension = Math.max(320, Math.min(8e3, number));
            await this.plugin.saveSettings();
          }
        });
      });
      new import_obsidian2.Setting(containerEl).setName("Ignore small images").setDesc("Images smaller than this width or height are not exported. This removes many icons and bullets.").addText((text) => {
        text.inputEl.type = "number";
        text.inputEl.min = "1";
        text.inputEl.max = "1000";
        text.setValue(String(this.plugin.pluginSettings.minImageDimension)).onChange(async (value) => {
          const number = Number.parseInt(value, 10);
          if (Number.isFinite(number)) {
            this.plugin.pluginSettings.minImageDimension = Math.max(1, Math.min(1e3, number));
            await this.plugin.saveSettings();
          }
        });
      });
    }
    new import_obsidian2.Setting(containerEl).setName("Keep image-only pages").setDesc("Render scanned or image-only pages as compressed images. This is not OCR.").addToggle((toggle) => {
      toggle.setValue(this.plugin.pluginSettings.renderImageOnlyPages).onChange(async (value) => {
        this.plugin.pluginSettings.renderImageOnlyPages = value;
        await this.plugin.saveSettings();
        this.display();
      });
    });
    new import_obsidian2.Setting(containerEl).setName("Tables").setHeading();
    new import_obsidian2.Setting(containerEl).setName("Detect tables").setDesc("Detect aligned PDF text and export it as clean Markdown, a compact SVG, or both.").addToggle((toggle) => {
      toggle.setValue(this.plugin.pluginSettings.detectTables).onChange(async (value) => {
        this.plugin.pluginSettings.detectTables = value;
        await this.plugin.saveSettings();
        this.display();
      });
    });
    if (this.plugin.pluginSettings.detectTables) {
      new import_obsidian2.Setting(containerEl).setName("Table output").setDesc("Markdown stays editable. SVG keeps the detected table as a small, scalable visual.").addDropdown((dropdown) => {
        dropdown.addOption("markdown", "Editable Markdown").addOption("svg", "Compact SVG").addOption("both", "Markdown and SVG").setValue(this.plugin.pluginSettings.tableOutput).onChange(async (value) => {
          this.plugin.pluginSettings.tableOutput = value;
          await this.plugin.saveSettings();
        });
      });
      new import_obsidian2.Setting(containerEl).setName("Table detection confidence").setDesc(`Current value: ${percent(this.plugin.pluginSettings.tableMinConfidence)}. Increase it if normal columns are detected as tables.`).addSlider((slider) => {
        slider.setLimits(50, 90, 1).setValue(Math.round(this.plugin.pluginSettings.tableMinConfidence * 100)).setDynamicTooltip().onChange(async (value) => {
          this.plugin.pluginSettings.tableMinConfidence = value / 100;
          await this.plugin.saveSettings();
        });
      });
    }
    new import_obsidian2.Setting(containerEl).setName("Markdown").setHeading();
    new import_obsidian2.Setting(containerEl).setName("Add page headings").setDesc("Add a page heading for each PDF page. PDF page links can then point to the matching heading.").addToggle((toggle) => {
      toggle.setValue(this.plugin.pluginSettings.includePageHeadings).onChange(async (value) => {
        this.plugin.pluginSettings.includePageHeadings = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian2.Setting(containerEl).setName("Remove repeated page margins").setDesc("Remove repeated headers, footers, and page numbers from documents with three or more pages.").addToggle((toggle) => {
      toggle.setValue(this.plugin.pluginSettings.removeRepeatedMargins).onChange(async (value) => {
        this.plugin.pluginSettings.removeRepeatedMargins = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian2.Setting(containerEl).setName("Update PDF links").setDesc("Change links that resolve to the PDF so they point to the new note. Existing aliases stay unchanged.").addToggle((toggle) => {
      toggle.setValue(this.plugin.pluginSettings.updateLinks).onChange(async (value) => {
        this.plugin.pluginSettings.updateLinks = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian2.Setting(containerEl).setName("Open converted note").setDesc("Open the Markdown note after the conversion is applied.").addToggle((toggle) => {
      toggle.setValue(this.plugin.pluginSettings.openAfterConversion).onChange(async (value) => {
        this.plugin.pluginSettings.openAfterConversion = value;
        await this.plugin.saveSettings();
      });
    });
  }
};

// src/ui/conversion-modal.ts
var import_obsidian9 = require("obsidian");

// src/conversion/apply.ts
var import_obsidian5 = require("obsidian");

// src/path.ts
var import_obsidian3 = require("obsidian");
var WINDOWS_RESERVED_STEM = /^(?:con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³])$/i;
var MAX_FILE_NAME_BYTES = 180;
var MAX_EXTENSION_BYTES = 32;
var UTF8_ENCODER = new TextEncoder();
function utf8Length(value) {
  return UTF8_ENCODER.encode(value).byteLength;
}
function truncateUtf8(value, maxBytes) {
  let output = "";
  let bytes = 0;
  for (const character of value) {
    const size = utf8Length(character);
    if (bytes + size > maxBytes) break;
    output += character;
    bytes += size;
  }
  return output;
}
function cleanFileName(value) {
  return value.normalize("NFC").replace(/[\\/:*?"<>|#[\]]/g, " ").replace(/\p{Cc}/gu, " ").replace(/[\u202a-\u202e\u2066-\u2069]/gu, " ").replace(/\s+/g, " ").trim().replace(/\s+\./g, ".").replace(/[. ]+$/g, "");
}
function splitExtension(value) {
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return { stem: value, suffix: "" };
  const suffix = value.slice(dot);
  return utf8Length(suffix) <= MAX_EXTENSION_BYTES ? { stem: value.slice(0, dot), suffix } : { stem: value, suffix: "" };
}
function truncateFileName(value) {
  if (utf8Length(value) <= MAX_FILE_NAME_BYTES) return value;
  const { stem, suffix } = splitExtension(value);
  const stemBudget = Math.max(1, MAX_FILE_NAME_BYTES - utf8Length(suffix));
  return `${truncateUtf8(stem, stemBudget)}${suffix}`.replace(/[. ]+$/g, "");
}
function avoidWindowsReservedName(value) {
  const firstDot = value.indexOf(".");
  const stem = firstDot > 0 ? value.slice(0, firstDot) : value;
  if (!WINDOWS_RESERVED_STEM.test(stem)) return value;
  return firstDot > 0 ? `${stem}_${value.slice(firstDot)}` : `${value}_`;
}
function collisionName(value, index, fallback, preserveExtension) {
  const cleaned = cleanFileName(value) || cleanFileName(fallback) || "Converted PDF";
  const marker = ` (${index})`;
  const parts = preserveExtension ? splitExtension(cleaned) : { stem: cleaned, suffix: "" };
  const stemBudget = Math.max(
    1,
    MAX_FILE_NAME_BYTES - utf8Length(marker) - utf8Length(parts.suffix)
  );
  const stem = truncateUtf8(parts.stem, stemBudget).replace(/[. ]+$/g, "") || "File";
  return avoidWindowsReservedName(`${stem}${marker}${parts.suffix}`);
}
function dirname(path) {
  const normalized = (0, import_obsidian3.normalizePath)(path);
  const index = normalized.lastIndexOf("/");
  return index < 0 ? "" : normalized.slice(0, index);
}
function basename(path) {
  const normalized = (0, import_obsidian3.normalizePath)(path);
  const index = normalized.lastIndexOf("/");
  return index < 0 ? normalized : normalized.slice(index + 1);
}
function withoutExtension(path) {
  const name = basename(path);
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}
function joinPath(...parts) {
  const joined = parts.map((part) => part.trim()).filter(Boolean).join("/");
  return joined ? (0, import_obsidian3.normalizePath)(joined) : "";
}
function safeFileName(value, fallback = "Converted PDF") {
  const cleaned = cleanFileName(value) || cleanFileName(fallback);
  if (!cleaned) return "";
  return truncateFileName(avoidWindowsReservedName(cleaned));
}
function sanitizeVaultFolder(value) {
  const raw = value.trim().replace(/\\/g, "/");
  if (!raw) return "";
  if (/^(?:\/|[A-Za-z]:|~(?:\/|$))/.test(raw)) {
    throw new Error("Use a relative path inside the Vault, not an absolute path.");
  }
  const rawParts = raw.split("/").filter(Boolean);
  if (rawParts.length === 0 || rawParts.some((part) => part === "." || part === "..")) {
    throw new Error("The folder must stay inside the Vault.");
  }
  const parts = rawParts.map((part) => safeFileName(part, ""));
  if (parts.some((part) => !part)) {
    throw new Error("The folder contains a name that cannot be used.");
  }
  return (0, import_obsidian3.normalizePath)(parts.join("/"));
}
function findLoadedPath(app, path) {
  var _a;
  const normalized = (0, import_obsidian3.normalizePath)(path);
  const exact = app.vault.getAbstractFileByPath(normalized);
  if (exact || !normalized) return exact;
  const getRoot = (_a = app.vault.getRoot) == null ? void 0 : _a.bind(app.vault);
  if (typeof getRoot !== "function") return null;
  let current = getRoot();
  for (const part of normalized.split("/")) {
    if (!(current instanceof import_obsidian3.TFolder)) return null;
    const folded = part.normalize("NFC").toLowerCase();
    const child = current.children.find(
      (item) => item.name.normalize("NFC").toLowerCase() === folded
    );
    if (!child) return null;
    current = child;
  }
  return current;
}
function canonicalFolderPath(app, path) {
  var _a;
  const normalized = path ? (0, import_obsidian3.normalizePath)(path) : "";
  if (!normalized) return "";
  const getRoot = (_a = app.vault.getRoot) == null ? void 0 : _a.bind(app.vault);
  if (typeof getRoot !== "function") return normalized;
  let current = getRoot();
  const parts = normalized.split("/");
  for (let index = 0; index < parts.length; index += 1) {
    const folded = parts[index].normalize("NFC").toLowerCase();
    const child = current.children.find(
      (item) => item.name.normalize("NFC").toLowerCase() === folded
    );
    if (!(child instanceof import_obsidian3.TFolder)) {
      return joinPath(current.path, ...parts.slice(index));
    }
    current = child;
  }
  return current.path;
}
function availableFilePath(app, desiredPath) {
  const normalized = (0, import_obsidian3.normalizePath)(desiredPath);
  const folder = canonicalFolderPath(app, dirname(normalized));
  const name = basename(normalized);
  const desired = joinPath(folder, name);
  if (!findLoadedPath(app, desired)) return desired;
  const dot = name.lastIndexOf(".");
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const suffix = dot > 0 ? name.slice(dot) : "";
  for (let index = 2; index < 1e4; index += 1) {
    const candidateName = collisionName(`${stem}${suffix}`, index, "Converted PDF", true);
    const candidate = joinPath(folder, candidateName);
    if (!findLoadedPath(app, candidate)) return candidate;
  }
  throw new Error(`Could not find an available path for ${desired}.`);
}
function availableFolderPath(app, desiredPath) {
  const normalized = (0, import_obsidian3.normalizePath)(desiredPath);
  const folder = canonicalFolderPath(app, dirname(normalized));
  const name = basename(normalized);
  const desired = joinPath(folder, name);
  if (!findLoadedPath(app, desired)) return desired;
  for (let index = 2; index < 1e4; index += 1) {
    const candidateName = collisionName(name, index, "Converted PDF", false);
    const candidate = joinPath(folder, candidateName);
    if (!findLoadedPath(app, candidate)) return candidate;
  }
  throw new Error(`Could not find an available folder for ${desired}.`);
}
async function ensureFolder(app, folderPath) {
  const normalized = folderPath ? (0, import_obsidian3.normalizePath)(folderPath) : "";
  if (!normalized) return;
  const existing = findLoadedPath(app, normalized);
  if (existing) {
    if (!(existing instanceof import_obsidian3.TFolder)) throw new Error(`A file already exists at ${normalized}.`);
    return;
  }
  const parts = normalized.split("/");
  let current = "";
  for (const part of parts) {
    const requested = joinPath(current, part);
    const item = findLoadedPath(app, requested);
    if (!item) {
      await app.vault.createFolder(requested);
      current = requested;
    } else if (!(item instanceof import_obsidian3.TFolder)) {
      throw new Error(`A file blocks the folder path ${requested}.`);
    } else {
      current = item.path;
    }
  }
}
function relativeVaultPath(fromFilePath, toFilePath) {
  const fromParts = dirname(fromFilePath).split("/").filter(Boolean);
  const toParts = (0, import_obsidian3.normalizePath)(toFilePath).split("/").filter(Boolean);
  let common = 0;
  while (common < fromParts.length && common < toParts.length && fromParts[common] === toParts[common]) {
    common += 1;
  }
  const up = Array.from({ length: fromParts.length - common }, () => "..");
  const down = toParts.slice(common);
  const result = [...up, ...down].join("/");
  return result || basename(toFilePath);
}
function encodeMarkdownLinkPath(path) {
  return path.split("/").map((part) => encodeURIComponent(part).replace(/%3A/gi, ":")).join("/");
}

// src/markdown/tables.ts
var HTML_BREAK = /<br\s*\/?>/gi;
var ENCODED_BREAK = /&lt;\s*br\s*\/?\s*&gt;/gi;
var NUMERIC = /^\s*(?:[$€£¥]\s*)?[+-]?(?:\d{1,3}(?:[ ,]\d{3})*|\d+)(?:[.,]\d+)?\s*%?\s*$/;
function cleanTableCell(value) {
  return value.replace(ENCODED_BREAK, "; ").replace(HTML_BREAK, "; ").replace(/\r?\n+/g, "; ").replace(/\\\|/g, "|").replace(/\|/g, "\\|").replace(/\s*;\s*(?:;\s*)+/g, "; ").replace(/\s+/g, " ").trim();
}
function isNumericCell(value) {
  return value.length > 0 && NUMERIC.test(value.replace(/\\\|/g, "|"));
}
function visibleLength(value) {
  return value.replace(/\\\|/g, "|").length;
}
function pad(value, width, right) {
  const difference = Math.max(0, width - visibleLength(value));
  return right ? `${" ".repeat(difference)}${value}` : `${value}${" ".repeat(difference)}`;
}
function splitMarkdownTableRow(value) {
  const row = value.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells = [];
  let current = "";
  let escaped = false;
  let codeTicks = 0;
  for (let index = 0; index < row.length; index += 1) {
    const char = row[index];
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }
    if (char === "\\") {
      current += char;
      escaped = true;
      continue;
    }
    if (char === "`") {
      let run = 1;
      while (row[index + run] === "`") run += 1;
      current += "`".repeat(run);
      if (codeTicks === 0) codeTicks = run;
      else if (codeTicks === run) codeTicks = 0;
      index += run - 1;
      continue;
    }
    if (char === "|" && codeTicks === 0) {
      cells.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current);
  return cells;
}
function formatMarkdownTable(rows) {
  if (rows.length < 2) return "";
  const columnCount = Math.max(...rows.map((row) => row.length));
  const normalized = rows.map(
    (row) => Array.from({ length: columnCount }, (_, index) => {
      var _a;
      return cleanTableCell((_a = row[index]) != null ? _a : "");
    })
  );
  const alignRight = Array.from({ length: columnCount }, (_, index) => {
    const body = normalized.slice(1).map((row) => row[index]).filter(Boolean);
    return body.length > 0 && body.filter(isNumericCell).length / body.length >= 0.7;
  });
  const widths = Array.from({ length: columnCount }, (_, index) => {
    const widest = Math.max(3, ...normalized.map((row) => visibleLength(row[index])));
    return Math.min(80, widest);
  });
  const rowText = (row) => {
    const cells = row.map((cell, index) => pad(cell, widths[index], alignRight[index]));
    return `| ${cells.join(" | ")} |`;
  };
  const separator = `| ${widths.map(
    (width, index) => alignRight[index] ? `${"-".repeat(Math.max(3, width - 1))}:` : "-".repeat(width)
  ).join(" | ")} |`;
  return [rowText(normalized[0]), separator, ...normalized.slice(1).map(rowText)].join("\n");
}
function isSeparatorRow(value) {
  const cells = splitMarkdownTableRow(value);
  return cells.length > 0 && cells.every((cell) => /^\s*:?-{3,}:?\s*$/.test(cell));
}
function normalizeMarkdownTables(markdown) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const output = [];
  let index = 0;
  let fence = null;
  while (index < lines.length) {
    const line = lines[index];
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);
    if (fenceMatch) {
      if (!fence) fence = fenceMatch[1][0];
      else if (fence === fenceMatch[1][0]) fence = null;
      output.push(line);
      index += 1;
      continue;
    }
    if (!fence && /^\s*\|.*\|\s*$/.test(line)) {
      const block = [];
      while (index < lines.length && /^\s*\|.*\|\s*$/.test(lines[index])) {
        block.push(lines[index]);
        index += 1;
      }
      const dataRows = block.filter((item, rowIndex) => rowIndex !== 1 || !isSeparatorRow(item));
      const parsed = dataRows.map(splitMarkdownTableRow);
      output.push(parsed.length >= 2 ? formatMarkdownTable(parsed) : block.join("\n"));
      continue;
    }
    output.push(line);
    index += 1;
  }
  return output.join("\n");
}

// src/markdown/document.ts
var ASSET_PATTERN = /\{\{PDFMD_ASSET:([^}]+)\}\}/g;
function pageMarkdown(page, settings) {
  var _a;
  const parts = [];
  if (settings.includePageHeadings) parts.push(`## Page ${page.page}`);
  for (const block of page.blocks) {
    if (block.kind === "asset" && block.assetId) {
      parts.push(`{{PDFMD_ASSET:${block.assetId}}}`);
    } else if ((_a = block.markdown) == null ? void 0 : _a.trim()) {
      parts.push(block.markdown.trim());
    }
  }
  return parts.join("\n\n").trim();
}
function buildMarkdownTemplate(pages, settings) {
  const value = pages.map((page) => pageMarkdown(page, settings)).filter(Boolean).join("\n\n---\n\n").replace(/\n{3,}/g, "\n\n").trim();
  return normalizeMarkdownTables(value) + (value ? "\n" : "");
}
function resolveAssetPlaceholders(template, resolver) {
  return template.replace(ASSET_PATTERN, (_match, assetId) => resolver(assetId.trim())).replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
function buildPlainPreview(template, assets) {
  const byId = new Map(assets.map((asset) => [asset.id, asset]));
  return resolveAssetPlaceholders(template, (assetId) => {
    const asset = byId.get(assetId);
    if (!asset) return `> [!warning] Missing generated asset: ${assetId}`;
    return `![${asset.alt}](${encodeURI(asset.fileName)})`;
  });
}

// src/links/links.ts
var import_obsidian4 = require("obsidian");

// src/links/syntax.ts
function splitTargetSubpath(value) {
  const hash = value.indexOf("#");
  if (hash < 0) return { target: value, subpath: "" };
  return { target: value.slice(0, hash), subpath: value.slice(hash) };
}
function firstUnescapedPipe(value) {
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] !== "|") continue;
    let backslashes = 0;
    for (let before = index - 1; before >= 0 && value[before] === "\\"; before -= 1) backslashes += 1;
    if (backslashes % 2 === 0) return index;
  }
  return -1;
}
function parseWiki(original) {
  const embed = original.startsWith("![[");
  const start = embed ? 3 : 2;
  if (!embed && !original.startsWith("[[") || !original.endsWith("]]")) return null;
  const inner = original.slice(start, -2);
  const pipe = firstUnescapedPipe(inner);
  const rawTarget = pipe >= 0 ? inner.slice(0, pipe) : inner;
  const alias = pipe >= 0 ? inner.slice(pipe + 1) : "";
  const { target, subpath } = splitTargetSubpath(rawTarget);
  if (!target.trim()) return null;
  return {
    style: "wiki",
    embed,
    target: target.trim(),
    subpath,
    alias,
    hasAlias: pipe >= 0,
    markdownTitle: "",
    angleWrapped: false
  };
}
function findMarkdownDestinationBoundary(value) {
  let escaped = false;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (character === "\\") {
      escaped = true;
      continue;
    }
    if (/\s/.test(character)) return index;
  }
  return value.length;
}
function parseMarkdown(original) {
  const embed = original.startsWith("![");
  const prefixLength = embed ? 2 : 1;
  if (!embed && !original.startsWith("[") || !original.endsWith(")")) return null;
  const labelEnd = original.indexOf("](", prefixLength);
  if (labelEnd < 0) return null;
  const alias = original.slice(prefixLength, labelEnd);
  const inside = original.slice(labelEnd + 2, -1).trim();
  if (!inside) return null;
  let rawTarget = "";
  let markdownTitle = "";
  let angleWrapped = false;
  if (inside.startsWith("<")) {
    const close = inside.indexOf(">");
    if (close < 0) return null;
    rawTarget = inside.slice(1, close);
    markdownTitle = inside.slice(close + 1);
    angleWrapped = true;
  } else {
    const boundary = findMarkdownDestinationBoundary(inside);
    rawTarget = inside.slice(0, boundary);
    markdownTitle = inside.slice(boundary);
  }
  const { target, subpath } = splitTargetSubpath(rawTarget);
  if (!target.trim()) return null;
  return {
    style: "markdown",
    embed,
    target: target.trim(),
    subpath,
    alias,
    hasAlias: true,
    markdownTitle,
    angleWrapped
  };
}
function parseLink(original) {
  var _a;
  return (_a = parseWiki(original)) != null ? _a : parseMarkdown(original);
}
function pdfSubpathToMarkdown(subpath, includePageHeadings) {
  const match = subpath.match(/^#page=(\d+)(?:[&,].*)?$/i);
  if (!match) return subpath;
  return includePageHeadings ? `#Page ${match[1]}` : "";
}
function renderReplacement(reference, wikiTarget, markdownTarget, includePageHeadings) {
  const parsed = parseLink(reference.original);
  if (!parsed) throw new Error(`Unsupported link syntax: ${reference.original}`);
  const subpath = pdfSubpathToMarkdown(parsed.subpath, includePageHeadings);
  if (parsed.style === "wiki") {
    const alias = parsed.hasAlias ? `|${parsed.alias}` : "";
    return `${parsed.embed ? "!" : ""}[[${wikiTarget}${subpath}${alias}]]`;
  }
  const destination = `${markdownTarget}${subpath}`;
  const wrapped = parsed.angleWrapped ? `<${destination}>` : destination;
  return `${parsed.embed ? "!" : ""}[${parsed.alias}](${wrapped}${parsed.markdownTitle})`;
}

// src/links/links.ts
function isInFrontmatter(position, frontmatter) {
  if (!frontmatter) return false;
  return position.start.offset >= frontmatter.start.offset && position.end.offset <= frontmatter.end.offset;
}
function candidateSourcePaths(app, source) {
  const resolvedLinks = app.metadataCache.resolvedLinks;
  return Object.entries(resolvedLinks).filter(([, destinations]) => {
    var _a;
    return ((_a = destinations[source.path]) != null ? _a : 0) > 0;
  }).map(([path]) => path);
}
function sameReference(left, right) {
  return left.start === right.start && left.end === right.end;
}
async function collectLinkPlans(app, source) {
  var _a, _b;
  const plans = [];
  for (const sourcePath of candidateSourcePaths(app, source)) {
    const file = app.vault.getAbstractFileByPath(sourcePath);
    if (!(file instanceof import_obsidian4.TFile) || file.extension.toLowerCase() !== "md") continue;
    const markdownFile = file;
    const content = await app.vault.cachedRead(markdownFile);
    const cache = app.metadataCache.getFileCache(markdownFile);
    if (!cache) continue;
    const entries = [...(_a = cache.links) != null ? _a : [], ...(_b = cache.embeds) != null ? _b : []];
    const references = [];
    for (const entry of entries) {
      if (isInFrontmatter(entry.position, cache.frontmatterPosition)) continue;
      const destination = app.metadataCache.getFirstLinkpathDest(entry.link, sourcePath);
      if ((destination == null ? void 0 : destination.path) !== source.path) continue;
      const start = entry.position.start.offset;
      const end = entry.position.end.offset;
      if (start < 0 || end <= start || end > content.length) continue;
      const original = content.slice(start, end);
      const parsed = parseLink(original);
      if (!parsed) continue;
      const reference = {
        start,
        end,
        original,
        style: parsed.style,
        embed: parsed.embed,
        alias: parsed.alias,
        subpath: parsed.subpath
      };
      if (!references.some((existing) => sameReference(existing, reference))) references.push(reference);
    }
    if (references.length > 0) {
      plans.push({
        file: markdownFile,
        references: references.sort((a, b) => a.start - b.start),
        originalMtime: markdownFile.stat.mtime,
        originalSize: markdownFile.stat.size
      });
    }
  }
  return plans;
}
function wikiTargetFor(app, note, sourceFile, sourcePdf) {
  const sameStem = withoutExtension(note.path).toLowerCase() === withoutExtension(sourcePdf.path).toLowerCase();
  if (sameStem) return note.path;
  return app.metadataCache.fileToLinktext(note, sourceFile.path, true);
}
function applyReferences(content, references, wikiTarget, markdownTarget, includePageHeadings) {
  let output = content;
  for (const reference of [...references].sort((a, b) => b.start - a.start)) {
    const actual = output.slice(reference.start, reference.end);
    if (actual !== reference.original) {
      throw new Error("A PDF link changed after the preview was created.");
    }
    const replacement = renderReplacement(
      reference,
      wikiTarget,
      markdownTarget,
      includePageHeadings
    );
    output = output.slice(0, reference.start) + replacement + output.slice(reference.end);
  }
  return output;
}
async function applyLinkPlans(app, plans, note, sourcePdf, options) {
  const changes = [];
  try {
    for (const plan of plans) {
      if (plan.file.stat.mtime !== plan.originalMtime || plan.file.stat.size !== plan.originalSize) {
        throw new Error(`${plan.file.path} changed after the preview was created.`);
      }
      let before = "";
      let after = "";
      await app.vault.process(plan.file, (content) => {
        before = content;
        const wikiTarget = wikiTargetFor(app, note, plan.file, sourcePdf);
        const markdownTarget = encodeMarkdownLinkPath(relativeVaultPath(plan.file.path, note.path));
        after = applyReferences(
          content,
          plan.references,
          wikiTarget,
          markdownTarget,
          options.includePageHeadings
        );
        return after;
      });
      if (before !== after) changes.push({ file: plan.file, before, after });
    }
    return changes;
  } catch (error) {
    await restoreLinkChanges(app, changes);
    throw error;
  }
}
async function restoreLinkChanges(app, changes) {
  for (const change of [...changes].reverse()) {
    try {
      await app.vault.process(change.file, (current) => current === change.after ? change.before : current);
    } catch (e) {
    }
  }
}

// src/conversion/apply.ts
async function trashGenerated(app, files, folderPath) {
  for (const file of [...files].reverse()) {
    try {
      const current = app.vault.getAbstractFileByPath(file.path);
      if (current) await app.fileManager.trashFile(current);
    } catch (e) {
    }
  }
  if (!folderPath) return;
  try {
    const folder = app.vault.getAbstractFileByPath(folderPath);
    if (folder instanceof import_obsidian5.TFolder && folder.children.length === 0) {
      await app.fileManager.trashFile(folder);
    }
  } catch (e) {
  }
}
function ensurePlanStillCurrent(app, plan) {
  const current = app.vault.getAbstractFileByPath(plan.sourcePath);
  if (current !== plan.source || plan.source.path !== plan.sourcePath || plan.source.stat.mtime !== plan.sourceMtime || plan.source.stat.size !== plan.sourceSize) {
    throw new Error("The PDF changed or moved after the preview was created. Start the conversion again.");
  }
}
async function createAssetFiles(app, plan, note, created) {
  const written = [];
  const byHash = /* @__PURE__ */ new Map();
  const byId = /* @__PURE__ */ new Map();
  for (const asset of plan.assets) {
    const duplicate = byHash.get(asset.hash);
    if (duplicate) {
      byId.set(asset.id, duplicate);
      continue;
    }
    let path;
    if (plan.options.assetLocation === "note-folder") {
      if (!asset.plannedPath) throw new Error(`No output path was prepared for ${asset.fileName}.`);
      path = asset.plannedPath;
      if (app.vault.getAbstractFileByPath(path)) {
        throw new Error(`${path} was created after the preview. Start the conversion again.`);
      }
    } else {
      path = await app.fileManager.getAvailablePathForAttachment(asset.fileName, note.path);
    }
    await ensureFolder(app, dirname(path));
    const file = await app.vault.createBinary(path, asset.bytes);
    created.push(file);
    written.push({ asset, file });
    byHash.set(asset.hash, file);
    byId.set(asset.id, file);
  }
  return { written, byId };
}
function finalMarkdown(app, plan, note, byId) {
  return resolveAssetPlaceholders(plan.markdownTemplate, (assetId) => {
    const file = byId.get(assetId);
    if (!file) return `> [!warning] A generated asset is missing: ${assetId}`;
    return `!${app.fileManager.generateMarkdownLink(file, note.path)}`;
  });
}
async function applySourceAction(app, plan) {
  const warnings = [];
  try {
    if (plan.options.sourceAction === "trash") {
      await app.fileManager.trashFile(plan.source);
    } else if (plan.options.sourceAction === "move" && plan.sourceDestination) {
      if (app.vault.getAbstractFileByPath(plan.sourceDestination)) {
        throw new Error(`${plan.sourceDestination} already exists.`);
      }
      await ensureFolder(app, dirname(plan.sourceDestination));
      await app.fileManager.renameFile(plan.source, plan.sourceDestination);
    }
  } catch (error) {
    warnings.push(
      `The Markdown was saved, but the PDF could not be ${plan.options.sourceAction === "trash" ? "moved to Trash" : "moved"}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
  return warnings;
}
async function applyConversionPlan(app, plan) {
  ensurePlanStillCurrent(app, plan);
  if (app.vault.getAbstractFileByPath(plan.notePath)) {
    throw new Error(`${plan.notePath} was created after the preview. Start the conversion again.`);
  }
  const created = [];
  let linkChanges = [];
  let note = null;
  try {
    await ensureFolder(app, dirname(plan.notePath));
    note = await app.vault.create(plan.notePath, "");
    created.push(note);
    const assetResult = await createAssetFiles(app, plan, note, created);
    await app.vault.modify(note, finalMarkdown(app, plan, note, assetResult.byId));
    if (plan.options.updateLinks && plan.linkFiles.length > 0) {
      linkChanges = await applyLinkPlans(app, plan.linkFiles, note, plan.source, plan.options);
    }
    ensurePlanStillCurrent(app, plan);
    const sourceWarnings = await applySourceAction(app, plan);
    return {
      note,
      assets: assetResult.written.map((entry) => entry.file),
      updatedLinks: plan.metrics.linkCount,
      sourceAction: plan.options.sourceAction,
      warnings: sourceWarnings
    };
  } catch (error) {
    await restoreLinkChanges(app, linkChanges);
    const dedicatedOutputFolder = plan.options.assetLocation === "note-folder" && plan.assets.length > 0 ? plan.outputFolder : "";
    await trashGenerated(app, created, dedicatedOutputFolder);
    throw error;
  }
}

// src/pdf/text.ts
function multiplyTransform(left, right) {
  return [
    left[0] * right[0] + left[2] * right[1],
    left[1] * right[0] + left[3] * right[1],
    left[0] * right[2] + left[2] * right[3],
    left[1] * right[2] + left[3] * right[3],
    left[0] * right[4] + left[2] * right[5] + left[4],
    left[1] * right[4] + left[3] * right[5] + left[5]
  ];
}
function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}
function isBoldFont(fontName) {
  return /(?:bold|black|heavy|semibold|demi)/i.test(fontName);
}
function shouldInsertSpace(previous, current) {
  if (!previous.text || !current.text) return false;
  const gap = current.x - (previous.x + previous.width);
  const threshold = Math.max(1.5, Math.min(previous.fontSize, current.fontSize) * 0.18);
  if (gap <= threshold) return false;
  if (/^[,.;:!?%)\]}]/.test(current.text)) return false;
  if (/[([{/$£€¥]$/.test(previous.text)) return false;
  return true;
}
function joinSpans(spans) {
  const sorted = [...spans].sort((a, b) => a.x - b.x);
  let output = "";
  let previous = null;
  for (const span of sorted) {
    const text = span.text.replace(/\s+/g, " ").trim();
    if (!text) continue;
    if (previous && shouldInsertSpace(previous, span) && !output.endsWith(" ")) output += " ";
    output += text;
    previous = span;
  }
  return output.replace(/\s+([,.;:!?%])/g, "$1").replace(/([([{])\s+/g, "$1").replace(/\s+/g, " ").trim();
}
function toSpan(item, page, index, pageHeight, viewportTransform) {
  var _a, _b, _c, _d, _e, _f;
  const text = (_b = (_a = item.str) == null ? void 0 : _a.replace(/\p{Cc}/gu, "")) != null ? _b : "";
  if (!text.trim()) return null;
  const rawTransform = item.transform;
  if (!rawTransform || rawTransform.length < 6) return null;
  const itemMatrix = rawTransform.slice(0, 6);
  const transform = (viewportTransform == null ? void 0 : viewportTransform.length) === 6 ? multiplyTransform(viewportTransform.slice(0, 6), itemMatrix) : itemMatrix;
  const fontSize = Math.max(
    1,
    Math.hypot(transform[2], transform[3]),
    Math.hypot(transform[0], transform[1]),
    Math.abs((_c = item.height) != null ? _c : 0)
  );
  const width = Math.max(0.1, Math.abs((_d = item.width) != null ? _d : text.length * fontSize * 0.5));
  const height = Math.max(fontSize, Math.abs((_e = item.height) != null ? _e : fontSize));
  const x = transform[4];
  const baseline = transform[5];
  const mappedByViewport = (viewportTransform == null ? void 0 : viewportTransform.length) === 6;
  const y = Math.max(0, mappedByViewport ? baseline - height * 0.82 : pageHeight - baseline - height * 0.82);
  const fontName = (_f = item.fontName) != null ? _f : "";
  return {
    id: `p${page}-s${index}`,
    page,
    text,
    x,
    y,
    width,
    height,
    fontSize,
    fontName,
    bold: isBoldFont(fontName),
    hasEol: Boolean(item.hasEOL)
  };
}
function createLine(group, pageWidth, pageHeight, index) {
  const spans = [...group.spans].sort((a, b) => a.x - b.x);
  const x = Math.min(...spans.map((span) => span.x));
  const right = Math.max(...spans.map((span) => span.x + span.width));
  const y = median(spans.map((span) => span.y));
  const bottom = Math.max(...spans.map((span) => span.y + span.height));
  const fontSize = median(spans.map((span) => span.fontSize));
  return {
    id: `p${spans[0].page}-l${index}`,
    page: spans[0].page,
    spans,
    text: joinSpans(spans),
    x,
    y,
    width: Math.max(0, right - x),
    height: Math.max(fontSize, bottom - y),
    fontSize,
    bold: spans.filter((span) => span.bold).length >= Math.ceil(spans.length / 2),
    pageWidth,
    pageHeight
  };
}
function groupSpansIntoLines(spans, pageWidth, pageHeight) {
  const sorted = [...spans].sort((a, b) => a.y - b.y || a.x - b.x);
  const groups = [];
  for (const span of sorted) {
    let best = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (let index = Math.max(0, groups.length - 8); index < groups.length; index += 1) {
      const group = groups[index];
      const groupFont = median(group.spans.map((item) => item.fontSize)) || span.fontSize;
      const tolerance = Math.max(2, Math.min(groupFont, span.fontSize) * 0.42);
      const distance = Math.abs(group.y - span.y);
      if (distance <= tolerance && distance < bestDistance) {
        best = group;
        bestDistance = distance;
      }
    }
    if (best) {
      best.spans.push(span);
      best.y = median(best.spans.map((item) => item.y));
    } else {
      groups.push({ spans: [span], y: span.y });
    }
  }
  return groups.map((group, index) => createLine(group, pageWidth, pageHeight, index)).filter((line) => line.text.length > 0).sort((a, b) => a.y - b.y || a.x - b.x);
}
async function extractPageText(page, pageNumber) {
  const viewport = page.getViewport({ scale: 1 });
  const content = await page.getTextContent({
    includeMarkedContent: false,
    disableNormalization: false
  });
  const spans = content.items.map(
    (item, index) => toSpan(item, pageNumber, index, viewport.height, viewport.transform)
  ).filter((span) => span !== null);
  const lines = groupSpansIntoLines(spans, viewport.width, viewport.height);
  return {
    page: pageNumber,
    width: viewport.width,
    height: viewport.height,
    spans,
    lines,
    characterCount: lines.reduce((total, line) => total + line.text.length, 0)
  };
}
function findColumnSplit(lines, pageWidth) {
  if (lines.length < 8 || pageWidth <= 0) return null;
  let bestSplit = null;
  let bestScore = 0;
  for (let ratio = 0.3; ratio <= 0.7; ratio += 0.02) {
    const split = pageWidth * ratio;
    const gutter = Math.max(8, pageWidth * 0.012);
    const left = lines.filter((line) => line.x + line.width <= split + gutter).length;
    const right = lines.filter((line) => line.x >= split - gutter).length;
    const crossing = lines.length - left - right;
    if (left < 3 || right < 3) continue;
    if (crossing / lines.length > 0.18) continue;
    const balance = Math.min(left, right) / Math.max(left, right);
    const score = Math.min(left, right) * balance - crossing * 2;
    if (score > bestScore) {
      bestScore = score;
      bestSplit = split;
    }
  }
  return bestSplit;
}
function sortBandByColumns(lines, split) {
  var _a;
  const gutter = Math.max(8, ((_a = lines[0]) == null ? void 0 : _a.pageWidth) * 0.012 || 8);
  const left = lines.filter((line) => line.x + line.width <= split + gutter).sort((a, b) => a.y - b.y || a.x - b.x);
  const right = lines.filter((line) => line.x >= split - gutter).sort((a, b) => a.y - b.y || a.x - b.x);
  const unassigned = lines.filter((line) => !left.includes(line) && !right.includes(line)).sort((a, b) => a.y - b.y || a.x - b.x);
  return [...left, ...right, ...unassigned];
}
function orderLinesForReading(lines, pageWidth) {
  const sorted = [...lines].sort((a, b) => a.y - b.y || a.x - b.x);
  const split = findColumnSplit(sorted, pageWidth);
  if (split === null) return sorted;
  const gutter = Math.max(8, pageWidth * 0.012);
  const fullWidth = sorted.filter((line) => line.x < split - gutter && line.x + line.width > split + gutter);
  if (fullWidth.length === 0) return sortBandByColumns(sorted, split);
  const result = [];
  let previousY = Number.NEGATIVE_INFINITY;
  for (const separator of fullWidth.sort((a, b) => a.y - b.y)) {
    const band = sorted.filter(
      (line) => !fullWidth.includes(line) && line.y >= previousY && line.y < separator.y
    );
    result.push(...sortBandByColumns(band, split), separator);
    previousY = separator.y + Math.max(1, separator.height * 0.2);
  }
  const tail = sorted.filter((line) => !fullWidth.includes(line) && line.y >= previousY);
  result.push(...sortBandByColumns(tail, split));
  return result;
}
function marginSignature(text) {
  return text.toLowerCase().replace(/\d+/g, "#").replace(/[^\p{L}\p{N}#]+/gu, " ").replace(/\s+/g, " ").trim();
}
function removeRepeatedMargins(pages, enabled) {
  var _a;
  if (!enabled || pages.length < 3) return pages;
  const counts = /* @__PURE__ */ new Map();
  for (const page of pages) {
    const signatures = /* @__PURE__ */ new Set();
    for (const line of page.lines) {
      const inMargin = line.y <= page.height * 0.12 || line.y + line.height >= page.height * 0.88;
      if (!inMargin) continue;
      const signature = marginSignature(line.text);
      if (signature.length >= 1 && signature.length <= 160) signatures.add(signature);
    }
    for (const signature of signatures) counts.set(signature, ((_a = counts.get(signature)) != null ? _a : 0) + 1);
  }
  const threshold = Math.max(2, Math.ceil(pages.length * 0.55));
  const repeated = new Set(
    [...counts.entries()].filter(([, count]) => count >= threshold).map(([signature]) => signature)
  );
  if (repeated.size === 0) return pages;
  return pages.map((page) => {
    const lines = page.lines.filter((line) => {
      const inMargin = line.y <= page.height * 0.12 || line.y + line.height >= page.height * 0.88;
      return !inMargin || !repeated.has(marginSignature(line.text));
    });
    return {
      ...page,
      lines,
      characterCount: lines.reduce((total, line) => total + line.text.length, 0)
    };
  });
}
function estimateBodyFontSize(pages) {
  const sizes = [];
  for (const page of pages) {
    for (const line of page.lines) {
      if (line.text.length > 8 && line.fontSize > 0) sizes.push(line.fontSize);
    }
  }
  const value = median(sizes);
  return value > 0 ? value : 12;
}

// src/markdown/page.ts
var LIST_PATTERN = /^\s*((?:\d+|[A-Za-z])[.)]|[•◦▪‣●○■□–—-])\s+(.*)$/;
var CJK_END = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]$/u;
var CJK_START = /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;
function normalizeText(value) {
  return value.replace(/[\u00ad\u200b\ufeff]/g, "").replace(/\s+/g, " ").replace(/\s+([,.;:!?%])/g, "$1").trim();
}
function headingLevel(line, bodyFontSize) {
  const text = normalizeText(line.text);
  if (!text || text.length > 180) return null;
  const ratio = line.fontSize / Math.max(1, bodyFontSize);
  if (ratio >= 1.6 && text.length <= 120) return 1;
  if (ratio >= 1.34 && text.length <= 150) return 2;
  if (ratio >= 1.16 && line.bold && text.length <= 180) return 3;
  return null;
}
function listLine(value) {
  const match = normalizeText(value).match(LIST_PATTERN);
  if (!match) return null;
  const rawMarker = match[1];
  const numeric = rawMarker.match(/^(\d+)[.)]$/);
  return {
    marker: numeric ? `${numeric[1]}.` : "-",
    text: match[2]
  };
}
function needsParagraphBreak(previous, current, bodyFontSize) {
  const verticalGap = current.y - (previous.y + previous.height);
  if (verticalGap < -bodyFontSize) return true;
  if (verticalGap > Math.max(bodyFontSize * 0.85, previous.height * 0.9)) return true;
  const indentChange = Math.abs(current.x - previous.x);
  if (indentChange > bodyFontSize * 2.4 && verticalGap > bodyFontSize * 0.15) return true;
  if (previous.bold !== current.bold && verticalGap > bodyFontSize * 0.35) return true;
  return false;
}
function joinParagraphText(previous, next) {
  if (!previous) return next;
  if (!next) return previous;
  if (/\p{L}-$/u.test(previous) && /^\p{Ll}/u.test(next)) return `${previous.slice(0, -1)}${next}`;
  if (CJK_END.test(previous) && CJK_START.test(next)) return `${previous}${next}`;
  if (["(", "[", "{", "/"].includes(previous.slice(-1)) || /^[,.;:!?%)]/.test(next)) {
    return `${previous}${next}`;
  }
  return `${previous} ${next}`;
}
function insertionOrder(y, orderedLines) {
  let order = 0;
  for (let index = 0; index < orderedLines.length; index += 1) {
    if (orderedLines[index].y <= y) order = index + 0.5;
  }
  return order;
}
function renderTextBlocks(lines, bodyFontSize) {
  const blocks = [];
  let paragraph = null;
  let list = null;
  let previousParagraphLine = null;
  const flushParagraph = () => {
    if (!paragraph) return;
    const text = paragraph.lines.reduce((value, line) => joinParagraphText(value, line), "");
    if (text) blocks.push({ kind: "markdown", order: paragraph.order, markdown: text });
    paragraph = null;
    previousParagraphLine = null;
  };
  const flushList = () => {
    if (!list) return;
    blocks.push({ kind: "markdown", order: list.order, markdown: list.lines.join("\n") });
    list = null;
  };
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const text = normalizeText(line.text);
    if (!text) continue;
    const level = headingLevel(line, bodyFontSize);
    if (level !== null) {
      flushParagraph();
      flushList();
      blocks.push({ kind: "markdown", order: index, markdown: `${"#".repeat(level)} ${text}` });
      continue;
    }
    const listItem = listLine(text);
    if (listItem) {
      flushParagraph();
      if (!list) list = { order: index, lines: [] };
      list.lines.push(`${listItem.marker} ${listItem.text}`);
      continue;
    }
    flushList();
    if (paragraph && previousParagraphLine && needsParagraphBreak(previousParagraphLine, line, bodyFontSize)) {
      flushParagraph();
    }
    if (!paragraph) paragraph = { order: index, lines: [] };
    paragraph.lines.push(text);
    previousParagraphLine = line;
  }
  flushParagraph();
  flushList();
  return blocks;
}
function buildPageBlocks(lines, pageWidth, tables, assets, bodyFontSize, settings) {
  const consumed = new Set(tables.flatMap((table) => table.consumedLineIds));
  const remaining = lines.filter((line) => !consumed.has(line.id));
  const orderedLines = orderLinesForReading(remaining, pageWidth);
  const blocks = renderTextBlocks(orderedLines, bodyFontSize);
  for (const table of tables) {
    const parts = [];
    if (settings.tableOutput === "markdown" || settings.tableOutput === "both") {
      parts.push(formatMarkdownTable(table.rows));
    }
    if (settings.tableOutput === "svg" || settings.tableOutput === "both") {
      parts.push(`{{PDFMD_ASSET:${table.id}}}`);
    }
    if (parts.length > 0) {
      blocks.push({
        kind: "markdown",
        order: insertionOrder(table.bounds.y, orderedLines),
        markdown: parts.join("\n\n")
      });
    }
  }
  for (const asset of assets) {
    if (asset.kind === "table") continue;
    blocks.push({
      kind: "asset",
      order: insertionOrder(asset.bounds.y, orderedLines) + asset.index / 1e3,
      assetId: asset.id
    });
  }
  return blocks.sort((a, b) => a.order - b.order);
}

// src/svg/table-svg.ts
var FONT_SIZE = 14;
var LINE_HEIGHT = 19;
var PADDING_X = 10;
var PADDING_Y = 8;
var MIN_COLUMN_WIDTH = 90;
var MAX_COLUMN_WIDTH = 300;
var MAX_TABLE_WIDTH = 1200;
function escapeXml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function estimateColumnWidths(rows) {
  const columns = Math.max(...rows.map((row) => row.length));
  const widths = Array.from({ length: columns }, (_, column) => {
    const longest = Math.max(0, ...rows.map((row) => {
      var _a;
      return ((_a = row[column]) != null ? _a : "").length;
    }));
    return Math.max(MIN_COLUMN_WIDTH, Math.min(MAX_COLUMN_WIDTH, longest * 7.2 + PADDING_X * 2));
  });
  const total = widths.reduce((sum, width) => sum + width, 0);
  if (total <= MAX_TABLE_WIDTH) return widths;
  const scale = MAX_TABLE_WIDTH / total;
  return widths.map((width) => Math.max(70, Math.floor(width * scale)));
}
function wrapText(value, maxWidth) {
  const maxCharacters = Math.max(4, Math.floor((maxWidth - PADDING_X * 2) / 7.2));
  const words = value.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (words.length === 0) return [""];
  const lines = [];
  let current = "";
  for (const word of words) {
    if (word.length > maxCharacters) {
      if (current) {
        lines.push(current);
        current = "";
      }
      for (let index = 0; index < word.length; index += maxCharacters) {
        lines.push(word.slice(index, index + maxCharacters));
      }
      continue;
    }
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxCharacters) current = next;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}
function generateTableSvg(table) {
  const widths = estimateColumnWidths(table.rows);
  const wrappedRows = table.rows.map(
    (row) => widths.map((width, column) => {
      var _a;
      return wrapText((_a = row[column]) != null ? _a : "", width);
    })
  );
  const heights = wrappedRows.map((row) => {
    const lineCount = Math.max(1, ...row.map((cell) => cell.length));
    return lineCount * LINE_HEIGHT + PADDING_Y * 2;
  });
  const totalWidth = widths.reduce((sum, width) => sum + width, 0);
  const totalHeight = heights.reduce((sum, height) => sum + height, 0);
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(totalWidth)}" height="${Math.ceil(totalHeight)}" viewBox="0 0 ${Math.ceil(totalWidth)} ${Math.ceil(totalHeight)}" role="img" aria-labelledby="title">`,
    `<title id="title">Table from page ${table.page}</title>`,
    "<style>rect{fill:#fff;stroke:#c8ccd0;stroke-width:1}rect.h{fill:#f2f3f5}text{fill:#202124;font:14px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}text.h{font-weight:600}@media(prefers-color-scheme:dark){rect{fill:#202225;stroke:#565a60}rect.h{fill:#2b2e33}text{fill:#eceff1}}</style>"
  ];
  let y = 0;
  for (let row = 0; row < wrappedRows.length; row += 1) {
    let x = 0;
    for (let column = 0; column < widths.length; column += 1) {
      const width = widths[column];
      const height = heights[row];
      const className = row === 0 ? ' class="h"' : "";
      parts.push(`<rect${className} x="${x}" y="${y}" width="${width}" height="${height}"/>`);
      const lines = wrappedRows[row][column];
      for (let line = 0; line < lines.length; line += 1) {
        const textY = y + PADDING_Y + FONT_SIZE + line * LINE_HEIGHT;
        parts.push(`<text${className} x="${x + PADDING_X}" y="${textY}">${escapeXml(lines[line])}</text>`);
      }
      x += width;
    }
    y += heights[row];
  }
  parts.push("</svg>");
  return parts.join("");
}
function svgToArrayBuffer(svg) {
  const bytes = new TextEncoder().encode(svg);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

// src/pdf/dimensions.ts
var MAX_CANVAS_PIXELS = 16e6;
function fitImageDimensions(sourceWidth, sourceHeight, maxDimension, options = {}) {
  var _a, _b;
  const width = Math.max(1, sourceWidth);
  const height = Math.max(1, sourceHeight);
  const longestEdge = Math.max(width, height);
  const requestedScale = Math.max(1, maxDimension) / longestEdge;
  const edgeScale = options.allowUpscale ? requestedScale : Math.min(1, requestedScale);
  const maxScale = Math.max(0.01, (_a = options.maxScale) != null ? _a : Number.POSITIVE_INFINITY);
  const maxPixels = Math.max(1, (_b = options.maxPixels) != null ? _b : MAX_CANVAS_PIXELS);
  const pixelScale = Math.sqrt(maxPixels / Math.max(1, width * height));
  const scale = Math.max(1e-9, Math.min(edgeScale, maxScale, pixelScale));
  return {
    width: Math.max(1, Math.floor(width * scale)),
    height: Math.max(1, Math.floor(height * scale)),
    scale,
    pixelLimited: pixelScale < Math.min(edgeScale, maxScale)
  };
}

// src/pdf/pixels.ts
function kindMatches(kind, expected) {
  return typeof kind === "number" && typeof expected === "number" && kind === expected;
}
function classifyRawPixels(byteLength, width, height, kind, kinds) {
  const pixels = width * height;
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width <= 0 || height <= 0 || !Number.isSafeInteger(pixels) || pixels <= 0) {
    return null;
  }
  const rgbaBytes = pixels * 4;
  const rgbBytes = pixels * 3;
  const grayBytes = pixels;
  const bitBytes = Math.ceil(width / 8) * height;
  if (kindMatches(kind, kinds.RGBA_32BPP)) return byteLength >= rgbaBytes ? "rgba" : null;
  if (kindMatches(kind, kinds.RGB_24BPP)) return byteLength >= rgbBytes ? "rgb" : null;
  if (kindMatches(kind, kinds.GRAYSCALE_1BPP)) return byteLength >= bitBytes ? "gray1" : null;
  if (byteLength >= rgbaBytes) return "rgba";
  if (byteLength >= rgbBytes) return "rgb";
  if (byteLength >= grayBytes) return "gray8";
  if (byteLength >= bitBytes) return "gray1";
  return null;
}
function sampleCoordinate(targetIndex, targetSize, sourceSize) {
  if (targetSize <= 1 || sourceSize <= 1) return 0;
  return Math.min(sourceSize - 1, Math.floor((targetIndex + 0.5) * sourceSize / targetSize));
}

// src/pdf/dom.ts
function getActiveDocument() {
  var _a, _b, _c;
  const host = window;
  return (_c = (_b = host.activeDocument) != null ? _b : (_a = host.activeWindow) == null ? void 0 : _a.document) != null ? _c : document;
}
function getActiveWindow() {
  var _a, _b;
  const host = window;
  return (_b = (_a = host.activeWindow) != null ? _a : getActiveDocument().defaultView) != null ? _b : window;
}

// src/pdf/image-canvas.ts
function createCanvas(width, height) {
  const canvas = getActiveDocument().createEl("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

// src/pdf/image-decode.ts
function toUint8Array(value) {
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) {
    const view = value;
    return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
  }
  return Uint8Array.from(value);
}
function makeImageData(raw, pdfjs, maxDimension) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
  const sourceWidth = Math.round((_a = raw.width) != null ? _a : 0);
  const sourceHeight = Math.round((_b = raw.height) != null ? _b : 0);
  if (!raw.data || sourceWidth <= 0 || sourceHeight <= 0) return null;
  const source = toUint8Array(raw.data);
  const layout = classifyRawPixels(
    source.byteLength,
    sourceWidth,
    sourceHeight,
    raw.kind,
    (_c = pdfjs.ImageKind) != null ? _c : {}
  );
  if (!layout) return null;
  const fitted = fitImageDimensions(sourceWidth, sourceHeight, maxDimension);
  const rgba = new Uint8ClampedArray(fitted.width * fitted.height * 4);
  const bitStride = Math.ceil(sourceWidth / 8);
  for (let targetY = 0; targetY < fitted.height; targetY += 1) {
    const sourceY = sampleCoordinate(targetY, fitted.height, sourceHeight);
    for (let targetX = 0; targetX < fitted.width; targetX += 1) {
      const sourceX = sampleCoordinate(targetX, fitted.width, sourceWidth);
      const sourcePixel = sourceY * sourceWidth + sourceX;
      const targetPixel = (targetY * fitted.width + targetX) * 4;
      if (layout === "rgba") {
        const offset = sourcePixel * 4;
        rgba[targetPixel] = (_d = source[offset]) != null ? _d : 0;
        rgba[targetPixel + 1] = (_e = source[offset + 1]) != null ? _e : 0;
        rgba[targetPixel + 2] = (_f = source[offset + 2]) != null ? _f : 0;
        rgba[targetPixel + 3] = (_g = source[offset + 3]) != null ? _g : 255;
      } else if (layout === "rgb") {
        const offset = sourcePixel * 3;
        rgba[targetPixel] = (_h = source[offset]) != null ? _h : 0;
        rgba[targetPixel + 1] = (_i = source[offset + 1]) != null ? _i : 0;
        rgba[targetPixel + 2] = (_j = source[offset + 2]) != null ? _j : 0;
        rgba[targetPixel + 3] = 255;
      } else if (layout === "gray8") {
        const value = (_k = source[sourcePixel]) != null ? _k : 0;
        rgba[targetPixel] = value;
        rgba[targetPixel + 1] = value;
        rgba[targetPixel + 2] = value;
        rgba[targetPixel + 3] = 255;
      } else {
        const byte = (_l = source[sourceY * bitStride + Math.floor(sourceX / 8)]) != null ? _l : 0;
        const value = byte & 1 << 7 - sourceX % 8 ? 255 : 0;
        rgba[targetPixel] = value;
        rgba[targetPixel + 1] = value;
        rgba[targetPixel + 2] = value;
        rgba[targetPixel + 3] = 255;
      }
    }
  }
  const ImageDataConstructor = (_m = getActiveDocument().defaultView) == null ? void 0 : _m.ImageData;
  if (!ImageDataConstructor) return null;
  return {
    imageData: new ImageDataConstructor(rgba, fitted.width, fitted.height),
    pixelLimited: fitted.pixelLimited,
    sourceWidth,
    sourceHeight
  };
}
function sourceDimensions(value) {
  var _a, _b, _c, _d, _e, _f;
  if (!value || typeof value !== "object") return null;
  const source = value;
  const width = (_c = (_b = (_a = source.naturalWidth) != null ? _a : source.displayWidth) != null ? _b : source.width) != null ? _c : 0;
  const height = (_f = (_e = (_d = source.naturalHeight) != null ? _d : source.displayHeight) != null ? _e : source.height) != null ? _f : 0;
  return Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0 ? { width, height } : null;
}
function rawImageCandidate(value) {
  if (!value || typeof value !== "object") return null;
  const candidate = value;
  return candidate.data && candidate.width && candidate.height ? candidate : null;
}
function memoryWarning(pixelLimited) {
  return pixelLimited ? `Very large images are limited to ${Math.round(MAX_CANVAS_PIXELS / 1e6)} megapixels to protect memory.` : void 0;
}
function imageToCanvas(value, pdfjs, maxDimension) {
  if (value && typeof value === "object" && "bitmap" in value) {
    const bitmap = value.bitmap;
    if (bitmap && bitmap !== value) {
      const decodedBitmap = imageToCanvas(bitmap, pdfjs, maxDimension);
      if (decodedBitmap) return decodedBitmap;
    }
  }
  const raw = rawImageCandidate(value);
  if (raw) {
    const decoded = makeImageData(raw, pdfjs, maxDimension);
    if (!decoded) return null;
    const canvas2 = createCanvas(decoded.imageData.width, decoded.imageData.height);
    const context2 = canvas2.getContext("2d", { alpha: true });
    if (!context2) return null;
    context2.putImageData(decoded.imageData, 0, 0);
    return {
      canvas: canvas2,
      sourceWidth: decoded.sourceWidth,
      sourceHeight: decoded.sourceHeight,
      warning: memoryWarning(decoded.pixelLimited)
    };
  }
  const dimensions = sourceDimensions(value);
  if (!dimensions) return null;
  const fitted = fitImageDimensions(dimensions.width, dimensions.height, maxDimension);
  const canvas = createCanvas(fitted.width, fitted.height);
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return null;
  try {
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(value, 0, 0, fitted.width, fitted.height);
    return {
      canvas,
      sourceWidth: dimensions.width,
      sourceHeight: dimensions.height,
      warning: memoryWarning(fitted.pixelLimited)
    };
  } catch (e) {
    canvas.width = 1;
    canvas.height = 1;
    return null;
  }
}

// src/pdf/image-encode.ts
function dataUrlToBlob(value) {
  const match = value.match(/^data:([^;,]+)?(?:;base64)?,(.*)$/s);
  if (!match) return null;
  const mime = match[1] || "application/octet-stream";
  try {
    const binary = getActiveWindow().atob(match[2]);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return new Blob([bytes], { type: mime });
  } catch (e) {
    return null;
  }
}
function canvasToBlob(canvas, mime, quality) {
  if (typeof canvas.toBlob === "function") {
    return new Promise((resolve) => canvas.toBlob(resolve, mime, quality));
  }
  try {
    return Promise.resolve(dataUrlToBlob(canvas.toDataURL(mime, quality)));
  } catch (e) {
    return Promise.resolve(null);
  }
}
function requestedEncoding(format) {
  if (format === "png") return { mime: "image/png", extension: "png" };
  if (format === "jpeg") return { mime: "image/jpeg", extension: "jpg" };
  return { mime: "image/webp", extension: "webp" };
}
function hasImageSignature(bytes, extension) {
  const value = new Uint8Array(bytes);
  if (extension === "png") {
    const signature = [137, 80, 78, 71, 13, 10, 26, 10];
    return signature.every((byte, index) => value[index] === byte);
  }
  if (extension === "jpg") {
    return value.length >= 3 && value[0] === 255 && value[1] === 216 && value[2] === 255;
  }
  return value.length >= 12 && String.fromCharCode(...value.slice(0, 4)) === "RIFF" && String.fromCharCode(...value.slice(8, 12)) === "WEBP";
}
async function encodeCanvas(source, format, quality, maxDimension) {
  const fitted = fitImageDimensions(source.width, source.height, maxDimension);
  const { width, height } = fitted;
  const canReuseSource = format !== "jpeg" && source.width === width && source.height === height;
  const target = canReuseSource ? source : createCanvas(width, height);
  if (!canReuseSource) {
    const context = target.getContext("2d", { alpha: format !== "jpeg" });
    if (!context) {
      target.width = 1;
      target.height = 1;
      throw new Error("The image canvas could not be created.");
    }
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    if (format === "jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
    }
    context.drawImage(source, 0, 0, width, height);
  }
  const requested = requestedEncoding(format);
  const warnings = [];
  if (fitted.pixelLimited) {
    warnings.push(`Very large images are limited to ${Math.round(MAX_CANVAS_PIXELS / 1e6)} megapixels to protect memory.`);
  }
  try {
    let blob = await canvasToBlob(target, requested.mime, format === "png" ? void 0 : quality);
    if (!blob) throw new Error("The image encoder returned no data.");
    let bytes = await blob.arrayBuffer();
    let mime = requested.mime;
    let extension = requested.extension;
    if (!hasImageSignature(bytes, requested.extension)) {
      if (format === "png") throw new Error("The PNG encoder returned an unknown file format.");
      blob = await canvasToBlob(target, "image/png");
      if (!blob) throw new Error(`${requested.mime} and PNG encoding both failed.`);
      bytes = await blob.arrayBuffer();
      if (!hasImageSignature(bytes, "png")) throw new Error("The image encoder returned an unknown file format.");
      mime = "image/png";
      extension = "png";
      warnings.push(`${format === "webp" ? "WebP" : "JPEG"} is not available on this platform. The image was saved as PNG.`);
    }
    return {
      bytes,
      mime,
      extension,
      width,
      height,
      warning: warnings.length > 0 ? warnings.join(" ") : void 0
    };
  } finally {
    if (!canReuseSource) {
      target.width = 1;
      target.height = 1;
    }
  }
}
async function hashBytes(bytes) {
  try {
    const digest = await getActiveWindow().crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("");
  } catch (e) {
    let fnv = 2166136261;
    let djb = 5381;
    for (const value of new Uint8Array(bytes)) {
      fnv ^= value;
      fnv = Math.imul(fnv, 16777619);
      djb = Math.imul(djb, 33) ^ value;
    }
    const size = bytes.byteLength.toString(16).padStart(8, "0");
    const first = (fnv >>> 0).toString(16).padStart(8, "0");
    const second = (djb >>> 0).toString(16).padStart(8, "0");
    return `fallback-${size}-${first}-${second}`;
  }
}

// src/pdf/image-geometry.ts
var IDENTITY = [1, 0, 0, 1, 0, 0];
function multiply(left, right) {
  const [a1, b1, c1, d1, e1, f1] = left;
  const [a2, b2, c2, d2, e2, f2] = right;
  return [
    a1 * a2 + c1 * b2,
    b1 * a2 + d1 * b2,
    a1 * c2 + c1 * d2,
    b1 * c2 + d1 * d2,
    a1 * e2 + c1 * f2 + e1,
    b1 * e2 + d1 * f2 + f1
  ];
}
function applyMatrix(matrix, x, y) {
  return {
    x: matrix[0] * x + matrix[2] * y + matrix[4],
    y: matrix[1] * x + matrix[3] * y + matrix[5]
  };
}
function imageBounds(matrix, viewport) {
  var _a, _b;
  const mapped = ((_a = viewport.transform) == null ? void 0 : _a.length) === 6 ? multiply(viewport.transform.slice(0, 6), matrix) : matrix;
  const points = [
    applyMatrix(mapped, 0, 0),
    applyMatrix(mapped, 1, 0),
    applyMatrix(mapped, 0, 1),
    applyMatrix(mapped, 1, 1)
  ];
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  return {
    x: minX,
    y: ((_b = viewport.transform) == null ? void 0 : _b.length) === 6 ? Math.max(0, minY) : Math.max(0, viewport.height - maxY),
    width: Math.max(0, maxX - minX),
    height: Math.max(0, maxY - minY)
  };
}
function transformFromArgs(args) {
  if (args.length < 6 || !args.slice(0, 6).every((value) => typeof value === "number")) return null;
  return args.slice(0, 6);
}

// src/pdf/pdfjs.ts
var import_obsidian6 = require("obsidian");
var CancelledError = class extends Error {
  constructor(message = "Conversion cancelled.") {
    super(message);
    this.name = "CancelledError";
  }
};
var CancellationController = class {
  constructor() {
    this.value = false;
  }
  get cancelled() {
    return this.value;
  }
  cancel() {
    this.value = true;
  }
};
function throwIfCancelled(token) {
  if (token.cancelled) throw new CancelledError();
}
async function yieldToInterface() {
  const timerWindow = getActiveWindow();
  await new Promise((resolve) => {
    if (typeof timerWindow.requestAnimationFrame === "function") {
      timerWindow.requestAnimationFrame(() => resolve());
    } else {
      window.setTimeout(resolve, 0);
    }
  });
}
function destroyLoadingTask(task) {
  var _a;
  const result = (_a = task.destroy) == null ? void 0 : _a.call(task);
  if (result) void result.catch(() => void 0);
}
function isRecord2(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isPdfJsLibrary(value) {
  return isRecord2(value) && typeof value.getDocument === "function" && isRecord2(value.OPS);
}
async function openPdfDocument(bytes, passwordProvider) {
  const loadedPdfJs = await (0, import_obsidian6.loadPdfJs)();
  if (!isPdfJsLibrary(loadedPdfJs)) {
    throw new Error("Obsidian's PDF engine is unavailable.");
  }
  const pdfjs = loadedPdfJs;
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(bytes),
    isEvalSupported: false,
    useSystemFonts: true,
    stopAtErrors: false,
    enableXfa: false,
    enableScripting: false
  });
  let passwordCancelled = false;
  if (passwordProvider) {
    loadingTask.onPassword = (updatePassword, reason) => {
      var _a;
      const incorrect = reason === ((_a = pdfjs.PasswordResponses) == null ? void 0 : _a.INCORRECT_PASSWORD);
      void passwordProvider(incorrect).then((password) => {
        if (password === null) {
          passwordCancelled = true;
          destroyLoadingTask(loadingTask);
          return;
        }
        updatePassword(password);
      }).catch(() => {
        passwordCancelled = true;
        destroyLoadingTask(loadingTask);
      });
    };
  }
  try {
    return {
      pdfjs,
      document: await loadingTask.promise
    };
  } catch (error) {
    if (passwordCancelled) throw new CancelledError("PDF password entry was cancelled.");
    throw error;
  }
}

// src/pdf/page-snapshot.ts
async function renderPageSnapshot(page, pageNumber, settings, token) {
  throwIfCancelled(token);
  const base = page.getViewport({ scale: 1 });
  const fitted = fitImageDimensions(base.width, base.height, settings.maxImageDimension, {
    allowUpscale: true,
    maxScale: 4
  });
  const viewport = page.getViewport({ scale: fitted.scale });
  const canvas = createCanvas(fitted.width, fitted.height);
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error(`Page ${pageNumber}: the page canvas could not be created.`);
  const renderTask = page.render({
    canvas,
    canvasContext: context,
    viewport,
    intent: "display",
    background: "#ffffff"
  });
  const renderWindow = getActiveWindow();
  const cancellationPoll = renderWindow.setInterval(() => {
    var _a;
    if (token.cancelled) (_a = renderTask.cancel) == null ? void 0 : _a.call(renderTask);
  }, 50);
  try {
    await renderTask.promise;
  } catch (error) {
    throwIfCancelled(token);
    throw error;
  } finally {
    renderWindow.clearInterval(cancellationPoll);
  }
  throwIfCancelled(token);
  try {
    const encoded = await encodeCanvas(
      canvas,
      settings.imageFormat,
      settings.imageQuality,
      settings.maxImageDimension
    );
    const hash = await hashBytes(encoded.bytes);
    const snapshotWarnings = [
      fitted.pixelLimited ? `Very large pages are limited to ${Math.round(MAX_CANVAS_PIXELS / 1e6)} megapixels to protect memory.` : void 0,
      encoded.warning
    ].filter((value) => Boolean(value));
    return {
      asset: {
        id: `page-${pageNumber}`,
        kind: "page",
        page: pageNumber,
        index: 1,
        bounds: { x: 0, y: 0, width: base.width, height: base.height },
        width: encoded.width,
        height: encoded.height,
        mime: encoded.mime,
        extension: encoded.extension,
        bytes: encoded.bytes,
        hash,
        fileName: `Page ${pageNumber}.${encoded.extension}`,
        alt: `Page ${pageNumber}`
      },
      warning: snapshotWarnings.length > 0 ? snapshotWarnings.join(" ") : void 0
    };
  } finally {
    canvas.width = 1;
    canvas.height = 1;
  }
}

// src/pdf/images.ts
function objectStoreHasValue(store, id) {
  if (typeof store.has !== "function") return false;
  try {
    return store.has(id);
  } catch (e) {
    return false;
  }
}
function getPdfObject(stores, id, timeoutMs = 1200) {
  const available = stores.filter((store) => Boolean(store));
  if (available.length === 0) return Promise.resolve(null);
  const resolved = available.filter((store) => objectStoreHasValue(store, id));
  const candidates = resolved.length > 0 ? resolved : available;
  return new Promise((resolve) => {
    let settled = false;
    let failed = 0;
    const finish = (value) => {
      if (settled || value === void 0 || value === null) return;
      settled = true;
      window.clearTimeout(timer);
      resolve(value);
    };
    const fail = () => {
      failed += 1;
      if (!settled && failed >= candidates.length) {
        settled = true;
        window.clearTimeout(timer);
        resolve(null);
      }
    };
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve(null);
    }, timeoutMs);
    for (const store of candidates) {
      try {
        const immediate = store.get(id, finish);
        if (immediate !== void 0 && immediate !== null) finish(immediate);
      } catch (e) {
        fail();
      }
    }
  });
}
function pdfObjectId(value) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  return "";
}
async function extractPageImages(pdfjs, page, pageNumber, settings, token) {
  var _a, _b;
  if (!settings.extractImages) return { assets: [], warnings: [] };
  const viewport = page.getViewport({ scale: 1 });
  const operatorList = await page.getOperatorList();
  const ops = pdfjs.OPS;
  const imageOps = new Set(
    [ops.paintImageXObject, ops.paintInlineImageXObject, ops.paintJpegXObject].filter(
      (value) => typeof value === "number"
    )
  );
  const assets = [];
  const warnings = [];
  const stack = [];
  const seenPlacements = /* @__PURE__ */ new Set();
  const encodedByObject = /* @__PURE__ */ new Map();
  let matrix = [...IDENTITY];
  let imageIndex = 1;
  for (let index = 0; index < operatorList.fnArray.length; index += 1) {
    throwIfCancelled(token);
    const operation = operatorList.fnArray[index];
    const args = (_a = operatorList.argsArray[index]) != null ? _a : [];
    if (operation === ops.save) {
      stack.push([...matrix]);
      continue;
    }
    if (operation === ops.restore) {
      matrix = (_b = stack.pop()) != null ? _b : [...IDENTITY];
      continue;
    }
    if (operation === ops.transform) {
      const transform = transformFromArgs(args);
      if (transform) matrix = multiply(matrix, transform);
      continue;
    }
    if (!imageOps.has(operation)) continue;
    const inline = operation === ops.paintInlineImageXObject;
    const objectId = inline ? `inline-${index}` : pdfObjectId(args[0]);
    if (!inline && !objectId) continue;
    const placementKey = `${objectId}:${matrix.map((value2) => Math.round(value2 * 10) / 10).join(",")}`;
    if (seenPlacements.has(placementKey)) continue;
    seenPlacements.add(placementKey);
    const cached = inline ? void 0 : encodedByObject.get(objectId);
    if (cached) {
      assets.push({
        id: `image-${pageNumber}-${imageIndex}`,
        kind: "image",
        page: pageNumber,
        index: imageIndex,
        bounds: imageBounds(matrix, viewport),
        width: cached.width,
        height: cached.height,
        mime: cached.mime,
        extension: cached.extension,
        bytes: cached.bytes,
        hash: cached.hash,
        fileName: `Figure ${pageNumber}-${imageIndex}.${cached.extension}`,
        alt: `Figure from page ${pageNumber}`
      });
      if (cached.warning && !warnings.includes(cached.warning)) warnings.push(cached.warning);
      imageIndex += 1;
      continue;
    }
    let value;
    if (inline) {
      value = args[0];
    } else {
      value = await getPdfObject([page.objs, page.commonObjs], objectId);
    }
    if (!value) continue;
    const decoded = imageToCanvas(value, pdfjs, settings.maxImageDimension);
    if (!decoded) {
      warnings.push(`Page ${pageNumber}: one embedded image could not be decoded.`);
      continue;
    }
    const source = decoded.canvas;
    if (decoded.warning && !warnings.includes(decoded.warning)) warnings.push(decoded.warning);
    if (Math.min(decoded.sourceWidth, decoded.sourceHeight) < settings.minImageDimension) {
      source.width = 1;
      source.height = 1;
      continue;
    }
    try {
      const encoded = await encodeCanvas(
        source,
        settings.imageFormat,
        settings.imageQuality,
        settings.maxImageDimension
      );
      const hash = await hashBytes(encoded.bytes);
      if (!inline) {
        encodedByObject.set(objectId, { ...encoded, hash });
      }
      const bounds = imageBounds(matrix, viewport);
      assets.push({
        id: `image-${pageNumber}-${imageIndex}`,
        kind: "image",
        page: pageNumber,
        index: imageIndex,
        bounds,
        width: encoded.width,
        height: encoded.height,
        mime: encoded.mime,
        extension: encoded.extension,
        bytes: encoded.bytes,
        hash,
        fileName: `Figure ${pageNumber}-${imageIndex}.${encoded.extension}`,
        alt: `Figure from page ${pageNumber}`
      });
      if (encoded.warning && !warnings.includes(encoded.warning)) warnings.push(encoded.warning);
      imageIndex += 1;
    } catch (error) {
      warnings.push(`Page ${pageNumber}: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      source.width = 1;
      source.height = 1;
    }
    await yieldToInterface();
  }
  return { assets, warnings };
}

// src/pdf/tables.ts
function median2(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}
function joinCellSpans(spans) {
  const sorted = [...spans].sort((a, b) => a.x - b.x);
  let value = "";
  let previousRight = Number.NEGATIVE_INFINITY;
  for (const span of sorted) {
    const text = span.text.replace(/\s+/g, " ").trim();
    if (!text) continue;
    const gap = span.x - previousRight;
    if (value && gap > Math.max(1.5, span.fontSize * 0.15)) value += " ";
    value += text;
    previousRight = span.x + span.width;
  }
  return value.replace(/\s+/g, " ").trim();
}
function cellsForLine(line) {
  const spans = [...line.spans].sort((a, b) => a.x - b.x);
  if (spans.length < 2) return [];
  const fontSize = median2(spans.map((span) => span.fontSize)) || line.fontSize;
  const gapThreshold = Math.max(14, fontSize * 1.45);
  const groups = [];
  let current = [];
  let previousRight = Number.NEGATIVE_INFINITY;
  for (const span of spans) {
    const gap = span.x - previousRight;
    if (current.length > 0 && gap > gapThreshold) {
      groups.push(current);
      current = [];
    }
    current.push(span);
    previousRight = Math.max(previousRight, span.x + span.width);
  }
  if (current.length > 0) groups.push(current);
  if (groups.length < 2) return [];
  return groups.map((group) => ({
    x: Math.min(...group.map((span) => span.x)),
    right: Math.max(...group.map((span) => span.x + span.width)),
    text: joinCellSpans(group)
  }));
}
function groupCandidateRows(lines) {
  const sorted = [...lines].sort((a, b) => a.y - b.y || a.x - b.x);
  const groups = [];
  let current = [];
  const flush = () => {
    if (current.length >= 2) groups.push(current);
    current = [];
  };
  for (const line of sorted) {
    const cells = cellsForLine(line);
    if (cells.length < 2) {
      flush();
      continue;
    }
    if (current.length > 0) {
      const previous = current[current.length - 1].line;
      const gap = line.y - (previous.y + previous.height);
      const maxGap = Math.max(28, median2([line.height, previous.height]) * 2.2);
      if (gap > maxGap) flush();
    }
    current.push({ line, cells });
  }
  flush();
  return groups;
}
function clusterAnchors(rows, tolerance) {
  const clusters = [];
  const positions = rows.flatMap((row) => row.cells.map((cell) => ({ x: cell.x, rowId: row.line.id })));
  positions.sort((a, b) => a.x - b.x);
  for (const position of positions) {
    let best = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const cluster of clusters) {
      const distance = Math.abs(cluster.x - position.x);
      if (distance <= tolerance && distance < bestDistance) {
        best = cluster;
        bestDistance = distance;
      }
    }
    if (best) {
      best.values.push(position.x);
      best.rows.add(position.rowId);
      best.x = median2(best.values);
    } else {
      clusters.push({ x: position.x, values: [position.x], rows: /* @__PURE__ */ new Set([position.rowId]) });
    }
  }
  return clusters.filter((cluster) => cluster.rows.size >= 2).sort((a, b) => a.x - b.x);
}
function mapRows(rows, anchors, tolerance) {
  const mapped = [];
  const consumedRows = [];
  let filled = 0;
  let distanceTotal = 0;
  let distanceCount = 0;
  for (const row of rows) {
    const values = Array.from({ length: anchors.length }, () => "");
    for (const cell of row.cells) {
      let bestIndex = -1;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (let index = 0; index < anchors.length; index += 1) {
        const distance = Math.abs(cell.x - anchors[index].x);
        if (distance < bestDistance) {
          bestIndex = index;
          bestDistance = distance;
        }
      }
      if (bestIndex < 0 || bestDistance > tolerance * 2.2) continue;
      values[bestIndex] = values[bestIndex] ? `${values[bestIndex]} ${cell.text}` : cell.text;
      distanceTotal += Math.min(1, bestDistance / Math.max(1, tolerance * 2.2));
      distanceCount += 1;
    }
    const populated = values.filter(Boolean).length;
    if (populated >= 2) {
      filled += populated;
      mapped.push(values.map((value) => value.trim()));
      consumedRows.push(row);
    }
  }
  return {
    rows: mapped,
    filled,
    distanceScore: distanceCount === 0 ? 0 : 1 - distanceTotal / distanceCount,
    consumedRows
  };
}
function scoreTable(rows, filled, distanceScore) {
  if (rows.length < 2 || rows[0].length < 2) return 0;
  const columns = rows[0].length;
  const density = filled / (rows.length * columns);
  const rowScore = Math.min(1, (rows.length - 1) / 4);
  const columnScore = Math.min(1, (columns - 1) / 3);
  const averageLength = rows.flat().reduce((total, value) => total + value.length, 0) / (rows.length * columns);
  const brevityScore = averageLength <= 45 ? 1 : Math.max(0, 1 - (averageLength - 45) / 100);
  return density * 0.38 + distanceScore * 0.27 + rowScore * 0.18 + columnScore * 0.08 + brevityScore * 0.09;
}
function boundsForRows(rows) {
  const lines = rows.map((row) => row.line);
  const x = Math.min(...lines.map((line) => line.x));
  const y = Math.min(...lines.map((line) => line.y));
  const right = Math.max(...lines.map((line) => line.x + line.width));
  const bottom = Math.max(...lines.map((line) => line.y + line.height));
  return { x, y, width: right - x, height: bottom - y };
}
function looksLikeNarrativeColumns(rows) {
  var _a;
  if (((_a = rows[0]) == null ? void 0 : _a.length) !== 2 || rows.length >= 4) return false;
  const lengths = rows.flat().map((value) => value.length).filter((value) => value > 0);
  if (lengths.length === 0) return false;
  return median2(lengths) > 55;
}
function detectTables(lines, minimumConfidence) {
  var _a, _b;
  const groups = groupCandidateRows(lines);
  const tables = [];
  let index = 1;
  for (const group of groups) {
    const fontSize = median2(group.map((row) => row.line.fontSize)) || 12;
    const tolerance = Math.max(8, fontSize * 0.85);
    const anchors = clusterAnchors(group, tolerance);
    if (anchors.length < 2 || anchors.length > 12) continue;
    const mapped = mapRows(group, anchors, tolerance);
    if (mapped.rows.length < 2 || looksLikeNarrativeColumns(mapped.rows)) continue;
    const confidence = scoreTable(mapped.rows, mapped.filled, mapped.distanceScore);
    if (confidence < minimumConfidence) continue;
    const bounds = boundsForRows(mapped.consumedRows);
    if (bounds.width < ((_b = (_a = group[0]) == null ? void 0 : _a.line.pageWidth) != null ? _b : 0) * 0.16) continue;
    tables.push({
      id: `table-${group[0].line.page}-${index}`,
      page: group[0].line.page,
      index,
      rows: mapped.rows,
      bounds,
      confidence,
      consumedLineIds: mapped.consumedRows.map((row) => row.line.id)
    });
    index += 1;
  }
  return tables;
}

// src/pdf/extract.ts
var IMAGE_ONLY_TEXT_LIMIT = 24;
var FULL_PAGE_IMAGE_COVERAGE = 0.72;
function warnOnce(target, value) {
  if (value && !target.includes(value)) target.push(value);
}
function coverage(asset, page) {
  const pageArea = Math.max(1, page.width * page.height);
  return Math.max(0, asset.bounds.width * asset.bounds.height) / pageArea;
}
function tableAssetName(page, index) {
  return `Table ${page}-${index}.svg`;
}
async function createTableAsset(table) {
  const svg = generateTableSvg(table);
  const bytes = svgToArrayBuffer(svg);
  return {
    id: table.id,
    kind: "table",
    page: table.page,
    index: table.index,
    bounds: table.bounds,
    width: Math.max(1, Math.round(table.bounds.width)),
    height: Math.max(1, Math.round(table.bounds.height)),
    mime: "image/svg+xml",
    extension: "svg",
    bytes,
    hash: await hashBytes(bytes),
    fileName: tableAssetName(table.page, table.index),
    alt: `Table from page ${table.page}`
  };
}
async function extractPdf(bytes, settings, token, onProgress, passwordProvider) {
  var _a, _b, _c, _d;
  const started = performance.now();
  const warnings = [];
  const rawPages = [];
  const pages = [];
  const assets = [];
  const { pdfjs, document: document2 } = await openPdfDocument(bytes, passwordProvider);
  try {
    for (let pageNumber = 1; pageNumber <= document2.numPages; pageNumber += 1) {
      throwIfCancelled(token);
      onProgress == null ? void 0 : onProgress({
        current: pageNumber - 1,
        total: document2.numPages * 2,
        message: `Reading text from page ${pageNumber} of ${document2.numPages}`
      });
      const page = await document2.getPage(pageNumber);
      try {
        rawPages.push(await extractPageText(page, pageNumber));
      } finally {
        (_a = page.cleanup) == null ? void 0 : _a.call(page);
      }
      await yieldToInterface();
    }
    const cleanedPages = removeRepeatedMargins(rawPages, settings.removeRepeatedMargins);
    const bodyFontSize = estimateBodyFontSize(cleanedPages);
    for (let pageIndex = 0; pageIndex < cleanedPages.length; pageIndex += 1) {
      throwIfCancelled(token);
      const rawPage = cleanedPages[pageIndex];
      const pageNumber = rawPage.page;
      onProgress == null ? void 0 : onProgress({
        current: document2.numPages + pageIndex,
        total: document2.numPages * 2,
        message: `Extracting page ${pageNumber} of ${document2.numPages}`
      });
      const pageWarnings = [];
      const page = await document2.getPage(pageNumber);
      try {
        const tables = settings.detectTables ? detectTables(rawPage.lines, settings.tableMinConfidence) : [];
        const pageAssets = [];
        if (settings.tableOutput === "svg" || settings.tableOutput === "both") {
          for (const table of tables) {
            throwIfCancelled(token);
            pageAssets.push(await createTableAsset(table));
          }
        }
        const isImageOnly = rawPage.characterCount < IMAGE_ONLY_TEXT_LIMIT;
        let extractedImages = [];
        if (settings.extractImages && !(isImageOnly && settings.renderImageOnlyPages)) {
          try {
            const imageResult = await extractPageImages(pdfjs, page, pageNumber, settings, token);
            extractedImages = imageResult.assets;
            for (const warning of imageResult.warnings) warnOnce(pageWarnings, warning);
          } catch (error) {
            pageWarnings.push(
              `Page ${pageNumber}: embedded image extraction failed: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }
        if (isImageOnly && settings.renderImageOnlyPages) {
          try {
            const snapshot = await renderPageSnapshot(page, pageNumber, settings, token);
            pageAssets.push(snapshot.asset);
            warnOnce(pageWarnings, snapshot.warning);
            extractedImages = [];
          } catch (error) {
            pageWarnings.push(
              `Page ${pageNumber}: the page image could not be created: ${error instanceof Error ? error.message : String(error)}`
            );
            if (settings.extractImages) {
              try {
                const imageResult = await extractPageImages(pdfjs, page, pageNumber, settings, token);
                extractedImages = imageResult.assets;
                for (const warning of imageResult.warnings) warnOnce(pageWarnings, warning);
              } catch (fallbackError) {
                pageWarnings.push(
                  `Page ${pageNumber}: embedded image fallback failed: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`
                );
              }
            }
          }
        } else if (!isImageOnly) {
          extractedImages = extractedImages.filter(
            (asset) => coverage(asset, rawPage) < FULL_PAGE_IMAGE_COVERAGE
          );
        }
        pageAssets.push(...extractedImages);
        assets.push(...pageAssets);
        const blocks = buildPageBlocks(
          rawPage.lines,
          rawPage.width,
          tables,
          pageAssets,
          bodyFontSize,
          settings
        );
        if (rawPage.characterCount === 0 && pageAssets.length === 0) {
          pageWarnings.push(
            `Page ${pageNumber} contains no extractable text or images. This plugin does not use OCR.`
          );
        }
        pages.push({
          page: pageNumber,
          width: rawPage.width,
          height: rawPage.height,
          blocks,
          warnings: pageWarnings,
          characterCount: rawPage.characterCount,
          tableCount: tables.length,
          imageCount: pageAssets.filter((asset) => asset.kind !== "table").length
        });
        for (const warning of pageWarnings) warnOnce(warnings, warning);
      } finally {
        (_b = page.cleanup) == null ? void 0 : _b.call(page);
      }
      await yieldToInterface();
    }
    onProgress == null ? void 0 : onProgress({
      current: document2.numPages * 2,
      total: document2.numPages * 2,
      message: "Preparing preview"
    });
    const uniqueBytes = /* @__PURE__ */ new Map();
    for (const asset of assets) {
      if (!uniqueBytes.has(asset.hash)) uniqueBytes.set(asset.hash, asset.bytes.byteLength);
    }
    const characterCount = pages.reduce((total, page) => total + page.characterCount, 0);
    const tableCount = pages.reduce((total, page) => total + page.tableCount, 0);
    const imageCount = pages.reduce((total, page) => total + page.imageCount, 0);
    if (characterCount === 0) {
      warnOnce(
        warnings,
        "No text was found. Scanned PDFs are preserved as compressed page images because the plugin does not use OCR."
      );
    }
    return {
      pages,
      assets,
      warnings,
      metrics: {
        pageCount: document2.numPages,
        characterCount,
        tableCount,
        imageCount,
        assetBytes: [...uniqueBytes.values()].reduce((total, value) => total + value, 0),
        elapsedMs: performance.now() - started
      }
    };
  } finally {
    try {
      await ((_c = document2.cleanup) == null ? void 0 : _c.call(document2));
    } catch (e) {
    }
    try {
      await ((_d = document2.destroy) == null ? void 0 : _d.call(document2));
    } catch (e) {
    }
  }
}

// src/conversion/plan.ts
function noteTitle(value, fallback) {
  return safeFileName(value.replace(/\.md$/i, ""), fallback);
}
function assetPathMap(assets, folder) {
  const paths = /* @__PURE__ */ new Map();
  const used = /* @__PURE__ */ new Set();
  for (const asset of assets) {
    const existing = paths.get(asset.hash);
    if (existing) continue;
    const dot = asset.fileName.lastIndexOf(".");
    const stem = dot > 0 ? asset.fileName.slice(0, dot) : asset.fileName;
    const suffix = dot > 0 ? asset.fileName.slice(dot) : "";
    let name = asset.fileName;
    let index = 2;
    while (used.has(name.toLowerCase())) {
      name = `${stem} (${index})${suffix}`;
      index += 1;
    }
    used.add(name.toLowerCase());
    paths.set(asset.hash, joinPath(folder, name));
  }
  return paths;
}
function planOutputLayout(app, source, assets, options) {
  const warnings = [];
  const title = noteTitle(options.title, source.basename);
  const sourceFolder = dirname(source.path);
  let notePath;
  let outputFolder;
  let plannedAssets = assets.map((asset) => ({ ...asset, plannedPath: void 0 }));
  if (plannedAssets.length > 0 && options.assetLocation === "note-folder") {
    outputFolder = availableFolderPath(app, joinPath(sourceFolder, title));
    notePath = joinPath(outputFolder, `${title}.md`);
    const byHash = assetPathMap(plannedAssets, outputFolder);
    plannedAssets = plannedAssets.map((asset) => ({
      ...asset,
      plannedPath: byHash.get(asset.hash)
    }));
  } else {
    outputFolder = sourceFolder;
    notePath = availableFilePath(app, joinPath(sourceFolder, `${title}.md`));
  }
  let sourceDestination;
  if (options.sourceAction === "move") {
    const moveFolder = sanitizeVaultFolder(options.moveFolder);
    if (!moveFolder) {
      throw new Error("Choose a Vault folder for the source PDF.");
    }
    const desired = joinPath(moveFolder, source.name);
    if (desired.toLowerCase() === source.path.toLowerCase()) {
      warnings.push("The PDF is already in the selected move folder. It will stay in place.");
    } else {
      sourceDestination = availableFilePath(app, desired);
    }
  }
  return { assets: plannedAssets, notePath, outputFolder, sourceDestination, warnings };
}
function assemblePlan(app, source, sourcePath, sourceMtime, sourceSize, options, extraction, linkFiles) {
  const layout = planOutputLayout(app, source, extraction.assets, options);
  const markdownTemplate = buildMarkdownTemplate(extraction.pages, options);
  const markdown = buildPlainPreview(markdownTemplate, layout.assets);
  return {
    source,
    sourcePath,
    sourceMtime,
    sourceSize,
    options: { ...options, title: noteTitle(options.title, source.basename) },
    pages: extraction.pages,
    assets: layout.assets,
    markdownTemplate,
    markdown,
    notePath: layout.notePath,
    outputFolder: layout.outputFolder,
    sourceDestination: layout.sourceDestination,
    linkFiles,
    warnings: [...extraction.warnings, ...layout.warnings],
    metrics: {
      ...extraction.metrics,
      linkCount: linkFiles.reduce((total, file) => total + file.references.length, 0)
    }
  };
}
async function buildConversionPlan(app, source, options, token, onProgress, passwordProvider) {
  const sourceMtime = source.stat.mtime;
  const sourceSize = source.stat.size;
  onProgress == null ? void 0 : onProgress({ current: 0, total: 1, message: "Reading PDF" });
  const bytes = await app.vault.readBinary(source);
  const extraction = await extractPdf(bytes, options, token, onProgress, passwordProvider);
  if (source.stat.mtime !== sourceMtime || source.stat.size !== sourceSize) {
    throw new Error("The PDF changed while it was being converted. Start the conversion again.");
  }
  onProgress == null ? void 0 : onProgress({ current: 1, total: 1, message: "Finding PDF links" });
  const linkFiles = options.updateLinks ? await collectLinkPlans(app, source) : [];
  return assemblePlan(app, source, source.path, sourceMtime, sourceSize, options, extraction, linkFiles);
}
function retargetConversionPlan(app, plan, changes) {
  const options = { ...plan.options, ...changes };
  const extraction = {
    pages: plan.pages,
    assets: plan.assets.map((asset) => ({ ...asset, plannedPath: void 0 })),
    warnings: plan.warnings.filter(
      (warning) => !warning.startsWith("The PDF move folder") && !warning.startsWith("The PDF is already in")
    ),
    metrics: {
      pageCount: plan.metrics.pageCount,
      characterCount: plan.metrics.characterCount,
      tableCount: plan.metrics.tableCount,
      imageCount: plan.metrics.imageCount,
      assetBytes: plan.metrics.assetBytes,
      elapsedMs: plan.metrics.elapsedMs
    }
  };
  return assemblePlan(
    app,
    plan.source,
    plan.sourcePath,
    plan.sourceMtime,
    plan.sourceSize,
    options,
    extraction,
    plan.linkFiles
  );
}

// src/ui/password-modal.ts
var import_obsidian7 = require("obsidian");
var PdfPasswordModal = class extends import_obsidian7.Modal {
  constructor(app, incorrect) {
    super(app);
    this.incorrect = incorrect;
    this.resolved = false;
    this.resolvePromise = () => void 0;
    this.promise = new Promise((resolve) => {
      this.resolvePromise = resolve;
    });
  }
  request() {
    this.open();
    return this.promise;
  }
  onOpen() {
    this.setTitle(this.incorrect ? "Incorrect PDF password" : "PDF password required");
    this.contentEl.empty();
    const description = this.contentEl.createEl("p", {
      text: this.incorrect ? "The password did not open this PDF. Enter a different password." : "Enter the password for this PDF. The password stays in memory and is not saved."
    });
    description.addClass("pdfmd-muted");
    let value = "";
    const setting = new import_obsidian7.Setting(this.contentEl).setName("Password");
    setting.addText((text) => {
      text.inputEl.type = "password";
      text.inputEl.autocomplete = "off";
      text.onChange((next) => {
        value = next;
      });
      this.contentEl.win.setTimeout(() => text.inputEl.focus(), 0);
      text.inputEl.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && value) {
          event.preventDefault();
          this.finish(value);
        }
      });
    });
    const buttons = this.contentEl.createDiv({ cls: "pdfmd-actions" });
    const cancel = buttons.createEl("button", { text: "Cancel" });
    cancel.addEventListener("click", () => this.finish(null));
    const unlock = buttons.createEl("button", { text: "Open PDF", cls: "mod-cta" });
    unlock.addEventListener("click", () => {
      if (value) this.finish(value);
    });
  }
  onClose() {
    this.contentEl.empty();
    if (!this.resolved) this.finish(null, false);
  }
  finish(value, close = true) {
    if (this.resolved) return;
    this.resolved = true;
    this.resolvePromise(value);
    if (close) this.close();
  }
};

// src/ui/conversion-preview.ts
var import_obsidian8 = require("obsidian");
var PREVIEW_LIMIT = 14e4;
function formatBytes(value) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}
function formatDuration(value) {
  if (value < 1e3) return `${Math.round(value)} ms`;
  return `${(value / 1e3).toFixed(1)} s`;
}
function sourceActionText(action, destination) {
  if (action === "trash") return "Use Obsidian's Deleted files setting for the PDF";
  if (action === "move") return destination ? `Move the PDF to ${destination}` : "Leave the PDF in place";
  return "Leave the PDF in place";
}
function renderTargetSummary(container, plan) {
  const noteRow = container.createDiv({ cls: "pdfmd-target-row" });
  noteRow.createSpan({ text: "Markdown" });
  noteRow.createEl("code", { text: plan.notePath });
  if (plan.assets.length > 0) {
    const assetRow = container.createDiv({ cls: "pdfmd-target-row" });
    assetRow.createSpan({ text: "Assets" });
    assetRow.createEl("code", {
      text: plan.options.assetLocation === "note-folder" ? `${plan.outputFolder}/` : "Obsidian attachment location"
    });
  }
  const sourceRow = container.createDiv({ cls: "pdfmd-target-row" });
  sourceRow.createSpan({ text: "PDF" });
  sourceRow.createEl("code", {
    text: sourceActionText(plan.options.sourceAction, plan.sourceDestination)
  });
}
var ConversionPreviewRenderer = class {
  constructor(app, source, assetUrls) {
    this.app = app;
    this.source = source;
    this.assetUrls = assetUrls;
    this.component = null;
    this.generation = 0;
  }
  dispose() {
    var _a;
    this.generation += 1;
    (_a = this.component) == null ? void 0 : _a.unload();
    this.component = null;
  }
  previewMarkdown(plan) {
    const byId = new Map(plan.assets.map((asset) => [asset.id, asset]));
    return resolveAssetPlaceholders(plan.markdownTemplate, (assetId) => {
      const asset = byId.get(assetId);
      const url = this.assetUrls.get(assetId);
      if (!asset || !url) return `> [!warning] Missing preview asset: ${assetId}`;
      const alt = asset.alt.replaceAll("[", "").replaceAll("]", "");
      return `![${alt}](${url})`;
    });
  }
  async render(container, tab, plan) {
    this.dispose();
    const generation = this.generation;
    container.empty();
    if (tab === "pdf") {
      const toolbar = container.createDiv({ cls: "pdfmd-pdf-toolbar" });
      const open = toolbar.createEl("button", { text: "Open PDF in Obsidian" });
      open.addEventListener("click", () => {
        void this.app.workspace.getLeaf(false).openFile(this.source).catch((error) => {
          new import_obsidian8.Notice(
            `The PDF could not be opened: ${error instanceof Error ? error.message : String(error)}`,
            1e4
          );
        });
      });
      if (import_obsidian8.Platform.isMobile) {
        container.createEl("p", {
          cls: "pdfmd-muted",
          text: "Use the button above to open the PDF in Obsidian. The inline PDF preview is available on desktop."
        });
        return;
      }
      const frame = container.createEl("iframe", {
        cls: "pdfmd-pdf-frame",
        attr: {
          src: this.app.vault.getResourcePath(this.source),
          title: `PDF preview: ${this.source.name}`
        }
      });
      frame.setAttr("loading", "lazy");
      return;
    }
    if (tab === "files") {
      renderTargetSummary(container, plan);
      if (plan.assets.length > 0) {
        const unique = new Map(plan.assets.map((asset) => [asset.hash, asset]));
        container.createEl("h4", { text: `${unique.size} asset file${unique.size === 1 ? "" : "s"}` });
        const list = container.createEl("ul", { cls: "pdfmd-file-list" });
        for (const asset of unique.values()) {
          list.createEl("li", {
            text: `${asset.fileName} \u2014 ${asset.width} \xD7 ${asset.height}, ${formatBytes(asset.bytes.byteLength)}`
          });
        }
      }
      return;
    }
    const markdown = tab === "rendered" ? this.previewMarkdown(plan) : plan.markdown;
    const truncated = markdown.length > PREVIEW_LIMIT;
    const previewValue = truncated ? `${markdown.slice(0, PREVIEW_LIMIT)}

> [!info] Preview stopped here because the complete note is large. The full note will be saved.` : markdown;
    if (tab === "source") {
      const pre = container.createEl("pre", { cls: "pdfmd-source" });
      pre.createEl("code", { text: previewValue });
      return;
    }
    const rendered = container.createDiv({ cls: "markdown-rendered pdfmd-rendered" });
    const component = new import_obsidian8.Component();
    component.load();
    this.component = component;
    try {
      await import_obsidian8.MarkdownRenderer.render(this.app, previewValue, rendered, plan.notePath, component);
    } catch (error) {
      if (generation === this.generation && this.component === component) {
        rendered.empty();
        rendered.createDiv({
          cls: "pdfmd-error",
          text: `The Markdown preview could not be rendered: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    } finally {
      if (generation !== this.generation || this.component !== component) {
        component.unload();
      }
    }
  }
};

// src/ui/conversion-modal.ts
var ConversionModal = class extends import_obsidian9.Modal {
  constructor(app, plugin, source) {
    super(app);
    this.plugin = plugin;
    this.source = source;
    this.controller = new CancellationController();
    this.plan = null;
    this.activeTab = "rendered";
    this.pathEl = null;
    this.applyButton = null;
    this.targetError = "";
    this.refreshTimer = null;
    this.applying = false;
    this.progressEl = null;
    this.progressTextEl = null;
    this.assetUrls = /* @__PURE__ */ new Map();
    this.previewRenderer = new ConversionPreviewRenderer(app, source, this.assetUrls);
    this.titleValue = source.basename;
    this.sourceAction = plugin.pluginSettings.sourceAction;
    this.moveFolder = plugin.pluginSettings.moveFolder;
  }
  onOpen() {
    this.modalEl.addClass("pdfmd-modal");
    this.setTitle("Convert PDF to Markdown");
    this.renderLoading("Preparing PDF", 0, 1);
    void this.prepare();
  }
  onClose() {
    if (!this.applying) this.controller.cancel();
    if (this.refreshTimer !== null) this.contentEl.win.clearTimeout(this.refreshTimer);
    this.disposePreviewRenderer();
    for (const url of new Set(this.assetUrls.values())) URL.revokeObjectURL(url);
    this.assetUrls.clear();
    this.contentEl.empty();
  }
  disposePreviewRenderer() {
    this.previewRenderer.dispose();
  }
  renderLoading(message, current, total) {
    this.disposePreviewRenderer();
    this.contentEl.empty();
    const wrap = this.contentEl.createDiv({ cls: "pdfmd-loading" });
    wrap.createDiv({ cls: "pdfmd-spinner", attr: { "aria-hidden": "true" } });
    this.progressTextEl = wrap.createEl("p", { text: message });
    this.progressEl = wrap.createEl("progress");
    this.progressEl.max = Math.max(1, total);
    this.progressEl.value = Math.max(0, current);
    const cancel = wrap.createEl("button", { text: "Cancel" });
    cancel.addEventListener("click", () => {
      this.controller.cancel();
      this.close();
    });
  }
  updateProgress(message, current, total) {
    if (this.progressTextEl) this.progressTextEl.setText(message);
    if (this.progressEl) {
      this.progressEl.max = Math.max(1, total);
      this.progressEl.value = Math.max(0, current);
    }
  }
  async prepare() {
    try {
      const options = {
        ...this.plugin.pluginSettings,
        title: this.titleValue
      };
      this.plan = await buildConversionPlan(
        this.app,
        this.source,
        options,
        this.controller,
        (progress) => this.updateProgress(progress.message, progress.current, progress.total),
        async (incorrect) => new PdfPasswordModal(this.app, incorrect).request()
      );
      if (this.controller.cancelled) throw new CancelledError();
      this.titleValue = this.plan.options.title;
      this.sourceAction = this.plan.options.sourceAction;
      this.moveFolder = this.plan.options.moveFolder;
      this.createAssetUrls(this.plan);
      this.renderReady();
    } catch (error) {
      if (error instanceof CancelledError || this.controller.cancelled) {
        this.close();
        return;
      }
      this.renderError(error, true);
    }
  }
  createAssetUrls(plan) {
    const byHash = /* @__PURE__ */ new Map();
    for (const asset of plan.assets) {
      if (this.assetUrls.has(asset.id)) continue;
      let url = byHash.get(asset.hash);
      if (!url) {
        const blob = new Blob([asset.bytes], { type: asset.mime });
        url = URL.createObjectURL(blob);
        byHash.set(asset.hash, url);
      }
      this.assetUrls.set(asset.id, url);
    }
  }
  currentPlan() {
    if (!this.plan) throw new Error("The conversion preview is not ready.");
    return retargetConversionPlan(this.app, this.plan, {
      title: this.titleValue,
      sourceAction: this.sourceAction,
      moveFolder: this.moveFolder
    });
  }
  scheduleTargetRefresh() {
    if (this.refreshTimer !== null) this.contentEl.win.clearTimeout(this.refreshTimer);
    this.refreshTimer = this.contentEl.win.setTimeout(() => {
      this.refreshTimer = null;
      this.refreshTargets();
    }, 120);
  }
  refreshTargets() {
    try {
      const plan = this.currentPlan();
      this.targetError = "";
      if (this.pathEl) {
        this.pathEl.empty();
        renderTargetSummary(this.pathEl, plan);
      }
      if (this.applyButton) this.applyButton.disabled = false;
    } catch (error) {
      this.targetError = error instanceof Error ? error.message : String(error);
      if (this.pathEl) {
        this.pathEl.empty();
        this.pathEl.createDiv({ cls: "pdfmd-error", text: this.targetError });
      }
      if (this.applyButton) this.applyButton.disabled = true;
    }
  }
  renderReady() {
    if (!this.plan) return;
    this.disposePreviewRenderer();
    this.pathEl = null;
    this.applyButton = null;
    this.contentEl.empty();
    const summary = this.contentEl.createDiv({ cls: "pdfmd-summary" });
    this.addMetric(summary, String(this.plan.metrics.pageCount), "pages");
    this.addMetric(summary, String(this.plan.metrics.tableCount), "tables");
    this.addMetric(summary, String(this.plan.metrics.imageCount), "images");
    this.addMetric(summary, formatBytes(this.plan.metrics.assetBytes), "assets");
    this.addMetric(summary, String(this.plan.metrics.linkCount), "links");
    this.addMetric(summary, formatDuration(this.plan.metrics.elapsedMs), "processed");
    const controls = this.contentEl.createDiv({ cls: "pdfmd-controls" });
    new import_obsidian9.Setting(controls).setName("Note name").setDesc("The plugin adds .md automatically.").addText((text) => {
      text.setValue(this.titleValue).onChange((value) => {
        this.titleValue = value;
        this.scheduleTargetRefresh();
      });
    });
    const moveSetting = new import_obsidian9.Setting(controls).setName("Source PDF").setDesc("The source action runs last. Trash follows Obsidian's Deleted files setting.");
    let moveFolderSetting = null;
    moveSetting.addDropdown((dropdown) => {
      dropdown.addOption("keep", "Leave in place").addOption("trash", "Use Obsidian Deleted files setting").addOption("move", "Move to folder").setValue(this.sourceAction).onChange((value) => {
        this.sourceAction = value;
        moveFolderSetting == null ? void 0 : moveFolderSetting.settingEl.toggle(this.sourceAction === "move");
        this.scheduleTargetRefresh();
      });
    });
    let moveFolderInput = null;
    moveFolderSetting = new import_obsidian9.Setting(controls).setName("Move folder").setDesc("Choose an existing vault folder or type a new vault-relative folder.").addText((text) => {
      moveFolderInput = text;
      text.setPlaceholder("PDF archive").setValue(this.moveFolder).onChange((value) => {
        this.moveFolder = value;
        this.scheduleTargetRefresh();
      });
    }).addButton((button) => {
      button.setButtonText("Choose").onClick(async () => {
        const folder = await chooseVaultFolder(this.app);
        if (folder === null) return;
        this.moveFolder = folder;
        moveFolderInput == null ? void 0 : moveFolderInput.setValue(folder);
        this.scheduleTargetRefresh();
      });
    });
    moveFolderSetting.settingEl.toggle(this.sourceAction === "move");
    this.pathEl = this.contentEl.createDiv({ cls: "pdfmd-targets" });
    this.refreshTargets();
    if (this.plan.warnings.length > 0) {
      const details = this.contentEl.createEl("details", { cls: "pdfmd-warnings" });
      details.createEl("summary", { text: `${this.plan.warnings.length} conversion warning${this.plan.warnings.length === 1 ? "" : "s"}` });
      const list = details.createEl("ul");
      for (const warning of this.plan.warnings) list.createEl("li", { text: warning });
    }
    const preview = this.contentEl.createDiv({ cls: "pdfmd-preview" });
    const tabs = preview.createDiv({ cls: "pdfmd-tabs", attr: { role: "tablist" } });
    const pane = preview.createDiv({ cls: "pdfmd-preview-pane" });
    const tabDefinitions = [
      ["pdf", "PDF"],
      ["rendered", "Markdown"],
      ["source", "Source"],
      ["files", "Files"]
    ];
    for (const [id, label] of tabDefinitions) {
      const button = tabs.createEl("button", {
        text: label,
        cls: id === this.activeTab ? "is-active" : ""
      });
      button.type = "button";
      button.setAttr("role", "tab");
      button.setAttr("aria-selected", id === this.activeTab ? "true" : "false");
      button.addEventListener("click", () => {
        this.activeTab = id;
        for (const child of Array.from(tabs.children)) {
          child.removeClass("is-active");
          child.setAttr("aria-selected", "false");
        }
        button.addClass("is-active");
        button.setAttr("aria-selected", "true");
        void this.renderPreviewTab(pane, id);
      });
    }
    void this.renderPreviewTab(pane, this.activeTab);
    const actions = this.contentEl.createDiv({ cls: "pdfmd-actions" });
    const cancel = actions.createEl("button", { text: "Cancel" });
    cancel.addEventListener("click", () => this.close());
    this.applyButton = actions.createEl("button", { text: "Convert", cls: "mod-cta" });
    this.applyButton.disabled = Boolean(this.targetError);
    this.applyButton.addEventListener("click", () => void this.apply());
  }
  addMetric(container, value, label) {
    const metric = container.createDiv({ cls: "pdfmd-metric" });
    metric.createEl("strong", { text: value });
    metric.createSpan({ text: label });
  }
  async renderPreviewTab(container, tab) {
    let plan;
    try {
      plan = this.currentPlan();
    } catch (error) {
      container.empty();
      container.createDiv({
        cls: "pdfmd-error",
        text: error instanceof Error ? error.message : String(error)
      });
      return;
    }
    await this.previewRenderer.render(container, tab, plan);
  }
  async apply() {
    if (this.applying || !this.plan) return;
    let plan;
    try {
      plan = this.currentPlan();
    } catch (error) {
      this.renderError(error, false);
      return;
    }
    this.applying = true;
    this.renderLoading("Saving Markdown and assets", 0, 1);
    const cancel = this.contentEl.querySelector("button");
    if (cancel) cancel.remove();
    try {
      const result = await applyConversionPlan(this.app, plan);
      const parts = [`Converted ${plan.source.name}`];
      if (result.assets.length > 0) parts.push(`${result.assets.length} assets`);
      if (result.updatedLinks > 0) parts.push(`${result.updatedLinks} links updated`);
      new import_obsidian9.Notice(parts.join(" \xB7 "), 7e3);
      for (const warning of result.warnings) new import_obsidian9.Notice(warning, 1e4);
      if (plan.options.openAfterConversion) {
        try {
          await this.app.workspace.getLeaf(false).openFile(result.note);
        } catch (error) {
          new import_obsidian9.Notice(
            `The conversion finished, but the note could not be opened: ${error instanceof Error ? error.message : String(error)}`,
            1e4
          );
        }
      }
      this.close();
    } catch (error) {
      this.applying = false;
      this.renderError(error, false);
    }
  }
  renderError(error, allowRetry) {
    this.disposePreviewRenderer();
    this.contentEl.empty();
    const message = error instanceof Error ? error.message : String(error);
    const panel = this.contentEl.createDiv({ cls: "pdfmd-error-panel" });
    panel.createEl("h3", { text: "PDF conversion failed" });
    panel.createEl("p", { text: message });
    const actions = panel.createDiv({ cls: "pdfmd-actions" });
    if (allowRetry) {
      const retry = actions.createEl("button", { text: "Try again", cls: "mod-cta" });
      retry.addEventListener("click", () => {
        this.renderLoading("Preparing PDF", 0, 1);
        void this.prepare();
      });
    } else if (this.plan) {
      const back = actions.createEl("button", { text: "Back to preview", cls: "mod-cta" });
      back.addEventListener("click", () => this.renderReady());
    }
    const close = actions.createEl("button", { text: "Close" });
    close.addEventListener("click", () => this.close());
  }
};

// src/main.ts
var PdfToMarkdownPlugin = class extends import_obsidian10.Plugin {
  constructor() {
    super(...arguments);
    this.pluginSettings = { ...DEFAULT_SETTINGS };
  }
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new PdfToMarkdownSettingTab(this.app, this));
    this.addCommand({
      id: "convert-current-pdf-to-markdown",
      name: "Convert current PDF to Markdown",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        const available = this.isPdf(file);
        if (!checking && available && file) this.openConverter(file);
        return available;
      }
    });
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (!this.isPdf(file)) return;
        menu.addItem((item) => {
          item.setTitle("Convert PDF to Markdown").setIcon("file-text").onClick(() => this.openConverter(file));
        });
      })
    );
  }
  async loadSettings() {
    const saved = await this.loadData();
    this.pluginSettings = normalizeSettings(saved);
  }
  async saveSettings() {
    await this.saveData(this.pluginSettings);
  }
  isPdf(file) {
    return file instanceof import_obsidian10.TFile && file.extension.toLowerCase() === "pdf";
  }
  openConverter(file) {
    if (!this.isPdf(file)) {
      new import_obsidian10.Notice("Select a PDF inside the vault.");
      return;
    }
    new ConversionModal(this.app, this, file).open();
  }
};

/* nosourcemap */