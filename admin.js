const tabs = [
  { id: "dashboard", label: "Dashboard", title: "Control Room" },
  { id: "media", label: "Media", title: "Media Library" },
  { id: "typography", label: "Typography", title: "Typography" },
  { id: "theme", label: "Theme", title: "Theme Tokens" },
  { id: "motion", label: "Motion", title: "Motion System" },
  { id: "hero", label: "Hero", title: "Hero Room" },
  { id: "products", label: "Products", title: "Product Control" },
  { id: "chapters", label: "Chapters", title: "Collection Chapters" },
  { id: "music", label: "Music", title: "Music Page" },
  { id: "about", label: "About", title: "About Page" },
  { id: "journal", label: "Journal", title: "Journal" },
  { id: "raw", label: "Raw JSON", title: "Raw JSON" },
];

const views = {
  login: document.querySelector('[data-view="login"]'),
  setup: document.querySelector('[data-view="setup"]'),
  app: document.querySelector('[data-view="app"]'),
};

const els = {
  loginForm: document.querySelector("[data-login-form]"),
  loginNote: document.querySelector("[data-login-note]"),
  loginError: document.querySelector("[data-login-error]"),
  tabs: document.querySelector("[data-tabs]"),
  panel: document.querySelector("[data-panel]"),
  notice: document.querySelector("[data-notice]"),
  dirty: document.querySelector("[data-dirty-state]"),
  storage: document.querySelector("[data-storage-card]"),
  activeKicker: document.querySelector("[data-active-kicker]"),
  activeTitle: document.querySelector("[data-active-title]"),
};

const state = {
  activeTab: "dashboard",
  activeProduct: 0,
  activeChapter: 0,
  activeJournal: 0,
  dirty: false,
  design: null,
  session: null,
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function pathParts(path) {
  return String(path).split(".").filter(Boolean);
}

function getPath(path) {
  return pathParts(path).reduce((target, key) => (target == null ? undefined : target[key]), state.design);
}

function setPath(path, value) {
  const parts = pathParts(path);
  const last = parts.pop();
  let target = state.design;

  parts.forEach((part) => {
    if (target[part] == null) {
      target[part] = /^\d+$/.test(part) ? [] : {};
    }
    target = target[part];
  });

  target[last] = value;
}

function showView(name) {
  Object.entries(views).forEach(([key, node]) => {
    node.hidden = key !== name;
  });
}

function showNotice(message, tone = "muted") {
  els.notice.textContent = message || "";
  els.notice.style.color = tone === "danger" ? "var(--danger)" : tone === "ok" ? "var(--ok)" : "var(--muted)";
}

function markDirty() {
  state.dirty = true;
  els.dirty.textContent = "Unsaved";
  els.dirty.classList.add("is-dirty");
}

function markClean() {
  state.dirty = false;
  els.dirty.textContent = "Saved";
  els.dirty.classList.remove("is-dirty");
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.ok === false) {
    throw new Error(payload.message || `Request failed: ${response.status}`);
  }

  return payload;
}

async function boot() {
  try {
    const session = await api("/api/session");
    state.session = session;

    if (!session.configured) {
      showView("setup");
      return;
    }

    if (!session.authenticated) {
      els.loginNote.textContent = session.usesDevelopmentFallback
        ? "Local development fallback is active. Use password: admin."
        : "Use the private password configured in Vercel.";
      showView("login");
      return;
    }

    await loadDesign();
    renderApp();
  } catch (error) {
    showView("login");
    els.loginError.textContent = error.message;
  }
}

async function loadDesign() {
  const payload = await api("/api/design");
  state.design = payload.design;
  markClean();
}

function renderApp() {
  renderTabs();
  renderStorage();
  renderPanel();
  showView("app");
}

function renderTabs() {
  els.tabs.innerHTML = tabs
    .map(
      (tab) => `
        <button type="button" class="${tab.id === state.activeTab ? "is-active" : ""}" data-action="select-tab" data-tab="${tab.id}">
          <span>${escapeHtml(tab.label)}</span>
          <span>${tab.id === "raw" ? "{}" : ""}</span>
        </button>
      `
    )
    .join("");
}

