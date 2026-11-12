/*
 * Sachaufgaben-Pool: 5 Themen × 5 echte Kontexte × 4 Rechenarten = 100
 * unterscheidbare Vorlagen. Keine austauschbaren Zahlenkopien im Arbeitsblatt.
 * Dieses Script wird nach app.js, story-variety.js und extra-modules.js geladen.
 */
const STORY_POOL_NAMES = [
  'Amir', 'Aylin', 'Ben', 'Can', 'David', 'Elif', 'Emma', 'Fatima', 'Hanna', 'Hassan',
  'Ida', 'Jamal', 'Jana', 'Jonas', 'Lina', 'Malik', 'Mara', 'Mehmet', 'Mila', 'Mina',
  'Moussa', 'Noah', 'Nora', 'Omar', 'Rania', 'Sami', 'Sara', 'Sofia', 'Yara', 'Yusuf',
  'Amina', 'Arda', 'Elias', 'Esma', 'Hadi', 'Iman', 'Ismail', 'Kaan', 'Lea', 'Levent',
  'Mariam', 'Mert', 'Meryem', 'Nadia', 'Nico', 'Rami', 'Samira', 'Selin', 'Tariq', 'Zehra',
  'Anisa', 'Emir', 'Farah', 'Ilyas', 'Luca', 'Maya', 'Rojin', 'Theo', 'Yasin', 'Zara'
];

