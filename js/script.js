(() => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 35);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const closeMenu = () => {
    navLinks.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    navLinks.classList.toggle('open', open);
  });
  navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

  // Home, the logo and "Back to top" always return to the very top of the page.
  document.querySelectorAll('a[href="#home"]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      closeMenu();
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', window.location.pathname + window.location.search);
    });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeMenu();
      closeLightbox();
    }
  });

  // Food photograph filters; labels describe visible groupings, not menu items.
  const filterButtons = [...document.querySelectorAll('.filter-btn')];
  const foodCards = [...document.querySelectorAll('.food-card')];
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      foodCards.forEach(card => {
        const visible = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hidden', !visible);
      });
    });
  });

  // Gallery draws from the original supplied photographs, avoiding repeats
  // within the gallery itself. A few food images also appear in the menu section.
  const galleryAssets = [
    ['heritage/heritage-01.jpg', 'Historic architecture on Fort Road'],
    ['heritage/heritage-06.jpg', 'A quiet corner of the restaurant'],
    ['heritage/heritage-08.jpg', 'Interior details'],
    ['heritage/heritage-11.jpg', 'Colour and craft in the interior'],
    ['heritage/heritage-13.jpg', 'Curated heritage details'],
    ['heritage/heritage-15.jpg', 'Decorative ceiling and lighting'],
    ['heritage/heritage-16.jpg', 'Restaurant atmosphere after dark'],
    ['heritage/heritage-17.jpg', 'A heritage corridor'],
    ['heritage/heritage-18.jpg', 'Junoon Heritage Restaurant exterior'],
    ['food/food-02.jpg', 'Grilled food selection'],
    ['food/food-07.jpg', 'A sweet treat'],
    ['food/food-12.jpg', 'Dessert served at Junoon']
  ];
  const gallery = document.getElementById('gallery-grid');
  galleryAssets.forEach(([src, alt], index) => {
    const item = document.createElement('button');
    item.className = 'gallery-item';
    item.type = 'button';
    item.setAttribute('aria-label', `View image: ${alt}`);
    const image = document.createElement('img');
    image.src = `assets/images/${src}`;
    image.alt = alt;
    image.loading = 'lazy';
    item.appendChild(image);
    item.addEventListener('click', () => openLightbox(index));
    gallery.appendChild(item);
  });

  const lightbox = document.getElementById('lightbox');
  const lightboxImage = lightbox.querySelector('img');
  const lightboxCaption = lightbox.querySelector('figcaption');
  const galleryItems = [...galleryAssets];
  let activeImage = 0;
  function showLightboxImage() {
    const [src, alt] = galleryItems[activeImage];
    lightboxImage.src = `assets/images/${src}`;
    lightboxImage.alt = alt;
    lightboxCaption.textContent = `${String(activeImage + 1).padStart(2, '0')} / ${String(galleryItems.length).padStart(2, '0')}  —  ${alt}`;
  }
  function openLightbox(index) {
    activeImage = index;
    showLightboxImage();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightbox.querySelector('.lightbox-close').focus();
  }
  function closeLightbox() {
    if (!lightbox.classList.contains('open')) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function stepLightbox(direction) {
    activeImage = (activeImage + direction + galleryItems.length) % galleryItems.length;
    showLightboxImage();
  }
  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => stepLightbox(-1));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => stepLightbox(1));
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', event => {
    if (!lightbox.classList.contains('open')) return;
    if (event.key === 'ArrowLeft') stepLightbox(-1);
    if (event.key === 'ArrowRight') stepLightbox(1);
  });

  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealElements.forEach(element => observer.observe(element));
  } else {
    revealElements.forEach(element => element.classList.add('visible'));
  }

  // Highlight the current in-page navigation item.
  const sectionLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const sections = sectionLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          sectionLinks.forEach(link => {
            const active = link.getAttribute('href') === `#${entry.target.id}`;
            link.classList.toggle('active', active);
          });
        }
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(section => sectionObserver.observe(section));
  }
  document.getElementById('year').textContent = new Date().getFullYear();
})();
