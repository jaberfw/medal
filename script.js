// ============================================================
// Medal Gifts - Script (JSON-based image loading)
// ============================================================

const CATEGORY_CONFIG = [
  { key: 'medal',         prefix: 'medal',  label: 'Medal',              title: 'Custom Medal',         desc: 'Premium custom medal crafted with precision. Available in gold, silver and bronze finishes with custom ribbon and engraving.' },
  { key: 'lapel-pin',    prefix: 'pin',    label: 'Lapel Pin',          title: 'Enamel Lapel Pin',     desc: 'High-quality custom enamel lapel pin with vibrant colors and durable metal base. Perfect for branding, events and gifting.' },
  { key: 'bottle-opener',prefix: 'opener', label: 'Bottle Opener',      title: 'Custom Bottle Opener', desc: 'Branded metal bottle opener with custom logo and text engraving. A popular promotional and gift item.' },
  { key: 'key-ring',     prefix: 'ring',   label: 'Key Ring',           title: 'Custom Key Ring',      desc: 'Durable metal key ring with custom die-cast logo or design. Popular for corporate giveaways and souvenirs.' },
  { key: 'coin',         prefix: 'coin',   label: 'Coin',               title: 'Custom Coin',          desc: 'Challenge coins, commemorative coins and souvenir coins with detailed relief designs and premium finish.' },
  { key: 'belt-buckle',  prefix: 'buckle', label: 'Belt & Buckle',      title: 'Custom Belt Buckle',   desc: 'Custom belt buckle with engraved or embossed design. Available in various sizes and finishes.' },
  { key: 'tag',          prefix: 'tag',    label: 'Soldier/Animal Tag', title: 'Custom ID Tag',        desc: 'Military dog tags and pet ID tags with custom engraving. Stainless steel or zinc alloy construction.' },
  { key: 'wing',         prefix: 'wing',   label: 'Wing',               title: 'Custom Wing Insignia', desc: 'Aviation and military wing insignia with gold or silver plating and custom center crest or enamel fill.' },
  { key: 'cap-badge',    prefix: 'cap',    label: 'Cap Badge',          title: 'Custom Cap Badge',     desc: 'Military and corporate cap badges with detailed crest designs, lugs and slider fittings.' },
  { key: 'badge',        prefix: 'badge',  label: 'Badge',              title: 'Custom Badge',         desc: 'Professional metal badges for security, corporate and decorative use. Customizable shape, logo and finish.' },
];

const labelMap = Object.fromEntries(CATEGORY_CONFIG.map(c => [c.key, c.label]));
function formatLabel(cat) { return labelMap[cat] || cat; }

// ============================================================
// LOAD IMAGE LIST FROM JSON (single request — fast!)
// ============================================================
let imageMapCache = null;

async function loadImageMap() {
  if (imageMapCache) return imageMapCache;
  try {
    const res = await fetch('./assets/images/images.json');
    if (!res.ok) throw new Error('images.json not found');
    imageMapCache = await res.json();
  } catch (e) {
    console.warn('Could not load images.json:', e);
    imageMapCache = {};
  }
  return imageMapCache;
}

function getImagesForPrefix(imageMap, prefix) {
  const files = imageMap[prefix] || [];
  return files.map(filename => `./assets/images/${filename}`);
}

// ============================================================
// BUILD PRODUCT LIST
// ============================================================
async function buildProducts() {
  const imageMap = await loadImageMap();
  const all = [];
  let id = 1;
  for (const cat of CATEGORY_CONFIG) {
    const images = getImagesForPrefix(imageMap, cat.prefix);
    images.forEach(imgUrl => {
      all.push({ id: id++, category: cat.key, image: imgUrl, description: cat.desc });
    });
  }
  return all;
}

// ============================================================
// GALLERY
// ============================================================
const ITEMS_PER_PAGE = 12;
let currentPage = 1;
let currentCategory = 'all';
let allProducts = [];

function getFiltered() {
  return currentCategory === 'all' ? allProducts : allProducts.filter(p => p.category === currentCategory);
}

