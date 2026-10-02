/* Loads the editable content files (content/site.json and content/portfolio.json).
   Both are edited through the /admin editor (Decap CMS) or by hand. */
window.loadContent = function (files) {
  return Promise.all(files.map(function (f) {
    return fetch('content/' + f + '.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(f + ': ' + r.status); return r.json(); })
      .catch(function (e) { console.warn('Could not load content/' + f + '.json', e); return null; });
  }));
};
/* "/assets/img/uploads/x.jpg" → "assets/img/uploads/x.jpg" so the site also works from a sub-folder (e.g. GitHub Pages). */
window.assetUrl = function (src) {
  if (!src) return '';
  return /^(https?:)?\/\//.test(src) ? src : String(src).replace(/^\/+/, '');
};
