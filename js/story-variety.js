/*
 * Streut Sachaufgaben über Namen, Themen und Kontexte.
 * Wird nach app.js geladen und nutzt dessen Vorlagen sowie Generatorfunktionen.
 */
storyTasks = function (module, namePool) {
  // Der Pool wird beim Erstellen eines Arbeitsblatts zwischen Sachaufgaben-
  // modulen geteilt. Dadurch gelten Vielfalt und Namensvermeidung blattweit.
  const variety = namePool.storyVariety || (namePool.storyVariety = {
    usedTemplates: new Set(),
    usedContexts: new Set(),
    topicCounts: new Map(),
    operationCounts: new Map()
  });
  const candidates = storyTemplates(module);
  const result = [];

  for (let index = 0; index < module.config.count; index++) {
    let available = candidates.filter(template =>
      !variety.usedTemplates.has(`${template.topic}|${template.scene.id}|${template.operation}`)
    );

    // Erst neue Kontexte nutzen. Ein Kontext darf erst wiederkehren, wenn in
    // dieser Modulauswahl keine unverbrauchten Kontexte mehr übrig sind.
    const freshContexts = available.filter(template =>
      !variety.usedContexts.has(`${template.topic}|${template.scene.id}`)
    );
    if (freshContexts.length) available = freshContexts;

    // Bei „Gemischt“ zunächst unterrepräsentierte Themen und danach
    // unterrepräsentierte Rechenarten bevorzugen.
    const score = template =>
      (variety.topicCounts.get(template.topic) || 0) * 100 +
      (variety.operationCounts.get(template.operation) || 0) * 10;
    const bestScore = Math.min(...available.map(score));
    const best = available.filter(template => score(template) === bestScore);
    const template = choose(best);
    const templateKey = `${template.topic}|${template.scene.id}|${template.operation}`;
    const contextKey = `${template.topic}|${template.scene.id}`;

    variety.usedTemplates.add(templateKey);
    variety.usedContexts.add(contextKey);
    variety.topicCounts.set(template.topic, (variety.topicCounts.get(template.topic) || 0) + 1);
    variety.operationCounts.set(template.operation, (variety.operationCounts.get(template.operation) || 0) + 1);

    // Jeder Aufgabentext enthält einen Namen. Namen werden über alle
    // Sachaufgaben dieses Arbeitsblatts verteilt und erst danach neu gemischt.
    if (!namePool.length) namePool.push(...shuffled(names));
    const person = namePool.pop();
    const task = storyFromTemplate(template, module.config.language, person);
    task.question = `${person} ist heute dabei.\n${task.question}`;
    result.push(task);
  }
  return result;
};
