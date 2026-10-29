import type { MetadataRoute } from "next";
import { SITE_URL } from "./content";
import { services, servicePath } from "./services-data";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...services.map((s, i) => ({
      url: `${SITE_URL}${servicePath(s)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: i === 0 ? 0.9 : 0.8,
    })),
  ];
}
