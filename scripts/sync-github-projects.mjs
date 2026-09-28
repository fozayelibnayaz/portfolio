import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const owner=(process.env.GITHUB_PROJECTS_OWNER||'fozayelibnayaz').toLowerCase();
const token=process.env.PORTFOLIO_REPO_READ_TOKEN||'';
const api='https://api.github.com';
const currentPortfolioRepo=`${owner}/portfolio`;
const maxReadmeBytes=180_000;
const techNames=['React Native','React.js','React','Next.js','Vue.js','Vue','Svelte','Angular','TypeScript','JavaScript','Python','Dart','Flutter','Node.js','Express.js','Express','Laravel','PHP','MySQL','PostgreSQL','MongoDB','Firebase','Supabase','SQLite','Tailwind CSS','Bootstrap','Vite','Streamlit','TensorFlow','PyTorch','scikit-learn','Pandas','NumPy','Prisma','Docker','Kubernetes','GCP','AWS','WordPress','WooCommerce','REST API','REST APIs','GraphQL','FastAPI','Django','Flask','OpenAI','LangChain','Redis','Java','C++','C#','Go','Rust'];

function log(message){console.log(`[repo-sync] ${message}`)}
function slugify(value){return String(value||'project').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,72)||'project'}
function cleanMarkdown(value){
  return String(value||'').replace(/<!--[\s\S]*?-->/g,' ').replace(/<[^>]*>/g,' ').replace(/!\[[^\]]*\]\([^)]*\)/g,' ').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/\[([^\]]+)\]\[[^\]]*\]/g,'$1').replace(/`{1,3}([^`]+)`{1,3}/g,'$1').replace(/[*_~>#]/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim();
}
function usableText(value){
 const text=cleanMarkdown(value);
 if(text.length<20)return '';
 if(/bootstrapped with|simple .* template|learn more about|getting started|open \[?http:\/\/localhost|lorem ipsum/i.test(text))return '';
 return text;
}
function parseSections(markdown){
 const lines=String(markdown||'').split(/\r?\n/);const sections=[];let current={heading:'Project overview',paragraphs:[],bullets:[]};let inCode=false;let para=[];
 const flushPara=()=>{if(para.length){const text=usableText(para.join(' '));if(text&&current.paragraphs.length<4)current.paragraphs.push(text.slice(0,1000));para=[]}};
 const flushSection=()=>{flushPara();if(current.paragraphs.length||current.bullets.length)sections.push(current);current={heading:'Project details',paragraphs:[],bullets:[]}};
 for(const raw of lines){const line=raw.trim();if(/^```|^~~~/.test(line)){flushPara();inCode=!inCode;continue}if(inCode)continue;
   if(/^#{1,6}\s+/.test(line)){flushSection();current.heading=cleanMarkdown(line.replace(/^#{1,6}\s+/,''))||'Project details';continue}
   if(!line){flushPara();continue}
   if(/^\|?\s*:?-{3,}/.test(line)||/^\|.*\|$/.test(line)||/^<img\b/i.test(line)||/^!\[/.test(line)||/^\[!\[/.test(line)||/^[-*_]{3,}$/.test(line))continue;
   const bullet=line.match(/^(?:[-*+]\s+|\d+[.)]\s+)(.+)$/);
   if(bullet){flushPara();const text=usableText(bullet[1]);if(text&&current.bullets.length<10)current.bullets.push(text.slice(0,400));continue}
   if(/^>/.test(line))continue;
   para.push(line);
 }
 flushSection();
 return sections.slice(0,14).map(section=>({heading:section.heading,paragraphs:section.paragraphs,bullets:section.bullets}));
}
function techStack(repo,readme){
 const values=[];const add=value=>{const text=String(value||'').trim();if(text&&!values.some(x=>x.toLowerCase()===text.toLowerCase()))values.push(text)};
 if(repo.language)add(repo.language);
 for(const topic of repo.topics||[])add(String(topic).replace(/[-_]+/g,' ').replace(/\b(api|ai|ml|seo|ui|ux|css|html|sql|php|gcp|aws)\b/gi,x=>x.toUpperCase()).replace(/\b\w/g,x=>x.toUpperCase()));
 const lower=String(readme||'').toLowerCase();
 for(const tech of techNames){const escaped=tech.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&');if(new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`,'i').test(lower))add(tech)}
 return values.slice(0,12);
}
function readmeIntro(markdown){
 const lines=String(markdown||'').split(/\r?\n/);let inCode=false;
 for(let i=0;i<lines.length;i++){
  const line=lines[i].trim();if(/^```|^~~~/.test(line)){inCode=!inCode;continue}if(inCode||!line||/^#{1,6}\s/.test(line)||/^\[!\[/.test(line)||/^!\[/.test(line)||/^\|/.test(line)||/^[-*_]{3,}$/.test(line))continue;
  const text=usableText(line);if(text)return text.slice(0,900);
 }
 return '';
}
function firstReadmeImage(markdown){
 const candidates=[];const re=/!\[([^\]]*)\]\(([^)]+)\)/g;let match;
 while((match=re.exec(String(markdown||'')))){
  const url=match[2].trim().split(/\s+/)[0];
  if(/badge|shield|workflow|travis|build-status|license|open in|streamlit_badge/i.test(`${match[1]} ${url}`))continue;
  if(/^https?:\/\//i.test(url)||(!url.startsWith('data:')&&!url.startsWith('#')))candidates.push(url);
 }
 return candidates[0]||'';
}
function tokens(value){return String(value||'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(x=>x&&!['the','a','an','website','web','site','project','app','application','platform','system'].includes(x))}
function matchingProject(repo,projects){
 const repoName=tokens(repo.name);const repoUrl=String(repo.html_url||'').toLowerCase().replace(/\/$/,'');
 for(const p of projects){const url=String(p.githubUrl||'').toLowerCase().replace(/\/$/,'');if(url&&url===repoUrl)return p;const old=tokens(p.name);if(old.length>=2&&old.every(word=>repoName.includes(word)))return p}
 return null;
}
async function requestJson(url,{allow404=false}={}){
 let last;
 for(let attempt=0;attempt<3;attempt++){
  try{
   const response=await fetch(url,{headers:{'User-Agent':'fozayel-portfolio-repo-sync','Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(token?{Authorization:`Bearer ${token}`}:{})}});
   if(response.status===404&&allow404)return null;
   if(!response.ok){const body=(await response.text()).slice(0,250);if((response.status===403||response.status===429||response.status>=500)&&attempt<2){await new Promise(r=>setTimeout(r,750*(attempt+1)));last=new Error(`GitHub returned ${response.status}: ${body}`);continue}throw new Error(`GitHub returned ${response.status} for ${url}: ${body}`)}
   return await response.json();
  }catch(error){last=error;if(attempt<2)await new Promise(r=>setTimeout(r,500*(attempt+1)))}
 }
 throw last;
}
async function getRepositories(){
 const repos=[];let page=1;
 while(true){
  const url=token?`${api}/user/repos?visibility=all&affiliation=owner&per_page=100&sort=updated&page=${page}`:`${api}/users/${encodeURIComponent(owner)}/repos?type=owner&per_page=100&sort=updated&page=${page}`;
  const batch=await requestJson(url);
  if(!Array.isArray(batch))throw new Error('GitHub repository list response was not an array.');
  repos.push(...batch);if(batch.length<100)break;page++;
 }
 return repos.filter(repo=>String(repo.owner?.login||'').toLowerCase()===owner&&!repo.disabled&&String(repo.full_name||'').toLowerCase()!==currentPortfolioRepo);
}
async function fetchPublicReadme(repo){
 const branch=encodeURIComponent(repo.default_branch||'main');
 for(const filename of ['README.md','Readme.md','readme.md','README.rst','README']){
  const url=`https://raw.githubusercontent.com/${repo.full_name}/${branch}/${filename}`;
  try{const res=await fetch(url,{headers:{'User-Agent':'fozayel-portfolio-repo-sync'}});if(res.ok){const text=await res.text();return text.slice(0,maxReadmeBytes)}}catch{}
 }
 return '';
}
async function fetchPrivateSummary(repo){
 const url=`${api}/repos/${repo.full_name}/contents/PORTFOLIO_PUBLIC.md?ref=${encodeURIComponent(repo.default_branch||'main')}`;
 const file=await requestJson(url,{allow404:true});
 if(!file||file.type!=='file'||!file.content)return '';
 try{return Buffer.from(file.content.replace(/\s/g,''),'base64').toString('utf8').slice(0,12000)}catch{return ''}
}
async function localizeReadmeImage(repo,readme){
 const image=firstReadmeImage(readme);if(!image)return '';
 let url;
 if(/^https?:\/\//i.test(image))url=image;
 else {
  const filePath=decodeURIComponent(image.split(/[?#]/)[0]).replace(/^\.\//,'').split('/').map(encodeURIComponent).join('/');
  url=`https://raw.githubusercontent.com/${repo.full_name}/${encodeURIComponent(repo.default_branch||'main')}/${filePath}`;
 }
 try{
  const res=await fetch(url,{headers:{'User-Agent':'fozayel-portfolio-repo-sync'}});if(!res.ok)return '';
  const type=(res.headers.get('content-type')||'').split(';')[0].toLowerCase();
  const ext=type==='image/png'?'.png':type==='image/jpeg'?'.jpg':type==='image/webp'?'.webp':type==='image/gif'?'.gif':'';
  if(!ext)return '';
  const buffer=Buffer.from(await res.arrayBuffer());if(!buffer.length||buffer.length>2_000_000)return '';
  const folder=path.join(process.cwd(),'public','images','github-projects');await mkdir(folder,{recursive:true});
  const filename=`${slugify(repo.full_name)}${ext}`;await writeFile(path.join(folder,filename),buffer);
  return `/images/github-projects/${filename}`;
 }catch{return ''}
}
function publicProject(repo,readme){
 const intro=readmeIntro(readme);const sections=parseSections(readme).map(section=>({...section,heading:slugify(section.heading)===slugify(repo.name)?'Overview':section.heading,paragraphs:section.paragraphs.filter(text=>text!==intro)})).filter(section=>section.paragraphs.length||section.bullets.length);const description=String(repo.description||'').trim()||intro||`No description is published for this ${repo.language||'GitHub'} repository yet.`;
 const technologies=techStack(repo,readme);const topic=repo.topics?.[0]?String(repo.topics[0]).replace(/[-_]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase()):'';
 return {id:`github-${repo.id}`,slug:slugify(repo.name),name:repo.name.replace(/[-_]+/g,' '),shortDescription:String(repo.description||'').trim()||intro||`A ${repo.language||'GitHub'} repository.`,description:intro&&intro.toLowerCase()!==String(repo.description||'').toLowerCase()?intro:description,technologies,featured:false,visible:true,order:0,category:topic||repo.language||'GitHub project',role:'Repository owner',date:repo.created_at?new Date(repo.created_at).getUTCFullYear().toString():'',liveUrl:String(repo.homepage||'').trim(),githubUrl:repo.html_url,caseStudy:[],readmeSections:sections,repoUpdatedAt:repo.pushed_at||repo.updated_at||''};
}
function privateProject(repo,summaryFile){
 const heading=summaryFile.match(/^#\s+(.+)$/m)?.[1]?.trim()||'Private project concept';
 const paragraphs=summaryFile.split(/\r?\n/).map(line=>line.trim()).filter(line=>line&&!/^#/.test(line)&&!/^---+$/.test(line));
 const summary=usableText(paragraphs[0]||'');if(!summary)return null;
 const title=cleanMarkdown(heading).slice(0,90)||'Private project concept';
 return {id:`private-concept-${slugify(title)}`,slug:`private-${slugify(title)}`,name:title,shortDescription:summary.slice(0,240),description:summary.slice(0,700),technologies:[],featured:false,visible:true,order:0,category:'Project concept',role:'Concept',date:'',liveUrl:'',githubUrl:'',caseStudy:[],readmeSections:[]};
}
async function main(){
 log(token?'Reading public repos and explicitly opted-in private concepts.':'Reading public repositories (including forks); private repos are skipped until a read-only token is configured.');
 const repos=await getRepositories();const manual=JSON.parse(await readFile(path.join(process.cwd(),'content/portfolio.json'),'utf8'));
 const curated=Array.isArray(manual.projects)?manual.projects:[];const auto=[];let privateSkipped=0;let matched=0;
 for(const repo of repos){
  if(repo.private){
   if(!token){privateSkipped++;continue}
   let summary='';try{summary=await fetchPrivateSummary(repo)}catch{log('Could not read one private opt-in summary; skipping that private repository.');privateSkipped++;continue}
   if(!summary){privateSkipped++;continue}
   const project=privateProject(repo,summary);if(project)auto.push(project);else privateSkipped++;
   continue;
  }
  let readme='';try{readme=await fetchPublicReadme(repo)}catch{}
  const existing=matchingProject(repo,curated);
  if(existing){
   if(!existing.githubUrl)existing.githubUrl=repo.html_url;
   if(!existing.liveUrl&&repo.homepage)existing.liveUrl=String(repo.homepage).trim();
   const merged=[...(Array.isArray(existing.technologies)?existing.technologies:[]),...techStack(repo,readme)];
   existing.technologies=[...new Map(merged.map(x=>[String(x).toLowerCase(),x])).values()];
   matched++;continue;
  }
  const project=publicProject(repo,readme);project.featuredImage=await localizeReadmeImage(repo,readme);auto.push(project);
 }
 auto.sort((a,b)=>String(b.repoUpdatedAt||'').localeCompare(String(a.repoUpdatedAt||''))||a.name.localeCompare(b.name));
 const occupied=new Set(curated.map(p=>p.slug).filter(Boolean));let order=Math.max(0,...curated.map(p=>Number(p.order)||0));
 for(const project of auto){let slug=project.slug;if(occupied.has(slug))slug=`${slug}-${slugify(project.id).slice(-10)}`;while(occupied.has(slug))slug=`${slug}-repo`;project.slug=slug;occupied.add(slug);project.order=++order;}
 manual.projects=[...curated,...auto];
 await writeFile(path.join(process.cwd(),'content/portfolio.json'),JSON.stringify(manual,null,2)+'\n');
 const fallbackPath=path.join(process.cwd(),'content/default.json');
 try{const fallback=JSON.parse(await readFile(fallbackPath,'utf8'));fallback.projects=[...curated.map(p=>({...p})),...auto.map(p=>({...p}))];await writeFile(fallbackPath,JSON.stringify(fallback,null,2)+'\n')}catch{}
 log(`Synced ${repos.filter(r=>!r.private).length} public repos, ${auto.filter(p=>!String(p.id).startsWith('private-')).length} new repo cards, matched ${matched} existing case studies, and opted-in private concepts; skipped ${privateSkipped} private repos without a safe summary.`);
}
main().catch(error=>{console.error('[repo-sync] Sync failed:',error);process.exitCode=1});
