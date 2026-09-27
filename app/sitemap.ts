import type { MetadataRoute } from 'next';
import { getContent } from '../lib/content';
export const dynamic='force-dynamic';
export default function sitemap():MetadataRoute.Sitemap{const c=getContent();const base=(process.env.NEXT_PUBLIC_SITE_URL||c.site.canonicalUrl).replace(/\/+$/,'');const pages:MetadataRoute.Sitemap=[{url:`${base}/`,lastModified:new Date(),changeFrequency:'monthly',priority:1}];for(const p of c.projects){if(p.visible!==false&&p.slug)pages.push({url:`${base}/projects/${p.slug}`,lastModified:new Date(),changeFrequency:'yearly',priority:p.featured?.8:.6})}return pages}
