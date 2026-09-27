import type { Metadata, Viewport } from 'next';
import type { CSSProperties } from 'react';
import './globals.css';
import { getContent } from '../lib/content';
import { siteAsset, siteSrcSet } from '../lib/site-path';
export const viewport: Viewport = { width:'device-width', initialScale:1, themeColor:'#fdfdfc' };
const themeBoot = `(function(){try{var key='portfolio-theme',mq=window.matchMedia('(prefers-color-scheme: dark)'),apply=function(){document.documentElement.dataset.theme=localStorage.getItem(key)||(mq.matches?'dark':'light')};apply();mq.addEventListener('change',function(){if(!localStorage.getItem(key))apply()})}catch(e){}})()`;
export async function generateMetadata():Promise<Metadata>{
  const c=getContent(),site=c.site as any;
  const base=process.env.NEXT_PUBLIC_SITE_URL||site.canonicalUrl;
  const canonical=process.env.NEXT_PUBLIC_SITE_URL||site.canonicalUrl||base;
  const image=site.socialImage?.startsWith('http')?site.socialImage:new URL(String(site.socialImage||'og-image.jpg').replace(/^\/+/,''),new URL(base.endsWith('/')?base:`${base}/`)).toString();
  return {
    metadataBase:new URL(base), title:site.seoTitle||site.title, description:site.description,
    alternates:{canonical},
    openGraph:{type:'website',locale:'en_US',url:canonical,title:site.seoTitle||site.title,description:site.description,siteName:site.title,images:[{url:image,width:1200,height:630,alt:'Fozayel Ibn Ayaz — full-stack developer'}]},
    twitter:{card:'summary_large_image',title:site.seoTitle||site.title,description:site.description,images:[image]},
    icons:{icon:siteAsset(site.favicon||'/favicon.svg')}, robots:{index:true,follow:true}
  };
}
export default function RootLayout({children}:{children:React.ReactNode}) {
  const content=getContent();const theme=content.site.theme as any;const heroImage=String(content.profile.image||'/images/fozayel-760.webp');
  const defaultPortrait=['/images/fozayel-760.webp','/images/fozayel-1200.webp'].includes(heroImage);
  const palette={'--theme-light':theme?.light||'#fdfdfc','--theme-dark':theme?.dark||'#141414','--accent-light':theme?.accent||'#22c55e','--accent-dark':theme?.darkAccent||'#36d978','--accent-text-light':theme?.accentTextLight||'#126b36','--accent-text-dark':theme?.accentTextDark||'#63e38f'} as CSSProperties;
  return <html lang="en" suppressHydrationWarning style={palette}><head><script dangerouslySetInnerHTML={{__html:themeBoot}}/><link rel="preload" href={siteAsset('/fonts/inter-latin.woff2')} as="font" type="font/woff2" crossOrigin="anonymous"/><link rel="preload" href={siteAsset('/fonts/archivo-latin.woff2')} as="font" type="font/woff2" crossOrigin="anonymous"/>{defaultPortrait?<link rel="preload" as="image" href={siteAsset('/images/fozayel-cutout.webp')} imageSrcSet={siteSrcSet('/images/fozayel-cutout-520.webp 520w, /images/fozayel-cutout-760.webp 760w, /images/fozayel-cutout-1024.webp 1024w, /images/fozayel-cutout.webp 1254w')} imageSizes="(max-width: 720px) 130vw, (max-width: 1300px) 58vw, 760px" fetchPriority="high"/>:<link rel="preload" as="image" href={siteAsset(heroImage)} fetchPriority="high"/>}</head><body>{children}</body></html>;
}
