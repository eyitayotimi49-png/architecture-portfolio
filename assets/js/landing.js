(function () {
  window.loadContent(['site']).then(function (res) {
    var cfg = res[0] || {};
    document.querySelectorAll('[data-config]').forEach(function (el) {
      var v = cfg[el.getAttribute('data-config')];
      if (v) el.textContent = v;
    });
    if (cfg.name) document.title = 'Welcome — ' + cfg.name + ' · Architectural Portfolio';
  });

  // Elegant fade-out before moving to the portfolio.
  var enter = document.getElementById('enter');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  enter.addEventListener('click', function (e) {
    if (reduce || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    document.body.classList.add('is-leaving');
    setTimeout(function () { window.location.href = enter.href; }, 650);
  });
  window.addEventListener('pageshow', function () { document.body.classList.remove('is-leaving'); });
})();