function renderStorage() {
  const storage = state.design?.storage || state.session?.storage || {};
  const mode = storage.mode || "unknown";
  const persistent = storage.persistent ? "Persistent Vercel Blob storage is active." : "Local/dev storage only. Production publish needs Blob.";

  els.storage.innerHTML = `
    <strong>Storage</strong>
    <span>${escapeHtml(mode)}</span><br />
    <span>${escapeHtml(persistent)}</span>
  `;
}

function renderPanel() {
  const active = tabs.find((tab) => tab.id === state.activeTab) || tabs[0];
  els.activeKicker.textContent = active.label;
  els.activeTitle.textContent = active.title;

  const renderers = {
    dashboard: renderDashboard,
    media: renderMedia,
    typography: renderTypography,
    theme: renderTheme,
    motion: renderMotion,
    hero: renderHero,
    products: renderProducts,
    chapters: renderChapters,
    music: renderMusic,
    about: renderAbout,
    journal: renderJournal,
    raw: renderRaw,
  };

  els.panel.innerHTML = (renderers[state.activeTab] || renderDashboard)();
}

function field(path, label, options = {}) {
  const value = getPath(path) ?? "";
  const type = options.type || "text";
  const wide = options.wide ? " wide" : "";
  const valueType = options.valueType || (type === "number" || type === "range" ? "number" : "string");

  if (type === "textarea") {
    return `
      <label class="${wide}">
        ${escapeHtml(label)}
        <textarea data-path="${escapeHtml(path)}" data-value-type="${valueType}" rows="${options.rows || 4}">${escapeHtml(value)}</textarea>
      </label>
    `;
  }

  if (type === "checkbox") {
    return `
      <label class="check-row${wide}">
        <span>${escapeHtml(label)}</span>
        <input type="checkbox" data-path="${escapeHtml(path)}" data-value-type="boolean" ${value ? "checked" : ""} />
      </label>
    `;
  }

  if (type === "select") {
    return `
      <label class="${wide}">
        ${escapeHtml(label)}
        <select data-path="${escapeHtml(path)}" data-value-type="${valueType}">
          ${(options.choices || [])
            .map((choice) => `<option value="${escapeHtml(choice.value)}" ${String(value) === String(choice.value) ? "selected" : ""}>${escapeHtml(choice.label)}</option>`)
            .join("")}
        </select>
      </label>
    `;
  }

  if (type === "color") {
    return `
      <label class="color-swatch${wide}">
        <input type="color" data-path="${escapeHtml(path)}" data-value-type="string" value="${escapeHtml(value)}" />
        <span>${escapeHtml(label)}</span>
      </label>
    `;
  }

  return `
    <label class="${wide}">
      ${escapeHtml(label)}
      <input
        type="${escapeHtml(type)}"
        data-path="${escapeHtml(path)}"
        data-value-type="${valueType}"
        value="${escapeHtml(value)}"
        ${options.min != null ? `min="${escapeHtml(options.min)}"` : ""}
        ${options.max != null ? `max="${escapeHtml(options.max)}"` : ""}
        ${options.step != null ? `step="${escapeHtml(options.step)}"` : ""}
      />
    </label>
  `;
}

function renderDashboard() {
  const products = state.design.products || [];
  const media = state.design.mediaLibrary || [];
  const journal = state.design.journal?.entries || [];
  const storage = state.design.storage || {};

  return `
    <div class="panel-grid">
      <section class="panel-block">
        <div class="status-grid">
          <div class="metric"><span>Products</span><strong>${products.length}</strong></div>
          <div class="metric"><span>Media Items</span><strong>${media.length}</strong></div>
          <div class="metric"><span>Journal Tiles</span><strong>${journal.length}</strong></div>
          <div class="metric"><span>Storage</span><strong>${escapeHtml(storage.mode || "local")}</strong></div>
        </div>
      </section>
      <section class="panel-block">
        <h2>Live preview</h2>
        <p>Save changes, then refresh this preview to inspect the public landing page without leaving the editor.</p>
        <iframe class="preview-frame" data-preview src="/?adminPreview=${Date.now()}" title="KingShadP public preview"></iframe>
      </section>
    </div>
  `;
}

