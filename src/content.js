import { education, experience, marketing, portfolio, projects, skills } from './data.js';

export const defaultContent = {
  portfolio,
  projects,
  skills,
  marketing,
  experience,
  education,
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function mergeContent(patch = {}, base = defaultContent) {
  const source = patch && typeof patch === 'object' ? patch : {};
  return {
    portfolio: { ...clone(base.portfolio), ...(source.portfolio && typeof source.portfolio === 'object' ? source.portfolio : {}) },
    projects: Array.isArray(source.projects) ? clone(source.projects) : clone(base.projects),
    skills: Array.isArray(source.skills) ? clone(source.skills) : clone(base.skills),
    marketing: source.marketing && typeof source.marketing === 'object' ? {
      ...clone(base.marketing),
      ...clone(source.marketing),
      items: (Array.isArray(source.marketing.items) ? clone(source.marketing.items) : clone(base.marketing.items)).slice(0, 5),
    } : clone(base.marketing),
    experience: Array.isArray(source.experience) ? clone(source.experience) : clone(base.experience),
    education: Array.isArray(source.education) ? clone(source.education) : clone(base.education),
  };
}

export function readLocalContent() {
  try {
    const raw = localStorage.getItem('fozay-content');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLocalContent(value) {
  localStorage.setItem('fozay-content', JSON.stringify(value));
}

export function clearLocalContent() {
  localStorage.removeItem('fozay-content');
}
