const MODULES = {
  addition: 'Addition', subtraction: 'Subtraktion', multiplication: 'Multiplikation',
  division: 'Division', story: 'Sachaufgaben'
};
const ranges = [10, 20, 50, 100, 1000, 10000];
const rowsAll = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const topics = ['Schule', 'Einkaufen', 'Tiere', 'Freizeit', 'Sport'];
const operations = ['Addition', 'Subtraktion', 'Multiplikation', 'Division'];
const state = { modules: [], results: null };
const moduleList = document.getElementById('module-list');
const resultsSection = document.getElementById('results');
const statusMessage = document.getElementById('status-message');
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const choose = values => values[rand(0, values.length - 1)];
const number = value => value.toLocaleString('de-DE');
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

function options(values, selected, label = value => value) {
  return values.map(value => `<option value="${value}"${value === selected ? ' selected' : ''}>${label(value)}</option>`).join('');
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
    const difficulties = module.type === 'addition'
      ? [['without', 'Ohne Zehnerübergang'], ['with', 'Mit Zehnerübergang'], ['mixed', 'Gemischt']]
      : [['without', 'Ohne Entbündeln'], ['with', 'Mit Entbündeln'], ['mixed', 'Gemischt']];
    html += field('Zahlenraum', 'range', ranges, c.range, value => `bis ${Number(value).toLocaleString('de-DE')}`);
    html += field(module.type === 'addition' ? 'Zehnerübergang' : 'Entbündeln', 'difficulty', difficulties.map(x => x[0]), c.difficulty, value => difficulties.find(x => x[0] === value)[1]);
  } else if (module.type === 'multiplication') {
    const rowChecks = rowsAll.map(row => `<label class="check-option"><input type="checkbox" data-row="${row}"${c.rows.includes(row) ? ' checked' : ''}> ${row}er-Reihe</label>`).join('');
    html += `<div class="field setting-wide"><span>Reihen auswählen</span><div class="filter-actions"><button class="filter-button" type="button" data-filter="easy">Leicht · 1, 2, 5, 10</button><button class="filter-button" type="button" data-filter="medium">Mittel · 3, 4, 6</button><button class="filter-button" type="button" data-filter="hard">Schwer · 7, 8, 9</button><button class="filter-button" type="button" data-filter="all">Alle</button></div><div class="row-options">${rowChecks}</div></div>`;
  } else if (module.type === 'division') {
    const modes = [['without', 'Ohne Rest'], ['with', 'Mit Rest'], ['mixed', 'Gemischt']];
    html += field('Aufgabenmodus', 'difficulty', modes.map(x => x[0]), c.difficulty, value => modes.find(x => x[0] === value)[1]);
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
  moduleList.innerHTML = state.modules.map((module, index) => `<article class="module-card" data-module-id="${module.id}"><header class="module-card-header"><span class="module-number">${index + 1}</span><div><h3>${MODULES[module.type]}</h3><p>Aufgaben und Einstellungen</p></div></header><div class="module-settings">${settings(module)}</div></article>`).join('');
}
function invalidate(message = 'Einstellungen geändert. Erstelle das Arbeitsblatt neu, um die Vorschau zu aktualisieren.') {
  state.results = null;
  resultsSection.hidden = true;
  statusMessage.textContent = message;
  statusMessage.classList.remove('error');
}
document.querySelectorAll('.add-module').forEach(button => button.addEventListener('click', () => {
  const type = button.dataset.module;
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
  const filters = { easy: [1, 2, 5, 10], medium: [3, 4, 6], hard: [7, 8, 9], all: rowsAll };
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
function story(module) {
  const c = module.config;
  const topic = c.topic === 'Gemischt' ? choose(topics) : c.topic;
  const operation = c.operation === 'Gemischt' ? choose(operations) : c.operation;
  const name = choose(['Mia', 'Tom', 'Ali', 'Lena', 'Noah', 'Emma']);
  const nouns = { Schule: 'Stifte', Einkaufen: 'Euro', Tiere: 'Leckerli', Freizeit: 'Sticker', Sport: 'Punkte' };
  const noun = nouns[topic];
  let a = rand(2, 20), b = rand(2, 12), question, answer;
  if (operation === 'Addition') {
    question = `${name} hat ${a} ${noun}. ${name} bekommt ${b} ${noun} dazu.\nWie viele ${noun} hat ${name} jetzt?`;
    answer = number(a + b);
  } else if (operation === 'Subtraktion') {
    a = rand(6, 40); b = rand(1, a);
    question = `${name} hat ${a} ${noun}. ${name} gibt ${b} ${noun} ab.\nWie viele ${noun} bleiben übrig?`;
    answer = number(a - b);
  } else if (operation === 'Multiplikation') {
    question = `Es gibt ${a} Gruppen. In jeder Gruppe sind ${b} ${noun}.\nWie viele ${noun} sind es zusammen?`;
    answer = number(a * b);
  } else {
    question = `${a * b} ${noun} werden gleichmäßig auf ${a} Gruppen verteilt.\nWie viele ${noun} sind in jeder Gruppe?`;
    answer = String(b);
  }
  if (c.language === 'Standard') question = `${topic}: ${question.replace('\n', ' ')} Berechne die Gesamtmenge.`;
  return { question, answer, label: `${topic} · ${operation}` };
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
    return story(module);
  });
}
function buildResults() {
  const fail = message => { statusMessage.textContent = message; statusMessage.classList.add('error'); };
  if (!state.modules.length) return fail('Füge mindestens ein Aufgabenmodul hinzu.');
  if (state.modules.some(m => m.type === 'multiplication' && !m.config.rows.length)) return fail('Wähle bei jedem Multiplikationsmodul mindestens eine Reihe aus.');
  const title = document.getElementById('worksheet-title').value.trim() || 'Mein Mathe-Arbeitsblatt';
  const name = document.getElementById('student-name').value.trim();
  state.results = { title, name, date: new Intl.DateTimeFormat('de-DE', { dateStyle: 'long' }).format(new Date()), groups: state.modules.map(module => ({ title: MODULES[module.type], tasks: tasksFor(module) })) };
  renderPreviews();
  resultsSection.hidden = false;
  statusMessage.textContent = 'Fertig! Vorschau und Word-Dateien sind bereit.';
  statusMessage.classList.remove('error');
}
document.getElementById('generate-button').addEventListener('click', buildResults);
['worksheet-title', 'student-name'].forEach(id => document.getElementById(id).addEventListener('input', () => { if (state.results) invalidate(); }));
function preview(isAnswer) {
  let index = 1;
  const name = state.results.name ? `Name: ${escapeHtml(state.results.name)}` : 'Name: ______________________________';
  const groups = state.results.groups.map(group => `<h5 class="preview-module-title">${escapeHtml(group.title)}</h5>${group.tasks.map(task => `<p class="preview-task"><span class="preview-task-number">${index++}.</span><span>${escapeHtml(task.question).replace(/\n/g, '<br>')}${isAnswer ? ` <b>${escapeHtml(task.answer)}</b>` : ''}</span></p>`).join('')}`).join('');
  return `<h4>${escapeHtml(state.results.title)}${isAnswer ? ' – Lösungen' : ''}</h4><div class="paper-meta">${name}<br>Datum: ${escapeHtml(state.results.date)}</div>${groups}`;
}
function renderPreviews() {
  document.getElementById('worksheet-preview').innerHTML = preview(false);
  document.getElementById('answers-preview').innerHTML = preview(true);
}
function xmlEscape(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]));
}
function paragraph(text, bold = false) {
  const lines = String(text).split('\n').map(line => `<w:t xml:space="preserve">${xmlEscape(line || ' ')}</w:t>`).join('<w:br/>');
  return `<w:p><w:r><w:rPr>${bold ? '<w:b/>' : ''}</w:rPr>${lines}</w:r></w:p>`;
}
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function makeZip(files) {
  const encoder = new TextEncoder(), localParts = [], centralParts = [];
  let offset = 0;
  const w16 = (view, pos, value) => view.setUint16(pos, value, true);
  const w32 = (view, pos, value) => view.setUint32(pos, value, true);
  for (const file of files) {
    const name = encoder.encode(file.name), content = encoder.encode(file.text), crc = crc32(content);
    const local = new Uint8Array(30 + name.length), lv = new DataView(local.buffer);
    w32(lv, 0, 0x04034b50); w16(lv, 4, 20); w32(lv, 14, crc); w32(lv, 18, content.length); w32(lv, 22, content.length); w16(lv, 26, name.length); local.set(name, 30);
    localParts.push(local, content);
    const central = new Uint8Array(46 + name.length), cv = new DataView(central.buffer);
    w32(cv, 0, 0x02014b50); w16(cv, 4, 20); w16(cv, 6, 20); w32(cv, 16, crc); w32(cv, 20, content.length); w32(cv, 24, content.length); w16(cv, 28, name.length); w32(cv, 42, offset); central.set(name, 46);
    centralParts.push(central);
    offset += local.length + content.length;
  }
  const centralSize = centralParts.reduce((sum, item) => sum + item.length, 0);
  const end = new Uint8Array(22), ev = new DataView(end.buffer);
  w32(ev, 0, 0x06054b50); w16(ev, 8, files.length); w16(ev, 10, files.length); w32(ev, 12, centralSize); w32(ev, 16, offset);
  return new Blob([...localParts, ...centralParts, end], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}
function docx(isAnswer) {
  const data = state.results;
  const body = [paragraph(`${data.title}${isAnswer ? ' – Lösungsblatt' : ''}`, true), paragraph(data.name ? `Name: ${data.name}` : 'Name: ______________________________'), paragraph(`Datum: ${data.date}`)];
  let index = 1;
  for (const group of data.groups) {
    body.push(paragraph(group.title, true));
    group.tasks.forEach(task => body.push(paragraph(`${index++}.  ${task.question}${isAnswer ? `   ${task.answer}` : ''}`)));
  }
  body.push('<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>');
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body.join('')}</w:body></w:document>`;
  const types = '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>';
  const rels = '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
  return makeZip([{ name: '[Content_Types].xml', text: types }, { name: '_rels/.rels', text: rels }, { name: 'word/document.xml', text: documentXml }]);
}
function download(isAnswer) {
  if (!state.results) return;
  const link = document.createElement('a'), blob = docx(isAnswer);
  const base = (state.results.title || 'Arbeitsblatt').replace(/[\\:*?"<>|]/g, '-').replace(/\//g, '-').trim() || 'Arbeitsblatt';
  link.href = URL.createObjectURL(blob);
  link.download = `${base}${isAnswer ? '-Loesungen' : ''}.docx`;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
document.getElementById('worksheet-download').addEventListener('click', () => download(false));
document.getElementById('answers-download').addEventListener('click', () => download(true));
renderModules();
