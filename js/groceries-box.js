(function () {
  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  function applyGroceriesState(root) {
    const state = {
      filter: root.querySelector('[data-grocery-filter].is-active')?.dataset.groceryFilter || 'all',
      source: root.querySelector('[data-grocery-source]')?.value || 'all',
      sort: root.querySelector('[data-grocery-sort]')?.value || 'name-asc',
      view: root.querySelector('[data-grocery-view].is-active')?.dataset.groceryView || 'grid',
    };

    localStorage.setItem('feng-groceries-state', JSON.stringify(state));

    const grid = root.querySelector('[data-groceries-box]');
    const cards = Array.from(root.querySelectorAll('.grocery-card'));

    cards.sort(function (a, b) {
      const [key, direction] = state.sort.split('-');
      const av = key === 'tag' ? normalize(a.dataset.tags).split(' ')[0] : normalize(a.dataset[key] || a.dataset.name);
      const bv = key === 'tag' ? normalize(b.dataset.tags).split(' ')[0] : normalize(b.dataset[key] || b.dataset.name);
      return direction === 'desc' ? bv.localeCompare(av) : av.localeCompare(bv);
    });

    cards.forEach(function (card) {
      const matchesType = state.filter === 'all' || card.dataset.type === state.filter;
      const matchesSource = state.source === 'all' || card.dataset.source === state.source;
      const visible = matchesType && matchesSource;
      card.hidden = !visible;
      if (grid) grid.appendChild(card);
    });

    if (grid) {
      grid.dataset.view = state.view;
      grid.classList.toggle('is-list', state.view === 'list');
    }

    const visibleCount = cards.filter(function (card) { return !card.hidden; }).length;
    const count = root.querySelector('[data-grocery-count]');
    const empty = root.querySelector('[data-grocery-empty]');
    if (count) count.textContent = String(visibleCount);
    if (empty) empty.hidden = visibleCount !== 0;
  }

  function restoreState(root) {
    try {
      const saved = JSON.parse(localStorage.getItem('feng-groceries-state') || '{}');
      if (saved.filter) {
        root.querySelectorAll('[data-grocery-filter]').forEach(function (button) {
          button.classList.toggle('is-active', button.dataset.groceryFilter === saved.filter);
        });
      }
      if (saved.source && root.querySelector('[data-grocery-source]')) root.querySelector('[data-grocery-source]').value = saved.source;
      if (saved.sort && root.querySelector('[data-grocery-sort]')) root.querySelector('[data-grocery-sort]').value = saved.sort;
      if (saved.view) {
        root.querySelectorAll('[data-grocery-view]').forEach(function (button) {
          button.classList.toggle('is-active', button.dataset.groceryView === saved.view);
        });
      }
    } catch (error) {
      localStorage.removeItem('feng-groceries-state');
    }
  }

  function initGroceriesBox() {
    const root = document.querySelector('.groceries-page');
    if (!root || root.dataset.groceriesReady === 'true') return;
    root.dataset.groceriesReady = 'true';

    restoreState(root);

    root.querySelectorAll('[data-grocery-filter]').forEach(function (button) {
      button.addEventListener('click', function () {
        root.querySelectorAll('[data-grocery-filter]').forEach(function (item) { item.classList.remove('is-active'); });
        button.classList.add('is-active');
        applyGroceriesState(root);
      });
    });

    root.querySelectorAll('[data-grocery-view]').forEach(function (button) {
      button.addEventListener('click', function () {
        root.querySelectorAll('[data-grocery-view]').forEach(function (item) { item.classList.remove('is-active'); });
        button.classList.add('is-active');
        applyGroceriesState(root);
      });
    });

    root.querySelectorAll('[data-grocery-source], [data-grocery-sort]').forEach(function (control) {
      control.addEventListener('change', function () { applyGroceriesState(root); });
    });

    applyGroceriesState(root);
  }

  document.addEventListener('DOMContentLoaded', initGroceriesBox);
  document.addEventListener('swup:contentReplaced', initGroceriesBox);
  window.applyGroceriesState = applyGroceriesState;
})();
