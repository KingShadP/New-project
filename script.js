const defaultProducts = {
  "giragon-crown-hoodie": {
    id: "giragon-crown-hoodie",
    title: "Giragon Crown Hoodie",
    collection: "Giragon",
    type: "Hoodie",
    category: "hoodies",
    price: 188,
    image: "assets/derived/giragon-hoodie-detail.png",
    imageAlt: "Giragon Crown Hoodie in matte black",
    position: "52% 48%",
    story: "Heavy matte black fleece with a controlled Giragon mark and rose-gold accessory language.",
    material: "Heavy fleece, satin neck label, rose-gold stitch detail",
    cropClass: "crop-hoodie",
  },
  "ksp-signature-tee": {
    id: "ksp-signature-tee",
    title: "KSP Signature Tee",
    collection: "KSP",
    type: "T-shirt",
    category: "t-shirts",
    price: 88,
    image: "assets/visual-samples/sample-01-luxury-drop-vault.png",
    imageAlt: "KSP Signature Tee presented in a private drop vault",
    position: "72% 58%",
    story: "A clean signature tee built for the first layer of the KingShadP uniform.",
    material: "Midweight cotton, soft wash, signature chest mark",
    cropClass: "crop-vault",
  },
  "platinum-long-sleeve": {
    id: "platinum-long-sleeve",
    title: "Platinum Long Sleeve",
    collection: "KSP",
    type: "Long sleeve",
    category: "long-sleeves",
    price: 128,
    image: "assets/visual-samples/sample-03-private-archive-grid.png",
    imageAlt: "Platinum Long Sleeve archive study",
    position: "54% 40%",
    story: "A long sleeve shaped around platinum gallery space and the private archive grid.",
    material: "Cotton jersey, rib cuff, archival screen print",
    cropClass: "crop-archive",
  },
  "black-issue-shorts": {
    id: "black-issue-shorts",
    title: "Black Issue Shorts",
    collection: "KSP",
    type: "Shorts",
    category: "shorts",
    price: 96,
    image: "assets/visual-samples/sample-03-private-archive-grid.png",
    imageAlt: "Black Issue Shorts textile detail",
    position: "88% 42%",
    story: "Black fabric, quiet branding, and a direct summer cut for the KSP chapter.",
    material: "Heavy cotton twill, drawcord waist, tonal mark",
    cropClass: "crop-leather",
  },
  "museum-shell-jacket": {
    id: "museum-shell-jacket",
    title: "Museum Shell Jacket",
    collection: "Giragon",
    type: "Jacket",
    category: "jackets",
    price: 268,
    image: "assets/photos/hero-architecture.png",
    imageAlt: "Museum Shell Jacket editorial architectural study",
    position: "62% 48%",
    story: "A structured shell jacket made for the museum corridor side of the KingShadP world.",
    material: "Water-resistant shell, mesh lining, interior relic label",
    cropClass: "crop-architecture",
  },
  "rose-vault-hoodie": {
    id: "rose-vault-hoodie",
    title: "Rose Vault Hoodie",
    collection: "Giragon",
    type: "Hoodie",
    category: "hoodies",
    price: 198,
    image: "assets/visual-samples/sample-01-luxury-drop-vault.png",
    imageAlt: "Rose Vault Hoodie with Giragon relic detail",
    position: "82% 74%",
    story: "A vault-weight hoodie with rose-gold detail and restrained Giragon placement.",
    material: "Heavy fleece, brushed interior, rose-gold embroidery",
    cropClass: "crop-relic",
  },
};

let products = { ...defaultProducts };
let siteDesign = {};
let motionConfig = {
  bootloader: true,
  cursor: true,
  pageTransitions: true,
  parallax: true,
  reveals: true,
  spatialClicks: true,
  musicVisualizer: true,
  intensity: 1,
  ambientVideo: "",
};

