import { CharacterScene } from './characterScene.js';
import { SkillScene } from './skillScene.js';
import { defaultContent, mergeContent, readLocalContent } from './content.js';

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const asset = (name) => `${import.meta.env.BASE_URL}${name}`;
const chapters = {
  about: { index: '01', label: 'PERSON', window: 'THREAD 01 / PERSON', position: 0 },
  projects: { index: '02', label: 'WORK', window: 'THREAD 02 / WORK', position: 1 },
  skills: { index: '03', label: 'SKILLS', window: 'THREAD 03 / SKILLS', position: 2 },
  path: { index: '04', label: 'PATH', window: 'THREAD 04 / PATH', position: 3 },
  contact: { index: '05', label: 'CONTACT', window: 'THREAD 05 / CONTACT', position: 4 },
};

const dom = {
  html: document.documentElement,
  buttons: $$('.display-button'),
  panels: $$('.chapter-content'),
  stageLabel: $('#stageLabel'),
  stageIndex: $('#stageIndex'),
  windowTag: $('#windowTag'),
  stageMode: $('#stageMode'),
  canvas: $('#characterCanvas'),
  fallback: $('#fallbackCharacter'),
  about: $('#aboutContent'),
  projects: $('#projectsContent'),
  skills: $('#skillsContent'),
  path: $('#pathContent'),
  contact: $('#contactContent'),
  overlay: $('#caseOverlay'),
  caseContent: $('#caseContent'),
  themeToggle: $('#themeToggle'),
};

let content = defaultContent;
let scene;
let skillScene;
let activeChapter = '';
let lastCard;

function esc(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
}

function getPortrait() {
  return localStorage.getItem('fozay-portrait-data') || asset('portrait.jpg');
}

function getAvatar() {
  return localStorage.getItem('fozay-avatar-data') || asset('avatar.png');
}

function getCv() {
  return localStorage.getItem('fozay-cv-data') || asset('Fozayel_Ibn_Ayaz.pdf');
}

function gmailCompose(email, subject = '') {
  const params = new URLSearchParams({ view: 'cm', fs: '1', to: email });
  if (subject) params.set('su', subject);
  return `https://mail.google.com/mail/?${params.toString()}`;
}

function setTheme(theme) {
  const next = theme === 'light' ? 'light' : 'dark';
  dom.html.dataset.theme = next;
  localStorage.setItem('fozayel-theme', next);
  dom.themeToggle.querySelector('b').textContent = next === 'dark' ? 'LIGHT' : 'DARK';
  dom.themeToggle.querySelector('.theme-icon').textContent = next === 'dark' ? '◐' : '◑';
  dom.stageMode.textContent = `${next.toUpperCase()} ROOM / LIVE`;
}

function updateProfileAssets() {
  const avatar = getAvatar();
  const fallbackImage = $('img', dom.fallback);
  if (fallbackImage) fallbackImage.src = avatar;
  const heroImage = $('#heroPortrait');
  if (heroImage) heroImage.src = avatar;
  const icon = $('link[rel="icon"]');
  const appleIcon = $('link[rel="apple-touch-icon"]');
  if (icon) icon.href = avatar;
  if (appleIcon) appleIcon.href = avatar;
  const footerEmail = $('.site-footer a');
  if (footerEmail) {
    footerEmail.href = gmailCompose(content.portfolio.email, 'Portfolio contact');
    footerEmail.target = '_blank';
    footerEmail.rel = 'noreferrer';
    footerEmail.innerHTML = `${esc(content.portfolio.email.toUpperCase())} <b>↗</b>`;
  }
}

