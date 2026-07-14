/* ISOLARIO — vanilla behaviour port of the DC prototype.
   All motion is transform/opacity-only; every path honours reduced motion. */
(function () {
  'use strict';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* Reveal-on-enter once; CSS carries the transition/final state. */
  function revealOnce(els, cls, threshold) {
    if (!els.length) return;
    if (reduced || !hasIO) { els.forEach(function (el) { el.classList.add(cls); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add(cls); io.unobserve(e.target); }
      });
    }, { threshold: threshold });
    els.forEach(function (el) { io.observe(el); });
  }
  var $ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  revealOnce($('[data-legend-line]'), 'is-in', 0.4);          // Legend: staggered fade (delays in CSS)
  revealOnce($('.spec-line'), 'is-in', 0.6);                  // Instrument spec line tracks in
  revealOnce($('[data-day-img]'), 'is-settled', 0.35);        // A Day: images settle 1.02 -> 1.00

  // Compass rose: draw hairlines when the section enters view
  var compass = document.querySelector('.compass');
  if (compass) {
    if (reduced || !hasIO) { compass.classList.add('is-drawn'); }
    else {
      var io2 = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { compass.classList.add('is-drawn'); io2.disconnect(); } });
      }, { threshold: 0.3 });
      io2.observe(compass);
    }
  }

  /* Videos: force muted + play; seamless-loop crossfade shim for the two
     data-xfade clips (hero loops natively). Under reduced motion: no video. */
  if (reduced) {
    $('[data-iso-video]').forEach(function (v) { if (v.parentNode) v.parentNode.removeChild(v); });
  } else {
    var setupXfade = function (v) {
      if (v._xfadeDone) return;
      v._xfadeDone = true;
      v.loop = false;
      var base = getComputedStyle(v).opacity || '1';
      var b = v.cloneNode(false);
      b.removeAttribute('data-iso-video'); b.removeAttribute('data-xfade');
      b.muted = true; b.loop = false; b.autoplay = false;
      b.style.opacity = '0'; b.style.transition = 'opacity 500ms linear';
      v.style.transition = 'opacity 500ms linear';
      v.parentNode.insertBefore(b, v.nextSibling);
      var active = v, standby = b, swapping = false;
      var swap = function () {
        if (swapping) return;
        swapping = true;
        standby.currentTime = 0; standby.muted = true; standby.play().catch(function () {});
        standby.style.opacity = base; active.style.opacity = '0';
        setTimeout(function () { active.pause(); var t = active; active = standby; standby = t; swapping = false; }, 550);
      };
      var onTime = function (e) {
        if (e.target !== active) return;
        var d = active.duration;
        if (d && active.currentTime >= d - 0.6) swap();
      };
      v.addEventListener('timeupdate', onTime); b.addEventListener('timeupdate', onTime);
      v.addEventListener('ended', function () { if (v === active) swap(); });
      b.addEventListener('ended', function () { if (b === active) swap(); });
    };
    var kick = function () {
      $('[data-iso-video]').forEach(function (v) {
        v.muted = true;
        if (v.hasAttribute('data-xfade')) {
          if (!v._xfadeDone && v.paused) v.play().catch(function () {});
          setupXfade(v);
        } else if (v.paused) { v.play().catch(function () {}); }
      });
    };
    var timer = setInterval(function () {
      var vids = $('[data-iso-video]');
      kick();
      if (vids.length && vids.every(function (v) { return v._xfadeDone || !v.paused; })) clearInterval(timer);
    }, 700);
    kick();
  }

  /* Nav: appears after the hero; theme flips light over ivory sections. */
  var nav = document.getElementById('iso-nav');
  var hero = document.querySelector('.hero');
  if (nav && hero) {
    var lightSections = $('[data-nav-theme="light"]');
    var navScroll = function () {
      var past = window.scrollY > hero.offsetHeight - 60;
      nav.classList.toggle('is-visible', past);
      if (!past) return;
      var light = lightSections.some(function (s) {
        var r = s.getBoundingClientRect();
        return r.top <= 40 && r.bottom >= 40;
      });
      nav.classList.toggle('is-light', light);
    };
    window.addEventListener('scroll', navScroll, { passive: true });
    navScroll();
  }

  /* Terrains: one caption visible at a time, advancing with scroll progress. */
  var track = document.querySelector('.terrains-track');
  var captions = $('[data-terrain-caption]');
  if (track && captions.length) {
    var terrainScroll = function () {
      if (!track.offsetParent) return;              // hidden on mobile/RM
      var r = track.getBoundingClientRect();
      var total = r.height - window.innerHeight;
      var p = Math.min(0.999, Math.max(0, -r.top / total));
      var active = Math.floor(p * 4);
      captions.forEach(function (el) {
        el.classList.toggle('is-active', +el.getAttribute('data-terrain-caption') === active);
      });
    };
    window.addEventListener('scroll', terrainScroll, { passive: true });
    terrainScroll();
  }

  /* Instrument: slow 20px parallax rise on the macro stills (transform only). */
  var figs = $('[data-parallax]');
  if (!reduced && figs.length) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var vh = window.innerHeight;
      figs.forEach(function (f) {
        var r = f.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var p = Math.min(1, Math.max(0, 1 - (r.top + r.height / 2) / vh));
        var i = +f.getAttribute('data-parallax');
        var depth = 20 - i * 4;
        f.style.transform = 'translateY(' + ((0.5 - p) * 2 * depth).toFixed(1) + 'px)';
      });
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* Eased anchor scroll (native smooth is fine, but keep reduced = instant). */
  var goTo = function (target) {
    if (reduced) { window.scrollTo(0, target); return; }
    var start = window.scrollY, dist = target - start;
    var dur = Math.min(1200, Math.max(400, Math.abs(dist) * 0.25));
    var t0 = performance.now();
    var ease = function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
    var step = function (now) {
      var p = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, start + dist * ease(p));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  $('[data-scroll]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      if (a.getAttribute('data-scroll') === 'top') return goTo(0);
      var el = document.querySelector(a.getAttribute('href'));
      if (el) goTo(el.getBoundingClientRect().top + window.scrollY);
    });
  });

  /* Private Viewing: closed -> open (inline field) -> sent. No modal, no backend. */
  var openLink = document.getElementById('pv-open');
  var form = document.getElementById('pv-form');
  var received = document.getElementById('pv-received');
  if (openLink && form && received) {
    openLink.addEventListener('click', function (e) {
      e.preventDefault();
      openLink.hidden = true;
      form.hidden = false;
      var input = document.getElementById('iso-viewing-email');
      if (input) input.focus();
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.hidden = true;
      received.hidden = false;
    });
  }
})();