const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const cursorLabel = document.querySelector(".cursor-label");
const header = document.querySelector(".site-header");
const nav = document.querySelector(".site-nav");
const cartDrawer = document.querySelector(".cart-drawer");
const cartPanel = document.querySelector(".cart-panel");
const cartItems = document.querySelector(".cart-items");
const cartEmpty = document.querySelector(".cart-empty");
const cartTotal = document.querySelector(".cart-total strong");
const cartCount = document.querySelector(".cart-count");
const closeCartButton = document.querySelector(".close-cart");
const playButton = document.querySelector(".play-button");
const player = document.querySelector(".player");
const musicRoom = document.querySelector(".music-room");
const progressFill = document.querySelector(".progress-fill");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const pdp = {
  image: document.querySelector("#pdp-image"),
  title: document.querySelector("#pdp-title"),
  story: document.querySelector("#pdp-story"),
  price: document.querySelector("#pdp-price"),
  material: document.querySelector("#pdp-material"),
  collection: document.querySelector("#pdp-collection"),
};

let hoverTargets = [];
let revealTargets = [];
let navLinks = [];
let parallaxTargets = [];
let filterButtons = [];
let productCards = [];
let addButtons = [];
let openProductButtons = [];
let currentAddButton;
let cartTriggers = [];
let variantOptions = [];
let pointerX = window.innerWidth / 2;
let pointerY = window.innerHeight / 2;
let ringX = pointerX;
let ringY = pointerY;
let cursorFrame;
let scrollFrame;
let activeProductId = "giragon-crown-hoodie";
let selectedSize = "M";
let cart = [];
let progress = 18;
let progressTimer;

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function slugify(value) {
  return String(value || "item")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatPrice(value) {
  const number = Number(value) || 0;
  return Number.isInteger(number) ? `$${number}` : `$${number.toFixed(2)}`;
}

function setText(selector, value) {
  const node = document.querySelector(selector);

  if (node && value != null) {
    node.textContent = value;
  }
}

function setAttribute(selector, attribute, value) {
  const node = document.querySelector(selector);

  if (node && value != null) {
    node.setAttribute(attribute, value);
  }
}

function setCSSVar(name, value) {
  if (value == null || value === "") {
    return;
  }

  document.documentElement.style.setProperty(name, value);
}

function refreshDomRefs() {
  hoverTargets = document.querySelectorAll("a, button, [data-hover]");
  revealTargets = document.querySelectorAll("[data-reveal], .signature-card");
  navLinks = document.querySelectorAll(".site-nav a");
  parallaxTargets = document.querySelectorAll("[data-parallax]");
  filterButtons = document.querySelectorAll("[data-filter]");
  productCards = document.querySelectorAll("[data-product-card]");
  addButtons = document.querySelectorAll("[data-add-cart]");
  openProductButtons = document.querySelectorAll("[data-open-product]");
  currentAddButton = document.querySelector("[data-add-current]");
  cartTriggers = document.querySelectorAll(".cart-trigger, .footer-cart");
  variantOptions = document.querySelectorAll(".variant-option");
}

async function fetchDesignFrom(path) {
  const response = await fetch(path, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Could not load ${path}`);
  }

  const payload = await response.json();
  return payload.design || payload;
}

async function loadSiteDesign() {
  try {
    siteDesign = await fetchDesignFrom("/api/design");
  } catch {
    try {
      siteDesign = await fetchDesignFrom("data/site-design.default.json");
    } catch {
      siteDesign = {};
    }
  }

  applySiteDesign(siteDesign);
}

function applySiteDesign(design) {
  if (!design || !Object.keys(design).length) {
    return;
  }

  applyMeta(design.site);
  applyTheme(design.theme);
  applyTypography(design.typography);
  applyMotion(design.motion);
  applyHero(design.hero);
  applySections(design.sections);
  renderRoutes(design.routes);
  renderProducts(design.products);
  renderChapters(design.chapters);
  applyMusic(design.music);
  applyAbout(design.about);
  renderJournal(design.journal);
  updatePdp(activeProductId, false);
}

function applyMeta(site = {}) {
  if (site.title) {
    document.title = site.title;
    setAttribute('meta[property="og:title"]', "content", site.title);
    setAttribute('meta[name="twitter:title"]', "content", site.title);
  }

  if (site.description) {
    setAttribute('meta[name="description"]', "content", site.description);
    setAttribute('meta[property="og:description"]', "content", site.description);
    setAttribute('meta[name="twitter:description"]', "content", site.description);
  }

  if (site.canonical) {
    setAttribute('link[rel="canonical"]', "href", site.canonical);
    setAttribute('meta[property="og:url"]', "content", site.canonical);
  }
}

function applyTheme(theme = {}) {
  const themeMap = {
    paper: "--paper",
    paperStrong: "--paper-strong",
    ink: "--ink",
    leather: "--leather",
    charcoal: "--charcoal",
    muted: "--muted",
    line: "--line",
    softLine: "--soft-line",
    champagne: "--champagne",
    rose: "--rose",
    platinum: "--platinum",
    reverse: "--reverse",
  };

  Object.entries(themeMap).forEach(([key, variable]) => setCSSVar(variable, theme[key]));
}

function applyTypography(typography = {}) {
  setCSSVar("--font-display", typography.displayFamily);
  setCSSVar("--font-body", typography.bodyFamily);
  setCSSVar("--hero-size", typography.heroSize ? `${typography.heroSize}px` : null);
  setCSSVar("--section-title-size", typography.sectionTitleSize ? `${typography.sectionTitleSize}px` : null);
  setCSSVar("--panel-title-size", typography.panelTitleSize ? `${typography.panelTitleSize}px` : null);
  setCSSVar("--body-size", typography.bodySize ? `${typography.bodySize}px` : null);
  setCSSVar("--nav-size", typography.navSize ? `${typography.navSize}px` : null);
}

function applyMotion(motion = {}) {
  motionConfig = { ...motionConfig, ...motion };
  const intensity = Number(motionConfig.intensity ?? 1);
  setCSSVar("--motion-intensity", String(intensity));
  document.body.classList.toggle("motion-no-cursor", !motionConfig.cursor || reducedMotion);
  document.body.classList.toggle("motion-muted", intensity <= 0.2 || reducedMotion);
  document.body.classList.toggle("motion-no-visualizer", !motionConfig.musicVisualizer);
  applyAmbientVideo(motionConfig.ambientVideo);
}

function applyAmbientVideo(url) {
  const hero = document.querySelector(".hero");
  let video = document.querySelector(".hero-video");

  if (!hero) {
    return;
  }

  if (!url) {
    video?.remove();
    return;
  }

  if (!video) {
    video = document.createElement("video");
    video.className = "hero-video";
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    hero.prepend(video);
  }

  if (video.getAttribute("src") !== url) {
    video.setAttribute("src", url);
  }
}

function applyHero(hero = {}) {
  setText(".signature-word", hero.signature);
  setText("#hero-title", hero.title);
  setText(".hero-copy > p:not(.signature-word)", hero.body);
  setText(".hero-actions .button-dark span", hero.primaryLabel);
  setText(".hero-actions .button-light span", hero.secondaryLabel);
  setAttribute(".hero-actions .button-dark", "href", hero.primaryHref || "#shop");
  setAttribute(".hero-actions .button-light", "href", hero.secondaryHref || "#music");
  setAttribute(".hero-visual img", "src", hero.image);
  setAttribute(".hero-visual img", "alt", hero.imageAlt);
  setText(".hero-visual figcaption span", hero.issue);
  setText(".hero-visual figcaption strong", hero.caption);
  setText(".hero-artifact span", hero.artifactGlyph);
  setText(".hero-artifact small", hero.artifactLabel);

  const heroImage = document.querySelector(".hero-visual img");
  if (heroImage && hero.imagePosition) {
    heroImage.style.objectPosition = hero.imagePosition;
    heroImage.style.transformOrigin = hero.imagePosition;
  }
}

function applySections(sections = {}) {
  setText("#shop .section-index", sections.shopIndex);
  setText("#shop-title", sections.shopTitle);
  setText("#shop .section-heading p:not(.section-index)", sections.shopBody);
  setText("#collection .section-index", sections.collectionIndex);
  setText("#collection-title", sections.collectionTitle);
  setText("#collection .section-heading p:not(.section-index)", sections.collectionBody);
  setText("#product-detail .section-index", sections.pdpIndex);
  setText("#music .section-index", sections.musicIndex);
  setText("#about .section-index", sections.aboutIndex);
  setText("#journal .section-index", sections.journalIndex);
}

function renderRoutes(routes = []) {
  const container = document.querySelector(".world-routes");

  if (!container || !routes.length) {
    return;
  }

  container.innerHTML = routes
    .map(
      (route) => `
        <a href="${escapeHTML(route.href || "#shop")}" data-hover data-cursor="${escapeHTML(route.cursor || "enter")}">
          <span>${escapeHTML(route.index)}</span>
          <strong>${escapeHTML(route.title)}</strong>
          <em>${escapeHTML(route.body)}</em>
        </a>
      `
    )
    .join("");
}

function normalizeProduct(product, index) {
  const title = product.title || `KingShadP Piece ${index + 1}`;
  const type = product.type || "Piece";
  const id = slugify(product.id || title);

  return {
    ...product,
    id,
    title,
    collection: product.collection || "KSP",
    type,
    category: product.category || slugify(type),
    price: Number(product.price) || 0,
    image: product.image || "assets/derived/giragon-hoodie-detail.png",
    imageAlt: product.imageAlt || `${title} product media`,
    position: product.position || "50% 50%",
    story: product.story || "",
    material: product.material || "",
    cropClass: product.cropClass || "",
  };
}

function renderFilters(productList) {
  const toolbar = document.querySelector(".shop-toolbar");

  if (!toolbar) {
    return;
  }

  const categories = [...new Map(productList.map((product) => [product.category, product.type])).entries()];
  const buttons = [["all", "All"], ...categories];

  toolbar.innerHTML = buttons
    .map(
      ([category, label], index) => `
        <button class="filter-button ${index === 0 ? "is-active" : ""}" type="button" data-filter="${escapeHTML(category)}" data-hover>
          ${escapeHTML(label)}
        </button>
      `
    )
    .join("");
}

function renderProducts(productList = []) {
  const normalized = productList.length ? productList.map(normalizeProduct) : Object.values(defaultProducts);
  const grid = document.querySelector(".product-grid");

  products = Object.fromEntries(normalized.map((product) => [product.id, product]));
  activeProductId = products[activeProductId] ? activeProductId : normalized[0]?.id || activeProductId;
  renderFilters(normalized);

  if (!grid) {
    return;
  }

  grid.innerHTML = normalized
    .map(
      (product) => `
        <article class="product-card" data-product-card data-type="${escapeHTML(product.category)}" data-product-id="${escapeHTML(product.id)}">
          <button
            class="product-media ${escapeHTML(product.cropClass)}"
            type="button"
            data-open-product
            data-product-id="${escapeHTML(product.id)}"
            data-hover
            data-cursor="inspect"
            data-reveal-label="Open detail"
          >
            <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.imageAlt)}" style="object-position:${escapeHTML(product.position)};transform-origin:${escapeHTML(product.position)}" />
            <span>${escapeHTML(product.type)}</span>
          </button>
          <div class="product-body">
            <p>${escapeHTML(product.collection)}</p>
            <h3>${escapeHTML(product.title)}</h3>
            <div class="product-meta">
              <span>${formatPrice(product.price)}</span>
              <button type="button" data-add-cart data-product-id="${escapeHTML(product.id)}" data-hover data-cursor="add">Quick add</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function renderChapters(chapters = []) {
  const grid = document.querySelector(".chapter-grid");

  if (!grid || !chapters.length) {
    return;
  }

  grid.innerHTML = chapters
    .map((chapter, index) => {
      const productButtons = (chapter.productIds || [])
        .filter((id) => products[id])
        .map(
          (id) =>
            `<button type="button" data-open-product data-product-id="${escapeHTML(id)}" data-hover data-cursor="inspect">${escapeHTML(products[id].title)}</button>`
        )
        .join("");

      return `
        <article class="chapter ${escapeHTML(chapter.key || `chapter-${index}`)}-chapter" data-reveal>
          <figure data-parallax data-depth="12" data-reveal-label="${escapeHTML(chapter.revealLabel || "Chapter room")}">
            <img src="${escapeHTML(chapter.image)}" alt="${escapeHTML(chapter.imageAlt || chapter.title || "KingShadP chapter")}" />
          </figure>
          <div class="chapter-copy">
            <span>${escapeHTML(chapter.label)}</span>
            <h3>${escapeHTML(chapter.title)}</h3>
            <p>${escapeHTML(chapter.body)}</p>
            <div class="chapter-rail">${productButtons}</div>
          </div>
        </article>
      `;
    })
    .join("");
}

function applyMusic(music = {}) {
  setText("#music-title", music.title);
  setText(".music-copy > p:not(.section-index)", music.body);
  setAttribute(".album-cover img", "src", music.cover);
  setAttribute(".album-cover img", "alt", music.coverAlt);
  setText(".track-meta strong", music.trackTitle);
  setText(".track-meta span", music.trackSubtitle);

  const links = document.querySelector(".stream-links");
  if (links && Array.isArray(music.links)) {
    links.innerHTML = music.links
      .map((link) => `<a href="${escapeHTML(link.href || "#music")}" data-hover data-cursor="open">${escapeHTML(link.label)}</a>`)
      .join("");
  }
}

function applyAbout(about = {}) {
  setText("#about-title", about.title);
  setText(".about-copy > p", about.body);
  setAttribute(".about-artifact img", "src", about.image);
  setAttribute(".about-artifact img", "alt", about.imageAlt);
  setText(".about-artifact figcaption", about.caption);
}

function renderJournal(journal = {}) {
  setText("#journal-title", journal.title);
  setText("#journal .section-heading p:not(.section-index)", journal.body);

  const grid = document.querySelector(".journal-grid");

  if (!grid || !Array.isArray(journal.entries)) {
    return;
  }

  grid.innerHTML = journal.entries
    .map(
      (entry) => `
        <a class="journal-card" href="${escapeHTML(entry.href || "#journal")}" data-hover data-cursor="read" data-reveal-label="Read note">
          <img src="${escapeHTML(entry.image)}" alt="${escapeHTML(entry.imageAlt || entry.title || "KingShadP journal image")}" />
          <span>${escapeHTML(entry.label)}</span>
          <strong>${escapeHTML(entry.title)}</strong>
        </a>
      `
    )
    .join("");
}

function updateCursor() {
  ringX += (pointerX - ringX) * 0.18;
  ringY += (pointerY - ringY) * 0.18;

  cursorDot.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
  cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
  cursorFrame = requestAnimationFrame(updateCursor);
}

function setCursorMode(target) {
  const label = target.dataset.cursor || target.getAttribute("aria-label") || "";
  cursorLabel.textContent = label;
  document.body.classList.add("cursor-hover");
  document.body.classList.toggle("cursor-labeled", Boolean(label));
}

function clearCursorMode() {
  cursorLabel.textContent = "";
  document.body.classList.remove("cursor-hover", "cursor-labeled");
}

function enableCursor() {
  if (!motionConfig.cursor || !window.matchMedia("(pointer: fine)").matches || reducedMotion) {
    document.body.classList.add("motion-no-cursor");
    return;
  }

  document.body.classList.add("cursor-ready");
  cursorFrame = requestAnimationFrame(updateCursor);

  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
  });

  hoverTargets.forEach((target) => {
    target.addEventListener("pointerenter", () => {
      setCursorMode(target);
    });
    target.addEventListener("pointerleave", () => {
      clearCursorMode();
    });
  });
}

