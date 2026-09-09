import { defaultContent, mergeContent, readLocalContent, saveLocalContent, clearLocalContent } from './content.js';

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const DEFAULT_PASSWORD_DIGEST = 'a6b93b788eca1e35f75c9d9723438959455cd89a1bb78d6df3263469b64f218b';
const PASSWORD_KEY = 'fozay-cms-password';
const SESSION_KEY = 'fozay-cms-unlocked';
const CMS_THEME_KEY = 'fozay-cms-theme-mono';
const API_ROOT = 'https://api.github.com/repos/fozayelibnayaz/portfolio/contents';

const state = {
  content: mergeContent(readLocalContent() || {}, defaultContent),
  fullJsonDirty: false,
};
let githubToken = '';
const liveChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('fozay-portfolio-live') : null;

function announcePortfolioSync(reason = 'content') {
  liveChannel?.postMessage({ type: 'portfolio-sync', reason, at: Date.now() });
}

const loginView = $('#loginView');
const editorView = $('#editorView');
const saveStatus = $('#saveStatus');
const loginError = $('#loginError');
const fullJson = $('#fullContentJson');

async function passwordMatches(value) {
  const stored = localStorage.getItem(PASSWORD_KEY);
  if (stored) return value === stored;
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const actual = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return actual === DEFAULT_PASSWORD_DIGEST;
}

function setStatus(message, isError = false) {
  saveStatus.textContent = message;
  saveStatus.style.color = isError ? 'var(--danger)' : 'var(--cyan)';
}

function setCmsTheme(theme) {
  const next = theme === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem(CMS_THEME_KEY, next);
  const toggle = $('#cmsThemeToggle');
  if (toggle) toggle.textContent = next === 'dark' ? 'LIGHT MODE' : 'DARK MODE';
}

function pretty(value) {
  return JSON.stringify(value, null, 2);
}

function parseJsonField(element, label) {
  try {
    return JSON.parse(element.value);
  } catch (error) {
    throw new Error(`${label} contains invalid JSON. Check commas, quotes, and brackets.`);
  }
}

function showEditor() {
  loginView.hidden = true;
  editorView.hidden = false;
  fillFields();
}

function lockEditor() {
  sessionStorage.removeItem(SESSION_KEY);
  editorView.hidden = true;
  loginView.hidden = false;
  $('#loginPassword').value = '';
  $('#loginPassword').focus();
}

function fillFields() {
  const profile = state.content.portfolio;
  const form = $('#identityForm');
  ['name', 'location', 'role', 'email', 'phone', 'github', 'summary', 'longerSummary'].forEach((name) => {
    const field = form.elements[name];
    if (field) field.value = profile[name] || '';
  });
  form.elements.traits.value = (profile.traits || []).join(', ');
  $('#projectsJson').value = pretty(state.content.projects);
  $('#skillsJson').value = pretty(state.content.skills);
  $('#marketingLabel').value = state.content.marketing.label || '';
  $('#marketingIntro').value = state.content.marketing.intro || '';
  $('#marketingItemsJson').value = pretty(state.content.marketing.items || []);
  $('#experienceJson').value = pretty(state.content.experience);
  $('#educationJson').value = pretty(state.content.education);
  fullJson.value = pretty(state.content);
  state.fullJsonDirty = false;
  const fallbackAvatar = location.pathname.endsWith('/cms/') ? '../avatar.png' : './avatar.png';
  const avatar = localStorage.getItem('fozay-avatar-data') || fallbackAvatar;
  $('#cmsPortraitPreview').src = avatar;
  const cv = localStorage.getItem('fozay-cv-data');
  $('#cvStatus').textContent = cv ? 'A local uploaded CV is active — open portfolio links update live.' : 'Using the repository CV — live link ready.';
}

function collectFields() {
  if (state.fullJsonDirty) {
    const complete = parseJsonField(fullJson, 'Complete content JSON');
    state.content = mergeContent(complete, state.content);
    state.fullJsonDirty = false;
    fillFields();
    return state.content;
  }
  const form = $('#identityForm');
  const profile = {};
  ['name', 'location', 'role', 'email', 'phone', 'github', 'summary', 'longerSummary'].forEach((name) => { profile[name] = form.elements[name].value.trim(); });
  profile.traits = form.elements.traits.value.split(',').map((item) => item.trim()).filter(Boolean);
  const patch = {
    portfolio: profile,
    projects: parseJsonField($('#projectsJson'), 'Projects JSON'),
    skills: parseJsonField($('#skillsJson'), 'Skills JSON'),
    marketing: {
      label: $('#marketingLabel').value.trim(),
      intro: $('#marketingIntro').value.trim(),
      items: parseJsonField($('#marketingItemsJson'), 'Digital marketing JSON'),
    },
    experience: parseJsonField($('#experienceJson'), 'Experience JSON'),
    education: parseJsonField($('#educationJson'), 'Education JSON'),
  };
  state.content = mergeContent(patch, state.content);
  fullJson.value = pretty(state.content);
  return state.content;
}