function mediaTargetOptions() {
  const options = [
    { value: "hero.image", label: "Hero image" },
    { value: "motion.ambientVideo", label: "Ambient video URL" },
    { value: "music.cover", label: "Music cover" },
    { value: "about.image", label: "About image" },
  ];

  (state.design.chapters || []).forEach((chapter, index) => {
    options.push({ value: `chapters.${index}.image`, label: `Chapter: ${chapter.label || chapter.title || index + 1}` });
  });

  (state.design.products || []).forEach((product, index) => {
    options.push({ value: `products.${index}.image`, label: `Product: ${product.title || index + 1}` });
  });

  (state.design.journal?.entries || []).forEach((entry, index) => {
    options.push({ value: `journal.entries.${index}.image`, label: `Journal: ${entry.title || index + 1}` });
  });

  return options;
}

function renderTargetSelect(id) {
  return `
    <select id="${escapeHtml(id)}">
      ${mediaTargetOptions().map((item) => `<option value="${escapeHtml(item.value)}">${escapeHtml(item.label)}</option>`).join("")}
    </select>
  `;
}

function renderMedia() {
  const media = state.design.mediaLibrary || [];

  return `
    <div class="panel-grid">
      <section class="panel-block">
        <h2>Upload and assign media</h2>
        <div class="media-tools">
          <label>
            Image or video file
            <input type="file" id="media-file" accept="image/*,video/*" />
          </label>
          <label>
            Assign upload to
            ${renderTargetSelect("media-target")}
          </label>
        </div>
        <div class="inline-actions">
          <button type="button" class="panel-button" data-action="upload-media">Upload Media</button>
        </div>
      </section>
      <section class="panel-block">
        <h2>Add external media URL</h2>
        <div class="media-tools">
          <label>
            Media URL
            <input type="url" id="manual-media-url" placeholder="https://..." />
          </label>
          <label>
            Assign URL to
            ${renderTargetSelect("manual-media-target")}
          </label>
        </div>
        <div class="inline-actions">
          <button type="button" class="panel-button" data-action="add-media-url">Add URL</button>
        </div>
      </section>
      <section class="panel-block">
        <h2>Library</h2>
        <div class="media-library">
          ${media
            .map((item, index) => {
              const isVideo = item.kind === "video" || /\.(mp4|webm|mov)$/i.test(item.url || "");
              return `
                <article class="media-card">
                  ${
                    isVideo
                      ? `<video src="${escapeHtml(item.url)}" muted playsinline></video>`
                      : `<img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.label || "Media item")}" loading="lazy" />`
                  }
                  <strong>${escapeHtml(item.label || item.url)}</strong>
                  <button type="button" data-action="use-media" data-media-index="${index}">Use Selected Target</button>
                </article>
              `;
            })
            .join("")}
        </div>
      </section>
    </div>
  `;
}

function renderTypography() {
  return `
    <div class="panel-grid">
      <section class="panel-block half">
        <h2>Font system</h2>
        <div class="form-grid">
          ${field("typography.displayFamily", "Display font stack", { wide: true })}
          ${field("typography.bodyFamily", "Body font stack", { wide: true })}
          ${field("typography.heroSize", "Hero size", { type: "range", min: 42, max: 96, step: 1 })}
          ${field("typography.sectionTitleSize", "Section title size", { type: "range", min: 32, max: 76, step: 1 })}
          ${field("typography.panelTitleSize", "Panel title size", { type: "range", min: 30, max: 68, step: 1 })}
          ${field("typography.bodySize", "Body size", { type: "range", min: 14, max: 22, step: 1 })}
          ${field("typography.navSize", "Navigation size", { type: "range", min: 11, max: 18, step: 1 })}
        </div>
      </section>
      <section class="panel-block half">
        <h2>Preview</h2>
        <div class="font-preview" style="--preview-display:${escapeHtml(state.design.typography.displayFamily)};--preview-body:${escapeHtml(state.design.typography.bodyFamily)}">
          <strong>KingShadP</strong>
          <span>A complete visual system should let the typography carry the same premium motion as the images and product rooms.</span>
        </div>
      </section>
    </div>
  `;
}

function renderTheme() {
  const keys = [
    ["theme.paper", "Paper"],
    ["theme.paperStrong", "Paper strong"],
    ["theme.ink", "Ink"],
    ["theme.leather", "Leather"],
    ["theme.charcoal", "Charcoal"],
    ["theme.muted", "Muted"],
    ["theme.line", "Line"],
    ["theme.softLine", "Soft line"],
    ["theme.champagne", "Champagne"],
    ["theme.rose", "Rose accent"],
    ["theme.platinum", "Platinum"],
    ["theme.reverse", "Reverse"]
  ];

  return `
    <section class="panel-block">
      <h2>Color tokens</h2>
      <div class="form-grid">
        ${keys.map(([path, label]) => field(path, label, { type: "color" })).join("")}
      </div>
    </section>
  `;
}