function setupGate() {
  const gate = document.querySelector(".signature-gate");

  if (!gate) {
    return;
  }

  if (!motionConfig.bootloader || reducedMotion) {
    gate.remove();
    return;
  }

  window.setTimeout(() => {
    gate.classList.add("is-dismissed");
  }, 2450);
}

function setupReveal() {
  if (!motionConfig.reveals || !("IntersectionObserver" in window) || reducedMotion) {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealTargets.forEach((target, index) => {
    target.style.setProperty("--reveal-delay", `${Math.min(index * 34, 170)}ms`);
    observer.observe(target);
  });
}

function setupHeader() {
  let headerFrame = null;
  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 20);
    headerFrame = null;
  };

  const requestHeaderUpdate = () => {
    if (!headerFrame) {
      headerFrame = requestAnimationFrame(updateHeader);
    }
  };

  updateHeader();
  window.addEventListener("scroll", requestHeaderUpdate, { passive: true });
}

function setupNavState() {
  const sections = [...navLinks]
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  let navFrame = null;
  let sectionOffsets = [];

  const cacheOffsets = () => {
    sectionOffsets = sections.map((section) => ({
      section,
      offset: section.offsetTop - 130,
    }));
  };

  const updateNav = () => {
    let active = sections[0];
    const scrollY = window.scrollY;

    sectionOffsets.forEach(({ section, offset }) => {
      if (offset <= scrollY) {
        active = section;
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle("is-active", active && link.getAttribute("href") === `#${active.id}`);
    });

    const activeLink = [...navLinks].find((link) => link.classList.contains("is-active")) || navLinks[0];

    if (nav && activeLink) {
      const navRect = nav.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      nav.style.setProperty("--nav-x", `${linkRect.left - navRect.left}px`);
      nav.style.setProperty("--nav-w", `${linkRect.width}px`);
    }
    navFrame = null;
  };

  const requestNavUpdate = () => {
    if (!navFrame) {
      navFrame = requestAnimationFrame(updateNav);
    }
  };

  cacheOffsets();
  updateNav();
  window.addEventListener("scroll", requestNavUpdate, { passive: true });
  window.addEventListener("resize", () => {
    cacheOffsets();
    requestNavUpdate();
  });
}

function setupParallax() {
  if (!motionConfig.parallax || reducedMotion) {
    return;
  }

  const updateParallax = () => {
    const viewportHeight = window.innerHeight;
    const intensity = Number(motionConfig.intensity ?? 1);

    parallaxTargets.forEach((target) => {
      const rect = target.getBoundingClientRect();
      const progressValue = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
      const depth = Number(target.dataset.depth || 18) * intensity;
      const offset = Math.max(-Math.abs(depth), Math.min(Math.abs(depth), progressValue * -depth));
      target.style.setProperty("--parallax-y", `${offset}px`);
    });

    scrollFrame = null;
  };

  const requestParallax = () => {
    if (!scrollFrame) {
      scrollFrame = requestAnimationFrame(updateParallax);
    }
  };

  updateParallax();
  window.addEventListener("scroll", requestParallax, { passive: true });
  window.addEventListener("resize", requestParallax);
}

function emitSpatialClick(event) {
  if (!motionConfig.spatialClicks || reducedMotion || !event.clientX || !event.clientY) {
    return;
  }

  const ripple = document.createElement("span");
  ripple.className = "spatial-click";
  ripple.style.setProperty("--click-x", `${event.clientX}px`);
  ripple.style.setProperty("--click-y", `${event.clientY}px`);
  document.body.appendChild(ripple);
  window.setTimeout(() => ripple.remove(), 680);
}

function pressTarget(target) {
  target.classList.add("is-pressed");
  window.setTimeout(() => target.classList.remove("is-pressed"), 260);
}

function setupSpatialMoments() {
  document.addEventListener("click", (event) => {
    const target = event.target.closest("a, button");

    if (!target) {
      return;
    }

    emitSpatialClick(event);
    pressTarget(target);
  });
}

function setupPageTransitions() {
  if (!motionConfig.pageTransitions || reducedMotion) {
    return;
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      const target = hash && hash.length > 1 ? document.querySelector(hash) : null;

      if (!target) {
        return;
      }

      event.preventDefault();
      document.body.classList.add("is-transitioning");

      window.setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, "", hash);
      }, 170);

      window.setTimeout(() => {
        document.body.classList.remove("is-transitioning");
      }, 620);
    });
  });
}

