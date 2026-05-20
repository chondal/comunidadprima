/* Comunidad PRIMA Caballito · motor de presentación mobile-first.
 *
 * Reemplaza al visor de escritorio original. Se encarga de:
 *  - Escalar el lienzo 1080×1920 para llenar el ancho del celular (sin recortar).
 *  - Mostrar una lámina a la vez con animación deslizante según la dirección.
 *  - Navegar con los botones Atrás/Siguiente, swipe táctil y flechas del teclado.
 *
 * No usa frameworks ni dependencias: corre tal cual en GitHub Pages. */
(function () {
  'use strict';

  var DESIGN_W = 1080;
  var DESIGN_H = 1920;

  var stage = document.querySelector('.stage');
  var canvas = document.querySelector('.deck-canvas');
  var slides = canvas ? Array.prototype.slice.call(canvas.querySelectorAll(':scope > section')) : [];

  var prevBtn = document.querySelector('.nav-btn.prev');
  var nextBtn = document.querySelector('.nav-btn.next');
  var currentEl = document.querySelector('.nav-counter .current');
  var totalEl = document.querySelector('.nav-counter .total');

  if (!stage || !canvas || slides.length === 0) return;

  var index = 0;

  /* ── Escalado: el lienzo de diseño entra completo en el área visible ── */
  function fit() {
    var w = stage.clientWidth;
    var h = stage.clientHeight;
    if (!w || !h) return;
    var scale = Math.min(w / DESIGN_W, h / DESIGN_H);
    canvas.style.setProperty('--deck-scale', String(scale));
  }

  /* ── Navegación ─────────────────────────────────────────────────────── */
  function go(target, dir) {
    target = Math.max(0, Math.min(slides.length - 1, target));
    if (target === index) { updateChrome(); return; }

    if (dir === undefined) dir = target > index ? 1 : -1;

    var cur = slides[index];
    var nxt = slides[target];

    // La entrante arranca siempre desde arriba (importante en modo texto grande).
    nxt.scrollTop = 0;
    // La entrante aparece desde el lado hacia el que vamos…
    nxt.style.setProperty('--enter', dir > 0 ? '60px' : '-60px');
    // …y forzamos un reflow para fijar esa posición inicial antes de animar.
    void nxt.offsetWidth;
    nxt.classList.add('is-active');

    // La saliente se va hacia el lado opuesto.
    cur.style.setProperty('--enter', dir > 0 ? '-60px' : '60px');
    cur.classList.remove('is-active');

    index = target;
    updateChrome();
  }

  function next() { go(index + 1, 1); }
  function prev() { go(index - 1, -1); }

  function updateChrome() {
    if (currentEl) currentEl.textContent = String(index + 1);
    if (totalEl) totalEl.textContent = String(slides.length);
    if (prevBtn) prevBtn.disabled = index <= 0;
    if (nextBtn) nextBtn.disabled = index >= slides.length - 1;
  }

  /* ── Botones ────────────────────────────────────────────────────────── */
  if (prevBtn) prevBtn.addEventListener('click', prev);
  if (nextBtn) nextBtn.addEventListener('click', next);

  /* ── Teclado (←/→, espacio, inicio/fin) ─────────────────────────────── */
  window.addEventListener('keydown', function (e) {
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
      case ' ':
      case 'Spacebar':
        e.preventDefault(); next(); break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault(); prev(); break;
      case 'Home':
        e.preventDefault(); go(0); break;
      case 'End':
        e.preventDefault(); go(slides.length - 1); break;
    }
  });

  /* ── Swipe táctil ───────────────────────────────────────────────────── */
  var sx = 0, sy = 0, tracking = false;
  var THRESHOLD = 45; // px mínimos del gesto horizontal

  stage.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) { tracking = false; return; }
    tracking = true;
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
  }, { passive: true });

  stage.addEventListener('touchend', function (e) {
    if (!tracking) return;
    tracking = false;
    var touch = e.changedTouches[0];
    var dx = touch.clientX - sx;
    var dy = touch.clientY - sy;
    // Solo si el gesto fue claramente horizontal.
    if (Math.abs(dx) > THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.4) {
      // No interferir si el dedo arrancó sobre un link (CTA de WhatsApp).
      if (e.target && e.target.closest && e.target.closest('a')) return;
      if (dx < 0) next(); else prev();
    }
  }, { passive: true });

  /* ── Tamaño de texto (Normal / Medio / Grande) ──────────────────────── */
  // Multiplica el tamaño de TODO el texto (incluye estilos inline) sobre su
  // valor original cacheado. En modos > 1 el body recibe la clase .fs-zoom,
  // que habilita el scroll vertical de la lámina (ver styles.css) para que el
  // texto más grande nunca se recorte.
  var FS_KEY = 'prima.fs';
  var fsBtns = Array.prototype.slice.call(document.querySelectorAll('.fs-btn'));
  var textEls = null;

  function ensureFontBase() {
    if (textEls) return;
    textEls = canvas.querySelectorAll('*');
    for (var i = 0; i < textEls.length; i++) {
      textEls[i].__baseFs = parseFloat(getComputedStyle(textEls[i]).fontSize) || 0;
    }
  }

  function applyFont(factor) {
    ensureFontBase();
    var reset = Math.abs(factor - 1) < 0.001;
    for (var i = 0; i < textEls.length; i++) {
      var b = textEls[i].__baseFs;
      if (!b) continue;
      textEls[i].style.fontSize = reset ? '' : (b * factor).toFixed(2) + 'px';
    }
    document.body.classList.toggle('fs-zoom', !reset);
    if (slides[index]) slides[index].scrollTop = 0;
  }

  function setFs(factor, persist) {
    fsBtns.forEach(function (b) {
      var on = Math.abs(parseFloat(b.getAttribute('data-fs')) - factor) < 0.001;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    applyFont(factor);
    if (persist) { try { localStorage.setItem(FS_KEY, String(factor)); } catch (e) {} }
  }

  fsBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      setFs(parseFloat(b.getAttribute('data-fs')), true);
    });
  });

  /* ── Bloqueo total de zoom (la pantalla queda fija al marco) ────────── */
  // iOS Safari ignora user-scalable=no, así que cancelamos a mano:
  //  · gesturestart/change/end → pellizco (pinch) de dos dedos.
  //  · touchmove con 2+ dedos  → pellizco en navegadores que no usan gesture*.
  //  · dblclick                → zoom por doble toque (apretar 2 veces un botón).
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (ev) {
    document.addEventListener(ev, function (e) { e.preventDefault(); }, { passive: false });
  });
  document.addEventListener('touchmove', function (e) {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });
  document.addEventListener('dblclick', function (e) { e.preventDefault(); }, { passive: false });

  /* ── Reescalado ante cambios de tamaño / orientación ────────────────── */
  // En móvil el alto del viewport (100dvh) y la barra de URL se resuelven
  // recién después del parse; un solo cálculo al inicio puede salir mal.
  // El ResizeObserver recalcula en cuanto el .stage tiene su tamaño real y
  // ante cualquier cambio posterior (rotación, barra de URL que aparece/
  // desaparece, teclado), que es lo que rompía la vista en el celular.
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
  window.addEventListener('load', fit);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', fit);
  if (window.ResizeObserver) {
    new ResizeObserver(fit).observe(stage);
  }
  requestAnimationFrame(fit);

  /* ── Arranque ───────────────────────────────────────────────────────── */
  // La primera lámina aparece sin animación de entrada.
  slides[0].style.transition = 'none';
  slides[0].classList.add('is-active');
  void slides[0].offsetWidth;
  slides[0].style.transition = '';

  // Tamaño de texto recordado (default: Normal).
  var savedFs = 1;
  try { var sv = localStorage.getItem(FS_KEY); if (sv) savedFs = parseFloat(sv) || 1; } catch (e) {}
  setFs(savedFs, false);

  fit();
  updateChrome();
})();
