/* Worksheet metadata, accessible instruction labels, and print-like previews. */
const WORKSHEET_DIRECTIONS = {
  addition: 'Berechne die Aufgaben.',
  subtraction: 'Berechne die Aufgaben.',
  multiplication: 'Berechne die Malaufgaben.',
  division: 'Berechne die Geteilt-Aufgaben.',
  'number-wall': 'Ergänze die fehlenden Zahlen.',
  triangle: 'Berechne die fehlenden Zahlen.',
  compare: 'Setze das richtige Zeichen ein.',
  chain: 'Rechne die Kette Schritt für Schritt.',
  house: 'Fülle die fehlenden Felder aus.',
  'find-operation': 'Finde die passende Rechenoperation.',
  'number-line': 'Lies den Zahlenstrahl und bearbeite die Aufgabe.'
};

function worksheetLocalDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
const worksheetDateInput = document.getElementById('worksheet-date');
if (worksheetDateInput && !worksheetDateInput.value) worksheetDateInput.value = worksheetLocalDate();

function worksheetEscape(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function worksheetFormattedDate(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(year, month - 1, day));
}
function worksheetDiagramTask(module, task) {
  if (!task || !task.question) return task;
  const lines = task.question.split('\n');
  if (module.type === 'number-wall') {
    const rows = lines.map(line => (line.match(/□|\d[\d.]*/g) || []));
    if (rows.length >= 3 && rows[0].length === 1 && rows[1].length === 2 && rows[2].length === 3) {
      task.visual = { type: 'wall', rows };
    }
  } else if (module.type === 'triangle') {
    const values = lines.flatMap(line => line.match(/□|\d[\d.]*/g) || []);
    if (values.length === 3) task.visual = { type: 'triangle', values };
  } else if (module.type === 'house' || module.type === 'find-operation') {
    const rows = lines.map(line => line.match(/^\s*(\d+)\s*→\s*(\d+)\s*$/)).filter(Boolean);
    if (rows.length) task.visual = { type: 'house', roof: lines[0].trim(), rows: rows.map(row => [row[1], row[2]]) };
  }
  return task;
}
const worksheetOriginalTasksFor = tasksFor;
tasksFor = function (module, namePool) {
  const tasks = worksheetOriginalTasksFor(module, namePool);
  return tasks.map(task => worksheetDiagramTask(module, task));
};

