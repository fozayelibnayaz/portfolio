import { cp, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const stage=path.join(root,'.github-pages-build');
const out=path.join(root,'out');
const excluded=new Set(['.git','.next','node_modules','.cache','.rembg','.github-pages-build','out','uploads','coverage','dist','target']);

try{
  await rm(stage,{recursive:true,force:true});
  await mkdir(stage,{recursive:true});
  const rootEntries=await readdir(root,{withFileTypes:true});
  for(const entry of rootEntries){
    const name=entry.name;
    if(excluded.has(name)||name==='.env'||(name.startsWith('.env.')&&name!=='.env.example'))continue;
    if(name.endsWith('.zip')||name.startsWith('qa-')||name.startsWith('final-hq-'))continue;
    await cp(path.join(root,name),path.join(stage,name),{recursive:true});
  }
  await symlink(path.relative(stage,path.join(root,'node_modules')),path.join(stage,'node_modules'),'dir');

  // GitHub Pages is static-only: omit the server CMS/API and use mailto contact.
  await Promise.all(['app/api','app/uploads','app/admin'].map(dir=>rm(path.join(stage,dir),{recursive:true,force:true})));
  const adminDir=path.join(stage,'app/admin');
  await mkdir(adminDir,{recursive:true});
  await writeFile(path.join(adminDir,'page.tsx'),`import Link from 'next/link';\nexport const metadata={title:'Portfolio editing — Fozayel Ibn Ayaz'};\nexport default function PagesEditInfo(){return <main className="section-container section-block" style={{maxWidth:760,minHeight:'75vh',paddingTop:100}}><span className="section-kicker">GITHUB PAGES · AUTOMATED PROJECT SYNC</span><h1 style={{fontSize:'clamp(38px,7vw,72px)',lineHeight:1,letterSpacing:'-.06em',margin:'22px 0'}}>Projects sync from GitHub.</h1><p style={{maxWidth:620,color:'var(--muted)',lineHeight:1.9}}>Public repositories and their README details are refreshed automatically by GitHub Actions about once an hour. For a private project concept, publish only a safe title and one-sentence summary in a <code>PORTFOLIO_PUBLIC.md</code> opt-in file; see the project auto-sync guide in the repository. GitHub Pages is static, so it does not run a CMS or upload API.</p><div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:28}}><a className="button button-primary" href="https://github.com/fozayelibnayaz/portfolio/blob/main/docs/project-auto-sync.md" target="_blank" rel="noreferrer">Read the auto-sync guide <span>↗</span></a><Link className="button button-quiet" href="/">Back to portfolio <span>↗</span></Link></div></main>}`);

  const sync=spawnSync(process.execPath,[path.join(stage,'scripts/sync-github-projects.mjs')],{cwd:stage,env:process.env,stdio:'inherit'});
  if(sync.error)throw sync.error;
  if(sync.status!==0)throw new Error(`GitHub project sync exited with code ${sync.status}`);

  const homeFile=path.join(stage,'app/page.tsx');
  let home=await readFile(homeFile,'utf8');
  home=home.replace("export const dynamic = 'force-dynamic';\n",'');
  await writeFile(homeFile,home);

  const projectFile=path.join(stage,'app/projects/[slug]/page.tsx');
  let project=await readFile(projectFile,'utf8');
  project=project.replace("export const dynamic='force-dynamic';",`export async function generateStaticParams(){return getContent().projects.filter((p:any)=>p.visible!==false&&p.slug).map((p:any)=>({slug:p.slug}))}`);
  project=project.replace("alternates:{canonical:\`/projects/\${p.slug}\`}","alternates:{canonical:\`https://fozayelibnayaz.github.io/portfolio/projects/\${p.slug}/\`}");
  await writeFile(projectFile,project);

  // Export SEO files as plain static assets (Pages cannot execute Route Handlers).
  await Promise.all(['app/robots.ts','app/sitemap.ts'].map(file=>rm(path.join(stage,file),{force:true})));
  const content=JSON.parse(await readFile(path.join(stage,'content/portfolio.json'),'utf8'));
  const publicDir=path.join(stage,'public');
  await mkdir(publicDir,{recursive:true});
  const siteBase='https://fozayelibnayaz.github.io/portfolio';
  const urls=[`${siteBase}/`,...(content.projects||[]).filter(p=>p.visible!==false&&p.slug).map(p=>`${siteBase}/projects/${p.slug}/`)];
  const escapeXml=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('\"','&quot;').replaceAll("'",'&apos;');
  await writeFile(path.join(publicDir,'robots.txt'),`User-agent: *\nAllow: /\nDisallow: /portfolio/admin/\nSitemap: ${siteBase}/sitemap.xml\n`);
  await writeFile(path.join(publicDir,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url=>`<url><loc>${escapeXml(url)}</loc></url>`).join('')}</urlset>\n`);
  const cssFile=path.join(stage,'app/globals.css');
  const css=(await readFile(cssFile,'utf8')).replaceAll("url('/fonts/","url('/portfolio/fonts/");
  await writeFile(cssFile,css);

  const env={...process.env,GITHUB_PAGES_EXPORT:'1',NEXT_PUBLIC_BASE_PATH:'/portfolio',NEXT_PUBLIC_GITHUB_PAGES:'true',NEXT_PUBLIC_SITE_URL:'https://fozayelibnayaz.github.io/portfolio'};
  delete env.PORTFOLIO_REPO_READ_TOKEN;
  const nextCli=path.join(root,'node_modules/next/dist/bin/next');
  const build=spawnSync(process.execPath,[nextCli,'build','--webpack'],{cwd:stage,env,stdio:'inherit'});
  if(build.error)throw build.error;
  if(build.status!==0)throw new Error(`Next.js static export exited with code ${build.status}`);

  await rm(out,{recursive:true,force:true});
  await cp(path.join(stage,'out'),out,{recursive:true});
  const entries=await readdir(out);
  console.log(`GitHub Pages export ready: ${out} (${entries.length} top-level entries)`);
}catch(error){
  console.error(error);
  process.exitCode=1;
}finally{
  await rm(stage,{recursive:true,force:true});
}
