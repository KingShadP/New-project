import { readDesign } from "@/lib/content/service";
import { siteDesignSchema } from "@/lib/content/schema";
import { StorefrontClient } from "@/components/site/StorefrontClient";

export async function StorefrontPage() {
  const data = await readDesign();
  const parsed = siteDesignSchema.parse(data);

  return <StorefrontClient design={parsed} />;
}
