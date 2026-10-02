(function () {
  'use strict';
  /* Category > Folders > Pictures. Category keys must match admin/config.yml. */
  var CATEGORIES = [
    { key: 'residential', label: 'Residential', numeral: 'I' },
    { key: 'mixed-use', label: 'Mixed Use', numeral: 'II' },
    { key: 'public', label: 'Public Buildings', numeral: 'III' }
  ];
  var CAT_LABEL = {}; CATEGORIES.forEach(function (c) { CAT_LABEL[c.key] = c.label; });
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function slug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'folder'; }
  function paras(t) { return String(t || '').split(/\n\s*\n/).map(function (p) { return p.trim(); }).filter(Boolean); }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }

  var folders = [], current = null, imgIndex = 0, lastFocus = null;

  window.loadContent(['site', 'portfolio']).then(function (res) {
    applySite(res[0] || {});
    folders = normalise((res[1] && res[1].folders) || []);
    render();
    var m = location.hash.match(/folder=([^&]+)/);
    if (m) openFolder(decodeURIComponent(m[1]), false);
  });

  /* ---------- Personal details ---------- */
  function applySite(cfg) {
    $$('[data-config]').forEach(function (el) {
      var v = cfg[el.getAttribute('data-config')];
      if (v) { el.textContent = v; el.hidden = false; }
      else if (el.getAttribute('data-config') in cfg) el.hidden = true;
    });
    if (cfg.name) document.title = cfg.name + ' — Architectural Portfolio';
    if (cfg.email) { var e = $('#c-email'); e.href = 'mailto:' + cfg.email; e.textContent = cfg.email; }
    if (cfg.phone) { var p = $('#c-phone'); p.href = 'tel:' + cfg.phone.replace(/[^\d+]/g, ''); p.textContent = cfg.phone; }
    $('#c-loc-block').hidden = !cfg.location;
    $('#bio').innerHTML = paras(cfg.bio).map(function (t, i) { return '<p' + (i === 0 ? ' class="lead"' : '') + '>' + esc(t) + '</p>'; }).join('');
    $('#year').textContent = new Date().getFullYear();
  }

  /* ---------- Data ---------- */
  function normalise(list) {
    var used = {};
    return list.map(function (f, i) {
      var id = slug(f.name); while (used[id]) id += '-' + i; used[id] = true;
      return {
        id: id, name: f.name || 'Untitled folder', category: CAT_LABEL[f.category] ? f.category : 'residential',
        location: (f.location || '').trim(), description: (f.description || '').trim(),
        order: (typeof f.order === 'number' && !isNaN(f.order)) ? f.order : null, index: i,
        images: (f.images || []).filter(function (im) { return im && im.image; }).map(function (im) {
          return { src: window.assetUrl(im.image), full: window.assetUrl(im.full || im.image), caption: (im.caption || '').trim() };
        })
      };
    }).sort(function (a, b) {
      var ao = a.order == null ? Infinity : a.order, bo = b.order == null ? Infinity : b.order;
      return ao - bo || a.index - b.index;
    });
  }
  function inCat(key) { return folders.filter(function (f) { return f.category === key; }); }

  /* ---------- Render categories and folders ---------- */
  function render() {
    var box = $('#categories'), n = 0;
    box.innerHTML = CATEGORIES.map(function (c) {
      var list = inCat(c.key);
      var body = list.length ? '<ul class="grid">' + list.map(function (f) { return card(f, n++); }).join('') + '</ul>'
        : '<div class="soon"><span class="soon__mark" aria-hidden="true"></span><p class="soon__title">Projects coming soon</p>' +
          '<p class="soon__text">New ' + esc(c.label.toLowerCase()) + ' work is being prepared for this collection.</p></div>';
      return '<section class="cat" data-cat="' + c.key + '" aria-labelledby="cat-' + c.key + '">' +
        '<header class="cat__head"><span class="cat__num">' + c.numeral + '</span>' +
        '<h2 class="cat__title" id="cat-' + c.key + '">' + esc(c.label) + '</h2>' +
        '<span class="cat__count">' + (list.length ? plural(list.length, 'project') : 'Coming soon') + '</span></header>' +
        body + '</section>';
    }).join('');
    $$('[data-count]').forEach(function (el) {
      var k = el.getAttribute('data-count');
      el.textContent = k === 'all' ? folders.length : inCat(k).length;
    });
    observe();
  }
  function card(f, i) {
    var cover = f.images[0];
    var media = cover ? '<img src="' + esc(cover.src) + '" alt="' + esc(cover.caption || f.name) + '" loading="lazy">'
      : '<span class="card__empty">No pictures yet</span>';
    var meta = [CAT_LABEL[f.category], f.location].filter(Boolean).map(esc).join(' · ');
    return '<li class="card" style="--i:' + i + '">' +
      '<button class="card__btn" data-id="' + esc(f.id) + '" aria-label="Open folder: ' + esc(f.name) + '">' +
        '<span class="card__media">' + media +
          (f.images.length ? '<span class="card__count">' + plural(f.images.length, 'picture') + '</span>' : '') +
          '<span class="card__view">Open folder</span></span>' +
        '<span class="card__body">' +
          '<span class="card__cat">' + meta + '</span>' +
          '<span class="card__title">' + esc(f.name) + '</span>' +
          (f.description ? '<span class="card__line">' + esc(f.description) + '</span>' : '') +
        '</span>' +
      '</button></li>';
  }
  function observe() {
    var els = $$('.card, .cat__head, .soon');
    if (!('IntersectionObserver' in window)) { els.forEach(function (c) { c.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (c) { io.observe(c); });
  }

  /* ---------- Filters ---------- */
  var box = $('#categories');
  function applyFilter(f) {
    $$('.filter').forEach(function (b) {
      var on = b.getAttribute('data-filter') === f;
      b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on);
    });
    var work = $('#work'), top = work.offsetTop - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--topbar-h'), 10);
    if (window.scrollY > top + 5) window.scrollTo({ top: work.offsetTop, behavior: 'smooth' });
    box.classList.add('is-switching');
    setTimeout(function () {
      $$('.cat', box).forEach(function (s) { s.hidden = !(f === 'all' || s.getAttribute('data-cat') === f); });
      box.classList.toggle('is-single', f !== 'all');
      box.classList.remove('is-switching');
    }, 220);
  }
  $$('.filter').forEach(function (b) { b.addEventListener('click', function () { applyFilter(b.getAttribute('data-filter')); }); });

  /* ---------- Folder detail (lightbox) ---------- */
  var lb = $('#lightbox'), lbImg = $('#lb-img'), stage = $('#lb-stage');
  function visibleFolders() {
    var ids = $$('.cat:not([hidden]) .card__btn', box).map(function (b) { return b.getAttribute('data-id'); });
    return folders.filter(function (f) { return ids.indexOf(f.id) > -1; });
  }
  function setZoom(on) {
    stage.classList.toggle('is-zoomed', on);
    $('#lb-zoom').setAttribute('aria-pressed', on); $('#lb-zoom').textContent = on ? 'Fit' : 'Zoom';
    var im = current && current.images[imgIndex];
    function centre() { stage.scrollTop = (lbImg.offsetHeight - stage.clientHeight) / 2; stage.scrollLeft = (lbImg.offsetWidth - stage.clientWidth) / 2; }
    if (on && im && lbImg.getAttribute('src') !== im.full) { lbImg.onload = function () { lbImg.onload = null; centre(); }; lbImg.src = im.full; }
    else if (on) centre();
    if (!on) { stage.scrollTop = 0; stage.scrollLeft = 0; }
  }
  function showImage(i) {
    var imgs = current.images;
    if (!imgs.length) { lbImg.removeAttribute('src'); lbImg.alt = ''; $('#lb-caption').textContent = 'No pictures in this folder yet.'; $('#lb-counter').textContent = ''; $('.lb-tools').hidden = true; $('#lb-prev').hidden = $('#lb-next').hidden = true; return; }
    imgIndex = (i + imgs.length) % imgs.length;
    var im = imgs[imgIndex];
    setZoom(false);
    lbImg.classList.add('is-fading');
    var pre = new Image();
    pre.onload = pre.onerror = function () { lbImg.src = im.src; lbImg.alt = im.caption || current.name; lbImg.classList.remove('is-fading'); };
    pre.src = im.src;
    $('#lb-caption').textContent = im.caption;
    $('#lb-counter').textContent = imgs.length > 1 ? (imgIndex + 1) + ' / ' + imgs.length : '';
    $('#lb-full').href = im.full;
    $('.lb-tools').hidden = false;
    $$('.lb-thumb').forEach(function (t, k) { t.classList.toggle('is-active', k === imgIndex); t.setAttribute('aria-current', k === imgIndex); });
    $$('#lb-list li').forEach(function (t, k) { t.classList.toggle('is-active', k === imgIndex); });
    $('#lb-prev').hidden = $('#lb-next').hidden = imgs.length < 2;
  }
  function openFolder(id, push) {
    var f = folders.filter(function (x) { return x.id === id; })[0];
    if (!f) return;
    current = f;
    $('#lb-cat').textContent = CAT_LABEL[f.category];
    $('#lb-title').textContent = f.name;
    var meta = [['Location', f.location]].filter(function (m) { return m[1]; });
    $('#lb-meta').innerHTML = meta.map(function (m) { return '<div><dt>' + m[0] + '</dt><dd>' + esc(m[1]) + '</dd></div>'; }).join('');
    $('#lb-meta').hidden = !meta.length;
    $('.lb-list-label').textContent = f.images.length ? plural(f.images.length, 'picture') + ' in this folder' : 'No pictures yet';
    $('#lb-desc').innerHTML = paras(f.description).map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('');
    $('#lb-thumbs').innerHTML = f.images.map(function (im, k) {
      return '<button class="lb-thumb" role="listitem" data-k="' + k + '" aria-label="Show ' + esc(im.caption || 'picture ' + (k + 1)) + '"><img src="' + esc(im.src) + '" alt=""></button>';
    }).join('');
    $('#lb-thumbs').hidden = f.images.length < 2;
    $('#lb-list').innerHTML = f.images.map(function (im, k) {
      return '<li><button data-k="' + k + '"><span class="lb-list__n">' + String(k + 1).padStart(2, '0') + '</span>' + esc(im.caption || 'Picture ' + (k + 1)) + '</button></li>';
    }).join('');
    $$('.lb-thumb, #lb-list button').forEach(function (t) { t.addEventListener('click', function () { showImage(+t.getAttribute('data-k')); }); });
    $('#lb-prevproj').hidden = $('#lb-nextproj').hidden = visibleFolders().length < 2;
    $('.lb-projnav').hidden = visibleFolders().length < 2;
    if (lb.hidden) {
      lastFocus = document.activeElement;
      lb.hidden = false;
      document.documentElement.classList.add('no-scroll');
      requestAnimationFrame(function () { lb.classList.add('is-open'); });
      setTimeout(function () { $('.lb-close').focus(); }, 50);
    }
    $('.lb-info').scrollTop = 0;
    showImage(0);
    if (push !== false) history.replaceState(null, '', '#folder=' + encodeURIComponent(id));
  }
  function closeFolder() {
    lb.classList.remove('is-open');
    document.documentElement.classList.remove('no-scroll');
    setTimeout(function () { lb.hidden = true; setZoom(false); }, 350);
    history.replaceState(null, '', location.pathname + location.search);
    if (lastFocus) lastFocus.focus();
  }
  function stepFolder(dir) {
    var vis = visibleFolders(), k = vis.indexOf(current);
    if (vis.length) openFolder(vis[(k + dir + vis.length) % vis.length].id);
  }
  box.addEventListener('click', function (e) { var b = e.target.closest('.card__btn'); if (b) openFolder(b.getAttribute('data-id')); });
  $$('[data-close]', lb).forEach(function (el) { el.addEventListener('click', closeFolder); });
  $('#lb-prev').addEventListener('click', function () { showImage(imgIndex - 1); });
  $('#lb-next').addEventListener('click', function () { showImage(imgIndex + 1); });
  $('#lb-prevproj').addEventListener('click', function () { stepFolder(-1); });
  $('#lb-nextproj').addEventListener('click', function () { stepFolder(1); });
  $('#lb-zoom').addEventListener('click', function () { setZoom(!stage.classList.contains('is-zoomed')); });
  lbImg.addEventListener('click', function () { setZoom(!stage.classList.contains('is-zoomed')); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') { if (stage.classList.contains('is-zoomed')) setZoom(false); else closeFolder(); }
    else if (e.key === 'ArrowRight') showImage(imgIndex + 1);
    else if (e.key === 'ArrowLeft') showImage(imgIndex - 1);
    else if (e.key === 'Tab') {
      var f = $$('button, a[href]', lb).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  var sx = null;
  stage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (sx == null || stage.classList.contains('is-zoomed')) return;
    var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) showImage(imgIndex + (dx < 0 ? 1 : -1)); sx = null;
  });

  var tb = $('.topbar');
  window.addEventListener('scroll', function () { tb.classList.toggle('is-scrolled', window.scrollY > 10); }, { passive: true });
})();