function renderMotion() {
  return `
    <div class="panel-grid">
      <section class="panel-block half">
        <h2>Motion controls</h2>
        <div class="form-grid">
          ${field("motion.bootloader", "Signature bootloader", { type: "checkbox", wide: true })}
          ${field("motion.cursor", "Rare custom cursor", { type: "checkbox", wide: true })}
          ${field("motion.pageTransitions", "Smooth page transitions", { type: "checkbox", wide: true })}
          ${field("motion.parallax", "Parallax hero/media layers", { type: "checkbox", wide: true })}
          ${field("motion.reveals", "Scroll-triggered reveals", { type: "checkbox", wide: true })}
          ${field("motion.spatialClicks", "Spatial click moments", { type: "checkbox", wide: true })}
          ${field("motion.musicVisualizer", "Music playback visualizer", { type: "checkbox", wide: true })}
          ${field("motion.intensity", "Motion intensity", { type: "range", min: 0, max: 1.4, step: 0.05, wide: true })}
        </div>
      </section>
      <section class="panel-block half">
        <h2>Ambient video</h2>
        <div class="form-grid">
          ${field("motion.ambientVideo", "Optional ambient video URL", { wide: true })}
        </div>
        <p>Upload a video in Media and assign it to Ambient video URL, or paste a direct hosted video link here.</p>
      </section>
    </div>
  `;
}

function renderHero() {
  return `
    <section class="panel-block">
      <h2>Hero content</h2>
      <div class="form-grid">
        ${field("site.title", "Browser title", { wide: true })}
        ${field("site.description", "Meta description", { type: "textarea", wide: true, rows: 3 })}
        ${field("hero.signature", "Signature word")}
        ${field("hero.title", "Hero headline", { type: "textarea", wide: true, rows: 3 })}
        ${field("hero.body", "Hero body", { type: "textarea", wide: true, rows: 4 })}
        ${field("hero.primaryLabel", "Primary CTA label")}
        ${field("hero.primaryHref", "Primary CTA href")}
        ${field("hero.secondaryLabel", "Secondary CTA label")}
        ${field("hero.secondaryHref", "Secondary CTA href")}
        ${field("hero.image", "Hero image URL", { wide: true })}
        ${field("hero.imageAlt", "Hero image alt", { wide: true })}
        ${field("hero.imagePosition", "Hero image position")}
        ${field("hero.issue", "Hero issue label")}
        ${field("hero.caption", "Hero caption", { wide: true })}
        ${field("hero.artifactGlyph", "Artifact glyph")}
        ${field("hero.artifactLabel", "Artifact label")}
      </div>
    </section>
  `;
}

function renderProducts() {
  const products = state.design.products || [];
  const product = products[state.activeProduct] || products[0];

  if (!product) {
    return `<section class="panel-block"><h2>No products yet</h2><button type="button" class="panel-button" data-action="add-product">Add Product</button></section>`;
  }

  const base = `products.${state.activeProduct}`;

  return `
    <div class="panel-grid">
      <section class="panel-block third">
        <h2>Products</h2>
        <div class="item-list">
          ${products
            .map(
              (item, index) => `
                <button type="button" class="${index === state.activeProduct ? "is-active" : ""}" data-action="select-product" data-index="${index}">
                  <span>${escapeHtml(item.title || "Untitled product")}</span>
                  <span>${escapeHtml(item.collection || "")}</span>
                </button>
              `
            )
            .join("")}
        </div>
        <div class="inline-actions">
          <button type="button" data-action="add-product">Add</button>
          <button type="button" data-action="duplicate-product">Duplicate</button>
          <button type="button" data-action="remove-product">Remove</button>
        </div>
      </section>
      <section class="panel-block">
        <h2>${escapeHtml(product.title || "Product")}</h2>
        <div class="form-grid">
          ${field(`${base}.id`, "ID")}
          ${field(`${base}.title`, "Title")}
          ${field(`${base}.collection`, "Collection")}
          ${field(`${base}.type`, "Type label")}
          ${field(`${base}.category`, "Filter category")}
          ${field(`${base}.price`, "Price", { type: "number", min: 0, step: 1 })}
          ${field(`${base}.image`, "Image URL", { wide: true })}
          ${field(`${base}.imageAlt`, "Image alt", { wide: true })}
          ${field(`${base}.position`, "Image object position")}
          ${field(`${base}.cropClass`, "Crop class")}
          ${field(`${base}.story`, "Story", { type: "textarea", wide: true, rows: 4 })}
          ${field(`${base}.material`, "Material", { type: "textarea", wide: true, rows: 3 })}
        </div>
      </section>
    </div>
  `;
}

