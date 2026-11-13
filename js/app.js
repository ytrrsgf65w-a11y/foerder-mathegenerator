const MODULES = {
  addition: 'Addition',
  subtraction: 'Subtraktion',
  multiplication: 'Multiplikation',
  division: 'Division',
  story: 'Sachaufgaben'
};
const ranges = [10, 20, 50, 100, 1000, 10000];
const allRows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const topics = ['Schule', 'Einkaufen', 'Tiere', 'Freizeit', 'Sport'];
const operations = ['Addition', 'Subtraktion', 'Multiplikation', 'Division'];
const names = [];
const state = { modules: [], results: null };
const moduleList = document.getElementById('module-list');
const resultsSection = document.getElementById('results');
const statusMessage = document.getElementById('status-message');
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const choose = values => values[rand(0, values.length - 1)];
const number = value => Number(value).toLocaleString('de-DE');
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
function shuffled(values) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function options(values, selected, label = value => value) {
  return values.map(value => `<option value="${value}"${String(value) === String(selected) ? ' selected' : ''}>${label(value)}</option>`).join('');
}
function field(label, key, values, selected, labelFor = value => value) {
  return `<label class="field">${label}<select data-key="${key}">${options(values, selected, labelFor)}</select></label>`;
}
function defaults(type) {
  if (type === 'addition' || type === 'subtraction') return { range: 20, difficulty: 'mixed', count: 5 };
  if (type === 'multiplication') return { rows: [2, 5], count: 5 };
  if (type === 'division') return { difficulty: 'without', count: 5 };
  return { topic: 'Gemischt', operation: 'Gemischt', language: 'Einfach', count: 5 };
}
function settings(module) {
  const c = module.config;
  let html = '';
  if (module.type === 'addition' || module.type === 'subtraction') {
    const choices = [['without', 'Ohne Zehnerübergang'], ['with', 'Mit Zehnerübergang'], ['mixed', 'Gemischt']];
    html += field('Zahlenraum', 'range', ranges, c.range, value => `bis ${Number(value).toLocaleString('de-DE')}`);
    html += field('Zehnerübergang', 'difficulty', choices.map(item => item[0]), c.difficulty, value => choices.find(item => item[0] === value)[1]);
  } else if (module.type === 'multiplication') {
    const checkboxes = allRows.map(row => `<label class="check-option"><input type="checkbox" data-row="${row}"${c.rows.includes(row) ? ' checked' : ''}> ${row}er-Reihe</label>`).join('');
    html += `<div class="field setting-wide"><span>Reihen auswählen</span><div class="filter-actions"><button class="filter-button" type="button" data-filter="easy">Leicht · 1, 2, 5, 10</button><button class="filter-button" type="button" data-filter="medium">Mittel · 3, 4, 6</button><button class="filter-button" type="button" data-filter="hard">Schwer · 7, 8, 9</button><button class="filter-button" type="button" data-filter="all">Alle</button></div><div class="row-options">${checkboxes}</div></div>`;
  } else if (module.type === 'division') {
    const modes = [['without', 'Ohne Rest'], ['with', 'Mit Rest'], ['mixed', 'Gemischt']];
    html += field('Aufgabenmodus', 'difficulty', modes.map(item => item[0]), c.difficulty, value => modes.find(item => item[0] === value)[1]);
  } else {
    html += field('Thema', 'topic', [...topics, 'Gemischt'], c.topic);
    html += field('Rechenart', 'operation', ['Gemischt', ...operations], c.operation);
    html += field('Sprachstufe', 'language', ['Leichte Sprache', 'Einfach', 'Standard'], c.language);
  }
  html += field('Anzahl Aufgaben', 'count', Array.from({ length: 20 }, (_, i) => i + 1), c.count, value => `${value} ${value === 1 ? 'Aufgabe' : 'Aufgaben'}`);
  return html;
}
function renderModules() {
  if (!state.modules.length) {
    moduleList.innerHTML = '<div class="empty-modules">Deine Module erscheinen hier. Wähle oben eine Aufgabenart aus.</div>';
    return;
  }
  moduleList.innerHTML = state.modules.map((module, index) => `<article class="module-card" data-module-id="${escapeHtml(module.id)}"><header class="module-card-header"><span class="module-number">${index + 1}</span><div class="module-card-title"><h3>${escapeHtml(MODULES[module.type] || module.type)}</h3><p>${module.config.range ? `Zahlenraum bis ${number(module.config.range)}` : `${module.config.count} Aufgaben`}</p></div><button class="remove-module" type="button" data-remove-module="${escapeHtml(module.id)}">Modul löschen</button></header><div class="module-settings">${settings(module)}</div></article>`).join('');
}
function invalidate(message = 'Einstellungen geändert. Erstelle das Arbeitsblatt neu, um die Vorschau zu aktualisieren.') {
  state.results = null;
  resultsSection.hidden = true;
  statusMessage.textContent = message;
  statusMessage.classList.remove('error');
}
document.querySelectorAll('.add-module').forEach(button => button.addEventListener('click', () => {
  const type = button.dataset.module;
  if (type === 'story') return;
  state.modules.push({ id: String(Date.now() + Math.random()), type, config: defaults(type) });
  renderModules();
  invalidate('Modul hinzugefügt. Du kannst weitere Module ergänzen und dann das Arbeitsblatt erstellen.');
}));
moduleList.addEventListener('change', event => {
  const card = event.target.closest('.module-card');
  const module = state.modules.find(item => item.id === card?.dataset.moduleId);
  if (!module) return;
  if (event.target.matches('[data-row]')) {
    const row = Number(event.target.dataset.row);
    module.config.rows = event.target.checked ? [...new Set([...module.config.rows, row])].sort((a, b) => a - b) : module.config.rows.filter(value => value !== row);
  } else {
    const key = event.target.dataset.key;
    if (!key) return;
    module.config[key] = ['count', 'range'].includes(key) ? Number(event.target.value) : event.target.value;
  }
  invalidate();
});
moduleList.addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  const card = button.closest('.module-card');
  const module = state.modules.find(item => item.id === card?.dataset.moduleId);
  if (!module) return;
  const filters = { easy: [1, 2, 5, 10], medium: [3, 4, 6], hard: [7, 8, 9], all: allRows };
  module.config.rows = [...filters[button.dataset.filter]];
  card.querySelectorAll('[data-row]').forEach(input => { input.checked = module.config.rows.includes(Number(input.dataset.row)); });
  invalidate();
});
function addition(max, difficulty) {
  for (let i = 0; i < 300; i++) {
    const a = rand(1, max - 1), b = rand(1, max - a);
    const carries = a % 10 + b % 10 >= 10;
    if (difficulty === 'mixed' || (difficulty === 'with') === carries) return { question: `${number(a)} + ${number(b)} = ____`, answer: number(a + b) };
  }
  return { question: '2 + 3 = ____', answer: '5' };
}
function subtraction(max, difficulty) {
  for (let i = 0; i < 300; i++) {
    const a = rand(2, max), b = rand(1, a - 1);
    const borrows = a % 10 < b % 10;
    if (difficulty === 'mixed' || (difficulty === 'with') === borrows) return { question: `${number(a)} − ${number(b)} = ____`, answer: number(a - b) };
  }
  return { question: '8 − 2 = ____', answer: '6' };
}
function division(mode) {
  const divisor = rand(2, 10), quotient = rand(1, 10);
  const withRemainder = mode === 'with' || (mode === 'mixed' && Math.random() < 0.5);
  if (withRemainder) {
    const remainder = rand(1, divisor - 1);
    return { question: `${divisor * quotient + remainder} : ${divisor} = ____`, answer: `${quotient} Rest ${remainder}` };
  }
  return { question: `${divisor * quotient} : ${divisor} = ____`, answer: String(quotient) };
}
function tasksFor(module) {
  return Array.from({ length: module.config.count }, () => {
    const c = module.config;
    if (module.type === 'addition') return addition(c.range, c.difficulty);
    if (module.type === 'subtraction') return subtraction(c.range, c.difficulty);
    if (module.type === 'multiplication') {
      const row = choose(c.rows), factor = rand(1, 10);
      return { question: `${row} × ${factor} = ____`, answer: number(row * factor) };
    }
    if (module.type === 'division') return division(c.difficulty);
    return { question: '', answer: '' };
  });
}
function buildResults() {
  if (!state.modules.length) {
    statusMessage.textContent = 'Füge mindestens ein Aufgabenmodul hinzu.';
    statusMessage.classList.add('error');
    return;
  }
  if (state.modules.some(module => module.type === 'multiplication' && !module.config.rows.length)) {
    statusMessage.textContent = 'Wähle mindestens eine Einmaleins-Reihe aus.';
    statusMessage.classList.add('error');
    return;
  }
  const title = document.getElementById('worksheet-title')?.value.trim() || '';
  const className = document.getElementById('class-name')?.value.trim() || '';
  const date = document.getElementById('worksheet-date')?.value || '';
  const name = document.getElementById('student-name')?.value.trim() || '';
  state.results = { title, className, date, name, groups: state.modules.map(module => ({ title: MODULES[module.type] || module.type, tasks: tasksFor(module) })) };
  if (typeof renderWorksheetPreviews === 'function') renderWorksheetPreviews();
  resultsSection.hidden = false;
  statusMessage.textContent = 'Fertig! Die Druckvorschau ist bereit.';
  statusMessage.classList.remove('error');
}
document.getElementById('generate-button')?.addEventListener('click', buildResults);
['worksheet-title', 'class-name', 'worksheet-date', 'student-name'].forEach(id => {
  const input = document.getElementById(id);
  input?.addEventListener('input', () => { if (state.results) invalidate(); });
  input?.addEventListener('change', () => { if (state.results) invalidate(); });
});
function download() {
  statusMessage.textContent = 'DOCX-Export ist derzeit nicht aktiviert.';
}
const worksheetDownloadButton = document.getElementById('worksheet-download');
if (worksheetDownloadButton) {
  worksheetDownloadButton.addEventListener('click', () => download(false));
}
const answersDownloadButton = document.getElementById('answers-download');
if (answersDownloadButton) {
  answersDownloadButton.addEventListener('click', () => download(true));
}
renderModules();
