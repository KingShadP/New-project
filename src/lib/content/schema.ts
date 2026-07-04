import { z } from "zod";

const hexColor = z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/);

const mediaEntrySchema = z.object({
  label: z.string().min(1),
  url: z.string().min(1),
  kind: z.enum(["image", "video"]),
  pathname: z.string().optional(),
});

const productSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  collection: z.string().min(1),
  type: z.string().min(1),
  category: z.string().min(1),
  price: z.number().nonnegative(),
  image: z.string().min(1),
  imageAlt: z.string().min(1),
  position: z.string().default("50% 50%"),
  story: z.string().default(""),
  material: z.string().default(""),
  cropClass: z.string().default(""),
});

const chapterSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  image: z.string().min(1),
  imageAlt: z.string().min(1),
  revealLabel: z.string().min(1),
  productIds: z.array(z.string().min(1)).default([]),
});

const journalEntrySchema = z.object({
  label: z.string().min(1),
  title: z.string().min(1),
  href: z.string().min(1),
  image: z.string().min(1),
  imageAlt: z.string().min(1),
});

export const siteDesignSchema = z.object({
  version: z.number().int().min(1),
  updatedAt: z.string().datetime().or(z.string().min(1)),
  site: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    canonical: z.string().url().or(z.string().startsWith("/")).or(z.string().min(1)),
  }),
  theme: z.object({
    paper: hexColor,
    paperStrong: hexColor,
    ink: hexColor,
    leather: hexColor,
    charcoal: hexColor,
    muted: hexColor,
    line: hexColor,
    softLine: hexColor,
    champagne: hexColor,
    rose: hexColor,
    platinum: hexColor,
    reverse: hexColor,
  }),
  typography: z.object({
    displayFamily: z.string().min(1),
    bodyFamily: z.string().min(1),
    heroSize: z.number().positive(),
    sectionTitleSize: z.number().positive(),
    panelTitleSize: z.number().positive(),
    bodySize: z.number().positive(),
    navSize: z.number().positive(),
  }),
  motion: z.object({
    bootloader: z.boolean(),
    cursor: z.boolean(),
    pageTransitions: z.boolean(),
    parallax: z.boolean(),
    reveals: z.boolean(),
    spatialClicks: z.boolean(),
    musicVisualizer: z.boolean(),
    intensity: z.number().min(0).max(2),
    ambientVideo: z.string(),
  }),
  hero: z.object({
    signature: z.string().min(1),
    title: z.string().min(1),
    body: z.string().min(1),
    primaryLabel: z.string().min(1),
    primaryHref: z.string().min(1),
    secondaryLabel: z.string().min(1),
    secondaryHref: z.string().min(1),
    image: z.string().min(1),
    imageAlt: z.string().min(1),
    imagePosition: z.string().min(1),
    issue: z.string().min(1),
    caption: z.string().min(1),
    artifactGlyph: z.string().min(1),
    artifactLabel: z.string().min(1),
  }),
  routes: z.array(
    z.object({
      index: z.string().min(1),
      title: z.string().min(1),
      body: z.string().min(1),
      href: z.string().min(1),
    }),
  ),
  sections: z.object({
    shopIndex: z.string().min(1),
    shopTitle: z.string().min(1),
    shopBody: z.string().min(1),
    collectionIndex: z.string().min(1),
    collectionTitle: z.string().min(1),
    collectionBody: z.string().min(1),
    pdpIndex: z.string().min(1),
    musicIndex: z.string().min(1),
    aboutIndex: z.string().min(1),
    journalIndex: z.string().min(1),
  }),
  chapters: z.array(chapterSchema),
  products: z.array(productSchema),
  music: z.object({
    title: z.string().min(1),
    body: z.string().min(1),
    cover: z.string().min(1),
    coverAlt: z.string().min(1),
    trackTitle: z.string().min(1),
    trackSubtitle: z.string().min(1),
    links: z.array(z.object({ label: z.string().min(1), href: z.string().min(1) })),
  }),
  about: z.object({
    title: z.string().min(1),
    body: z.string().min(1),
    image: z.string().min(1),
    imageAlt: z.string().min(1),
    caption: z.string().min(1),
  }),
  journal: z.object({
    title: z.string().min(1),
    body: z.string().min(1),
    entries: z.array(journalEntrySchema),
  }),
  mediaLibrary: z.array(mediaEntrySchema),
});

export type SiteDesign = z.infer<typeof siteDesignSchema>;