function setupFilters() {
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");

      productCards.forEach((card) => {
        const matches = filter === "all" || card.dataset.type === filter;
        card.classList.toggle("is-hidden", !matches);
      });
    });
  });
}

function updatePdp(productId, shouldScroll = true) {
  const product = products[productId];

  if (!product || !pdp.image) {
    return;
  }

  activeProductId = productId;
  pdp.image.style.opacity = "0";
  pdp.image.style.transform = "scale(1.13)";

  window.setTimeout(() => {
    pdp.image.src = product.image;
    pdp.image.alt = `${product.title} product detail media`;
    pdp.image.style.objectPosition = product.position;
    pdp.image.style.transformOrigin = product.position;
    pdp.image.style.opacity = "1";
    pdp.image.style.transform = "scale(1.18)";
  }, 130);

  pdp.title.textContent = product.title;
  pdp.story.textContent = product.story;
  pdp.price.textContent = formatPrice(product.price);
  pdp.material.textContent = product.material;
  pdp.collection.textContent = product.collection;

  if (shouldScroll) {
    document.querySelector("#product-detail").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function setupProductDetail() {
  openProductButtons.forEach((button) => {
    button.addEventListener("click", () => {
      updatePdp(button.dataset.productId);
    });
  });

  variantOptions.forEach((button) => {
    button.addEventListener("click", () => {
      selectedSize = button.dataset.size;
      variantOptions.forEach((item) => item.classList.remove("is-selected"));
      button.classList.add("is-selected");
    });
  });

  currentAddButton?.addEventListener("click", () => {
    addToCart(activeProductId);
  });
}

function addToCart(productId) {
  const product = products[productId];

  if (!product) {
    return;
  }

  const key = `${productId}-${selectedSize}`;
  const existing = cart.find((item) => item.key === key);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, key, size: selectedSize, quantity: 1 });
  }

  renderCart();
  openCart();
}

