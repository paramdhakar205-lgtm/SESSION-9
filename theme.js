(function () {
  var root = document.documentElement, KEY = 'theme-prefs';
  var s = { mode: null, palette: 'indigo', bg: null, fg: null };
  try { Object.assign(s, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}

  function save() { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  function mode() {
    return s.mode || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  function apply() {
    var st = root.style;
    root.dataset.mode = mode();
    root.dataset.palette = s.palette;
    st.colorScheme = mode();
    ['--paper', '--ink', '--muted', '--rule'].forEach(function (p) { st.removeProperty(p); });
    if (s.bg) st.setProperty('--paper', s.bg);
    if (s.fg) st.setProperty('--ink', s.fg);
    if (s.bg || s.fg) {
      st.setProperty('--muted', 'color-mix(in srgb, var(--ink) 65%, var(--paper))');
      st.setProperty('--rule', 'color-mix(in srgb, var(--ink) 20%, var(--paper))');
    }
  }

  function cssVar(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }

  function hex(v) { return /^#[0-9a-f]{6}$/i.test(v) ? v : '#000000'; }

  apply(); // run before first paint to avoid a flash

  document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.getElementById('mode-toggle');
    var bg = document.getElementById('bg-color');
    var fg = document.getElementById('fg-color');
    var swatches = document.querySelectorAll('.swatch');

    function sync() {
      var dark = mode() === 'dark';
      toggle.setAttribute('aria-pressed', dark);
      toggle.textContent = dark ? 'Light mode' : 'Dark mode';
      swatches.forEach(function (b) {
        b.setAttribute('aria-pressed', b.dataset.palette === s.palette);
      });
      bg.value = hex(s.bg || cssVar('--paper'));
      fg.value = hex(s.fg || cssVar('--ink'));
    }

    function update() { apply(); save(); sync(); }

    toggle.addEventListener('click', function () {
      s.mode = mode() === 'dark' ? 'light' : 'dark';
      s.bg = s.fg = null; // custom colours belong to the previous mode
      update();
    });

    swatches.forEach(function (b) {
      b.addEventListener('click', function () {
        s.palette = b.dataset.palette;
        s.bg = s.fg = null;
        update();
      });
    });

    bg.addEventListener('input', function () { s.bg = bg.value; update(); });
    fg.addEventListener('input', function () { s.fg = fg.value; update(); });

    document.getElementById('theme-reset').addEventListener('click', function () {
      s = { mode: null, palette: 'indigo', bg: null, fg: null };
      update();
    });

    sync();
  });
})();