function setActive(chapter, { scroll = false } = {}) {
  const data = chapters[chapter];
  if (!data) return;
  const changed = activeChapter !== chapter;
  activeChapter = chapter;
  dom.buttons.forEach((button) => {
    const active = button.dataset.section === chapter;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });
  dom.panels.forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === chapter));
  dom.stageLabel.textContent = data.label;
  dom.stageIndex.textContent = data.index;
  dom.windowTag.textContent = data.window;
  if (changed) scene?.setSection(data.position);
  if (chapter === 'skills') requestAnimationFrame(() => skillScene?.resize());
  if (scroll) document.querySelector('.content-window')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderAbout() {
  const profile = content.portfolio;
  dom.about.innerHTML = `
    <div class="about-intro"><div class="identity-card"><img src="${getPortrait()}" alt="Portrait of ${esc(profile.name)}" /><div><span>${esc(profile.name.toUpperCase())}</span><strong>Full-stack developer<br />data analyst · WordPress builder</strong></div></div><p>${esc(profile.longerSummary)}</p></div>
    <div class="human-note"><span>THE HUMAN VERSION</span><strong>${esc(profile.summary)}</strong><p>I like the seam between a polished interface and the system that has to keep it honest.</p></div>
    <div class="about-facts"><div><b>Dhaka</b><span>based in Bangladesh</span></div><div><b>Code + data</b><span>where I do my best work</span></div><div><b>BSc CSE</b><span>North South University</span></div><div><b>English / Bengali</b><span>languages at work</span></div></div>
    <div class="trait-list">${(profile.traits || []).map((trait) => `<span>${esc(trait)}</span>`).join('')}</div>
    <div class="inline-links"><a href="${esc(profile.github)}" target="_blank" rel="noreferrer">OPEN GITHUB <b>↗</b></a><a href="${getCv()}" target="_blank" rel="noreferrer">READ THE CV <b>↗</b></a></div>
  `;
}

function renderProjects() {
  dom.projects.innerHTML = `<div class="project-intro"><span>06 CASE FILES / DIFFERENT PROBLEMS / SAME CARE</span><p>Every project is a small argument: this is what needed to become clearer, and this is how I helped it get there.</p></div><div class="project-list">${content.projects.map((project, index) => `<button class="project-card project-card-${index}" type="button" data-project="${esc(project.id)}" aria-label="Open case file for ${esc(project.title)}"><div class="project-art" aria-hidden="true"><span>${String(index + 1).padStart(2, '0')}</span><i></i><b></b></div><div class="project-card-copy"><div class="project-meta"><span>${esc(project.tag)}</span><b>${esc(project.number)}</b></div><h3>${esc(project.title)}</h3><p>${esc(project.summary)}</p><div class="project-stack">${(project.stack || []).slice(0, 4).map((item) => `<span>${esc(item)}</span>`).join('')}</div></div><em class="project-arrow">↗</em></button>`).join('')}</div>`;
  $$('.project-card', dom.projects).forEach((card) => card.addEventListener('click', () => openCase(card.dataset.project, card)));
}

function openCase(id, card) {
  const project = content.projects.find((item) => item.id === id);
  if (!project) return;
  lastCard = card;
  dom.caseContent.innerHTML = `<div class="case-kicker">${esc(project.number)} <span>${esc(project.tag)}</span></div><h2 id="caseTitle">${esc(project.title)}</h2><p class="case-summary">${esc(project.summary)}</p><div class="case-grid"><div><span>WHAT I DID</span><p>${esc(project.what)}</p></div><div><span>HOW I DID IT</span><p>${esc(project.how)}</p></div></div><div class="case-stack">${(project.stack || []).map((item) => `<span>${esc(item)}</span>`).join('')}</div><div class="case-outcome"><span>WHY IT MATTERS</span><strong>${esc(project.outcome)}</strong></div><a class="case-contact" href="${gmailCompose(content.portfolio.email, `Question about ${project.title}`)}" target="_blank" rel="noreferrer">ASK ME ABOUT THIS BUILD <b>↗</b></a>`;
  dom.overlay.classList.add('is-open');
  dom.overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('case-open');
  $('.case-close', dom.overlay)?.focus();
}

function closeCase() {
  dom.overlay.classList.remove('is-open');
  dom.overlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('case-open');
  lastCard?.focus();
}

function installSkillFallback() {
  $('#skillFallback', dom.skills)?.classList.add('is-visible');
}

