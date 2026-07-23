/**
 * Mobile nav toggle. Keeps aria-expanded in sync so screen readers know
 * whether the menu is open, and closes on Escape.
 */
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.nav-links');
  if (!toggle || !menu) { return; }

  toggle.addEventListener('click', function () {
    var isOpen = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });

  // Closes the menu on any click outside it (or the toggle button itself),
  // same pattern as clicking off a native dropdown.
  document.addEventListener('click', function (e) {
    if (!menu.classList.contains('open')) { return; }
    if (menu.contains(e.target) || toggle.contains(e.target)) { return; }
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });
})();

/**
 * Color theme toggle. Dark is the default (set before paint by the inline
 * script in each page <head>); this just flips it on click, saves the
 * explicit choice to localStorage so it sticks across pages and visits,
 * and keeps the button's pressed state honest for screen readers.
 */
(function () {
  var btn = document.querySelector('.theme-toggle');
  if (!btn) { return; }
  var root = document.documentElement;

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function syncButton() {
    var isDark = currentTheme() === 'dark';
    btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    btn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  syncButton();

  btn.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('pcyd-theme', next); } catch (e) {}
    syncButton();
  });
})();
