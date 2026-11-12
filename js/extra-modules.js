/* Additional independent exercise modules. Loaded after app.js. */
const EXTRA_MODULE_LABELS = {
  'number-wall': 'Zahlenmauern', triangle: 'Rechendreiecke', compare: 'Größer / Kleiner / Gleich',
  chain: 'Kettenaufgaben', house: 'Rechenhäuser', 'find-operation': 'Rechenhäuser – Aufgabe suchen',
  'number-line': 'Zahlenstrahl'
};
Object.assign(MODULES, Object.fromEntries(Object.entries(EXTRA_MODULE_LABELS).map(([key, title]) => [key, title])));
const EXTRA_RANGES = [10, 20, 50, 100, 1000, 10000];
const EXTRA_OPS = ['Addition', 'Subtraktion', 'Multiplikation', 'Division'];
const EXTRA_COUNT = Array.from({ length: 20 }, (_, i) => i + 1);
const EXTRA_BASE_SETTINGS = settings;
const EXTRA_BASE_DEFAULTS = defaults;
const EXTRA_BASE_TASKS = tasksFor;

function extraField(label, key, values, selected, format = value => value) {
  return `<label class="field">${label}<select data-key="${key}">${values.map(value => `<option value="${value}"${String(value) === String(selected) ? ' selected' : ''}>${format(value)}</option>`).join('')}</select></label>`;
}
function extraNumberRange(value) { return `bis ${Number(value).toLocaleString('de-DE')}`; }
function extraCountField(config) {
  return extraField('Anzahl Aufgaben', 'count', EXTRA_COUNT, config.count, value => `${value} ${Number(value) === 1 ? 'Aufgabe' : 'Aufgaben'}`);
}
function extraOperationField(config) {
  return extraField('Rechenart', 'operation', ['Addition', 'Subtraktion'], config.operation);
}
function extraSettings(module) {
  const c = module.config;
  if (module.type === 'number-wall') return `${extraField('Zahlenraum', 'range', EXTRA_RANGES, c.range, extraNumberRange)}${extraOperationField(c)}${extraCountField(c)}`;
  if (module.type === 'triangle') return `${extraField('Zahlenraum', 'range', EXTRA_RANGES, c.range, extraNumberRange)}${extraOperationField(c)}${extraCountField(c)}`;
  if (module.type === 'compare') return `${extraField('Zahlenraum', 'range', EXTRA_RANGES, c.range, extraNumberRange)}${extraField('Aufgabenart', 'compareMode', ['numbers', 'expressions'], c.compareMode, value => value === 'numbers' ? 'Nur Zahlen' : 'Mit Rechenaufgaben')}${extraCountField(c)}`;
  if (module.type === 'chain') return `${extraField('Rechenart', 'operation', ['Gemischt', ...EXTRA_OPS], c.operation)}${extraField('Zahlenraum', 'range', EXTRA_RANGES, c.range, extraNumberRange)}${extraCountField(c)}`;
  if (module.type === 'house') return `${extraField('Zahlenraum', 'range', EXTRA_RANGES, c.range, extraNumberRange)}${extraOperationField(c)}${extraCountField(c)}`;
  if (module.type === 'find-operation') return `${extraField('Zahlenraum', 'range', EXTRA_RANGES, c.range, extraNumberRange)}${extraOperationField(c)}${extraCountField(c)}`;
  if (module.type === 'number-line') return `${extraField('Zahlenraum', 'range', [10, 20, 100, 1000], c.range, extraNumberRange)}${extraField('Aufgabenart', 'lineMode', ['read', 'fill', 'path'], c.lineMode, value => ({ read: 'Zahl ablesen', fill: 'Zahl eintragen', path: 'Rechenwege nachvollziehen' })[value])}${extraCountField(c)}`;
  return EXTRA_BASE_SETTINGS(module);
}
settings = extraSettings;
function extraDefaults(type) {
  if (type === 'number-wall' || type === 'triangle' || type === 'house' || type === 'find-operation') return { range: 100, operation: 'Addition', count: 5 };
  if (type === 'compare') return { range: 20, compareMode: 'numbers', count: 5 };
  if (type === 'chain') return { range: 100, operation: 'Gemischt', count: 5 };
  if (type === 'number-line') return { range: 20, lineMode: 'read', count: 5 };
  return EXTRA_BASE_DEFAULTS(type);
}
defaults = extraDefaults;
function extraSummary(module) {
  const c = module.config;
  if (c.range) return `Zahlenraum bis ${Number(c.range).toLocaleString('de-DE')}${c.operation ? ` · ${c.operation}` : ''}${c.count ? ` · ${c.count} Aufgaben` : ''}`;
  if (module.type === 'multiplication') return `${c.rows.map(row => `${row}er`).join('-, ')}-Reihe · ${c.count} Aufgaben`;
  if (module.type === 'story') return `${c.topic} · ${c.operation} · ${c.count} Aufgaben`;
  return `${c.count || 0} Aufgaben`;
}
renderModules = function () {
  if (!state.modules.length) {
    moduleList.innerHTML = '<div class="empty-modules">Deine Module erscheinen hier. Wähle oben eine Aufgabenart aus.</div>';
    return;
  }
  moduleList.innerHTML = state.modules.map((module, index) => `<article class="module-card" data-module-id="${escapeHtml(module.id)}"><header class="module-card-header"><span class="module-number" aria-hidden="true">${index + 1}</span><div class="module-card-title"><h3>${escapeHtml(MODULES[module.type])}</h3><p>${escapeHtml(extraSummary(module))}</p></div><button class="remove-module" type="button" aria-label="${escapeHtml(MODULES[module.type])} löschen" data-remove-module="${escapeHtml(module.id)}">Modul löschen</button></header><div class="module-settings">${settings(module)}</div></article>`).join('');
};
moduleList.addEventListener('click', event => {
  const button = event.target.closest('[data-remove-module]');
  if (!button) return;
  state.modules = state.modules.filter(module => module.id !== button.dataset.removeModule);
  renderModules();
  invalidate(state.modules.length ? 'Modul gelöscht. Erstelle das Arbeitsblatt, wenn deine Auswahl fertig ist.' : 'Füge zuerst mindestens ein Aufgabenmodul hinzu.');
});
function extraRandom(max) { return rand(1, Math.max(2, Number(max))); }
function extraWall(module) {
  const maxBase = Math.max(2, Math.floor(module.config.range / 6));
  const bottom = [rand(1, maxBase), rand(1, maxBase), rand(1, maxBase)];
  const middle = module.config.operation === 'Subtraktion'
    ? [Math.abs(bottom[0] - bottom[1]), Math.abs(bottom[1] - bottom[2])]
    : [bottom[0] + bottom[1], bottom[1] + bottom[2]];
  const top = module.config.operation === 'Subtraktion' ? Math.abs(middle[0] - middle[1]) : middle[0] + middle[1];
  const cells = [top, ...middle, ...bottom];
  const blank = rand(0, cells.length - 1);
  const shown = cells.map((value, i) => i === blank ? '□' : number(value));
  return { question: `      ${shown[0]}\n   ${shown[1]}   ${shown[2]}\n ${shown[3]}   ${shown[4]}   ${shown[5]}`, answer: number(cells[blank]) };
}
function extraTriangle(module) {
  const max = Math.max(3, Math.floor(module.config.range / 3));
  let left = rand(1, max), right = rand(1, max);
  if (module.config.operation === 'Subtraktion' && left < right) [left, right] = [right, left];
  const top = module.config.operation === 'Subtraktion' ? left - right : left + right;
  const values = [top, left, right], blank = rand(0, 2);
  const shown = values.map((value, i) => i === blank ? '□' : number(value));
  return { question: `    ${shown[0]}\n ${shown[1]}     ${shown[2]}`, answer: number(values[blank]) };
}
function extraExpression(range) {
  const op = choose(['+', '−']);
  const a = rand(2, Math.min(20, range));
  const b = op === '+' ? rand(1, Math.max(1, Math.min(10, range - a))) : rand(1, a - 1);
  return { text: `${a} ${op} ${b}`, value: op === '+' ? a + b : a - b };
}
function extraCompare(module) {
  const range = module.config.range;
  let left, right;
  if (module.config.compareMode === 'numbers') {
    left = rand(0, range); right = rand(0, range);
  } else {
    left = extraExpression(range); right = extraExpression(range);
  }
  const leftValue = typeof left === 'number' ? left : left.value;
  let rightValue = typeof right === 'number' ? right : right.value;
  if (leftValue === rightValue && Math.random() < 0.7) rightValue += 1;
  const symbol = leftValue < rightValue ? '<' : leftValue > rightValue ? '>' : '=';
  return { question: `${typeof left === 'number' ? number(left) : left.text}  □  ${typeof right === 'number' ? number(right) : right.text}`, answer: symbol };
}
function extraChain(module) {
  const max = Math.min(30, Math.max(10, Number(module.config.range)));
  let current = rand(5, Math.min(15, max));
  const tokens = [String(current)];
  const selected = module.config.operation;
  for (let i = 0; i < 3; i++) {
    let op = selected === 'Gemischt' ? choose(EXTRA_OPS) : selected;
    let operand;
    if (op === 'Addition') { operand = rand(1, 5); current += operand; tokens.push('+', String(operand)); }
    else if (op === 'Subtraktion') { operand = rand(1, Math.max(1, current - 1)); current -= operand; tokens.push('−', String(operand)); }
    else if (op === 'Multiplikation') { operand = rand(2, 3); current *= operand; tokens.push('×', String(operand)); }
    else { const divisors = [2, 3, 4, 5].filter(value => current % value === 0); operand = divisors.length ? choose(divisors) : current; current /= operand; tokens.push(':', String(operand)); }
  }
  return { question: `${tokens.join(' ')} = ____`, answer: number(current) };
}
function extraHouse(module, findOperation) {
  const op = module.config.operation === 'Subtraktion' ? '−' : '+';
  const shift = rand(2, Math.max(3, Math.min(10, Math.floor(module.config.range / 4))));
  const starts = [rand(1, 8), rand(2, 10), rand(3, 12)];
  const rows = starts.map(start => `${start} → ${number(op === '+' ? start + shift : Math.max(0, start - shift))}`);
  return { question: `${findOperation ? '□' : `${op} ${shift}`}\n\n${rows.join('\n')}`, answer: findOperation ? `${op} ${shift}` : rows.map(row => row.split(' → ')[1]).join(', ') };
}
function extraNumberLine(module) {
  const max = Number(module.config.range), step = max <= 20 ? 2 : max <= 100 ? 10 : 100;
  const target = rand(1, Math.max(2, Math.floor(max / step) - 1)) * step;
  const mode = module.config.lineMode;
  if (mode === 'read') return { question: `Zahlenstrahl von 0 bis ${number(max)}.\nJeder Schritt zählt ${number(step)}.\n0 ─── ? ─── ${number(max)}\nWelche Zahl fehlt?`, answer: number(target) };
  if (mode === 'fill') return { question: `Trage ${number(target)} am Zahlenstrahl ein.\n0 ─── □ ─── ${number(max)}`, answer: `${number(target)} (zwischen ${number(Math.max(0, target - step))} und ${number(target + step)})` };
  const jump = step * rand(1, 3);
  const start = rand(1, Math.max(2, Math.floor((max - jump) / step))) * step;
  const direction = Math.random() < 0.5 ? '+' : '−';
  const result = direction === '+' ? start + jump : start - jump;
  return { question: `Starte bei ${number(start)}.\nGehe ${number(jump)} Schritte zu je ${number(step)} ${direction === '+' ? 'vor' : 'zurück'}.\nBei welcher Zahl kommst du an?`, answer: number(result) };
}
function extraTask(module) {
  if (module.type === 'number-wall') return extraWall(module);
  if (module.type === 'triangle') return extraTriangle(module);
  if (module.type === 'compare') return extraCompare(module);
  if (module.type === 'chain') return extraChain(module);
  if (module.type === 'house') return extraHouse(module, false);
  if (module.type === 'find-operation') return extraHouse(module, true);
  if (module.type === 'number-line') return extraNumberLine(module);
  return null;
}
tasksFor = function (module, namePool) {
  if (Object.hasOwn(EXTRA_MODULE_LABELS, module.type)) {
    return Array.from({ length: module.config.count }, () => extraTask(module));
  }
  return EXTRA_BASE_TASKS(module, namePool);
};
const extraModuleStyle = document.createElement('style');
extraModuleStyle.textContent = `.module-card-header{display:flex;align-items:center;gap:12px}.module-card-title{min-width:0;flex:1}.remove-module{min-height:36px;padding:6px 10px;color:#8d3029;background:#fff;border:1px solid #e6c6c2;border-radius:8px;font-size:12px;font-weight:700}.remove-module:hover{background:#fff3f1}.module-settings select{white-space:normal}@media(max-width:420px){.module-card-header{flex-wrap:wrap}.remove-module{margin-left:44px}}`;
document.head.append(extraModuleStyle);
renderModules();