function renderCart() {
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  cartCount.textContent = totalQuantity;
  cartTotal.textContent = formatPrice(totalPrice);
  cartEmpty.classList.toggle("is-hidden", cart.length > 0);

  cartItems.innerHTML = cart
    .map(
      (item) => `
        <article class="cart-line">
          <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.title)}" style="object-position:${escapeHTML(item.position)}" />
          <div>
            <h3>${escapeHTML(item.title)}</h3>
            <p>${escapeHTML(item.collection)} / ${escapeHTML(item.type)} / Size ${escapeHTML(item.size)}</p>
            <div class="quantity-control" aria-label="Quantity for ${escapeHTML(item.title)}">
              <button type="button" data-quantity="decrease" data-key="${escapeHTML(item.key)}" aria-label="Decrease ${escapeHTML(item.title)} quantity">-</button>
              <span>${item.quantity}</span>
              <button type="button" data-quantity="increase" data-key="${escapeHTML(item.key)}" aria-label="Increase ${escapeHTML(item.title)} quantity">+</button>
            </div>
          </div>
          <span class="line-price">${formatPrice(item.price * item.quantity)}</span>
        </article>
      `
    )
    .join("");

  cartItems.querySelectorAll("[data-quantity]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = cart.find((cartItem) => cartItem.key === button.dataset.key);

      if (!item) {
        return;
      }

      if (button.dataset.quantity === "increase") {
        item.quantity += 1;
      } else {
        item.quantity -= 1;
      }

      cart = cart.filter((cartItem) => cartItem.quantity > 0);
      renderCart();
    });
  });
}

