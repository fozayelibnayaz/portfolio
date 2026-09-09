import { ThresholdScene } from './thresholdScene.js';
import { defaultContent, mergeContent, readLocalContent } from './content.js';

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const asset = (name) => `${import.meta.env.BASE_URL}${name}`;
const sections = ['home', 'experience', 'method', 'projects', 'contact'];
const sectionLabels = ['HOME', 'EXPERIENCE', 'WHAT I BRING', 'PROJECTS', 'CONTACT'];

let content = defaultContent;
let currentSection = 0;
let lastCard;
let entranceOpen = false;
let thresholdScene;
let thresholdArrived = false;
let cinematicDone = false;
let cinematicTimer;
let cinematicWheelLock = false;
let cinematicClicks = 0;
const cinematicReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
const liveChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('fozay-portfolio-live') : null;
const THEME_KEY = 'fozay-theme-mono-studio';
const cinematicFrames = [
  { kicker: 'BUILD 01 / OPENING', title: 'Start with<br /><em>the person.</em>', text: 'The site is coming together one useful section at a time.' },
  { kicker: 'BUILD 02 / EXPERIENCE', title: 'Follow the<br /><em>thread.</em>', text: 'Roles, responsibility, and the lessons that stay after launch.' },
  { kicker: 'BUILD 03 / WHAT I BRING', title: 'Make it<br /><em>useful.</em>', text: 'Build, measure, shape, and ship — together, not in separate rooms.' },
  { kicker: 'BUILD 04 / PROJECTS', title: 'See what<br /><em>moved.</em>', text: 'Six projects, each with a real question behind the interface.' },
  { kicker: 'BUILD 05 / CONTACT', title: 'Leave with<br /><em>a next step.</em>', text: 'The build is complete. There is a room ready for your problem.' },
];
const developmentPhases = [
  { name: 'WIREFRAME', note: 'Figma-style frames set the page proportions.', visual: ['01 / WIREFRAME', 'STRUCTURE', 'Empty frames establish the app before any content is added.', 'FRAME'], lines: [] },
  { name: 'DESIGN', note: 'The visual system and content shape the screen.', visual: ['02 / DESIGN', 'DESIGNING', 'Type, content, spacing, and visual direction enter the frames.', 'DESIGN'], lines: [] },
  { name: 'DEVELOP', note: 'The designed screen becomes a working frontend.', visual: ['03 / DEVELOP', 'DEVELOPING', 'Navigation, cards, buttons, and responsive UI become real.', 'BUILD'], lines: [] },
  { name: 'CONTENT', note: 'Real content is implemented and checked in the interface.', visual: ['04 / CONTENT', 'IMPLEMENT CONTENT', 'Project cards, copy, labels, and real page details fill the designed system.', 'CONTENT'], lines: [] },
  { name: 'FINAL', note: 'The complete app is ready to use.', visual: ['05 / FINAL OUTPUT', 'FINAL LOOK', 'A complete product screen is ready to use, share, and ship.', 'OUTPUT'], lines: [] },
];

function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
}

function avatar() {
  return localStorage.getItem('fozay-avatar-data') || asset('avatar.png');
}

function portrait() {
  return localStorage.getItem('fozay-portrait-data') || asset('portrait.jpg');
}

function cv() {
  return localStorage.getItem('fozay-cv-data') || asset('Fozayel_Ibn_Ayaz.pdf');
}

function gmail(email, subject = '') {
  const params = new URLSearchParams({ view: 'cm', fs: '1', to: email });
  if (subject) params.set('su', subject);
  return `https://mail.google.com/mail/?${params.toString()}`;
}

async function loadContent() {
  let next = defaultContent;
  try {
    const response = await fetch(`${asset('content.json')}?v=${Date.now()}`, { cache: 'no-store' });
    if (response.ok) next = mergeContent(await response.json(), defaultContent);
  } catch {
    // Bundled content keeps the experience usable without a network request.
  }
  const local = readLocalContent();
  if (local) next = mergeContent(local, next);
  content = next;
}

function renderPerson() {
  const profile = content.portfolio;
  const name = (profile.name || 'Fozayel Ibn Ayaz').toUpperCase();
  $('#siteName').textContent = name;
  $('#siteRole').textContent = profile.role || 'developer / analyst / builder';
  $('#heroName').textContent = name;
  $('#heroRole').textContent = profile.role || '';
  $('#heroLocation').textContent = (profile.location || '').toUpperCase();
  $('#heroSummary').textContent = profile.summary || '';
  $('#heroLonger').textContent = profile.longerSummary || '';
  $('#contactName').textContent = name;
  $('#heroPortrait').alt = `Portrait of ${profile.name || 'Fozayel Ibn Ayaz'}`;
  document.title = `${profile.name || 'Fozayel Ibn Ayaz'} — Build Room`;
}

