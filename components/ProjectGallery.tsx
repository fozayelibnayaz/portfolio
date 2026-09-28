'use client';

import Link from 'next/link';
import { useMemo, useRef, useState, type KeyboardEvent, type TouchEvent } from 'react';
import { PROJECT_TYPES, classifyProject, type ProjectTypeId } from '../lib/project-type';
import { siteAsset } from '../lib/site-path';

type ProjectCardData={
  id?:string;slug?:string;name:string;shortDescription?:string;description?:string;category?:string;stack?:string;
  technologies?:string[];featured?:boolean;featuredImage?:string;liveUrl?:string;order?:number;repoUpdatedAt?:string;
  projectType?:ProjectTypeId;githubUrl?:string;
};
type Filter='all'|ProjectTypeId;
const PAGE_SIZE=9;
const typeById=(id:ProjectTypeId)=>PROJECT_TYPES.find(type=>type.id===id)||PROJECT_TYPES[2];

export default function ProjectGallery({projects}:{projects:ProjectCardData[]}){
  const [filter,setFilter]=useState<Filter>('all');
  const [page,setPage]=useState(0);
  const touchStart=useRef<number|null>(null);
  const classified=useMemo(()=>projects.map(project=>({...project,projectType:project.projectType||classifyProject(project)})),[projects]);
  const groups=useMemo(()=>PROJECT_TYPES.map(type=>({
    type,
    projects:classified.filter(project=>project.projectType===type.id).sort((a,b)=>{
      if(Boolean(a.featured)!==Boolean(b.featured))return Number(Boolean(b.featured))-Number(Boolean(a.featured));
      const aDate=Date.parse(a.repoUpdatedAt||'')||0,bDate=Date.parse(b.repoUpdatedAt||'')||0;
      if(aDate&&bDate&&aDate!==bDate)return bDate-aDate;
      return (Number(a.order)||0)-(Number(b.order)||0)||a.name.localeCompare(b.name);
    }),
  })),[classified]);
  const counts=useMemo(()=>Object.fromEntries(groups.map(group=>[group.type.id,group.projects.length])) as Record<ProjectTypeId,number>,[groups]);
  const selected=filter==='all'?null:groups.find(group=>group.type.id===filter)||null;
  const items=useMemo(()=>filter==='all'?interleave(groups):(selected?.projects||[]),[filter,groups,selected]);
  const pageCount=Math.max(1,Math.ceil(items.length/PAGE_SIZE));
  const currentPage=Math.min(page,pageCount-1);
  const visible=items.slice(currentPage*PAGE_SIZE,(currentPage+1)*PAGE_SIZE);
  const goTo=(next:number)=>setPage(Math.max(0,Math.min(pageCount-1,next)));
  const chooseFilter=(next:Filter)=>{setFilter(next);setPage(0)};
  const swipeEnd=(event:TouchEvent<HTMLDivElement>)=>{
    if(touchStart.current===null)return;
    const delta=event.changedTouches[0].clientX-touchStart.current;
    if(Math.abs(delta)>55)goTo(currentPage+(delta<0?1:-1));
    touchStart.current=null;
  };
  const keyboardNav=(event:KeyboardEvent<HTMLDivElement>)=>{
    if(event.key==='ArrowRight'){event.preventDefault();goTo(currentPage+1)}
    if(event.key==='ArrowLeft'){event.preventDefault();goTo(currentPage-1)}
  };

  return <div className="project-gallery">
    <div className="project-gallery-tools">
      <div className="project-type-filters" role="group" aria-label="Filter selected projects by detected type">
        <button type="button" aria-pressed={filter==='all'} className={`project-filter${filter==='all'?' is-active':''}`} onClick={()=>chooseFilter('all')}><span>All work</span><small>{classified.length.toString().padStart(2,'0')}</small></button>
        {PROJECT_TYPES.map(type=><button key={type.id} type="button" aria-pressed={filter===type.id} className={`project-filter filter-${type.id}${filter===type.id?' is-active':''}`} onClick={()=>chooseFilter(type.id)}><span>{type.label}</span><small>{(counts[type.id]||0).toString().padStart(2,'0')}</small></button>)}
      </div>
      <p className="project-swipe-hint"><span aria-hidden="true">↔</span> Swipe to explore <span className="project-hint-divider">·</span> arrow keys work too</p>
    </div>

    <div className="project-gallery-viewport" tabIndex={0} aria-label="Project gallery. Use left and right arrow keys to change page." onKeyDown={keyboardNav} onTouchStart={event=>{touchStart.current=event.touches[0].clientX}} onTouchEnd={swipeEnd}>
      <div className={`project-grid project-gallery-grid ${filter==='all'?'gallery-is-all':'gallery-is-filtered'}`} key={`${filter}-${currentPage}`} aria-live="polite">
        {visible.map((project,index)=><GalleryCard key={project.id||project.slug||project.name} project={project} type={project.projectType!} ordinal={currentPage*PAGE_SIZE+index+1}/>)}
        {visible.length===0&&<div className="project-gallery-empty"><span>NO PROJECTS IN THIS TYPE YET</span><p>Try another collection.</p></div>}
      </div>
    </div>

    <div className="project-gallery-footer">
      <p className="project-page-readout"><span>PAGE</span><strong>{String(currentPage+1).padStart(2,'0')}</strong><i>/</i>{String(pageCount).padStart(2,'0')}<small>{items.length.toString().padStart(2,'0')} PROJECTS</small></p>
      <nav className="project-pagination" aria-label="Project gallery pages">
        <button type="button" className="gallery-arrow" onClick={()=>goTo(currentPage-1)} disabled={currentPage===0} aria-label="Previous project page">←</button>
        {Array.from({length:pageCount},(_,i)=><button type="button" key={i} className={`gallery-page${i===currentPage?' is-current':''}`} onClick={()=>goTo(i)} aria-label={`Page ${i+1} of ${pageCount}`} aria-current={i===currentPage?'page':undefined}>{i+1}</button>)}
        <button type="button" className="gallery-arrow gallery-arrow-next" onClick={()=>goTo(currentPage+1)} disabled={currentPage===pageCount-1} aria-label="Next project page">→</button>
      </nav>
      <p className="project-gallery-endnote">A small window into the work <span>✳</span></p>
    </div>
    <div className="project-gallery-progress" aria-hidden="true"><span style={{width:`${((currentPage+1)/pageCount)*100}%`}}/></div>
  </div>;
}

