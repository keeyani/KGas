/* KGas - shared behaviour. Vanilla JS, no dependencies, no build step.
   Loaded with `defer` on every page. Keep this file small; if it starts
   growing a framework shape, raise it rather than adding one. */

(function () {
  'use strict';

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  function setOpen(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }

  toggle.addEventListener('click', function () {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Escape closes the panel and returns focus to the control that opened it.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  // Reset state when crossing into the desktop layout, so a panel left
  // open on mobile does not strand the class on a wide screen.
  var wide = window.matchMedia('(min-width: 880px)');
  var onChange = function (e) { if (e.matches) setOpen(false); };
  if (wide.addEventListener) wide.addEventListener('change', onChange);
  else if (wide.addListener) wide.addListener(onChange); // older Safari
})();
