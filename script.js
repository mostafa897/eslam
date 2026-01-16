// Cinematic interactions + performance-friendly animations
document.addEventListener('DOMContentLoaded', () => {
  // ---- Navbar style on scroll
  const nav = document.querySelector('.nav-shell');
  const onNav = () => {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  onNav();
  window.addEventListener('scroll', onNav, { passive: true });

  // ---- Mobile menu
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const setMenu = (open) => {
    if (!menuBtn || !mobileMenu) return;
    mobileMenu.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const open = !mobileMenu.classList.contains('open');
      setMenu(open);
    });
    mobileMenu.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (a) setMenu(false);
    });
  }

  // ---- Reveal on scroll (stagger)
  const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReduced && revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = Number(el.getAttribute('data-delay') || '0');
        setTimeout(() => el.classList.add('is-visible'), delay);
        revealObserver.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // ---- Parallax hero (requestAnimationFrame)
  const heroImgs = Array.from(document.querySelectorAll('.hero-bg'));
  let ticking = false;

  const updateParallax = () => {
    ticking = false;
    if (prefersReduced || heroImgs.length === 0) return;
    const y = window.scrollY || 0;
    const offset = Math.max(-40, Math.min(40, y * -0.08));
    document.documentElement.style.setProperty('--parallax', `${offset}px`);
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateParallax);
    }
  }, { passive: true });
  updateParallax();

  // ---- Pause/Play work videos based on viewport (performance)
  const workVideos = Array.from(document.querySelectorAll('.work-video'));
  if (workVideos.length && !prefersReduced) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const v = entry.target;
        if (entry.isIntersecting) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.55 });

    workVideos.forEach((v) => videoObserver.observe(v));
  }

  // ---- Video modal
  const modal = document.getElementById('videoModal');
  const modalVideo = document.getElementById('modalVideo');

  const openModal = (src) => {
    if (!modal || !modalVideo) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modalVideo.src = src;
    modalVideo.currentTime = 0;
    modalVideo.play().catch(() => {});
  };

  const closeModal = () => {
    if (!modal || !modalVideo) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    modalVideo.pause();
    modalVideo.removeAttribute('src');
    modalVideo.load();
  };

  document.querySelectorAll('.work-card[data-video]').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.getAttribute('data-video')));
  });

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) closeModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      closeModal();
    }
  });
});