// Jeder Kontext hat passende Gegenstände, Handlungen und Gruppierungen. Die
// Datensätze sind absichtlich konkret, damit Text und Rechenhandlung stimmen.
const STORY_POOL_CONTEXTS = {
  Schule: [
    { id: 'klassenbuecher', place: 'In der Klassenbücherei', item: 'Bücher', addVerb: 'stellt', subVerb: 'leiht', group: 'Kisten', container: 'Kiste', groupItem: 'Bücher', addEnd: 'ins Regal', subEnd: 'aus der Bücherei aus', groupAction: 'packt', divideAction: 'verteilt' },
    { id: 'buntstifte', place: 'Im Kunstunterricht', item: 'Buntstifte', addVerb: 'legt', subVerb: 'räumt', group: 'Mappen', container: 'Mappe', groupItem: 'Buntstifte', addEnd: 'auf den Tisch', subEnd: 'in die Schachtel', groupAction: 'sortiert', divideAction: 'teilt' },
    { id: 'hefte', place: 'Im Klassenraum', item: 'Hefte', addVerb: 'bringt', subVerb: 'nimmt', group: 'Fächer', container: 'Fach', groupItem: 'Hefte', addEnd: 'für die Klasse mit', subEnd: 'für die Hausaufgabe mit', groupAction: 'legt', divideAction: 'verteilt' },
    { id: 'arbeitsblaetter', place: 'Auf dem Lehrertisch', item: 'Arbeitsblätter', addVerb: 'legt', subVerb: 'teilt', group: 'Stapel', container: 'Stapel', groupItem: 'Arbeitsblätter', addEnd: 'dazu', subEnd: 'an die Kinder aus', groupAction: 'bildet', divideAction: 'teilt' },
    { id: 'sitzplaetze', place: 'Im Gruppenraum', item: 'Stühle', addVerb: 'stellt', subVerb: 'räumt', group: 'Tische', container: 'Tisch', groupItem: 'Stühle', addEnd: 'dazu', subEnd: 'weg', groupAction: 'stellt', divideAction: 'ordnet' }
  ],
  Einkaufen: [
    { id: 'aepfel', place: 'Am Obststand', item: 'Äpfel', addVerb: 'legt', subVerb: 'nimmt', group: 'Tüten', container: 'Tüte', groupItem: 'Äpfel', addEnd: 'in den Einkaufskorb', subEnd: 'wieder aus dem Korb', groupAction: 'füllt', divideAction: 'packt' },
    { id: 'broetchen', place: 'In der Bäckerei', item: 'Brötchen', addVerb: 'kauft', subVerb: 'gibt', group: 'Tüten', container: 'Tüte', groupItem: 'Brötchen', addEnd: 'für das Frühstück dazu', subEnd: 'an die Familie ab', groupAction: 'packt', divideAction: 'verteilt' },
    { id: 'eis', place: 'An der Eisdiele', item: 'Eiskugeln', addVerb: 'bestellt', subVerb: 'isst', group: 'Eisbecher', container: 'Eisbecher', groupItem: 'Eiskugeln', addEnd: 'noch dazu', subEnd: 'schon auf', groupAction: 'bestellt', divideAction: 'füllt' },
    { id: 'getraenke', place: 'Für das Klassenfest', item: 'Getränkeflaschen', addVerb: 'holt', subVerb: 'bringt', group: 'Getränkekisten', container: 'Getränkekiste', groupItem: 'Getränkeflaschen', addEnd: 'aus dem Laden', subEnd: 'zum Laden zurück', groupAction: 'stellt', divideAction: 'sortiert' },
    { id: 'gemuese', place: 'Auf dem Markt', item: 'Möhren', addVerb: 'kauft', subVerb: 'verarbeitet', group: 'Beutel', container: 'Beutel', groupItem: 'Möhren', addEnd: 'für das Abendessen dazu', subEnd: 'für die Suppe', groupAction: 'füllt', divideAction: 'packt' }
  ],
  Tiere: [
    { id: 'schafe', place: 'Auf der Weide', item: 'Schafe', addVerb: 'zählt', subVerb: 'bringt', group: 'Pferche', container: 'Pferch', groupItem: 'Schafe', addEnd: 'mit dazu', subEnd: 'in den Stall', groupAction: 'teilt', divideAction: 'verteilt' },
    { id: 'kaninchen', place: 'Im Kaninchengehege', item: 'Kaninchen', addVerb: 'sieht', subVerb: 'setzt', group: 'Gehege', container: 'Gehege', groupItem: 'Kaninchen', addEnd: 'dazu kommen', subEnd: 'in ein anderes Gehege', groupAction: 'ordnet', divideAction: 'verteilt' },
    { id: 'pferde', place: 'Auf dem Reiterhof', item: 'Pferde', addVerb: 'führt', subVerb: 'bringt', group: 'Koppeln', container: 'Koppel', groupItem: 'Pferde', addEnd: 'auf die Koppel', subEnd: 'in den Stall', groupAction: 'stellt', divideAction: 'verteilt' },
    { id: 'enten', place: 'Am Teich', item: 'Enten', addVerb: 'beobachtet', subVerb: 'sieht', group: 'Teiche', container: 'Teich', groupItem: 'Enten', addEnd: 'dazu schwimmen', subEnd: 'davonschwimmen', groupAction: 'teilt', divideAction: 'ordnet' },
    { id: 'hunde', place: 'Im Tierheim', item: 'Hunde', addVerb: 'versorgt', subVerb: 'vermittelt', group: 'Gehege', container: 'Gehege', groupItem: 'Hunde', addEnd: 'zusätzlich', subEnd: 'an eine Familie', groupAction: 'ordnet', divideAction: 'verteilt' }
  ],
  Freizeit: [
    { id: 'sticker', place: 'In Yaras Sammelalbum', item: 'Sticker', addVerb: 'klebt', subVerb: 'verschenkt', group: 'Albumseiten', container: 'Albumseite', groupItem: 'Sticker', addEnd: 'auf die Seite', subEnd: 'an ihre Freundin', groupAction: 'ordnet', divideAction: 'verteilt' },
    { id: 'murmeln', place: 'Auf dem Spielplatz', item: 'Murmeln', addVerb: 'sammelt', subVerb: 'verliert', group: 'Beutel', container: 'Beutel', groupItem: 'Murmeln', addEnd: 'noch dazu', subEnd: 'beim Spielen', groupAction: 'füllt', divideAction: 'teilt' },
    { id: 'sammelkarten', place: 'Beim Tauschen auf dem Schulhof', item: 'Sammelkarten', addVerb: 'bekommt', subVerb: 'tauscht', group: 'Päckchen', container: 'Päckchen', groupItem: 'Sammelkarten', addEnd: 'von Can dazu', subEnd: 'gegen andere Karten', groupAction: 'sortiert', divideAction: 'packt' },
    { id: 'comics', place: 'Im Jugendzentrum', item: 'Comics', addVerb: 'stellt', subVerb: 'leiht', group: 'Regale', container: 'Regal', groupItem: 'Comics', addEnd: 'ins Regal', subEnd: 'an Freunde aus', groupAction: 'räumt', divideAction: 'verteilt' },
    { id: 'spiele', place: 'Im Spielezimmer', item: 'Brettspiele', addVerb: 'räumt', subVerb: 'leiht', group: 'Regale', container: 'Regal', groupItem: 'Brettspiele', addEnd: 'ins Regal', subEnd: 'an die Nachbarn aus', groupAction: 'bestückt', divideAction: 'ordnet' }
  ],
  Sport: [
    { id: 'baelle', place: 'In der Sporthalle', item: 'Bälle', addVerb: 'holt', subVerb: 'räumt', group: 'Körbe', container: 'Korb', groupItem: 'Bälle', addEnd: 'aus dem Geräteraum', subEnd: 'in den Geräteraum', groupAction: 'füllt', divideAction: 'verteilt' },
    { id: 'punkte', place: 'Beim Sportfest', item: 'Punkte', addVerb: 'erzielt', subVerb: 'verliert', group: 'Teams', container: 'Team', groupItem: 'Punkte', addEnd: 'im nächsten Spiel', subEnd: 'im Spiel', groupAction: 'teilt', divideAction: 'verteilt' },
    { id: 'runden', place: 'Auf der Laufbahn', item: 'Runden', addVerb: 'läuft', subVerb: 'läuft', group: 'Laufgruppen', container: 'Laufgruppe', groupItem: 'Runden', addEnd: 'beim Training dazu', subEnd: 'weniger als geplant', groupAction: 'bildet', divideAction: 'teilt' },
    { id: 'spruenge', place: 'Beim Weitsprung', item: 'Sprünge', addVerb: 'macht', subVerb: 'wiederholt', group: 'Durchgänge', container: 'Durchgang', groupItem: 'Sprünge', addEnd: 'beim Üben', subEnd: 'wegen eines Fehlers', groupAction: 'plant', divideAction: 'verteilt' },
    { id: 'sportgeraete', place: 'Vor dem Training', item: 'Hütchen', addVerb: 'stellt', subVerb: 'räumt', group: 'Trainingsfelder', container: 'Trainingsfeld', groupItem: 'Hütchen', addEnd: 'auf den Platz', subEnd: 'vom Platz', groupAction: 'markiert', divideAction: 'teilt' }
  ]
};