function interleave(groups:{projects:ProjectCardData[]}[]):ProjectCardData[]{
  const result:ProjectCardData[]=[];const rows=Math.max(0,...groups.map(group=>group.projects.length));
  for(let row=0;row<rows;row++)for(const group of groups){const project=group.projects[row];if(project)result.push(project)}
  return result;
}

function GalleryCard({project,type,ordinal}:{project:ProjectCardData;type:ProjectTypeId;ordinal:number}){
  const group=typeById(type);
  return <Link className={`project-card project-gallery-card project-tone-${(ordinal-1)%3} type-${type}`} href={project.slug?`/projects/${project.slug}`:'#projects'}>
    <div className="project-art">
      {project.featuredImage?<img className="project-custom-image" src={siteAsset(project.featuredImage)} alt="" loading="lazy"/>:<><div className="art-grid"/><div className="art-orbit art-orbit-one"/><div className="art-orbit art-orbit-two"/><div className="art-inner"><span className="art-kicker">{group.eyebrow}</span><strong>{String(ordinal).padStart(2,'0')}</strong><span className="art-mark">{type==='data-ai'?'✳':type==='web-commerce'?'◉':'⌘'}</span></div></>}
      <span className="project-card-type">{group.label}</span><span className="project-arrow">↗</span><span className="project-live">{project.liveUrl?'LIVE':'PROJECT'}</span>
    </div>
    <div className="project-card-meta"><div><span className="project-type">{project.category||project.stack||group.label}</span><h3>{project.name}</h3><p>{project.shortDescription||project.description||'Explore the project details.'}</p></div><span className="project-open" aria-hidden="true">↗</span></div>
    <div className="project-tags">{project.featured&&<span className="featured-tag">FEATURED</span>}{(project.technologies||[]).slice(0,3).map(tag=><span key={tag}>{tag}</span>)}</div>
  </Link>;
}
