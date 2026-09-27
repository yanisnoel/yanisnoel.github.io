(function () {
  var body = document.body;

  // ---------- langue ----------
  var btns = document.querySelectorAll('.lang button');
  function setLang(l) {
    body.setAttribute('data-lang', l);
    document.documentElement.lang = l;
    btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.set === l)); });
    try { localStorage.setItem('lang', l); } catch (e) {}
    document.querySelectorAll('a[data-keeplang]').forEach(function (a) {
      var u = a.getAttribute('href').split('?')[0].split('#');
      a.setAttribute('href', u[0] + (l === 'en' ? '?lang=en' : '') + (u[1] ? '#' + u[1] : ''));
    });
  }
  var params = new URLSearchParams(location.search);
  var q = params.get('lang'), saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  var nav = (navigator.language || 'fr').slice(0, 2);
  setLang(q === 'en' || q === 'fr' ? q : (saved || (nav === 'fr' ? 'fr' : 'en')));
  btns.forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.set); }); });

  // ---------- suivi de campagne (GoatCounter, sans cookies) ----------
  // ?c=ademe dans le lien envoyé -> mémorisé pour la visite, ajouté aux événements
  var camp = (params.get('c') || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40);
  try {
    if (camp) sessionStorage.setItem('camp', camp); else camp = sessionStorage.getItem('camp') || '';
  } catch (e) {}
  function track(name) {
    try {
      if (window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path: name + (camp ? '--' + camp : ''), title: name, event: true });
      }
    } catch (e) {}
  }

  // ---------- fenêtre contact ----------
  var dlg = document.getElementById('contact-dlg');
  document.querySelectorAll('[data-open-contact]').forEach(function (b) {
    b.addEventListener('click', function (ev) {
      ev.preventDefault();
      if (dlg && dlg.showModal) { dlg.showModal(); track('ouverture-contact'); }
      else { location.href = 'mailto:yanis.noel.etu@gmail.com'; }
    });
  });
  if (dlg) {
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    var x = dlg.querySelector('.x'); if (x) x.addEventListener('click', function () { dlg.close(); });
  }
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      var txt = b.dataset.copy, old = b.innerHTML;
      function done() { b.textContent = body.dataset.lang === 'en' ? 'Copied ✓' : 'Copié ✓'; setTimeout(function () { b.innerHTML = old; }, 1800); }
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, done); else done();
      track('copie-email');
    });
  });
  document.querySelectorAll('[data-track]').forEach(function (a) {
    a.addEventListener('click', function () { track(a.dataset.track); });
  });

  // ---------- filtres projets ----------
  var fb = document.querySelectorAll('.filters button');
  fb.forEach(function (b) {
    b.addEventListener('click', function () {
      fb.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', 'true');
      var f = b.dataset.filter;
      document.querySelectorAll('[data-cat]').forEach(function (c) {
        c.style.display = (f === 'all' || c.dataset.cat.split(' ').indexOf(f) > -1) ? '' : 'none';
      });
    });
  });
})();
