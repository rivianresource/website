/* ── shared.js — site-wide utilities ── */

function stripCopyCode() {
  if (typeof gtag === 'function') gtag('event', 'copy_referral_code');
  navigator.clipboard.writeText('SCOTT4395475').then(() => {
    const el = document.getElementById('stripCopied');
    if (el) el.style.display = 'inline';
    setTimeout(() => {
      window.open('https://rivian.com/configurations/list?reprCode=SCOTT4395475', '_blank');
      setTimeout(() => { if (el) el.style.display = 'none'; }, 3000);
    }, 600);
  }).catch(() => {
    window.open('https://rivian.com/configurations/list?reprCode=SCOTT4395475', '_blank');
  });
}

/* Image / right-click protection — does NOT block Ctrl+C */
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('dragstart', e => { if (e.target.tagName === 'IMG') e.preventDefault(); });
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && ['u', 's', 'x'].includes(e.key.toLowerCase())) e.preventDefault();
});