function renderFeatured() {
  const role = content.experience[0];
  if (!role) return;
  $('#featuredTag').textContent = 'CURRENT ROLE';
  $('#featuredTitle').textContent = role.role;
  $('#featuredMeta').textContent = `${role.company} · ${role.date}`;
}

function projectRowMarkup(project, index) {
  return `<article class="project-row"><span class="project-number">${String(index + 1).padStart(2, '0')}</span><div class="project-row-copy"><div><span>${esc(project.tag)}</span><small>${esc(project.number)}</small></div><h3>${esc(project.title)}</h3><p>${esc(project.summary)}</p></div><button class="project-open" type="button" data-project="${esc(project.id)}">OPEN PROJECT <b>↗</b></button></article>`;
}

function renderProjects() {
  $('#projectList').innerHTML = content.projects.map(projectRowMarkup).join('');
  $$('.project-open', $('#projectList')).forEach((button) => button.addEventListener('click', () => openCase(button.dataset.project, button)));
}

function openCase(id, card) {
  const project = content.projects.find((item) => item.id === id);
  if (!project) return;
  lastCard = card;
  $('#caseContent').innerHTML = `<div class="case-kicker">${esc(project.number)} <span>${esc(project.tag)}</span></div><h2 id="caseTitle">${esc(project.title)}</h2><p class="case-summary">${esc(project.summary)}</p><div class="case-grid"><div><span>WHAT I DID</span><p>${esc(project.what)}</p></div><div><span>HOW I DID IT</span><p>${esc(project.how)}</p></div></div><div class="case-stack"><span>STACK</span><div>${(project.stack || []).map((item) => `<b>${esc(item)}</b>`).join('')}</div></div><div class="case-outcome"><span>WHY IT MATTERS</span><strong>${esc(project.outcome)}</strong></div><a class="case-contact" href="${gmail(content.portfolio.email, `Question about ${project.title}`)}" target="_blank" rel="noreferrer">ASK ABOUT THIS PROJECT <b>↗</b></a>`;
  $('#caseOverlay').classList.add('is-open');
  $('#caseOverlay').setAttribute('aria-hidden', 'false');
  document.body.classList.add('case-open');
  $('.case-close').focus();
}

function closeCase() {
  $('#caseOverlay').classList.remove('is-open');
  $('#caseOverlay').setAttribute('aria-hidden', 'true');
  document.body.classList.remove('case-open');
  if (lastCard instanceof HTMLElement) lastCard.focus();
}

function renderMethod() {
  $('#methodGrid').innerHTML = content.skills.map((group, index) => `<article class="method-card"><div class="method-card-head"><span>0${index + 1}</span><h3>${esc(group.label)}</h3></div><p>${esc(group.note)}</p><ul>${(group.items || []).map((item) => `<li>${esc(item)}</li>`).join('')}</ul></article>`).join('');
  $('#marketingBox').innerHTML = `<div class="marketing-head"><span>05 / DIGITAL MARKETING</span><h3>${esc(content.marketing.label)}</h3></div><p>${esc(content.marketing.intro)}</p><div class="marketing-list">${(content.marketing.items || []).slice(0, 5).map((item, index) => `<div><span>0${index + 1}</span><strong>${esc(item.title)}</strong><p>${esc(item.note)}</p></div>`).join('')}</div>`;
}

function renderExperience() {
  $('#experienceList').innerHTML = content.experience.map((item) => `<div class="timeline-item"><span>${esc(item.date)}</span><div><h3>${esc(item.role)}</h3><b>${esc(item.company)}</b><p>${esc(item.note)}</p></div></div>`).join('');
  $('#educationBox').innerHTML = `<span>EDUCATION</span>${content.education.map((item) => `<div><strong>${esc(item.school)}</strong><small>${esc(item.detail)}</small></div>`).join('')}`;
}

function renderContact() {
  const profile = content.portfolio;
  $('#contactActions').innerHTML = `<a class="primary-action" href="${gmail(profile.email, 'Portfolio contact')}" target="_blank" rel="noreferrer">EMAIL FOZAYEL <b>↗</b></a><a class="text-action" href="tel:${esc(profile.phone)}">${esc(profile.phone)} <b>↗</b></a><a class="text-action" href="${esc(profile.github)}" target="_blank" rel="noreferrer">GITHUB <b>↗</b></a><a class="text-action" id="portfolioCvLink" href="${cv()}" target="_blank" rel="noreferrer">READ THE CV <b>↗</b></a>`;
}

