/* ============================================================
   IZINAJADULU — Main JavaScript
   Version: 2.0
   ============================================================ */

'use strict';

/* ============================================================
   LOADER
   ============================================================ */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (!loader) return;
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
  }, 2000);
});

// Block scroll during load
document.body.style.overflow = 'hidden';

/* ============================================================
   SCROLL PROGRESS BAR
   ============================================================ */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${Math.min(progress, 100)}%`;
  }, { passive: true });
}

/* ============================================================
   NAVBAR
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // Scroll behavior
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    if (current > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = current;
  }, { passive: true });

  // Hamburger
  const hamburger = navbar.querySelector('.nav-hamburger');
  const mobileMenu = navbar.querySelector('.nav-mobile');
  const mobileLayananToggle = navbar.querySelector('.mobile-layanan-toggle');
  const mobileLayananSub = navbar.querySelector('.mobile-layanan-sub');

  function setMenuState(open) {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.toggle('open', open);
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (window.innerWidth <= 900) {
      document.body.style.overflow = open ? 'hidden' : '';
    }
  }

  if (hamburger && mobileMenu) {
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.addEventListener('click', () => {
      const willOpen = !mobileMenu.classList.contains('open');
      setMenuState(willOpen);
    });

    document.addEventListener('click', (e) => {
      if (!mobileMenu.classList.contains('open')) return;
      if (!navbar.contains(e.target)) {
        setMenuState(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setMenuState(false);
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) {
        setMenuState(false);
      }
    });
  }

  // Mobile sub-menu toggles
  if (mobileLayananToggle && mobileLayananSub) {
    mobileLayananToggle.setAttribute('aria-expanded', 'false');
    mobileLayananSub.style.display = 'none';
    mobileLayananToggle.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = mobileLayananSub.style.display === 'flex';
      mobileLayananSub.style.display = isOpen ? 'none' : 'flex';
      mobileLayananToggle.classList.toggle('open', !isOpen);
      mobileLayananToggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });
  }

  // Active link highlighting
  const sections = document.querySelectorAll('section[id]');
  const navLinks = navbar.querySelectorAll('.nav-link[data-section]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.dataset.section === entry.target.id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => observer.observe(s));

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = navbar.offsetHeight + 16;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });

        // Close mobile menu if open
        if (hamburger && mobileMenu) {
          setMenuState(false);
        }
      }
    });
  });
}

/* ============================================================
   REVEAL ON SCROLL
   ============================================================ */
function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ============================================================
   COUNTER ANIMATION
   ============================================================ */
function animateCounter(el, target, suffix = '', duration = 1800) {
  const start = performance.now();
  const initial = 0;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out quart
    const eased = 1 - Math.pow(1 - progress, 4);
    const current = Math.round(initial + (target - initial) * eased);
    el.textContent = current.toLocaleString('id-ID') + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target.toLocaleString('id-ID') + suffix;
  }

  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ============================================================
   CAROUSEL (Gallery)
   ============================================================ */
function initCarousel() {
  const wrapper = document.querySelector('.carousel-wrapper');
  if (!wrapper) return;

  const track = wrapper.querySelector('.carousel-track');
  const slides = wrapper.querySelectorAll('.carousel-slide');
  const prevBtn = wrapper.querySelector('.carousel-btn-prev');
  const nextBtn = wrapper.querySelector('.carousel-btn-next');
  const dotsContainer = wrapper.querySelector('.carousel-dots');

  if (!track || !slides.length) return;

  let currentIndex = 0;
  let slidesVisible = getSlidesVisible();
  let maxIndex = Math.max(0, slides.length - slidesVisible);

  // Drag state
  let isDragging = false;
  let startX = 0;
  let startTranslate = 0;
  let currentTranslate = 0;

  function getSlidesVisible() {
    if (window.innerWidth <= 640) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  }

  function getSlideWidth() {
    const gap = 20;
    const containerWidth = track.parentElement.offsetWidth;
    return (containerWidth - gap * (slidesVisible - 1)) / slidesVisible;
  }

  function getTranslateX() {
    const slideWidth = getSlideWidth();
    const gap = 20;
    return currentIndex * (slideWidth + gap);
  }

  function updateCarousel(animate = true) {
    const translateX = getTranslateX();
    currentTranslate = translateX;

    if (animate) {
      track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    } else {
      track.style.transition = 'none';
    }
    track.style.transform = `translateX(-${translateX}px)`;

    // Update buttons
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;

    // Update dots
    const dots = dotsContainer ? dotsContainer.querySelectorAll('.carousel-dot') : [];
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function createDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const dotCount = maxIndex + 1;
    for (let i = 0; i <= maxIndex; i++) {
      const dot = document.createElement('button');
      dot.className = `carousel-dot${i === 0 ? ' active' : ''}`;
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => {
        currentIndex = i;
        updateCarousel();
      });
      dotsContainer.appendChild(dot);
    }
  }

  // Drag / Swipe
  function onPointerDown(e) {
    isDragging = true;
    startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    startTranslate = getTranslateX();
    track.classList.add('dragging');
    track.style.transition = 'none';
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const diff = startX - clientX;
    const translate = Math.max(0, startTranslate + diff);
    track.style.transform = `translateX(-${translate}px)`;
  }

  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('dragging');

    const clientX = e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX;
    const diff = startX - clientX;
    const threshold = getSlideWidth() * 0.25;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex < maxIndex) {
        currentIndex++;
      } else if (diff < 0 && currentIndex > 0) {
        currentIndex--;
      }
    }
    updateCarousel();
  }

  // Event listeners
  track.addEventListener('mousedown', onPointerDown);
  document.addEventListener('mousemove', onPointerMove);
  document.addEventListener('mouseup', onPointerUp);
  track.addEventListener('touchstart', onPointerDown, { passive: true });
  document.addEventListener('touchmove', onPointerMove, { passive: true });
  document.addEventListener('touchend', onPointerUp);

  // Prevent click on drag
  track.addEventListener('click', (e) => {
    if (Math.abs(startX - (e.type === 'click' ? e.clientX : 0)) > 5) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) { currentIndex--; updateCarousel(); }
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentIndex < maxIndex) { currentIndex++; updateCarousel(); }
    });
  }

  // Keyboard
  wrapper.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && currentIndex > 0) { currentIndex--; updateCarousel(); }
    if (e.key === 'ArrowRight' && currentIndex < maxIndex) { currentIndex++; updateCarousel(); }
  });

  // Auto-play
  let autoPlay = setInterval(() => {
    if (currentIndex >= maxIndex) currentIndex = 0;
    else currentIndex++;
    updateCarousel();
  }, 4000);

  wrapper.addEventListener('mouseenter', () => clearInterval(autoPlay));
  wrapper.addEventListener('mouseleave', () => {
    autoPlay = setInterval(() => {
      if (currentIndex >= maxIndex) currentIndex = 0;
      else currentIndex++;
      updateCarousel();
    }, 4000);
  });

  // Resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      slidesVisible = getSlidesVisible();
      maxIndex = Math.max(0, slides.length - slidesVisible);
      currentIndex = Math.min(currentIndex, maxIndex);
      createDots();
      updateCarousel(false);
    }, 200);
  });

  createDots();
  updateCarousel(false);
}

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      items.forEach(i => i.classList.remove('open'));

      // Toggle current
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ============================================================
   STATS COUNTER TRIGGER
   ============================================================ */
function initStats() {
  const statNums = document.querySelectorAll('.stat-num[data-count]');
  if (!statNums.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => observer.observe(el));
}

/* ============================================================
   HERO COUNTER (inline)
   ============================================================ */
function initHeroCounters() {
  const heroNums = document.querySelectorAll('.hero-stat-num[data-count]');
  if (!heroNums.length) return;
  // Trigger after load
  setTimeout(() => {
    heroNums.forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      animateCounter(el, target, suffix, 1500);
    });
  }, 1200);
}

/* ============================================================
   SMOOTH HOVER CARDS (tilt effect)
   ============================================================ */
function initTiltCards() {
  const cards = document.querySelectorAll('.service-card, .why-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;
      card.style.transform = `translateY(-8px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ============================================================
   BLOG ARTICLE MODAL
   ============================================================ */
function initBlogCards() {
  const cards = document.querySelectorAll('.blog-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const url = card.dataset.url;
      if (url && url !== '#') window.open(url, '_blank');
    });
  });
}

