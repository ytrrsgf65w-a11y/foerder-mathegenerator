/*
 * Sachaufgaben sind vorübergehend vollständig aus dem Generator deaktiviert.
 * Dieses Script wird nach app.js und extra-modules.js ausgeführt.
 */
delete MODULES.story;

document.querySelectorAll('.add-module[data-module="story"]').forEach(button => button.remove());

// Auch falls später versehentlich wieder ein Sachaufgaben-Button ergänzt wird,
// kann das deaktivierte Modul nicht mehr hinzugefügt werden.
document.addEventListener('click', event => {
  const button = event.target.closest('.add-module[data-module="story"]');
  if (!button) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}, true);

// Defensive Bereinigung möglicher Module aus einem offenen alten Tab.
if (Array.isArray(state.modules)) {
  const hadStory = state.modules.some(module => module.type === 'story');
  if (hadStory) {
    state.modules = state.modules.filter(module => module.type !== 'story');
    renderModules();
    invalidate('Das Sachaufgaben-Modul ist nicht mehr verfügbar.');
  }
}
