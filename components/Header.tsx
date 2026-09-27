'use client';
import { useEffect, useState } from 'react';

const links = [ ['About','about'], ['Tech Stack','skills'], ['Work','projects'], ['Experience','experience'], ['Contact','contact'] ];
type HeaderProps = { labels?: Record<string,string>; logo?:string; name?:string; location?:string; availability?:string; projectCount?:number; skillCount?:number };
export default function Header({ labels, availability='Available for new projects', projectCount=0, skillCount=0 }: HeaderProps) {
  const [open,setOpen] = useState(false);
  const [dark,setDark] = useState(false);
  useEffect(() => { const sync=()=>setDark(document.documentElement.dataset.theme==='dark');sync();const media=window.matchMedia('(prefers-color-scheme: dark)');media.addEventListener('change',sync);return()=>media.removeEventListener('change',sync); }, []);
  function toggleTheme(){
    const next = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('portfolio-theme', next); setDark(next === 'dark');
  }
  return <header className="site-header">
    <div className="header-status"><span className="status-dot"/><span>{availability}</span></div>
    <nav className={`main-nav ${open?'is-open':''}`} aria-label="Main navigation">
      {links.map(([name,id],i)=><a key={id} href={`#${id}`} onClick={()=>setOpen(false)}><span>{labels?.[id] && id!=='skills' && id!=='projects' ? labels[id] : name}</span>{id==='skills'&&<small>[{skillCount}]</small>}{id==='projects'&&<small>[{projectCount}]</small>}</a>)}
    </nav>
    <div className="header-actions">
      <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${dark?'light':'dark'} theme`} aria-pressed={dark} title={`Switch to ${dark?'light':'dark'} theme`}><span className="theme-icon" aria-hidden="true">{dark?'☼':'◐'}</span><span className="theme-label">{dark?'Light':'Theme'}</span></button>
      <a className="header-cta" href="#contact">Let’s Talk <span aria-hidden="true">↗</span></a>
      <button className={`menu-toggle ${open?'active':''}`} type="button" aria-expanded={open} aria-label={open?'Close navigation':'Open navigation'} onClick={()=>setOpen(!open)}><i/><i/></button>
    </div>
  </header>;
}
