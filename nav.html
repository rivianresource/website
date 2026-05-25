// nav-init.js — include on every page after the site-nav div

// ─── Google Analytics 4 ───
(function() {
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-SB8DBC8NBQ';
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', 'G-SB8DBC8NBQ');
})();

// ─── Nav ───
fetch('/nav.html')
  .then(r => r.text())
  .then(html => {
    document.getElementById('site-nav').innerHTML = html;
    const path = window.location.pathname;
    document.querySelectorAll('.nav-links a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === '/' ? path === '/' : path.startsWith(href)) a.classList.add('active');
    });
    const btn     = document.getElementById('navHamburger');
    const links   = document.getElementById('navLinks');
    const menuIc  = document.getElementById('navIconMenu');
    const closeIc = document.getElementById('navIconClose');
    if (btn && links) {
      btn.addEventListener('click', () => {
        const isOpen = links.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen);
        menuIc.style.display  = isOpen ? 'none'  : 'block';
        closeIc.style.display = isOpen ? 'block' : 'none';
      });
      links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          links.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
          menuIc.style.display  = 'block';
          closeIc.style.display = 'none';
        });
      });
    }
  })
  .catch(() => {});
