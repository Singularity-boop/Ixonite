import type { MetadataRoute } from "next";
import { SITE_URL } from "./content";
import { services, servicePath } from "./services-data";
import { toolPath, tools } from "./tools-data";

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
    { url: `${SITE_URL}/tools/`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    ...tools.map((t) => ({
      url: `${SITE_URL}${toolPath(t)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
