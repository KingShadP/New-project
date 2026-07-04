import type { Metadata } from "next";
import { readDesign } from "@/lib/content/service";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await readDesign();
  return {
    title: site.title,
    description: site.description,
    metadataBase: new URL(site.canonical),
    openGraph: {
      title: site.title,
      description: site.description,
      url: site.canonical,
      type: "website",
      siteName: "KingShadP",
    },
    twitter: {
      card: "summary_large_image",
      title: site.title,
      description: site.description,
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