function renderSkills() {
  const skillLabels = [...content.skills.flatMap((group) => group.items || []), ...(content.marketing.items || []).map((item) => item.title)];
  dom.skills.innerHTML = `<div class="skill-intro"><span>THE SKILLS I USE / THE QUESTIONS THEY ANSWER</span><p>I do not collect tools. I collect ways to make the next decision less foggy.</p></div><div class="skill-lab"><div class="skill-visual"><canvas id="skillCanvas" aria-label="Animated three-dimensional skill constellation"></canvas><div class="skill-fallback" id="skillFallback">${skillLabels.slice(0, 12).map((label) => `<span>${esc(label)}</span>`).join('')}</div></div><div class="skill-lab-copy"><span>SKILL CONSTELLATION / LIVE</span><strong>Tools are only useful when they change the next decision.</strong><p>Build, measure, shape, and ship orbit the same centre: make something clearer, more reliable, and easier to use.</p></div></div><div class="skill-grid">${content.skills.map((group, index) => `<article class="skill-card skill-card-${index}"><div class="skill-card-top"><span>0${index + 1}</span><b>${esc(group.label)}</b></div><p>${esc(group.note)}</p><div class="skill-tags">${(group.items || []).map((item) => `<span>${esc(item)}</span>`).join('')}</div></article>`).join('')}</div><article class="marketing-card"><div class="marketing-heading"><span>05 / REAL-WORLD PRACTICE</span><b>${esc(content.marketing.label)}</b></div><p>${esc(content.marketing.intro)}</p><div class="marketing-grid">${(content.marketing.items || []).map((item) => `<div><strong>${esc(item.title)}</strong><span>${esc(item.note)}</span></div>`).join('')}</div></article>`;
  skillScene = new SkillScene($('#skillCanvas', dom.skills), { labels: skillLabels, onWebGLError: installSkillFallback });
  if (!skillScene?.renderer) installSkillFallback();
}

function renderPath() {
  dom.path.innerHTML = `<div class="path-intro"><span>WORK IS NOT A STRAIGHT LINE</span><p>Each room taught me a different kind of attention: reliability, explanation, measurement, and care.</p></div><div class="timeline">${content.experience.map((item) => `<div class="timeline-row"><span>${esc(item.date)}</span><div><h3>${esc(item.role)}</h3><b>${esc(item.company)}</b><p>${esc(item.note)}</p></div></div>`).join('')}</div><div class="education"><div class="subsection-label">EDUCATION</div>${content.education.map((item) => `<div class="education-row"><strong>${esc(item.school)}</strong><span>${esc(item.detail)}</span></div>`).join('')}</div>`;
}

function renderContact() {
  const profile = content.portfolio;
  dom.contact.innerHTML = `<p class="contact-lede">If you are building something that needs a person who can move between product thinking, implementation, analytics, marketing, and the deployment logs, this is the open door.</p><div class="contact-card"><span>BEST FIRST MOVE</span><a href="${gmailCompose(profile.email, 'Portfolio contact')}" target="_blank" rel="noreferrer">${esc(profile.email)} <b>↗</b></a><a href="tel:${esc(profile.phone)}">${esc(profile.phone)} <b>↗</b></a></div><div class="contact-facts"><div><span>OPEN TO</span><strong>Full-stack, data, WordPress, digital marketing, and product-minded roles.</strong></div><div><span>BASED IN</span><strong>${esc(profile.location)} · available for thoughtful work.</strong></div></div><div class="contact-links"><a href="${esc(profile.github)}" target="_blank" rel="noreferrer">GITHUB <b>↗</b></a><a href="${getCv()}" target="_blank" rel="noreferrer">CV / PDF <b>↗</b></a></div>`;
}

function installFallback() {
  dom.fallback.classList.add('is-visible');
  dom.canvas.setAttribute('aria-hidden', 'true');
}

async function loadContent() {
  let next = defaultContent;
  try {
    const response = await fetch(`${asset('content.json')}?v=${Date.now()}`, { cache: 'no-store' });
    if (response.ok) next = mergeContent(await response.json(), defaultContent);
  } catch {
    // The bundled defaults keep the portfolio usable offline and in a local preview.
  }
  const local = readLocalContent();
  if (local) next = mergeContent(local, next);
  content = next;
}

async function init() {
  await loadContent();
  renderAbout();
  renderProjects();
  renderSkills();
  renderPath();
  renderContact();
  updateProfileAssets();
  scene = new CharacterScene(dom.canvas, { onWebGLError: installFallback });
  if (!scene?.renderer) installFallback();
  setTheme(localStorage.getItem('fozayel-theme') || 'dark');
  setActive('about');
  dom.buttons.forEach((button) => button.addEventListener('click', () => setActive(button.dataset.section, { scroll: true })));
  $$('[data-scroll]').forEach((link) => link.addEventListener('click', (event) => { const target = link.dataset.scroll; if (!chapters[target]) return; event.preventDefault(); setActive(target, { scroll: true }); }));
  $$('[data-close-case]').forEach((button) => button.addEventListener('click', closeCase));
  dom.themeToggle.addEventListener('click', () => setTheme(dom.html.dataset.theme === 'dark' ? 'light' : 'dark'));
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeCase(); const keys = ['1', '2', '3', '4', '5']; const index = keys.indexOf(event.key); if (index >= 0) setActive(Object.keys(chapters)[index], { scroll: true }); });
}

init();