function worksheetVisual(task, isAnswer) {
  const visual = task.visual;
  if (!visual) return `<div class="worksheet-task-text">${worksheetEscape(task.question).replace(/\n/g, '<br>')}</div>`;
  const answerClass = isAnswer ? ' worksheet-answer-key' : '';
  if (visual.type === 'wall') {
    return `<div class="worksheet-visual wall-visual${answerClass}" aria-label="Zahlenmauer">${visual.rows.map((row, index) => `<div class="wall-row wall-row-${['top', 'middle', 'bottom'][index]}">${row.map(value => `<span class="wall-cell">${worksheetEscape(value)}</span>`).join('')}</div>`).join('')}</div>`;
  }
  if (visual.type === 'triangle') {
    return `<div class="worksheet-visual triangle-visual${answerClass}" aria-label="Rechendreieck"><span class="triangle-cell triangle-cell-top">${worksheetEscape(visual.values[0])}</span><span class="triangle-cell triangle-cell-left">${worksheetEscape(visual.values[1])}</span><span class="triangle-cell triangle-cell-right">${worksheetEscape(visual.values[2])}</span></div>`;
  }
  if (visual.type === 'house') {
    return `<div class="worksheet-visual house-visual${answerClass}" aria-label="Rechenhaus"><div class="house-roof">${worksheetEscape(visual.roof || '□')}</div>${visual.rows.map(row => `<div class="house-row"><span class="house-box">${worksheetEscape(row[0])}</span><span class="house-arrow" aria-hidden="true">→</span><span class="house-box">${worksheetEscape(row[1])}</span></div>`).join('')}</div>`;
  }
  return `<div class="worksheet-task-text">${worksheetEscape(task.question).replace(/\n/g, '<br>')}</div>`;
}
function worksheetMeta(data) {
  const date = worksheetFormattedDate(data.date);
  const className = data.className ? `<div class="worksheet-meta-item"><strong>Klasse:</strong> ${worksheetEscape(data.className)}</div>` : '';
  return `<div class="worksheet-meta"><div class="worksheet-meta-item">${className || ''}</div><div class="worksheet-meta-item">${date ? `<strong>Datum:</strong> ${worksheetEscape(date)}` : ''}</div><div class="worksheet-meta-item worksheet-name-line"><strong>Name:</strong> ${data.name ? worksheetEscape(data.name) : '________________________________'}</div></div>`;
}
function worksheetPreview(isAnswer) {
  const data = state.results;
  let taskNumber = 1;
  const groups = data.groups.map(group => {
    const moduleType = Object.keys(MODULES).find(key => MODULES[key] === group.title);
    const instruction = WORKSHEET_DIRECTIONS[moduleType] || 'Bearbeite die Aufgaben.';
    const tasks = group.tasks.map(task => {
      const answer = isAnswer ? `<span class="worksheet-answer-inline">${worksheetEscape(task.answer)}</span>` : '<div class="worksheet-answer-space" aria-hidden="true"></div>';
      const visual = worksheetVisual(task, isAnswer);
      return `<div class="worksheet-task"><span class="worksheet-task-number">${taskNumber++}.</span><div class="worksheet-task-content">${visual}${answer}</div></div>`;
    }).join('');
    return `<section class="worksheet-group"><h3 class="worksheet-group-title">${worksheetEscape(group.title)}</h3><p class="worksheet-instructions">${worksheetEscape(instruction)}</p>${tasks}</section>`;
  }).join('');
  const title = data.title.trim() || 'Mathe-Arbeitsblatt';
  return `<div class="paper-preview worksheet-paper${isAnswer ? ' answer-paper' : ''}"><h2 class="worksheet-heading">${worksheetEscape(title)}${isAnswer ? ' – Lösungen' : ''}</h2>${worksheetMeta(data)}${groups}</div>`;
}
function renderWorksheetPreviews() {
  document.getElementById('worksheet-preview').innerHTML = worksheetPreview(false);
  document.getElementById('answers-preview').innerHTML = worksheetPreview(true);
}
function createWorksheetPreview() {
  const fail = message => {
    statusMessage.textContent = message;
    statusMessage.classList.add('error');
  };
  if (!state.modules.length) return fail('Füge mindestens ein Aufgabenmodul hinzu.');
  if (state.modules.some(module => module.type === 'multiplication' && !module.config.rows.length)) return fail('Wähle bei jedem Multiplikationsmodul mindestens eine Reihe aus.');
  const title = document.getElementById('worksheet-title').value.trim();
  const className = document.getElementById('class-name').value.trim();
  const date = document.getElementById('worksheet-date').value || worksheetLocalDate();
  const name = document.getElementById('student-name').value.trim();
  const namePool = shuffled(names);
  const groups = state.modules.map(module => ({ title: MODULES[module.type], tasks: tasksFor(module, namePool) }));
  state.results = { title, className, date, name, groups };
  renderWorksheetPreviews();
  resultsSection.hidden = false;
  statusMessage.textContent = 'Fertig! Die Druckvorschau für Arbeitsblatt und Lösungen ist bereit.';
  statusMessage.classList.remove('error');
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Den bisherigen Klick-Handler gezielt ersetzen: Die Druckvorschau erhält ihre
// Metadaten direkt aus den aktuellen Eingaben. Der DOCX-Code bleibt unberührt.
const oldGenerateButton = document.getElementById('generate-button');
const newGenerateButton = oldGenerateButton.cloneNode(true);
oldGenerateButton.replaceWith(newGenerateButton);
newGenerateButton.addEventListener('click', createWorksheetPreview);
['worksheet-title', 'class-name', 'worksheet-date', 'student-name'].forEach(id => {
  const input = document.getElementById(id);
  input.addEventListener('input', () => { if (state.results) invalidate(); });
  input.addEventListener('change', () => { if (state.results) invalidate(); });
});
document.getElementById('print-button').addEventListener('click', () => window.print());