function renderChapters() {
  const chapters = state.design.chapters || [];
  const chapter = chapters[state.activeChapter] || chapters[0];

  if (!chapter) {
    return `<section class="panel-block"><h2>No chapters yet</h2><button type="button" class="panel-button" data-action="add-chapter">Add Chapter</button></section>`;
  }

  const base = `chapters.${state.activeChapter}`;

  return `
    <div class="panel-grid">
      <section class="panel-block third">
        <h2>Chapters</h2>
        <div class="item-list">
          ${chapters
            .map(
              (item, index) => `
                <button type="button" class="${index === state.activeChapter ? "is-active" : ""}" data-action="select-chapter" data-index="${index}">
                  <span>${escapeHtml(item.label || "Chapter")}</span>
                  <span>${escapeHtml(item.key || "")}</span>
                </button>
              `
            )
            .join("")}
        </div>
      </section>
      <section class="panel-block">
        <h2>${escapeHtml(chapter.label || "Chapter")}</h2>
        <div class="form-grid">
          ${field("sections.collectionTitle", "Collection heading", { wide: true })}
          ${field("sections.collectionBody", "Collection body", { type: "textarea", wide: true, rows: 3 })}
          ${field(`${base}.key`, "Key")}
          ${field(`${base}.label`, "Label")}
          ${field(`${base}.title`, "Title", { wide: true })}
          ${field(`${base}.body`, "Body", { type: "textarea", wide: true, rows: 4 })}
          ${field(`${base}.image`, "Image URL", { wide: true })}
          ${field(`${base}.imageAlt`, "Image alt", { wide: true })}
          ${field(`${base}.revealLabel`, "Hover reveal label")}
        </div>
      </section>
    </div>
  `;
}

function renderMusic() {
  return `
    <section class="panel-block">
      <h2>Music page</h2>
      <div class="form-grid">
        ${field("music.title", "Title")}
        ${field("music.body", "Body", { type: "textarea", wide: true, rows: 4 })}
        ${field("music.cover", "Cover URL", { wide: true })}
        ${field("music.coverAlt", "Cover alt", { wide: true })}
        ${field("music.trackTitle", "Track title")}
        ${field("music.trackSubtitle", "Track subtitle")}
        ${(state.design.music?.links || [])
          .map((link, index) => `${field(`music.links.${index}.label`, `Link ${index + 1} label`)}${field(`music.links.${index}.href`, `Link ${index + 1} href`)}`)
          .join("")}
      </div>
    </section>
  `;
}

function renderAbout() {
  return `
    <section class="panel-block">
      <h2>About page</h2>
      <div class="form-grid">
        ${field("about.title", "Title", { wide: true })}
        ${field("about.body", "Body", { type: "textarea", wide: true, rows: 5 })}
        ${field("about.image", "Image URL", { wide: true })}
        ${field("about.imageAlt", "Image alt", { wide: true })}
        ${field("about.caption", "Caption")}
      </div>
    </section>
  `;
}

