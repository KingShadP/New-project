"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { SiteDesign } from "@/lib/content/schema";

type CartLine = {
  id: string;
  title: string;
  price: number;
  quantity: number;
};

const navItems = [
  { label: "Shop", href: "/shop#shop" },
  { label: "Collection", href: "/collection#collection" },
  { label: "Music", href: "/music#music" },
  { label: "About", href: "/about#about" },
  { label: "Journal", href: "/journal#journal" },
];

function money(value: number) {
  return `$${value.toFixed(0)}`;
}

export function StorefrontClient({ design }: { design: SiteDesign }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeProduct, setActiveProduct] = useState(design.products[0]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [isPlaying, setPlaying] = useState(false);

  const categories = useMemo(() => {
    return ["all", ...new Set(design.products.map((product) => product.category))];
  }, [design.products]);

  const filtered = useMemo(() => {
    if (activeCategory === "all") {
      return design.products;
    }

    return design.products.filter((product) => product.category === activeCategory);
  }, [activeCategory, design.products]);

  const total = useMemo(() => {
    return cart.reduce((sum, line) => sum + line.quantity * line.price, 0);
  }, [cart]);

  function addToCart(productId: string) {
    const product = design.products.find((item) => item.id === productId);
    if (!product) {
      return;
    }

    setCart((current) => {
      const existing = current.find((line) => line.id === product.id);
      if (!existing) {
        return [...current, { id: product.id, title: product.title, price: product.price, quantity: 1 }];
      }

      return current.map((line) => (line.id === product.id ? { ...line, quantity: line.quantity + 1 } : line));
    });
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <Link href="/" className="brand">
          KingShadP
        </Link>
        <nav>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="cart-pill">Cart {cart.reduce((sum, line) => sum + line.quantity, 0)}</div>
      </header>

      <main>
        <section className="hero" id="home">
          <div>
            <p className="eyebrow">{design.hero.signature}</p>
            <h1>{design.hero.title}</h1>
            <p>{design.hero.body}</p>
            <div className="hero-actions">
              <a href={design.hero.primaryHref} className="button dark">
                {design.hero.primaryLabel}
              </a>
              <a href={design.hero.secondaryHref} className="button light">
                {design.hero.secondaryLabel}
              </a>
            </div>
          </div>
          <img src={design.hero.image} alt={design.hero.imageAlt} />
        </section>

        <section className="routes" aria-label="World routes">
          {design.routes.map((route) => (
            <a key={route.index + route.href} href={route.href}>
              <span>{route.index}</span>
              <strong>{route.title}</strong>
              <small>{route.body}</small>
            </a>
          ))}
        </section>

        <section id="shop" className="section">
          <p className="eyebrow">{design.sections.shopIndex}</p>
          <h2>{design.sections.shopTitle}</h2>
          <p>{design.sections.shopBody}</p>
          <div className="filters">
            {categories.map((category) => (
              <button
                key={category}
                className={category === activeCategory ? "is-active" : ""}
                onClick={() => setActiveCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
          <div className="grid">
            {filtered.map((product) => (
              <article key={product.id} className="card">
                <button type="button" className="ghost" onClick={() => setActiveProduct(product)}>
                  <img src={product.image} alt={product.imageAlt} />
                </button>
                <div>
                  <p>{product.collection}</p>
                  <h3>{product.title}</h3>
                  <div className="row">
                    <span>{money(product.price)}</span>
                    <button type="button" onClick={() => addToCart(product.id)}>
                      Add
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="product-detail" className="section detail">
          <p className="eyebrow">{design.sections.pdpIndex}</p>
          <div>
            <img src={activeProduct.image} alt={activeProduct.imageAlt} />
            <div>
              <p>{activeProduct.collection}</p>
              <h2>{activeProduct.title}</h2>
              <p>{activeProduct.story}</p>
              <p>
                <strong>{money(activeProduct.price)}</strong>
              </p>
              <p>{activeProduct.material}</p>
            </div>
          </div>
        </section>

        <section id="collection" className="section">
          <p className="eyebrow">{design.sections.collectionIndex}</p>
          <h2>{design.sections.collectionTitle}</h2>
          <p>{design.sections.collectionBody}</p>
          <div className="chapters">
            {design.chapters.map((chapter) => (
              <article key={chapter.key}>
                <img src={chapter.image} alt={chapter.imageAlt} />
                <h3>{chapter.title}</h3>
                <p>{chapter.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="music" className="section">
          <p className="eyebrow">{design.sections.musicIndex}</p>
          <h2>{design.music.title}</h2>
          <p>{design.music.body}</p>
          <div className="music-box">
            <img src={design.music.cover} alt={design.music.coverAlt} />
            <div>
              <strong>{design.music.trackTitle}</strong>
              <p>{design.music.trackSubtitle}</p>
              <button type="button" onClick={() => setPlaying((value) => !value)}>
                {isPlaying ? "Pause" : "Play"}
              </button>
              <div className="music-links">
                {design.music.links.map((link) => (
                  <a key={link.label} href={link.href}>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="section">
          <p className="eyebrow">{design.sections.aboutIndex}</p>
          <h2>{design.about.title}</h2>
          <p>{design.about.body}</p>
          <img src={design.about.image} alt={design.about.imageAlt} />
          <small>{design.about.caption}</small>
        </section>

        <section id="journal" className="section">
          <p className="eyebrow">{design.sections.journalIndex}</p>
          <h2>{design.journal.title}</h2>
          <p>{design.journal.body}</p>
          <div className="journal-grid">
            {design.journal.entries.map((entry) => (
              <article key={entry.title}>
                <img src={entry.image} alt={entry.imageAlt} />
                <small>{entry.label}</small>
                <h3>{entry.title}</h3>
                <a href={entry.href}>Open</a>
              </article>
            ))}
          </div>
        </section>
      </main>

      <aside className="cart-summary">
        <h3>Cart Summary</h3>
        {cart.length ? (
          <>
            <ul>
              {cart.map((line) => (
                <li key={line.id}>
                  <span>{line.title}</span>
                  <span>
                    {line.quantity} x {money(line.price)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="total">Total {money(total)}</p>
          </>
        ) : (
          <p>Cart is empty.</p>
        )}
      </aside>
    </div>
  );
}