function updateAssets() {
  const avatarImage = avatar();
  const heroPortrait = $('#heroPortrait');
  const contactPortrait = $('#contactPortrait');
  if (heroPortrait) heroPortrait.src = portrait();
  if (contactPortrait) contactPortrait.src = avatarImage;
  const icon = $('link[rel="icon"]');
  const appleIcon = $('link[rel="apple-touch-icon"]');
  if (icon) icon.href = avatarImage;
  if (appleIcon) appleIcon.href = avatarImage;
  const email = gmail(content.portfolio.email, 'Portfolio contact');
  ['#heroEmail', '#footerEmail'].forEach((selector) => {
    const link = $(selector);
    link.href = email;
    link.target = '_blank';
    link.rel = 'noreferrer';
  });
  $('#footerEmail').textContent = `${content.portfolio.email.toUpperCase()} ↗`;
  const cvLink = $('#portfolioCvLink');
  if (cvLink) cvLink.href = cv();
}

function refreshPortfolioFromDraft() {
  content = mergeContent(readLocalContent() || {}, defaultContent);
  renderPerson();
  renderFeatured();
  renderProjects();
  renderMethod();
  renderExperience();
  renderContact();
  updateAssets();
}

function setupLiveSync() {
  const sync = () => refreshPortfolioFromDraft();
  window.addEventListener('storage', (event) => {
    if (['fozay-content', 'fozay-cv-data', 'fozay-portrait-data', 'fozay-avatar-data'].includes(event.key)) sync();
  });
  window.addEventListener('focus', sync, { passive: true });
  liveChannel?.addEventListener('message', (event) => {
    if (event.data?.type === 'portfolio-sync') sync();
  });
}

