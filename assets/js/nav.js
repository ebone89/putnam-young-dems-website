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
})();

/**
 * Color theme toggle. The saved choice lives in localStorage and is applied
 * before paint by the inline script in each page <head>; this just flips it
 * on click, keeps the button's pressed state honest for screen readers, and
 * keeps following the OS setting until the visitor makes an explicit choice.
 */
(function () {
  var btn = document.querySelector('.theme-toggle');
  if (!btn) { return; }
  var root = document.documentElement;
  var media = window.matchMedia('(prefers-color-scheme: dark)');

  function currentTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
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

  media.addEventListener('change', function (e) {
    var saved = null;
    try { saved = localStorage.getItem('pcyd-theme'); } catch (err) {}
    if (saved) { return; }   // an explicit choice wins over the OS setting
    root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    syncButton();
  });
})();