function openCart() {
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("cart-open");
}

function closeCart() {
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("cart-open");
}

function setupCart() {
  addButtons.forEach((button) => {
    button.addEventListener("click", () => {
      addToCart(button.dataset.productId);
    });
  });

  cartTriggers.forEach((trigger) => {
    trigger.addEventListener("click", openCart);
  });

  closeCartButton.addEventListener("click", closeCart);

  cartDrawer.addEventListener("click", (event) => {
    if (!cartPanel.contains(event.target)) {
      closeCart();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && cartDrawer.classList.contains("is-open")) {
      closeCart();
    }
  });
}

function setupMusicPlayer() {
  playButton.addEventListener("click", () => {
    player.classList.toggle("is-playing");
    musicRoom.classList.toggle("is-playing", player.classList.contains("is-playing"));

    if (player.classList.contains("is-playing") && motionConfig.musicVisualizer) {
      window.clearInterval(progressTimer);
      progressTimer = window.setInterval(() => {
        progress = progress >= 100 ? 0 : progress + 1;
        progressFill.style.width = `${progress}%`;
      }, 260);
    } else {
      window.clearInterval(progressTimer);
    }
  });
}

window.addEventListener("beforeunload", () => {
  if (cursorFrame) {
    cancelAnimationFrame(cursorFrame);
  }
  if (scrollFrame) {
    cancelAnimationFrame(scrollFrame);
  }
  if (progressTimer) {
    window.clearInterval(progressTimer);
  }
});

async function init() {
  await loadSiteDesign();
  refreshDomRefs();
  setupGate();
  enableCursor();
  setupReveal();
  setupHeader();
  setupNavState();
  setupParallax();
  setupPageTransitions();
  setupSpatialMoments();
  setupFilters();
  setupProductDetail();
  setupCart();
  setupMusicPlayer();
}

init();