function renderJournal() {
  const entries = state.design.journal?.entries || [];
  const entry = entries[state.activeJournal] || entries[0];

  if (!entry) {
    return `<section class="panel-block"><h2>No journal tiles yet</h2><button type="button" class="panel-button" data-action="add-journal">Add Tile</button></section>`;
  }

  const base = `journal.entries.${state.activeJournal}`;

  return `
    <div class="panel-grid">
      <section class="panel-block third">
        <h2>Tiles</h2>
        <div class="item-list">
          ${entries
            .map(
              (item, index) => `
                <button type="button" class="${index === state.activeJournal ? "is-active" : ""}" data-action="select-journal" data-index="${index}">
                  <span>${escapeHtml(item.title || "Journal tile")}</span>
                  <span>${escapeHtml(item.label || "")}</span>
                </button>
              `
            )
            .join("")}
        </div>
        <div class="inline-actions">
          <button type="button" data-action="add-journal">Add</button>
          <button type="button" data-action="remove-journal">Remove</button>
        </div>
      </section>
      <section class="panel-block">
        <h2>Journal content</h2>
        <div class="form-grid">
          ${field("journal.title", "Section title", { wide: true })}
          ${field("journal.body", "Section body", { type: "textarea", wide: true, rows: 3 })}
          ${field(`${base}.label`, "Tile label")}
          ${field(`${base}.title`, "Tile title", { wide: true })}
          ${field(`${base}.href`, "Tile link")}
          ${field(`${base}.image`, "Tile image URL", { wide: true })}
          ${field(`${base}.imageAlt`, "Tile image alt", { wide: true })}
        </div>
      </section>
    </div>
  `;
}

function renderRaw() {
  const payload = clone(state.design);
  delete payload.storage;

  return `
    <section class="panel-block">
      <h2>Raw design JSON</h2>
      <p>Edit the full site contract directly when you need absolute control.</p>
      <textarea class="raw-json" id="raw-json">${escapeHtml(JSON.stringify(payload, null, 2))}</textarea>
      <div class="inline-actions">
        <button type="button" class="panel-button" data-action="apply-raw-json">Apply JSON</button>
      </div>
    </section>
  `;
}

function boundValue(target) {
  if (target.dataset.valueType === "boolean") {
    return target.checked;
  }

  if (target.dataset.valueType === "number") {
    return Number(target.value);
  }

  return target.value;
}

async function saveDesign() {
  const design = clone(state.design);
  delete design.storage;
  showNotice("Publishing design changes...");

  const payload = await api("/api/design", {
    method: "POST",
    body: JSON.stringify({ design }),
  });

  state.design = payload.design;
  markClean();
  renderStorage();
  renderPanel();
  refreshPreview();
  showNotice("Published.", "ok");
}

function refreshPreview() {
  const frame = document.querySelector("[data-preview]");
  if (frame) {
    frame.src = `/?adminPreview=${Date.now()}`;
  }
}

async function uploadMedia() {
  const input = document.querySelector("#media-file");
  const target = document.querySelector("#media-target")?.value;
  const file = input?.files?.[0];

  if (!file) {
    showNotice("Choose an image or video file first.", "danger");
    return;
  }

  showNotice("Uploading media...");

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const payload = await api("/api/upload", {
    method: "POST",
    body: JSON.stringify({ fileName: file.name, dataUrl }),
  });

  state.design.mediaLibrary = state.design.mediaLibrary || [];
  state.design.mediaLibrary.unshift(payload.media);
  applyMedia(payload.media.url, target);
  markDirty();
  renderPanel();
  showNotice("Media uploaded and assigned.", "ok");
}

function applyMedia(url, target) {
  if (!url || !target) {
    return;
  }

  setPath(target, url);
}

function addManualMedia() {
  const url = document.querySelector("#manual-media-url")?.value.trim();
  const target = document.querySelector("#manual-media-target")?.value;

  if (!url) {
    showNotice("Paste a media URL first.", "danger");
    return;
  }

  const item = {
    label: url.split("/").pop() || "External media",
    url,
    kind: /\.(mp4|webm|mov)$/i.test(url) ? "video" : "image",
  };

  state.design.mediaLibrary = state.design.mediaLibrary || [];
  state.design.mediaLibrary.unshift(item);
  applyMedia(url, target);
  markDirty();
  renderPanel();
  showNotice("Media URL added.", "ok");
}

function addProduct() {
  const products = state.design.products || [];
  const id = `new-piece-${Date.now()}`;
  products.push({
    id,
    title: "New KingShadP Piece",
    collection: "KSP",
    type: "T-shirt",
    category: "t-shirts",
    price: 88,
    image: "assets/brand/ksp-shield-mark.png",
    imageAlt: "KingShadP piece",
    position: "50% 50%",
    story: "Write the product story here.",
    material: "Add material details here.",
    cropClass: "",
  });
  state.design.products = products;
  state.activeProduct = products.length - 1;
  markDirty();
  renderPanel();
}

