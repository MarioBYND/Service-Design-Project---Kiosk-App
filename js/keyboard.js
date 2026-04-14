const Keyboard = (() => {
  const ROWS = [
    ['1','2','3','4','5','6','7','8','9','0'],
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['Z','X','C','V','B','N','M','⌫'],
  ];

  function create(onSearch) {
    let value = '';
    let boundInput = null;

    const container = document.createElement('div');
    container.className = 'vkb';

    function dispatch() {
      if (boundInput) {
        boundInput.value = value;
        boundInput.dispatchEvent(new Event('input'));
      }
    }

    // Rows 1–3
    ROWS.forEach(row => {
      const rowEl = document.createElement('div');
      rowEl.className = 'vkb-row';

      row.forEach(key => {
        const btn = document.createElement('button');
        btn.className = 'vkb-key' + (key === '⌫' ? ' del' : '');
        btn.textContent = key;
        btn.addEventListener('click', () => {
          if (key === '⌫') {
            value = value.slice(0, -1);
          } else {
            value += key;
          }
          dispatch();
        });
        rowEl.appendChild(btn);
      });

      container.appendChild(rowEl);
    });

    // Bottom row: space + search
    const bottomRow = document.createElement('div');
    bottomRow.className = 'vkb-bottom';

    const spaceBtn = document.createElement('button');
    spaceBtn.className = 'vkb-space';
    spaceBtn.textContent = 'Space';
    spaceBtn.addEventListener('click', () => {
      value += ' ';
      dispatch();
    });

    const searchBtn = document.createElement('button');
    searchBtn.className = 'vkb-search';
    searchBtn.textContent = 'Search';
    searchBtn.addEventListener('click', () => {
      onSearch(value.trim());
    });

    bottomRow.appendChild(spaceBtn);
    bottomRow.appendChild(searchBtn);
    container.appendChild(bottomRow);

    function bindInput(el) {
      boundInput = el;
    }

    function reset() {
      value = '';
      if (boundInput) boundInput.value = '';
    }

    return { el: container, bindInput, reset };
  }

  return { create };
})();
