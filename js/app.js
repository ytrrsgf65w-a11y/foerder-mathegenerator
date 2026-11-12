const MODULES = {
  addition: { title: 'Addition', subtitle: 'Plusaufgaben passend zum Zahlenraum' },
  subtraction: { title: 'Subtraktion', subtitle: 'Minusaufgaben passend zum Zahlenraum' },
  multiplication: { title: 'Multiplikation', subtitle: 'Einmaleins-Reihen auswählen' },
  division: { title: 'Division', subtitle: 'Geteiltaufgaben mit oder ohne Rest' },
  story: { title: 'Sachaufgaben', subtitle: 'Rechnen in alltagsnahen Situationen' }
};
const RANGES = [10, 20, 50, 100, 1000, 10000];
const TOPICS = {
  Schule: { one: 'Stifte', many: 'Stifte', setting: 'im Klassenzimmer' },
  Einkaufen: { one: 'Euro', many: 'Euro', setting: 'beim Einkaufen' },
  Tiere: { one: 'Leckerli', many: 'Leckerli', setting: 'bei den Tieren' },
  Freizeit: { one: 'Sticker', many: 'Sticker', setting: 'in der Freizeit' },
  Sport: { one: 'Punkte', many: 'Punkte', setting: 'beim Sport' }
};
const OPERATIONS = ['Addition', 'Subtraktion', 'Multiplikation', 'Division'];
const appState = { modules: [], results: null };
const moduleList = document.getElementById('module-list');
const statusMessage = document.getElementById('status-message');
const resultsSection = document.getElementById('results');