function saveDraft({ quiet = false } = {}) {
  try {
    const next = collectFields();
    saveLocalContent(next);
    announcePortfolioSync('content');
    if (!quiet) setStatus(`SAVED ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    return next;
  } catch (error) {
    setStatus(error.message, true);
    throw error;
  }
}

function download(name, content, type) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadContent() {
  try {
    saveDraft({ quiet: true });
    download('portfolio-content.json', pretty(state.content), 'application/json');
    setStatus('CONTENT JSON DOWNLOADED');
  } catch {
    // saveDraft already reports the useful error.
  }
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('The file could not be read.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('That image could not be decoded.'));
    image.src = dataUrl;
  });
}

async function savePortrait(file) {
  const source = await fileToDataUrl(file);
  const image = await loadImage(source);
  const fullCanvas = document.createElement('canvas');
  const fullScale = Math.min(1, 960 / image.width);
  fullCanvas.width = Math.round(image.width * fullScale);
  fullCanvas.height = Math.round(image.height * fullScale);
  fullCanvas.getContext('2d').drawImage(image, 0, 0, fullCanvas.width, fullCanvas.height);
  const portrait = fullCanvas.toDataURL('image/jpeg', .9);
  const side = Math.min(image.width, image.height);
  const avatarCanvas = document.createElement('canvas');
  avatarCanvas.width = 512;
  avatarCanvas.height = 512;
  const avatarContext = avatarCanvas.getContext('2d');
  const cropTop = Math.max(0, Math.min(image.height - side, image.height * .43 - side / 2));
  avatarContext.drawImage(image, (image.width - side) / 2, cropTop, side, side, 0, 0, 512, 512);
  const avatar = avatarCanvas.toDataURL('image/png');
  localStorage.setItem('fozay-portrait-data', portrait);
  localStorage.setItem('fozay-avatar-data', avatar);
  announcePortfolioSync('portrait');
  $('#cmsPortraitPreview').src = avatar;
  setStatus('PORTRAIT READY — LIVE PREVIEW UPDATED');
}

async function saveCv(file) {
  if (file.type !== 'application/pdf') throw new Error('Please choose a PDF file for the CV.');
  const dataUrl = await fileToDataUrl(file);
  localStorage.setItem('fozay-cv-data', dataUrl);
  announcePortfolioSync('cv');
  $('#cvStatus').textContent = `${file.name} is ready — open portfolio links update live.`;
  setStatus('CV READY — LIVE PORTFOLIO LINK UPDATED');
}

function resetDraft() {
  if (!window.confirm('Reset the local draft, portrait, and CV in this browser?')) return;
  clearLocalContent();
  localStorage.removeItem('fozay-portrait-data');
  localStorage.removeItem('fozay-avatar-data');
  localStorage.removeItem('fozay-cv-data');
  announcePortfolioSync('reset');
  state.content = mergeContent({}, defaultContent);
  fillFields();
  setStatus('LOCAL DRAFT RESET');
}

function utf8Base64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function apiHeaders(token) {
  return { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' };
}

function apiPath(path) {
  return `${API_ROOT}/${path.split('/').map(encodeURIComponent).join('/')}`;
}

async function putGithubFile(path, base64, message, token) {
  const existing = await fetch(`${apiPath(path)}?ref=main`, { headers: apiHeaders(token) });
  let sha;
  if (existing.ok) sha = (await existing.json()).sha;
  else if (existing.status !== 404) throw new Error(`Could not read ${path} from GitHub.`);
  const body = { message, content: base64, branch: 'main' };
  if (sha) body.sha = sha;
  const response = await fetch(apiPath(path), { method: 'PUT', headers: apiHeaders(token), body: JSON.stringify(body) });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub rejected ${path}: ${detail.slice(0, 180)}`);
  }
}

