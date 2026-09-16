// HERO site — mobile nav toggle, carousel, stat counters, scroll reveal, sticky header.
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.site-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function initCarousels() {
    document.querySelectorAll('[data-carousel]').forEach(function (root) {
      var track = root.querySelector('.carousel-track');
      var slides = Array.prototype.slice.call(root.querySelectorAll('.carousel-slide'));
      var dotsWrap = root.querySelector('.carousel-dots');
      var prevBtn = root.querySelector('[data-carousel-prev]');
      var nextBtn = root.querySelector('[data-carousel-next]');
      if (!track || slides.length === 0) return;

      var index = 0;
      var autoplayMs = parseInt(root.getAttribute('data-autoplay'), 10) || 4000;
      var timer = null;

      var dots = [];
      if (dotsWrap) {
        slides.forEach(function (_, i) {
          var dot = document.createElement('button');
          dot.type = 'button';
          dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
          dot.addEventListener('click', function () { goTo(i); });
          dotsWrap.appendChild(dot);
          dots.push(dot);
        });
      }

      function update() {
        track.scrollTo({ left: slides[index].offsetLeft, behavior: 'smooth' });
        dots.forEach(function (d, i) { d.classList.toggle('is-active', i === index); });
      }

      function goTo(i) {
        index = (i + slides.length) % slides.length;
        update();
        resetAutoplay();
      }

      function next() { goTo(index + 1); }
      function prev() { goTo(index - 1); }

      if (nextBtn) nextBtn.addEventListener('click', next);
      if (prevBtn) prevBtn.addEventListener('click', prev);

      function resetAutoplay() {
        if (timer) clearInterval(timer);
        timer = setInterval(next, autoplayMs);
      }

      root.addEventListener('mouseenter', function () { if (timer) clearInterval(timer); });
      root.addEventListener('mouseleave', resetAutoplay);

      update();
      resetAutoplay();
    });
  }

  function initHeaderScroll() {
    var root = document.documentElement;
    var ticking = false;

    function update() {
      root.classList.toggle('is-scrolled', window.scrollY > 40);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  function initStatCounters() {
    var counters = document.querySelectorAll('.stat-number[data-count-to]');
    if (counters.length === 0) return;

    function animate(el) {
      var target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';

      if (prefersReducedMotion) {
        el.textContent = target + suffix;
        return;
      }

      var duration = 1200;
      var start = null;

      function step(timestamp) {
        if (start === null) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach(function (el) { observer.observe(el); });
  }

  function initScrollReveal() {
    if (prefersReducedMotion) return;

    var targets = document.querySelectorAll(
      '.card, .bio-card, .person-card, .team-card, .callout, .split, .doc-tile, .section-head'
    );
    if (targets.length === 0) return;

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });

    targets.forEach(function (el) {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initCarousels();
    initHeaderScroll();
    initStatCounters();
    initScrollReveal();
  });
})();
