(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.header');
  const reveals = [...document.querySelectorAll([
    '.benefit-strip > div', '.section-heading > *', '.service-card',
    '.process-layout > div', '.process-list li', '.vehicle-toggle', '.package-card',
    '.pricing-note', '.comparison', '.gallery-caption', '.gallery-grid figure',
    '.reviews-section > *', '.areas-layout > *', '.faq-section > div:first-child',
    '.faq-list details', '.contact-layout > *', '.footer > *'
  ].join(','))];
  const parallax = [...document.querySelectorAll('.hero-image, .service-card .service-photo img')];
  const activeParallax = new Set();
  let revealObserver;
  let parallaxObserver;
  let frame = 0;

  // Batch geometry reads before style writes, and only run on scroll/resize.
  function renderScroll() {
    frame = 0;
    const viewport = window.innerHeight;
    const scroll = window.scrollY;
    const distance = document.documentElement.scrollHeight - viewport;
    const progress = distance > 0 ? Math.min(1, Math.max(0, scroll / distance)) : 0;
    const positions = [...activeParallax].map(element => {
      const region = element.closest('.hero, .service-photo').getBoundingClientRect();
      const travel = element.classList.contains('hero-image') ? (viewport < 700 ? 12 : 22) : 7;
      const position = Math.max(-1, Math.min(1, (viewport / 2 - region.top - region.height / 2) / (viewport / 2 + region.height / 2)));
      return [element, position * travel];
    });
    header.style.setProperty('--page-progress', progress.toFixed(4));
    header.classList.toggle('is-scrolled', scroll > 24);
    positions.forEach(([element, offset]) => element.style.setProperty('--parallax-y', `${offset.toFixed(2)}px`));
  }
  function queueScroll() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(renderScroll);
  }
  function show(element) { element.classList.add('is-visible'); }

  function setupMotion() {
    revealObserver?.disconnect();
    parallaxObserver?.disconnect();
    activeParallax.clear();
    document.documentElement.classList.remove('motion-ready');
    reveals.forEach(element => {
      element.classList.remove('motion-reveal', 'is-visible');
      element.style.removeProperty('--reveal-delay');
    });
    parallax.forEach(element => {
      element.classList.remove('motion-parallax');
      element.style.removeProperty('--parallax-y');
    });
    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      queueScroll();
      return;
    }
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) show(entry.target);
        // Re-enter gracefully when scrolling back down; never hide content above.
        else if (entry.boundingClientRect.top > window.innerHeight) entry.target.classList.remove('is-visible');
      });
    }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
    reveals.forEach(element => {
      const siblings = [...element.parentElement.children].filter(child => reveals.includes(child));
      element.style.setProperty('--reveal-delay', `${Math.min(siblings.indexOf(element), 3) * 75}ms`);
      element.classList.add('motion-reveal');
      // Preserve above-fold and hash-linked content during initial load.
      if (element.getBoundingClientRect().top < window.innerHeight - 24) show(element);
      revealObserver.observe(element);
    });
    parallaxObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) activeParallax.add(entry.target);
        else activeParallax.delete(entry.target);
      });
      queueScroll();
    });
    parallax.forEach(element => {
      element.classList.add('motion-parallax');
      parallaxObserver.observe(element);
    });
    document.documentElement.classList.add('motion-ready');
    queueScroll();
  }
  // Keyboard navigation must reveal its destination immediately.
  document.addEventListener('focusin', event => {
    const target = event.target.closest('.motion-reveal');
    if (target) { target.style.setProperty('--reveal-delay', '0ms'); show(target); }
  });
  window.addEventListener('scroll', queueScroll, { passive: true });
  window.addEventListener('resize', queueScroll, { passive: true });
  window.addEventListener('pageshow', queueScroll);
  document.addEventListener('visibilitychange', queueScroll);
  // Expanded galleries, FAQs and forms change the page's total scroll distance.
  if ('ResizeObserver' in window) new ResizeObserver(queueScroll).observe(document.body);
  reducedMotion.addEventListener('change', setupMotion);
  setupMotion();
})();
