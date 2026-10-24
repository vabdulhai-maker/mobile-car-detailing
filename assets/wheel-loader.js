(() => {
  // Keep the hero image and booking controls ahead of optional decorative 3D.
  const load = () => {
    if (navigator.connection?.saveData) return;
    const start = () => import('./wheel-scene.js').then(module => module.mountWheel()).catch(() => {
      document.querySelector('.wheel-backdrop')?.remove();
      document.documentElement.classList.remove('has-wheel');
    });
    if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 1800 });
    else setTimeout(start, 200);
  };
  if (document.readyState === 'complete') load();
  else window.addEventListener('load', load, { once: true });
})();