function duplicateProduct() {
  const products = state.design.products || [];
  const product = products[state.activeProduct];

  if (!product) {
    return;
  }

  const copy = { ...clone(product), id: `${slugify(product.id || product.title)}-copy`, title: `${product.title || "Piece"} Copy` };
  products.splice(state.activeProduct + 1, 0, copy);
  state.activeProduct += 1;
  markDirty();
  renderPanel();
}

function removeProduct() {
  const products = state.design.products || [];

  if (products.length <= 1) {
    showNotice("Keep at least one product in the room.", "danger");
    return;
  }

  products.splice(state.activeProduct, 1);
  state.activeProduct = Math.max(0, state.activeProduct - 1);
  markDirty();
  renderPanel();
}

function addJournal() {
  state.design.journal.entries = state.design.journal.entries || [];
  state.design.journal.entries.push({
    label: "Archive Note",
    title: "New journal tile",
    href: "#journal",
    image: "assets/brand/giragon-statue-mark.png",
    imageAlt: "KingShadP archive image",
  });
  state.activeJournal = state.design.journal.entries.length - 1;
  markDirty();
  renderPanel();
}

function removeJournal() {
  const entries = state.design.journal.entries || [];

  if (entries.length <= 1) {
    showNotice("Keep at least one journal tile.", "danger");
    return;
  }

  entries.splice(state.activeJournal, 1);
  state.activeJournal = Math.max(0, state.activeJournal - 1);
  markDirty();
  renderPanel();
}

function applyRawJson() {
  const raw = document.querySelector("#raw-json")?.value || "";

  try {
    state.design = JSON.parse(raw);
    markDirty();
    renderStorage();
    renderPanel();
    showNotice("Raw JSON applied. Save to publish it.", "ok");
  } catch (error) {
    showNotice(`JSON error: ${error.message}`, "danger");
  }
}

els.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  els.loginError.textContent = "";

  try {
    const password = new FormData(event.currentTarget).get("password");
    await api("/api/admin-login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    await loadDesign();
    renderApp();
  } catch (error) {
    els.loginError.textContent = error.message;
  }
});

document.addEventListener("input", (event) => {
  const target = event.target.closest("[data-path]");

  if (!target || !state.design) {
    return;
  }

  setPath(target.dataset.path, boundValue(target));
  markDirty();
});

document.addEventListener("change", (event) => {
  const target = event.target.closest("[data-path]");

  if (!target || !state.design) {
    return;
  }

  setPath(target.dataset.path, boundValue(target));
  markDirty();
});

document.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-action]");

  if (!target) {
    return;
  }

  const action = target.dataset.action;

  try {
    if (action === "select-tab") {
      state.activeTab = target.dataset.tab;
      renderTabs();
      renderPanel();
    } else if (action === "save-design") {
      await saveDesign();
    } else if (action === "reload-design") {
      await loadDesign();
      renderStorage();
      renderPanel();
      showNotice("Reloaded from storage.", "ok");
    } else if (action === "refresh-preview") {
      refreshPreview();
      showNotice("Preview refreshed.", "ok");
    } else if (action === "logout") {
      await api("/api/session", { method: "DELETE" });
      window.location.reload();
    } else if (action === "upload-media") {
      await uploadMedia();
    } else if (action === "add-media-url") {
      addManualMedia();
    } else if (action === "use-media") {
      const item = state.design.mediaLibrary?.[Number(target.dataset.mediaIndex)];
      const selected = document.querySelector("#media-target")?.value || "hero.image";
      applyMedia(item?.url, selected);
      markDirty();
      renderPanel();
      showNotice("Media assigned to selected target.", "ok");
    } else if (action === "select-product") {
      state.activeProduct = Number(target.dataset.index);
      renderPanel();
    } else if (action === "add-product") {
      addProduct();
    } else if (action === "duplicate-product") {
      duplicateProduct();
    } else if (action === "remove-product") {
      removeProduct();
    } else if (action === "select-chapter") {
      state.activeChapter = Number(target.dataset.index);
      renderPanel();
    } else if (action === "select-journal") {
      state.activeJournal = Number(target.dataset.index);
      renderPanel();
    } else if (action === "add-journal") {
      addJournal();
    } else if (action === "remove-journal") {
      removeJournal();
    } else if (action === "apply-raw-json") {
      applyRawJson();
    }
  } catch (error) {
    showNotice(error.message, "danger");
  }
});

boot();
