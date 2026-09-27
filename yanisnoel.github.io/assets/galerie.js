/* Galerie chantier : carrousel à droite + visionneuse plein écran par stage */
(function () {
  var dataEl = document.getElementById('galerie-data');
  if (!dataEl) return;
  var DATA = JSON.parse(dataEl.textContent);
  var vcss = document.createElement('style');
  vcss.textContent = '.carousel .slide{position:relative;overflow:hidden}.carousel .slide img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}.carousel .play,.lb .vplay{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:64px;height:64px;border-radius:50%;background:rgba(0,0,0,.6);color:#fff;font-size:26px;display:grid;place-items:center;padding-left:5px;box-sizing:border-box;pointer-events:none}.lb video{max-width:100%;max-height:calc(100vh - 150px);border-radius:8px;background:#000}';
  document.head.appendChild(vcss);
  var TITLES = {
    maritimes: { fr: 'Les Maritimes, Vannes 2025', en: 'Les Maritimes, Vannes 2025' },
    synopsys: { fr: 'Synopsys, Nantes 2024', en: 'Synopsys, Nantes 2024' },
    chu: { fr: 'CHU de Nantes 2023', en: 'Nantes hospital 2023' }
  };
  function lang() { return document.body.getAttribute('data-lang') === 'en' ? 'en' : 'fr'; }
  function track(n) { try { var c = sessionStorage.getItem('camp'); if (c) n += '--' + c; if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: n, title: n, event: true }); } catch (e) {} }

  // ---------- carrousel ----------
  var car = document.getElementById('carousel');
  var tr = car.querySelector('.track');
  var cap = document.getElementById('gcap');
  var dots = document.getElementById('gdots');
  var cnt = car.querySelector('.count');
  var current = 'maritimes', idx = 0;

  function build(g) {
    current = g; idx = 0;
    tr.innerHTML = ''; dots.innerHTML = '';
    DATA[g].forEach(function (p, i) {
      var b = document.createElement('button');
      b.className = 'slide'; b.type = 'button';
      b.setAttribute('aria-label', p[lang()]);
      b.innerHTML = '<img src="' + p.thumb + '" alt="" loading="' + (i < 2 ? 'eager' : 'lazy') + '">' + (p.type === 'video' ? '<span class="play">&#9654;</span>' : '');
      b.addEventListener('click', function () { openLB(g, i); });
      tr.appendChild(b);
      var d = document.createElement('button');
      d.type = 'button'; d.setAttribute('aria-label', (i + 1) + '/' + DATA[g].length);
      d.addEventListener('click', function () { go(i); });
      dots.appendChild(d);
    });
    document.querySelectorAll('.gtabs button').forEach(function (t) { t.setAttribute('aria-pressed', String(t.dataset.g === g)); });
    tr.scrollLeft = 0; update();
  }
  function update() {
    var p = DATA[current][idx];
    cap.textContent = p[lang()];
    cnt.textContent = (idx + 1) + ' / ' + DATA[current].length;
    [].forEach.call(dots.children, function (d, i) { d.setAttribute('aria-current', String(i === idx)); });
  }
  function go(i) {
    var n = DATA[current].length; idx = (i + n) % n;
    tr.scrollTo({ left: idx * tr.clientWidth, behavior: 'smooth' }); update();
  }
  car.querySelector('.prev').addEventListener('click', function () { go(idx - 1); });
  car.querySelector('.next').addEventListener('click', function () { go(idx + 1); });
  var st;
  tr.addEventListener('scroll', function () {
    clearTimeout(st);
    st = setTimeout(function () { var i = Math.round(tr.scrollLeft / tr.clientWidth); if (i !== idx) { idx = i; update(); } }, 80);
  });
  document.querySelectorAll('.gtabs button').forEach(function (t) {
    t.addEventListener('click', function () { build(t.dataset.g); track('galerie-onglet-' + t.dataset.g); });
  });

  // ---------- visionneuse ----------
  var lb = document.getElementById('lightbox');
  var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('.cap');
  var lbVid = document.createElement('video');
  lbVid.muted = true; lbVid.loop = true; lbVid.playsInline = true; lbVid.controls = true; lbVid.setAttribute('playsinline', ''); lbVid.style.display = 'none';
  lbImg.parentNode.insertBefore(lbVid, lbCap);
  var lg = 'maritimes', li = 0;
  function showLB() {
    var p = DATA[lg][li];
    if (p.type === 'video') {
      lbImg.style.display = 'none'; lbVid.style.display = '';
      if (lbVid.getAttribute('src') !== p.src) { lbVid.setAttribute('poster', p.thumb); lbVid.src = p.src; }
      var pr = lbVid.play(); if (pr && pr.catch) pr.catch(function () {});
    } else {
      lbVid.pause(); lbVid.style.display = 'none'; lbImg.style.display = '';
      lbImg.src = p.src; lbImg.alt = p[lang()];
    }
    lbCap.innerHTML = p[lang()] + '<small>' + TITLES[lg][lang()] + ' · ' + (li + 1) + ' / ' + DATA[lg].length + '</small>';
    var nx = DATA[lg][(li + 1) % DATA[lg].length]; if (nx.type !== 'video') (new Image()).src = nx.src; // précharge la suivante
  }
  function openLB(g, i) {
    lg = g; li = i || 0; showLB();
    if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
    track('galerie-ouverture-' + g);
  }
  function step(d) { var n = DATA[lg].length; li = (li + d + n) % n; showLB(); }
  lb.querySelector('.lprev').addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
  lb.querySelector('.lnext').addEventListener('click', function (e) { e.stopPropagation(); step(1); });
  lb.querySelector('.close').addEventListener('click', function () { lb.close(); });
  lb.addEventListener('close', function () { lbVid.pause(); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('stage')) lb.close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.open) return;
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
  var tx = null;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (tx === null) return; var dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); tx = null;
  });

  // boutons « Voir les photos » sous chaque stage
  document.querySelectorAll('[data-open-gallery]').forEach(function (b) {
    var g = b.dataset.openGallery;
    b.querySelectorAll('.n').forEach(function (n) { n.textContent = DATA[g].length; });
    b.addEventListener('click', function () { build(g); openLB(g, 0); });
  });

  // changement de langue : met à jour les légendes
  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { setTimeout(function () { update(); if (lb.open) showLB(); }, 0); });
  });

  build('maritimes');
})();