function renderGallery() {
  const productGrid = document.getElementById('product-grid');
  const paginationEl = document.getElementById('pagination');
  if (!productGrid) return;

  const filtered = getFiltered();
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  productGrid.innerHTML = '';

  if (paginated.length === 0) {
    productGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:4rem;color:#888;">No products found. Add images to assets/images/ and update images.json</p>`;
    if (paginationEl) paginationEl.innerHTML = '';
    return;
  }

  paginated.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${formatLabel(product.category)}" class="product-image" loading="lazy">
      <div class="card-info">
        <h3>${formatLabel(product.category)}</h3>
        <span class="category-label">${formatLabel(product.category)}</span>
      </div>
    `;
    card.addEventListener('click', () => showModal(product));
    productGrid.appendChild(card);
  });

  renderPagination(totalPages, paginationEl);
}

function renderPagination(totalPages, paginationEl) {
  if (!paginationEl) return;
  paginationEl.innerHTML = '';
  if (totalPages <= 1) return;

  function btn(label, disabled, onClick) {
    const b = document.createElement('button');
    b.innerHTML = label;
    b.disabled = disabled;
    b.addEventListener('click', onClick);
    return b;
  }

  paginationEl.appendChild(btn('&larr; Prev', currentPage === 1, () => { currentPage--; renderGallery(); window.scrollTo(0, 280); }));

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      const b = btn(i, false, () => { currentPage = i; renderGallery(); window.scrollTo(0, 280); });
      if (i === currentPage) b.classList.add('active');
      paginationEl.appendChild(b);
    } else if (paginationEl.lastChild.textContent !== '...') {
      const sp = document.createElement('span');
      sp.textContent = '...';
      sp.style.cssText = 'padding:8px 4px;color:#999;line-height:36px;';
      paginationEl.appendChild(sp);
    }
  }

  paginationEl.appendChild(btn('Next &rarr;', currentPage === totalPages, () => { currentPage++; renderGallery(); window.scrollTo(0, 280); }));
}

// ============================================================
// MODAL
// ============================================================
function showModal(product) {
  const modal = document.getElementById('modal');
  if (!modal) return;
  document.getElementById('modal-image').src = product.image;
  document.getElementById('modal-title').textContent = formatLabel(product.category);
  document.getElementById('modal-category-label').textContent = formatLabel(product.category);
  document.getElementById('modal-description').textContent = product.description;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
}

// ============================================================
// HOME: FEATURED GRID (1 image per category)
// ============================================================
async function renderFeatured() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;

  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#aaa;">⏳ Loading...</div>`;

  const imageMap = await loadImageMap();
  const featured = [];

  for (const cat of CATEGORY_CONFIG) {
    const images = getImagesForPrefix(imageMap, cat.prefix);
    if (images.length) featured.push({ category: cat.key, label: cat.label, image: images[0] });
  }

  grid.innerHTML = '';
  if (!featured.length) {
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:3rem;color:#aaa;">Add images to assets/images/ to display products.</p>`;
    return;
  }

  featured.forEach(item => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.cursor = 'pointer';
    card.innerHTML = `
      <img src="${item.image}" alt="${item.label}" class="product-image" loading="lazy">
      <div class="card-info">
        <h3>${item.label}</h3>
        <span class="category-label">${item.label}</span>
      </div>
    `;
    card.addEventListener('click', () => { window.location.href = `gallery.html?category=${item.category}`; });
    grid.appendChild(card);
  });
}

// ============================================================
// HOME: UPDATE CATEGORY CARD IMAGES
// ============================================================
async function updateCategoryImages() {
  const imageMap = await loadImageMap();
  for (const cat of CATEGORY_CONFIG) {
    const el = document.querySelector(`.category-card[href="gallery.html?category=${cat.key}"] img`);
    if (!el) continue;
    const images = getImagesForPrefix(imageMap, cat.prefix);
    if (images.length) el.src = images[0];
  }
}

// ============================================================
// HERO SLIDER
// ============================================================
function initSlider() {
  const slides = document.querySelectorAll('.slide');
  const dotsContainer = document.getElementById('slider-dots');
  const counterEl     = document.getElementById('slide-counter');
  const prevBtn       = document.getElementById('slide-prev');
  const nextBtn       = document.getElementById('slide-next');
  if (!slides.length) return;

  let current = 0, timer = null;

  function show(idx) {
    current = (idx + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('active', i === current));
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));
    if (counterEl) counterEl.textContent = `${current + 1} / ${slides.length}`;
  }

  function reset() {
    clearInterval(timer);
    timer = setInterval(() => show(current + 1), 5000);
  }

  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', () => { show(i); reset(); });
      dotsContainer.appendChild(d);
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { show(current - 1); reset(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { show(current + 1); reset(); });

  let tx = 0;
  const slider = document.querySelector('.hero-slider');
  if (slider) {
    slider.addEventListener('touchstart', e => { tx = e.changedTouches[0].screenX; }, { passive: true });
    slider.addEventListener('touchend', e => {
      const diff = tx - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) { show(diff > 0 ? current + 1 : current - 1); reset(); }
    }, { passive: true });
  }

  show(0); reset();
}

// ============================================================
// MAIN INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {

  // Hamburger menu
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('nav-menu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      hamburger.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
    });
    navMenu.querySelectorAll('.nav-link').forEach(l =>
      l.addEventListener('click', () => { navMenu.classList.remove('active'); hamburger.textContent = '☰'; })
    );
  }

  // Modal close
  const modal      = document.getElementById('modal');
  const modalClose = document.getElementById('modal-close');
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // Slider
  initSlider();

  // ---- GALLERY PAGE ----
  const productGrid = document.getElementById('product-grid');
  if (productGrid) {
    productGrid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:5rem;color:#999;">
        <div style="font-size:2.5rem;margin-bottom:1rem;">⏳</div>
        <p style="font-size:1rem;">Loading products...</p>
      </div>`;

    allProducts = await buildProducts();

    const params = new URLSearchParams(window.location.search);
    currentCategory = params.get('category') || 'all';
    currentPage = 1;

    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === currentCategory);
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        currentPage = 1;
        renderGallery();
        const url = new URL(window.location);
        currentCategory === 'all' ? url.searchParams.delete('category') : url.searchParams.set('category', currentCategory);
        window.history.pushState({}, '', url);
      });
    });

    renderGallery();
  }

  // ---- HOME PAGE ----
  if (document.getElementById('featured-grid')) {
    renderFeatured();
  }
  if (document.querySelector('.category-card')) {
    updateCategoryImages();
  }
});
