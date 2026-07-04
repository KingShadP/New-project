import { readDesign } from "@/lib/content/service";
import { StorefrontClient } from "@/components/site/StorefrontClient";

export async function StorefrontPage() {
  const data = await readDesign();
  const design = { ...data } as typeof data & { storage?: unknown };
  delete design.storage;

  return <StorefrontClient design={design} />;
}
