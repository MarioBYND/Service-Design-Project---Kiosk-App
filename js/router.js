const Router = (() => {
  let currentScreen = null;
  const screens = {};

  function register(name, renderFn) {
    screens[name] = renderFn;
  }

  function go(name, params = {}) {
    const app = document.getElementById('app');
    app.innerHTML = '';
    const el = screens[name](params);
    app.appendChild(el);
    currentScreen = name;
    resetIdleTimer();
  }

  function current() {
    return currentScreen;
  }

  return { register, go, current };
})();