const STORY_POOL_TEMPLATES = Object.entries(STORY_POOL_CONTEXTS).flatMap(([topic, contexts]) =>
  contexts.flatMap(context => ['Addition', 'Subtraktion', 'Multiplikation', 'Division'].map(operation => ({
    id: `${topic}:${context.id}:${operation}`, topic, context, operation
  })))
);

function storyPoolQuestion(template, language, person) {
  const { topic, context: scene, operation } = template;
  const { item } = scene;
  let a, b, answer, first, second, question;
  if (operation === 'Addition') {
    a = rand(3, 14);
    b = rand(1, 10);
    const style = STORY_POOL_TEMPLATES.indexOf(template) % 5;
    if (style === 0) {
      first = `${person} zählt ${a} ${item} ${scene.place === 'Auf der Weide' ? 'auf der Weide' : ` ${scene.place}`}.`;
      second = `Dann ${scene.addVerb} ${person} ${b} ${item} ${scene.addEnd}.`;
    } else if (style === 1) {
      first = `${scene.place} sind ${a} ${item}.`;
      second = `${person} ${scene.addVerb} ${b} ${item} ${scene.addEnd}.`;
    } else if (style === 2) {
      first = `Zuerst hat ${person} ${a} ${item}.`;
      second = `Später kommen ${b} ${item} dazu.`;
    } else if (style === 3) {
      first = `${person} sammelt ${a} ${item}.`;
      second = `Beim ${topic === 'Sport' ? 'Training' : 'Besuch'} kommen ${b} ${item} hinzu.`;
    } else {
      first = `Es liegen ${a} ${item} ${scene.place}.`;
      second = `${person} legt noch ${b} ${item} dazu.`;
    }
    question = choose([`Wie viele ${item} sind es zusammen?`, `Wie viele ${item} gibt es jetzt?`, `Wie groß ist die Anzahl danach?`]);
    answer = number(a + b);
  } else if (operation === 'Subtraktion') {
    a = rand(8, 24);
    b = rand(1, Math.min(7, a - 1));
    const style = STORY_POOL_TEMPLATES.indexOf(template) % 5;
    if (style === 0) {
      first = `${person} hat ${a} ${item} ${scene.place}.`;
      second = `${person} gibt ${b} davon ab.`;
    } else if (style === 1) {
      first = `${scene.place} sind ${a} ${item}.`;
      second = `${b} ${item} werden ${scene.subEnd}.`;
    } else if (style === 2) {
      first = `${person} möchte ${a} ${item} mitnehmen.`;
      second = `${b} ${item} ${scene.subEnd}.`;
    } else if (style === 3) {
      first = `Am Anfang sind ${a} ${item} da.`;
      second = `${person} ${scene.subVerb} ${b} davon ${scene.subEnd}.`;
    } else {
      first = `${person} zählt ${a} ${item}.`;
      second = `Dann fehlen ${b} ${item}, weil sie ${scene.subEnd}.`;
    }
    question = choose([`Wie viele ${item} bleiben übrig?`, `Wie viele ${item} sind noch da?`, `Wie viele ${item} hat ${person} danach?`]);
    answer = number(a - b);
  } else if (operation === 'Multiplikation') {
    a = rand(2, 5);
    b = rand(2, 8);
    const style = STORY_POOL_TEMPLATES.indexOf(template) % 5;
    if (style === 0) {
      first = `${person} bereitet ${a} ${scene.group} vor.`;
      second = `In jede ${scene.container} kommen ${b} ${scene.groupItem}.`;
    } else if (style === 1) {
      first = `Für ${scene.place} werden ${a} ${scene.group} gebraucht.`;
      second = `Jede ${scene.container} enthält ${b} ${scene.groupItem}.`;
    } else if (style === 2) {
      first = `${person} packt ${b} ${scene.groupItem} in jede ${scene.container}.`;
      second = `So füllt ${person} insgesamt ${a} ${scene.group}.`;
    } else if (style === 3) {
      first = `${a} ${scene.group} stehen bereit.`;
      second = `${person} legt in jede ${scene.container} ${b} ${scene.groupItem}.`;
    } else {
      first = `Es gibt ${a} gleich große ${scene.group}.`;
      second = `In einer ${scene.container} liegen ${b} ${scene.groupItem}.`;
    }
    question = `Wie viele ${scene.groupItem} sind es insgesamt?`;
    answer = number(a * b);
  } else {
    a = rand(2, 5);
    b = rand(2, 8);
    const total = a * b;
    const style = STORY_POOL_TEMPLATES.indexOf(template) % 5;
    if (style === 0) {
      first = `${person} hat ${total} ${item}.`;
      second = `${person} verteilt sie gleichmäßig auf ${a} ${scene.group}.`;
    } else if (style === 1) {
      first = `${total} ${item} sollen in ${a} ${scene.group} gepackt werden.`;
      second = `${person} legt in jede ${scene.container} gleich viele.`;
    } else if (style === 2) {
      first = `${person} teilt ${total} ${item} gerecht auf ${a} Gruppen auf.`;
      second = `Jede Gruppe bekommt gleich viele.`;
    } else if (style === 3) {
      first = `Für das Training sind ${total} ${item} da.`;
      second = `${person} bildet ${a} gleich große Gruppen.`;
    } else {
      first = `${total} ${item} werden auf ${a} ${scene.group} verteilt.`;
      second = `${person} achtet darauf, dass jede Gruppe gleich viel bekommt.`;
    }
    question = `Wie viele ${item} sind in jeder Gruppe?`;
    answer = String(b);
  }
  if (language === 'Leichte Sprache') {
    // Drei kurze Zeilen, ein klarer Gedanke pro Satz.
    return { question: `${first}\n${second}\n${question}`, answer, label: `${topic} · ${operation} · ${scene.id}` };
  }
  if (language === 'Standard') {
    question = operation === 'Subtraktion' ? `Wie viele ${item} verbleiben?` : operation === 'Division' ? `Wie viele ${item} entfallen auf jede Gruppe?` : `Wie groß ist die Gesamtzahl der ${operation === 'Multiplikation' ? scene.groupItem : item}?`;
  }
  return { question: `${first}\n${second}\n${question}`, answer, label: `${topic} · ${operation} · ${scene.id}` };
}