/* ============================================================
   SERVICE CARD LINKS
   ============================================================ */
function initServiceCards() {
  const cards = document.querySelectorAll('.service-card[data-href]');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const href = card.dataset.href;
      if (href && href !== '#') window.location.href = href;
    });
    card.style.cursor = 'pointer';
  });
}

/* ============================================================
   BACK TO TOP
   ============================================================ */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.style.opacity = window.scrollY > 400 ? '1' : '0';
    btn.style.pointerEvents = window.scrollY > 400 ? 'auto' : 'none';
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   DOCUMENT MODAL (for PDF/Company Profile link)
   ============================================================ */
function initDocumentLinks() {
  const docBtns = document.querySelectorAll('[data-doc]');
  docBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const docType = btn.dataset.doc;
      // Placeholder: replace with actual PDF URLs when available
      const urls = {
        'company-profile': '#company-profile-pdf',
        'pamflet': '#pamflet-pdf'
      };
      const url = urls[docType];
      if (url && url !== '#' && !url.startsWith('#')) {
        window.open(url, '_blank');
      } else {
        showToast('Dokumen segera tersedia. Hubungi kami via WhatsApp untuk informasi lengkap.');
      }
    });
  });
}

/* ============================================================
   TOAST NOTIFICATION
   ============================================================ */
function showToast(message, duration = 3500) {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
    <span>${message}</span>
  `;
  toast.style.cssText = `
    position: fixed; bottom: 110px; left: 50%; transform: translateX(-50%) translateY(20px);
    background: #0A1628; color: white; padding: 14px 24px; border-radius: 12px;
    font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; gap: 10px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3); z-index: 9998;
    border: 1px solid rgba(59,158,232,0.3);
    opacity: 0; transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    max-width: calc(100vw - 48px); text-align: center;
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ============================================================
   INIT ALL
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initNavbar();
  initReveal();
  initCounters();
  initCarousel();
  initFAQ();
  initStats();
  initHeroCounters();
  initTiltCards();
  initBlogCards();
  initServiceCards();
  initBackToTop();
  initDocumentLinks();
});
