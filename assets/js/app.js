/* Woetroe BV - interactie
   1. mobiel menu
   2. discipline-schakelaar in de hero (kruisfade + tabtoetsen)
   3. reveal bij scrollen
   Alles degradeert netjes: zonder JS blijft de pagina volledig leesbaar en is
   het eerste hero-beeld zichtbaar.                                           */

(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------- mobiel menu -- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('hoofdmenu');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!open));
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Menu openen' : 'Menu sluiten');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.setAttribute('data-open', 'false');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* --------------------------------------------- discipline-schakelaar -- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.disc__btn'));
  var shots = Array.prototype.slice.call(document.querySelectorAll('.hero__shot'));

  var swap = document.querySelector('[data-swap]');

  function select(tab) {
    tabs.forEach(function (t) {
      t.setAttribute('aria-pressed', String(t === tab));
    });
    shots.forEach(function (s) {
      s.setAttribute('data-active', String(s.dataset.shot === tab.dataset.shot));
    });
    /* Het laatste woord van de kop volgt de keuze. Daarmee doet de schakelaar
       iets aan de belofte zelf en is hij geen bladvulling. */
    if (swap && tab.dataset.woord && swap.textContent !== tab.dataset.woord) {
      swap.setAttribute('data-uit', 'true');
      window.setTimeout(function () {
        swap.textContent = tab.dataset.woord;
        swap.removeAttribute('data-uit');
      }, reduce ? 0 : 200);
    }
  }

  if (tabs.length && shots.length) {
    /* Gewone knoppen: elk apart bereikbaar met Tab. De pijltjestoetsen blijven
       werken als snelkoppeling, maar zijn niet meer de enige weg. */
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab); stop(); });
      tab.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var next = tabs[(i + d + tabs.length) % tabs.length];
        next.focus();
        select(next);
        stop();
      });
    });

    /* rustige automatische wisseling tot de bezoeker zelf kiest */
    var timer = null;
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    if (!reduce) {
      timer = setInterval(function () {
        var cur = tabs.findIndex(function (t) { return t.getAttribute("aria-pressed") === 'true'; });
        select(tabs[(cur + 1) % tabs.length]);
      }, 7000);
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) stop();
      });
    }
  }

  /* ----------------------------------------------------- hero-opkomst -- */
  var hero = document.querySelector('.hero');
  if (hero) {
    requestAnimationFrame(function () { hero.classList.add('is-in'); });
  }

  /* --------------------------------------------------- formulier-notitie
     Er is nog geen verzendadres ingesteld. Tot dat er is, wordt de aanvraag
     omgezet naar een voorbereide e-mail zodat er geen bericht verdwijnt.   */
  var form = document.querySelector('form[action="#"]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var d = new FormData(form);
      var body = [
        'Naam: ' + (d.get('naam') || ''),
        'E-mail: ' + (d.get('email') || ''),
        'Telefoon: ' + (d.get('telefoon') || ''),
        'Soort machine: ' + (d.get('soort') || ''),
        'Merk, type, bouwjaar: ' + (d.get('machine') || ''),
        '',
        (d.get('vraag') || '')
      ].join('\n');
      window.location.href = 'mailto:info@woetroe.nl'
        + '?subject=' + encodeURIComponent('Aanvraag via woetroe.nl')
        + '&body=' + encodeURIComponent(body);
    });
  }
})();
