/* Add remove controls and clearer place-value labels without changing generation timing. */
const originalRenderModules = renderModules;
renderModules = function () {
  originalRenderModules();
  document.querySelectorAll('.module-card').forEach(card => {
    const module = state.modules.find(item => item.id === card.dataset.moduleId);
    if (!module) return;

    const header = card.querySelector('.module-card-header');
    if (header && !header.querySelector('.remove-module')) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'remove-module';
      button.textContent = 'Modul löschen';
      button.setAttribute('aria-label', `${MODULES[module.type]}-Modul löschen`);
      header.append(button);
    }

    const difficulty = card.querySelector('[data-key="difficulty"]');
    if (difficulty && (module.type === 'addition' || module.type === 'subtraction')) {
      const labels = {
        without: 'Ohne Zehnerübergang',
        with: 'Mit Zehnerübergang',
        mixed: 'Gemischt'
      };
      Array.from(difficulty.options).forEach(option => { option.textContent = labels[option.value]; });
    }
  });
};

moduleList.addEventListener('click', event => {
  const button = event.target.closest('.remove-module');
  if (!button) return;
  const card = button.closest('.module-card');
  state.modules = state.modules.filter(module => module.id !== card.dataset.moduleId);
  renderModules();
  invalidate(state.modules.length ? 'Modul gelöscht. Erstelle das Arbeitsblatt, wenn deine Auswahl fertig ist.' : 'Füge zuerst mindestens ein Aufgabenmodul hinzu.');
});

const moduleControlStyle = document.createElement('style');
moduleControlStyle.textContent = `
.module-card-header { position: relative; }
.remove-module { margin-left: auto; min-height: 36px; padding: 6px 10px; color: #8d3029; background: #fff; border: 1px solid #e6c6c2; border-radius: 8px; font-size: 12px; font-weight: 700; }
.remove-module:hover { background: #fff3f1; }
@media (max-width: 420px) { .module-card-header { flex-wrap: wrap; } .remove-module { margin-left: 44px; } }
`;
document.head.append(moduleControlStyle);