function updateSectionUI(index) {
  const label = sectionLabels[index] || sectionLabels[0];
  $('#headerSection').textContent = `${String(index).padStart(2, '0')} / ${label}`;
  $$('.top-nav a').forEach((link) => {
    const active = Number(link.dataset.sectionLink) === index;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function syncBuildToSection(index) {
  if (!entranceOpen) return;
  const next = Math.max(0, Math.min(cinematicFrames.length - 1, Number(index) || 0));
  if (cinematicDone) {
    setCinematicFrame(next, Math.max(cinematicClicks, next + 1));
    updateBuildWorkbench(next);
    updateStageButtons();
    return;
  }
  while (!cinematicDone && cinematicClicks <= next) handleBuildStage(cinematicClicks);
  if (!cinematicDone && cinematicClicks > next) {
    setCinematicFrame(next, cinematicClicks);
    updateBuildWorkbench(next);
    updateStageButtons();
  }
}

function goToSection(index, { scroll = false } = {}) {
  const next = Math.max(0, Math.min(sections.length - 1, Number(index) || 0));
  currentSection = next;
  updateSectionUI(next);
  syncBuildToSection(next);
  if (scroll) document.getElementById(sections[next])?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setupScrollState() {
  if (!window.IntersectionObserver) return;
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const index = Number(visible.target.dataset.section);
    if (index !== currentSection) goToSection(index);
  }, { rootMargin: '-24% 0px -60% 0px', threshold: [0, .2, .45, .7] });
  sections.forEach((id) => observer.observe(document.getElementById(id)));
}

function updateStageButtons() {
  $$('[data-build-stage]').forEach((button, index) => {
    const complete = index < cinematicClicks;
    const current = !cinematicDone && index === cinematicClicks;
    button.disabled = !current;
    button.classList.toggle('is-complete', complete);
    button.classList.toggle('is-current', current);
    button.setAttribute('aria-current', current ? 'step' : 'false');
  });
}

function updateDevelopmentProcess(stageIndex = 0) {
  const index = Math.max(0, Math.min(developmentPhases.length - 1, Number(stageIndex) || 0));
  const phase = developmentPhases[index];
  const windowElement = $('#devWindow');
  if (windowElement) {
    windowElement.dataset.phase = String(index + 1);
    windowElement.classList.remove('is-refreshing');
    void windowElement.offsetWidth;
    windowElement.classList.add('is-refreshing');
  }
  $('#devPhase').textContent = phase.name;
  $('#devPhaseNote').textContent = phase.note;
  const visibleProgress = cinematicClicks === 0 && index === 0 ? 0 : (index + 1) * 20;
  $('#devPercent').textContent = `${String(visibleProgress).padStart(2, '0')}%`;
  $('#devVisualLabel').textContent = phase.visual[0];
  $('#devVisualTitle').textContent = phase.visual[1];
  $('#devVisualDescription').textContent = phase.visual[2];
  $('#devVisualAction').textContent = phase.visual[3];
  $$('[data-dev-step]').forEach((step, stepIndex) => {
    step.classList.toggle('is-active', stepIndex === index);
    step.classList.toggle('is-complete', stepIndex < cinematicClicks || (cinematicDone && stepIndex <= index));
  });
}

function updateBuildWorkbench(stageIndex = -1) {
  updateDevelopmentProcess(stageIndex < 0 ? 0 : stageIndex);
}

function setCinematicFrame(index, completed = cinematicClicks) {
  const frame = cinematicFrames[index];
  if (!frame) return;
  const center = $('.sequence-center');
  center.classList.remove('is-changing');
  void center.offsetWidth;
  $('#sequenceKicker').textContent = frame.kicker;
  $('#sequenceTitle').innerHTML = frame.title;
  $('#sequenceText').textContent = frame.text;
  $('#sequenceCount').textContent = `${String(completed).padStart(2, '0')} — ${String(cinematicFrames.length).padStart(2, '0')}`;
  $('#sequenceProgress').style.width = `${(completed / cinematicFrames.length) * 100}%`;
  $('#cinematicSequence').dataset.stage = String(index + 1);
  thresholdScene?.setStage(index);
  center.classList.add('is-changing');
}

function completeCinematicSequence() {
  cinematicDone = true;
  const sequence = $('#cinematicSequence');
  sequence.classList.add('is-complete');
  updateStageButtons();
  updateBuildWorkbench(cinematicFrames.length - 1);
  if (thresholdArrived) {
    cinematicTimer = window.setTimeout(revealSite, 900);
  }
}

function handleBuildStage(index) {
  if (cinematicDone || index !== cinematicClicks) return;
  const completed = index + 1;
  setCinematicFrame(index, completed);
  cinematicClicks = completed;
  updateBuildWorkbench(index);
  updateStageButtons();
  if (completed === cinematicFrames.length) completeCinematicSequence();
}

function beginCinematicSequence() {
  const sequence = $('#cinematicSequence');
  sequence.classList.add('is-active');
  sequence.classList.remove('is-complete');
  sequence.removeAttribute('inert');
  sequence.setAttribute('aria-hidden', 'false');
  cinematicDone = false;
  cinematicClicks = 0;
  setCinematicFrame(0, 0);
  updateBuildWorkbench(-1);
  updateStageButtons();
  if (cinematicReducedMotion) {
    cinematicClicks = cinematicFrames.length;
    cinematicDone = true;
    return;
  }
}

function skipCinematicSequence() {
  if (entranceOpen) {
    const sequence = $('#cinematicSequence');
    const minimized = !sequence.classList.contains('is-minimized');
    sequence.classList.toggle('is-minimized', minimized);
    sequence.setAttribute('aria-hidden', minimized ? 'true' : 'false');
    if (minimized) sequence.setAttribute('inert', '');
    else sequence.removeAttribute('inert');
    $('#skipSequence').innerHTML = minimized ? 'OPEN MONITOR <b>↗</b>' : 'MINIMIZE MONITOR <b>−</b>';
    return;
  }
  if (cinematicTimer) window.clearTimeout(cinematicTimer);
  cinematicTimer = null;
  cinematicClicks = cinematicFrames.length;
  cinematicDone = true;
  const sequence = $('#cinematicSequence');
  sequence.classList.remove('is-active');
  sequence.setAttribute('aria-hidden', 'true');
  sequence.setAttribute('inert', '');
  if (thresholdArrived) revealSite();
}

function handleSceneArrived() {
  thresholdArrived = true;
  if (!entranceOpen) revealSite();
}

function revealSite() {
  if (entranceOpen) return;
  entranceOpen = true;
  const gate = $('#arrivalGate');
  const sequence = $('#cinematicSequence');
  const site = $('#siteContent');
  if (cinematicTimer) window.clearTimeout(cinematicTimer);
  cinematicTimer = null;
  sequence.classList.remove('is-active', 'is-minimized');
  sequence.classList.add('is-docked');
  sequence.removeAttribute('inert');
  sequence.setAttribute('aria-hidden', 'false');
  $('#skipSequence').innerHTML = 'MINIMIZE MONITOR <b>−</b>';
  updateBuildWorkbench(0);
  updateStageButtons();
  $('#knockStatus').textContent = 'THE DOOR IS OPEN';
  gate.classList.add('is-opening');
  gate.setAttribute('aria-hidden', 'true');
  gate.setAttribute('inert', '');
  site.classList.add('is-visible');
  site.removeAttribute('inert');
  site.setAttribute('aria-hidden', 'false');
  document.body.classList.add('site-ready');
  window.setTimeout(() => gate.classList.add('is-hidden'), 1050);
  window.setTimeout(() => $('#heroEmail')?.focus(), 1150);
}

function setupEntrance() {
  thresholdScene = new ThresholdScene($('#thresholdCanvas'), {
    onKnock: (count) => { $('#knockStatus').textContent = count < 3 ? `KNOCK ${count} / 3` : 'BUILD ROOM OPEN'; },
    onDoorOpen: () => {
      $('#arrivalGate').classList.add('is-walking');
      $('#knockStatus').textContent = 'CROSSING THE THRESHOLD';
      beginCinematicSequence();
    },
    onOpen: handleSceneArrived,
    onWebGLError: () => $('#doorFallback').classList.add('is-visible'),
  });
  if (!thresholdScene?.renderer) $('#doorFallback').classList.add('is-visible');
  thresholdScene.setTheme(document.documentElement.dataset.theme || 'light');
  thresholdScene.startSequence();
  $('#thresholdCanvas').addEventListener('click', () => thresholdScene.open());
  $('#enterButton').addEventListener('click', () => thresholdScene.open());
  $('#skipSequence').addEventListener('click', skipCinematicSequence);
  const sequence = $('#cinematicSequence');
  let touchStartY = 0;
  const advanceFromInput = () => {
    if (!sequence.classList.contains('is-active') || cinematicDone || cinematicWheelLock) return;
    cinematicWheelLock = true;
    handleBuildStage(cinematicClicks);
    window.setTimeout(() => { cinematicWheelLock = false; }, 420);
  };
  sequence.addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaY) < 8) return;
    event.preventDefault();
    advanceFromInput();
  }, { passive: false });
  sequence.addEventListener('touchstart', (event) => { touchStartY = event.changedTouches[0]?.clientY || 0; }, { passive: true });
  sequence.addEventListener('touchend', (event) => {
    const endY = event.changedTouches[0]?.clientY || touchStartY;
    if (Math.abs(endY - touchStartY) > 18) advanceFromInput();
  }, { passive: true });
  sequence.addEventListener('click', (event) => {
    if (event.target.closest('#skipSequence, [data-build-stage]')) return;
    if (event.target.closest('#buildPreview, .sequence-center')) advanceFromInput();
  });
  $('#buildPreview').addEventListener('click', advanceFromInput);
  $$('[data-build-stage]').forEach((button) => button.addEventListener('click', () => handleBuildStage(Number(button.dataset.buildStage))));
  window.addEventListener('keydown', (event) => {
    if (!entranceOpen && $('#cinematicSequence').classList.contains('is-active')) {
      const buildIndex = ['1', '2', '3', '4', '5'].indexOf(event.key);
      if (buildIndex >= 0) { event.preventDefault(); handleBuildStage(buildIndex); return; }
      if (['ArrowDown', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); advanceFromInput(); return; }
    }
    if (!entranceOpen && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); thresholdScene.open(); return; }
    if (entranceOpen) {
      const index = ['1', '2', '3', '4', '5'].indexOf(event.key);
      if (index >= 0) goToSection(index, { scroll: true });
      if (event.key === 'Escape') closeCase();
    }
  });
}

async function init() {
  await loadContent();
  renderPerson();
  renderFeatured();
  renderProjects();
  renderMethod();
  renderExperience();
  renderContact();
  updateAssets();
  setTheme(localStorage.getItem(THEME_KEY) || document.documentElement.dataset.theme || 'light');
  $$('[data-section-link]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    goToSection(link.dataset.sectionLink, { scroll: true });
  }));
  $('#themeToggle').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'));
  $$('[data-close-case]').forEach((button) => button.addEventListener('click', closeCase));
  setupScrollState();
  setupLiveSync();
  updateSectionUI(0);
  setupEntrance();
}

function setTheme(theme) {
  const next = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  localStorage.setItem(THEME_KEY, next);
  const themeMeta = $('meta[name="theme-color"]');
  if (themeMeta) themeMeta.content = next === 'light' ? '#f4f4f1' : '#050608';
  $('#themeToggle b').textContent = next === 'light' ? 'MONO' : 'BLACK';
  $('#themeToggle span').textContent = next === 'light' ? '◐' : '◑';
  thresholdScene?.setTheme(next);
}

init();