function rangeOptions(selected = 20) {
  return RANGES.map(value => `<option value="${value}"${value === selected ? ' selected' : ''}>bis ${value.toLocaleString('de-DE')}</option>`).join('');
}
function countOptions(selected = 5) {
  return Array.from({ length: 20 }, (_, i) => i + 1).map(value => `<option value="${value}"${value === selected ? ' selected' : ''}>${value} ${value === 1 ? 'Aufgabe' : 'Aufgaben'}</option>`).join('');
}
function selectField(label, id, options, wide = false) {
  return `<label class="field${wide ? ' setting-wide' : ''}" for="${id}">${label}<select id="${id}" data-key="${id}">${options}</select></label>`;
}
function moduleSettings(module, index) {
  const prefix = `m${module.id}`;
  const count = selectField('Anzahl Aufgaben', `${prefix}-count`, countOptions(module.config.count));
  if (module.type === 'addition' || module.type === 'subtraction') {
    const transitionLabel = module.type === 'addition' ? 'Zehnerübergang' : 'Entbündeln';
    const choices = module.type === 'addition'
      ? [['without', 'Ohne Zehnerübergang'], ['with', 'Mit Zehnerübergang'], ['mixed', 'Gemischt']]
      : [['without', 'Ohne Entbündeln'], ['with', 'Mit Entbündeln'], ['mixed', 'Gemischt']];
    const options = choices.map(([value, label]) => `<option value="${value}"${module.config.difficulty === value ? ' selected' : ''}>${label}</option>`).join('');
    return `${selectField('Zahlenraum', `${prefix}-range`, rangeOptions(module.config.range))}${selectField(transitionLabel, `${prefix}-difficulty`, options)}${count}`;
  }
  if (module.type === 'multiplication') {
    const rows = [1,2,3,4,5,6,7,8,9,10].map(row => `<label class="check-option"><input type="checkbox" data-row="${row}"${module.config.rows.includes(row) ? ' checked' : ''}> ${row}er-Reihe</label>`).join('');
    return `<div class="field setting-wide"><span>Reihen auswählen</span><div class="filter-actions" aria-label="Schnellfilter für Reihen"><button class="filter-button" type="button" data-filter="easy">Leicht · 1, 2, 5, 10</button><button class="filter-button" type="button" data-filter="medium">Mittel · 3, 4, 6</button><button class="filter-button" type="button" data-filter="hard">Schwer · 7, 8, 9</button><button class="filter-button" type="button" data-filter="all">Alle</button></div><div class="row-options">${rows}</div></div>${count}`;
  }
  if (module.type === 'division') {
    const options = [['without', 'Ohne Rest'], ['with', 'Mit Rest'], ['mixed', 'Gemischt']].map(([value, label]) => `<option value="${value}"${module.config.difficulty === value ? ' selected' : ''}>${label}</option>`).join('');
    return `${selectField('Aufgabenmodus', `${prefix}-difficulty`, options)}${count}`;
  }
  const topicOptions = ['Schule', 'Einkaufen', 'Tiere', 'Freizeit', 'Sport', 'Gemischt'].map(value => `<option value="${value}"${module.config.topic === value ? ' selected' : ''}>${value}</option>`).join('');
  const operationOptions = ['Gemischt', ...OPERATIONS].map(value => `<option value="${value}"${module.config.operation === value ? ' selected' : ''}>${value}</option>`).join('');
  const languageOptions = ['Leichte Sprache', 'Einfach', 'Standard'].map(value => `<option value="${value}"${module.config.language === value ? ' selected' : ''}>${value}</option>`).join('');
  return `${selectField('Thema', `${prefix}-topic`, topicOptions)}${selectField('Rechenart', `${prefix}-operation`, operationOptions)}${selectField('Sprachstufe', `${prefix}-language`, languageOptions)}${count}`;
}
function renderModules() {
  if (!appState.modules.length) {
    moduleList.innerHTML = '<div class="empty-modules">Deine Module erscheinen hier. Wähle oben eine Aufgabenart aus.</div>';
    return;
  }
  moduleList.innerHTML = appState.modules.map((module, index) => `<article class="module-card" data-module-id="${module.id}"><header class="module-card-header"><span class="module-number" aria-hidden="true">${index + 1}</span><div><h3>${MODULES[module.type].title}</h3><p>${MODULES[module.type].subtitle}</p></div></header><div class="module-settings">${moduleSettings(module, index)}</div></article>`).join('');
}
function defaultConfig(type) {
  if (type === 'addition' || type === 'subtraction') return { range: 20, difficulty: 'mixed', count: 5 };
  if (type === 'multiplication') return { rows: [2, 5], count: 5 };
  if (type === 'division') return { difficulty: 'without', count: 5 };
  return { topic: 'Gemischt', operation: 'Gemischt', language: 'Einfach', count: 5 };
}
function invalidateResults(message = 'Einstellungen geändert. Erstelle das Arbeitsblatt neu, um die Vorschau zu aktualisieren.') {
  appState.results = null;
  resultsSection.hidden = true;
  setStatus(message);
}
function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle('error', isError);
}
document.querySelectorAll('.add-module').forEach(button => button.addEventListener('click', () => {
  const type = button.dataset.module;
  appState.modules.push({ id: Date.now() + Math.random(), type, config: defaultConfig(type) });
  renderModules();
  invalidateResults('Modul hinzugefügt. Du kannst weitere Module ergänzen und dann das Arbeitsblatt erstellen.');
}));
moduleList.addEventListener('change', event => {
  const card = event.target.closest('.module-card');
  if (!card) return;
  const module = appState.modules.find(item => String(item.id) === card.dataset.moduleId);
  if (!module) return;
  if (event.target.matches('[data-row]')) {
    const row = Number(event.target.dataset.row);
    module.config.rows = event.target.checked ? [...new Set([...module.config.rows, row])].sort((a,b) => a-b) : module.config.rows.filter(value => value !== row);
  } else {
    const key = event.target.dataset.key;
    if (!key) return;
    const field = key.slice(`m${module.id}-`.length);
    module.config[field] = field === 'count' || field === 'range' ? Number(event.target.value) : event.target.value;
  }
  invalidateResults();
});
moduleList.addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  const card = button.closest('.module-card');
  const module = appState.modules.find(item => String(item.id) === card?.dataset.moduleId);
  if (!module) return;
  const filters = { easy: [1,2,5,10], medium: [3,4,6], hard: [7,8,9], all: [1,2,3,4,5,6,7,8,9,10] };
  module.config.rows = filters[button.dataset.filter];
  card.querySelectorAll('[data-row]').forEach(input => { input.checked = module.config.rows.includes(Number(input.dataset.row)); });
  invalidateResults();
});

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = values => values[randomInt(0, values.length - 1)];
const formatNumber = value => Number(value).toLocaleString('de-DE');
function difficultyFor(module) {
  if (module.config.difficulty !== 'mixed') return module.config.difficulty;
  return Math.random() < 0.5 ? 'without' : 'with';
}
function makeAddition(range, difficulty) {
  for (let attempt = 0; attempt < 300; attempt++) {
    const a = randomInt(1, range - 1);
    const b = randomInt(1, range - a);
    const carries = a % 10 + b % 10 >= 10;
    if ((difficulty === 'with') === carries) return { question: `${formatNumber(a)} + ${formatNumber(b)} = ____`, answer: formatNumber(a + b) };
  }
  const a = Math.min(5, range - 1);
  const b = Math.min(2, range - a);
  return { question: `${a} + ${b} = ____`, answer: formatNumber(a + b) };
}
function makeSubtraction(range, difficulty) {
  for (let attempt = 0; attempt < 300; attempt++) {
    const a = randomInt(2, range);
    const b = randomInt(1, a - 1);
    const borrows = a % 10 < b % 10;
    if ((difficulty === 'with') === borrows) return { question: `${formatNumber(a)} − ${formatNumber(b)} = ____`, answer: formatNumber(a - b) };
  }
  const a = Math.min(8, range);
  return { question: `${a} − 2 = ____`, answer: formatNumber(a - 2) };
}
function makeMultiplication(rows) {
  const row = pick(rows);
  const factor = randomInt(1, 10);
  return { question: `${row} × ${factor} = ____`, answer: formatNumber(row * factor) };
}
function makeDivision(mode) {
  const selectedMode = mode === 'mixed' ? (Math.random() < .5 ? 'without' : 'with') : mode;
  const divisor = randomInt(2, 10);
  const quotient = randomInt(1, 10);
  if (selectedMode === 'with') {
    const remainder = randomInt(1, divisor - 1);
    return { question: `${divisor * quotient + remainder} : ${divisor} = ____`, answer: `${quotient} Rest ${remainder}` };
  }
  return { question: `${divisor * quotient} : ${divisor} = ____`, answer: formatNumber(quotient) };
}
function storyText(topic, operation, language, values) {
  const info = TOPICS[topic];
  const name = pick(['Mia', 'Tom', 'Ali', 'Lena', 'Noah', 'Emma']);
  const item = info.one;
  const plural = info.many;
  const introVariants = {
    Schule: ['In der Schule', 'In der Klasse'], Einkaufen: ['Im Laden', 'Beim Einkaufen'],
    Tiere: ['Bei den Tieren', 'Im Tierpark'], Freizeit: ['In der Freizeit', 'Zu Hause'], Sport: ['Beim Sport', 'Im Training']
  };
  const place = pick(introVariants[topic]);
  const { a, b } = values;
  let first, second, question, answer;
  if (operation === 'Addition') {
    first = `${name} hat ${a} ${plural}.`;
    second = `${name} bekommt ${b} ${plural} dazu.`;
    question = `Wie viele ${plural} hat ${name} jetzt?`;
    answer = formatNumber(a + b);
  } else if (operation === 'Subtraktion') {
    first = `${name} hat ${a} ${plural}.`;
    second = `${name} gibt ${b} ${plural} ab.`;
    question = `Wie viele ${plural} bleiben übrig?`;
    answer = formatNumber(a - b);
  } else if (operation === 'Multiplikation') {
    first = `Es gibt ${a} Gruppen.`;
    second = `In jeder Gruppe sind ${b} ${plural}.`;
    question = `Wie viele ${plural} sind es zusammen?`;
    answer = formatNumber(a * b);
  } else {
    const total = a * b;
    first = `${name} hat ${total} ${plural}.`;
    second = `${name} verteilt sie gleichmäßig auf ${a} Gruppen.`;
    question = `Wie viele ${plural} sind in jeder Gruppe?`;
    answer = formatNumber(b);
  }
  if (language === 'Leichte Sprache') {
    return { question: `${place}. ${first}\n${second}\n${question}`, answer };
  }
  if (language === 'Standard') {
    const standardFirst = operation === 'Multiplikation' ? `${place} werden ${a} Gruppen gebildet.` : first;
    const standardSecond = operation === 'Addition' ? `${name} erhält weitere ${b} ${plural}.` : operation === 'Subtraktion' ? `${name} gibt ${b} davon ab.` : operation === 'Multiplikation' ? `Jede Gruppe enthält ${b} ${plural}.` : `${name} teilt sie gleichmäßig auf ${a} Gruppen auf.`;
    const standardQuestion = operation === 'Addition' ? `Wie viele ${plural} besitzt ${name} anschließend?` : operation === 'Subtraktion' ? `Wie viele ${plural} verbleiben?` : operation === 'Multiplikation' ? `Wie viele ${plural} sind es insgesamt?` : `Wie viele ${plural} entfallen auf jede Gruppe?`;
    return { question: `${place}: ${standardFirst} ${standardSecond}\n${standardQuestion}`, answer };
  }
  return { question: `${place}. ${first}\n${second}\n${question}`, answer };
}
function makeStory(module) {
  const topic = module.config.topic === 'Gemischt' ? pick(Object.keys(TOPICS)) : module.config.topic;
  const operation = module.config.operation === 'Gemischt' ? pick(OPERATIONS) : module.config.operation;
  let a, b;
  if (operation === 'Subtraktion') { a = randomInt(6, 40); b = randomInt(1, Math.min(20, a)); }
  else if (operation === 'Division') { a = randomInt(2, 10); b = randomInt(2, 10); }
  else { a = randomInt(2, 20); b = randomInt(2, 12); }
  const result = storyText(topic, operation, module.config.language, { a, b });
  return { question: result.question, answer: result.answer, label: `${topic} · ${operation}` };
}
function makeTasks(module) {
  const tasks = [];
  for (let i = 0; i < module.config.count; i++) {
    if (module.type === 'addition') tasks.push(makeAddition(module.config.range, difficultyFor(module)));
    else if (module.type === 'subtraction') tasks.push(makeSubtraction(module.config.range, difficultyFor(module)));
    else if (module.type === 'multiplication') tasks.push(makeMultiplication(module.config.rows));
    else if (module.type === 'division') tasks.push(makeDivision(module.config.difficulty));
    else tasks.push(makeStory(module));
  }
  return tasks;
}
function buildResults() {
  if (!appState.modules.length) {
    setStatus('Füge mindestens ein Aufgabenmodul hinzu.', true);
    return;
  }
  const emptyRows = appState.modules.some(module => module.type === 'multiplication' && module.config.rows.length === 0);
  if (emptyRows) {
    setStatus('Wähle bei jedem Multiplikationsmodul mindestens eine Reihe aus.', true);
    return;
  }
  const title = document.getElementById('worksheet-title').value.trim() || 'Mein Mathe-Arbeitsblatt';
  const name = document.getElementById('student-name').value.trim();
  appState.results = { title, name, date: new Intl.DateTimeFormat('de-DE', { dateStyle: 'long' }).format(new Date()), groups: appState.modules.map(module => ({ title: MODULES[module.type].title, tasks: makeTasks(module) })) };
  renderPreviews();
  resultsSection.hidden = false;
  setStatus('Fertig! Vorschau und Word-Dateien sind bereit.');
}
document.getElementById('generate-button').addEventListener('click', buildResults);
document.getElementById('worksheet-title').addEventListener('input', () => { if (appState.results) invalidateResults(); });
document.getElementById('student-name').addEventListener('input', () => { if (appState.results) invalidateResults(); });
function escapeHTML(text) { return String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
function renderPreview(isAnswer) {
  const data = appState.results;
  const nameLine = data.name ? `Name: ${escapeHTML(data.name)}` : 'Name: ______________________________';
  const dateLine = `Datum: ${escapeHTML(data.date)}`;
  let number = 1;
  const groups = data.groups.map(group => `<h5 class="preview-module-title">${escapeHTML(group.title)}</h5>${group.tasks.map(task => `<p class="preview-task"><span class="preview-task-number">${number++}.</span><span>${escapeHTML(task.question).replace(/\n/g, '<br>')}${isAnswer ? ` <span class="answer-text">${escapeHTML(task.answer)}</span>` : ''}</span></p>`).join('')}`).join('');
  return `<h4>${escapeHTML(data.title)}${isAnswer ? ' – Lösungen' : ''}</h4><div class="paper-meta">${nameLine}<br>${dateLine}</div>${groups}`;
}
function renderPreviews() {
  document.getElementById('worksheet-preview').innerHTML = renderPreview(false);
  document.getElementById('answers-preview').innerHTML = renderPreview(true);
}

function xmlEscape(text) {
  return String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]));
}
function wordParagraph(text, options = {}) {
  const bold = options.bold ? '<w:b/>' : '';
  const size = options.size ? `<w:sz w:val="${options.size}"/><w:szCs w:val="${options.size}"/>` : '';
  const spacing = options.after ? `<w:spacing w:after="${options.after}"/>` : '';
  const paragraphs = String(text).split('\n').map(line => `<w:t xml:space="preserve">${xmlEscape(line || ' ')}</w:t>`).join('<w:br/>');
  return `<w:p><w:pPr>${spacing}${bold || size ? `<w:rPr>${bold}${size}</w:rPr>` : ''}</w:pPr><w:r><w:rPr>${bold}${size}</w:rPr>${paragraphs}</w:r></w:p>`;
}
function docxBytes(isAnswer) {
  const data = appState.results;
  const title = `${data.title}${isAnswer ? ' – Lösungsblatt' : ''}`;
  const body = [wordParagraph(title, { bold: true, size: 32, after: 120 }), wordParagraph(data.name ? `Name: ${data.name}` : 'Name: ______________________________'), wordParagraph(`Datum: ${data.date}`, { after: 180 })];
  let number = 1;
  for (const group of data.groups) {
    body.push(wordParagraph(group.title, { bold: true, size: 26, after: 90 }));
    group.tasks.forEach(task => {
      body.push(wordParagraph(`${number++}.  ${task.question}${isAnswer ? `   ${task.answer}` : ''}`, { after: 130 }));
    });
  }
  body.push('<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>');
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body.join('')}</w:body></w:document>`;
  const types = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>';
  const rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
  return zipStored([{ name: '[Content_Types].xml', text: types }, { name: '_rels/.rels', text: rels }, { name: 'word/document.xml', text: documentXml }]);
}
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function zipStored(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const write16 = (view, position, value) => view.setUint16(position, value, true);
  const write32 = (view, position, value) => view.setUint32(position, value, true);
  for (const file of files) {
    const name = encoder.encode(file.name);
    const content = encoder.encode(file.text);
    const crc = crc32(content);
    const local = new Uint8Array(30 + name.length);
    const lv = new DataView(local.buffer);
    write32(lv, 0, 0x04034b50); write16(lv, 4, 20); write16(lv, 6, 0); write16(lv, 8, 0);
    write16(lv, 10, 0); write16(lv, 12, 0); write32(lv, 14, crc); write32(lv, 18, content.length); write32(lv, 22, content.length); write16(lv, 26, name.length); write16(lv, 28, 0); local.set(name, 30);
    localParts.push(local, content);
    const central = new Uint8Array(46 + name.length);
    const cv = new DataView(central.buffer);
    write32(cv, 0, 0x02014b50); write16(cv, 4, 20); write16(cv, 6, 20); write16(cv, 8, 0); write16(cv, 10, 0);
    write16(cv, 12, 0); write16(cv, 14, 0); write32(cv, 16, crc); write32(cv, 20, content.length); write32(cv, 24, content.length);
    write16(cv, 28, name.length); write16(cv, 30, 0); write16(cv, 32, 0); write16(cv, 34, 0); write16(cv, 36, 0); write32(cv, 38, 0); write32(cv, 42, offset); central.set(name, 46);
    centralParts.push(central);
    offset += local.length + content.length;
  }
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  write32(ev, 0, 0x06054b50); write16(ev, 4, 0); write16(ev, 6, 0); write16(ev, 8, files.length); write16(ev, 10, files.length); write32(ev, 12, centralSize); write32(ev, 16, offset); write16(ev, 20, 0);
  return new Blob([...localParts, ...centralParts, end], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}
function downloadDocx(isAnswer) {
  if (!appState.results) return;
  const file = docxBytes(isAnswer);
  const link = document.createElement('a');
  const base = (appState.results.title || 'Arbeitsblatt').replace(/[\\/:*?"<>|]/g, '-').trim() || 'Arbeitsblatt';
  link.href = URL.createObjectURL(file);
  link.download = `${base}${isAnswer ? '-Loesungen' : ''}.docx`;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
document.getElementById('worksheet-download').addEventListener('click', () => downloadDocx(false));
document.getElementById('answers-download').addEventListener('click', () => downloadDocx(true));
renderModules();