async function publishGithub() {
  try {
    const token = $('#githubToken').value.trim();
    if (!token) throw new Error('Enter a fine-grained GitHub token first.');
    githubToken = token;
    const draft = saveDraft({ quiet: true });
    const message = $('#commitMessage').value.trim() || 'Update portfolio from CMS';
    $('#publishStatus').textContent = 'Publishing content…';
    $('#publishButton').disabled = true;
    await putGithubFile('public/content.json', utf8Base64(pretty(draft) + '\n'), message, githubToken);
    const cv = localStorage.getItem('fozay-cv-data');
    if (cv?.startsWith('data:application/pdf;base64,')) await putGithubFile('public/Fozayel_Ibn_Ayaz.pdf', cv.split(',')[1], message, githubToken);
    const portrait = localStorage.getItem('fozay-portrait-data');
    const avatar = localStorage.getItem('fozay-avatar-data');
    if (portrait?.startsWith('data:image/jpeg;base64,')) await putGithubFile('public/portrait.jpg', portrait.split(',')[1], message, githubToken);
    if (avatar?.startsWith('data:image/png;base64,')) await putGithubFile('public/avatar.png', avatar.split(',')[1], message, githubToken);
    $('#publishStatus').textContent = 'Published. GitHub Actions will rebuild the live site shortly.';
    setStatus('PUBLISHED TO GITHUB');
  } catch (error) {
    $('#publishStatus').textContent = error.message;
    setStatus('PUBLISH FAILED', true);
  } finally {
    $('#publishButton').disabled = false;
  }
}

function handleImport(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      state.content = mergeContent(JSON.parse(reader.result), defaultContent);
      fillFields();
      setStatus('JSON IMPORTED — SAVE TO KEEP IT');
    } catch {
      setStatus('IMPORT FAILED — CHECK THE JSON FILE', true);
    }
  };
  reader.readAsText(file);
}

function switchTab(tab) {
  $$('.cms-tab').forEach((button) => button.classList.toggle('active', button.dataset.tab === tab));
  $$('[data-panel]').forEach((panel) => { panel.hidden = panel.dataset.panel !== tab; });
}

$('#loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (await passwordMatches($('#loginPassword').value)) {
    sessionStorage.setItem(SESSION_KEY, 'true');
    loginError.textContent = '';
    showEditor();
  } else {
    loginError.textContent = 'ACCESS NOT RECOGNIZED.';
  }
});

$('#logoutButton').addEventListener('click', lockEditor);
$('#saveButton').addEventListener('click', () => { try { saveDraft(); } catch {} });
$$('.cms-tab').forEach((button) => button.addEventListener('click', () => switchTab(button.dataset.tab)));
$('[data-action="save"]').addEventListener('click', () => { try { saveDraft(); } catch {} });
$$('[data-action="download-json"]').forEach((button) => button.addEventListener('click', downloadContent));
$$('[data-action="reset"]').forEach((button) => button.addEventListener('click', resetDraft));
$('[data-action="import-json"]').addEventListener('click', () => $('#jsonUpload').click());
$('#jsonUpload').addEventListener('change', (event) => { if (event.target.files[0]) handleImport(event.target.files[0]); event.target.value = ''; });
fullJson.addEventListener('input', () => { state.fullJsonDirty = true; });
$('#portraitUpload').addEventListener('change', async (event) => { if (!event.target.files[0]) return; try { await savePortrait(event.target.files[0]); } catch (error) { setStatus(error.message, true); } event.target.value = ''; });
$('#cvUpload').addEventListener('change', async (event) => { if (!event.target.files[0]) return; try { await saveCv(event.target.files[0]); } catch (error) { setStatus(error.message, true); } event.target.value = ''; });
$('#passwordForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const next = $('#newPassword').value;
  if (next !== $('#confirmPassword').value) return setStatus('PASSWORDS DO NOT MATCH', true);
  localStorage.setItem(PASSWORD_KEY, next);
  event.target.reset();
  setStatus('CMS PASSWORD CHANGED');
});
$('#publishButton').addEventListener('click', publishGithub);
$('#cmsThemeToggle')?.addEventListener('click', () => setCmsTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
setCmsTheme(localStorage.getItem(CMS_THEME_KEY) || document.documentElement.dataset.theme || 'dark');

if (sessionStorage.getItem(SESSION_KEY) === 'true') showEditor();
else $('#loginPassword').focus();