function storyPoolTasks(module, namePool) {
  const config = module.config;
  const allowedTopics = config.topic === 'Gemischt' ? Object.keys(STORY_POOL_CONTEXTS) : [config.topic];
  const allowedOperations = config.operation === 'Gemischt' ? ['Addition', 'Subtraktion', 'Multiplikation', 'Division'] : [config.operation];
  const candidates = STORY_POOL_TEMPLATES.filter(template => allowedTopics.includes(template.topic) && allowedOperations.includes(template.operation));
  const history = namePool.storyPoolHistory || (namePool.storyPoolHistory = { usedTemplates: new Set(), usedContexts: new Set(), topicCounts: new Map(), operationCounts: new Map() });
  const result = [];

  for (let i = 0; i < config.count; i++) {
    let available = candidates.filter(template => !history.usedTemplates.has(template.id));
    if (!available.length) {
      // Nur dann wiederholen, wenn der konkrete Filter alle Vorlagen verbraucht hat.
      history.usedTemplates.clear();
      available = [...candidates];
    }
    const newContexts = available.filter(template => !history.usedContexts.has(`${template.topic}:${template.context.id}`));
    if (newContexts.length) available = newContexts;

    const score = template =>
      (history.topicCounts.get(template.topic) || 0) * 100 +
      (history.operationCounts.get(template.operation) || 0) * 10;
    const lowestScore = Math.min(...available.map(score));
    const choices = available.filter(template => score(template) === lowestScore);
    const template = choose(choices);
    history.usedTemplates.add(template.id);
    history.usedContexts.add(`${template.topic}:${template.context.id}`);
    history.topicCounts.set(template.topic, (history.topicCounts.get(template.topic) || 0) + 1);
    history.operationCounts.set(template.operation, (history.operationCounts.get(template.operation) || 0) + 1);

    if (!namePool.length) namePool.push(...shuffled(STORY_POOL_NAMES));
    const person = namePool.pop();
    result.push(storyPoolQuestion(template, config.language, person));
  }
  return result;
}

// Aufgabenpool als letzte Generatorstufe verwenden, damit alle Sachaufgaben-
// Module denselben blattweiten Themen-, Kontext- und Namenspool teilen.
const STORY_POOL_PREVIOUS_TASKS = tasksFor;
tasksFor = function (module, namePool) {
  if (module.type === 'story') return storyPoolTasks(module, namePool);
  return STORY_POOL_PREVIOUS_TASKS(module, namePool);
};
