import type { MetadataRoute } from 'next';
import { getContent } from '../lib/content';
export const dynamic='force-dynamic';
export default function robots():MetadataRoute.Robots{const c=getContent();const origin=process.env.NEXT_PUBLIC_SITE_URL||c.site.canonicalUrl||'https://fozayelibnayaz.github.io/portfolio/';return{rules:{userAgent:'*',allow:'/',disallow:'/admin/'},sitemap:`${origin.replace(/\/+$/,'')}/sitemap.xml`}}
