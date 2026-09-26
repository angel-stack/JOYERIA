const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('nav-glass');
    } else {
      navbar.classList.remove('nav-glass');
    }
  });

  const revealElements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });
  revealElements.forEach(el => observer.observe(el));

  const cartStorageKey = 'jr-joyeria-cart';
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  let cart = loadCart();

  function showToast(msg) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    setTimeout(() => {
      toast.style.transform = 'translateY(6rem)';
      toast.style.opacity = '0';
    }, 2500);
  }

  function loadCart() {
    try {
      const savedCart = JSON.parse(localStorage.getItem(cartStorageKey) || '[]');
      return Array.isArray(savedCart)
        ? savedCart.filter(item => item && item.id && item.name && Number(item.price) > 0 && Number(item.quantity) > 0)
          .map(item => ({ ...item, price: Number(item.price), quantity: Math.floor(Number(item.quantity)) }))
        : [];
    } catch {
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    } catch {
      showToast('No se pudo guardar el carrito en este navegador.');
    }
    renderCart();
  }

  function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(price);
  }

  function renderImportedCatalog() {
    const productGrid = document.getElementById('productGrid');
    const isChainCatalog = Array.isArray(window.CADENAS_PRODUCTS);
    const isPulseraCatalog = Array.isArray(window.PULSERAS_PRODUCTS);
    const isAretesCatalog = Array.isArray(window.ARETES_PRODUCTS);
    const catalogProducts = isChainCatalog
      ? window.CADENAS_PRODUCTS
      : isPulseraCatalog
        ? window.PULSERAS_PRODUCTS
        : isAretesCatalog
          ? window.ARETES_PRODUCTS
          : window.ANILLOS_PRODUCTS;
    if (!productGrid || !Array.isArray(catalogProducts)) return;

    const productCards = document.createDocumentFragment();
    catalogProducts.forEach(product => {
      const card = document.createElement('article');
      card.className = 'product-card chain-product-card';
      card.dataset.available = String(product.available);

      const media = document.createElement('div');
      media.className = 'chain-product-media';
      const image = document.createElement('img');
      const imageUrl = new URL(product.image);
      imageUrl.searchParams.set('width', '720');
      image.src = imageUrl.href;
      image.alt = product.name;
      image.loading = 'lazy';
      image.decoding = 'async';
      media.appendChild(image);

      const details = document.createElement('div');
      details.className = 'chain-product-details';
      const material = document.createElement('div');
      material.className = 'chain-product-material';
      const productType = isChainCatalog
        ? 'Cadena'
        : isPulseraCatalog
          ? (/^pulso\b/i.test(product.name) ? 'Pulso' : 'Pulsera')
          : isAretesCatalog
            ? (/^topos?\b/i.test(product.name) ? 'Topo' : (/^candonga/i.test(product.name) ? 'Candonga' : 'Arete'))
            : 'Anillo';
      material.textContent = /nacional/i.test(product.name)
        ? `${productType} · Oro nacional`
        : `${productType} · Oro 18k`;

      const name = document.createElement('h3');
      name.className = 'font-serif chain-product-name';
      name.textContent = product.name;

      const price = document.createElement('span');
      price.className = 'chain-product-price';
      price.textContent = formatPrice(Number(product.price));

      details.append(material, name, price);
      card.append(media, details);
      productCards.appendChild(card);
    });

    productGrid.replaceChildren(productCards);
  }

  function createCartInterface() {
    if (document.getElementById('jrCartPanel')) return;

    const cartButton = document.createElement('button');
    cartButton.id = 'jrCartToggle';
    cartButton.type = 'button';
    cartButton.className = 'jr-cart-toggle';
    cartButton.setAttribute('aria-label', 'Abrir carrito');
    cartButton.setAttribute('aria-controls', 'jrCartPanel');
    cartButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 1.9-1.4L22 8H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg><span>Carrito</span><span id="cartCount" class="jr-cart-count">0</span>';

    const overlay = document.createElement('button');
    overlay.id = 'cartOverlay';
    overlay.type = 'button';
    overlay.className = 'jr-cart-overlay';
    overlay.setAttribute('aria-label', 'Cerrar carrito');

    const panel = document.createElement('aside');
    panel.id = 'jrCartPanel';
    panel.className = 'jr-cart-panel';
    panel.setAttribute('aria-labelledby', 'jrCartTitle');
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML = `
      <div class="jr-cart-header">
        <div><span class="jr-cart-eyebrow">JR JOYERÍA</span><h2 id="jrCartTitle">Tu carrito</h2></div>
        <button type="button" class="jr-cart-close" aria-label="Cerrar carrito">&times;</button>
      </div>
      <div id="cartItems" class="jr-cart-items" aria-live="polite"></div>
      <div class="jr-cart-footer">
        <div class="jr-cart-total"><span>Total</span><strong id="cartTotal">$0</strong></div>
        <p>El envío y la disponibilidad se confirman por WhatsApp.</p>
        <button type="button" id="jrCheckout" class="jr-cart-checkout">Continuar por WhatsApp</button>
      </div>`;

    (document.querySelector('.navbar-container') || document.body).appendChild(cartButton);
    document.body.append(overlay, panel);
  }

  function renderCart() {
    const itemsContainer = document.getElementById('cartItems');
    const countElement = document.getElementById('cartCount');
    const totalElement = document.getElementById('cartTotal');
    const checkoutButton = document.getElementById('jrCheckout');
    if (!itemsContainer || !countElement || !totalElement || !checkoutButton) return;

    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    countElement.textContent = itemCount;
    countElement.hidden = itemCount === 0;
    totalElement.textContent = formatPrice(cartTotal);
    checkoutButton.disabled = cart.length === 0;
    itemsContainer.replaceChildren();

    if (cart.length === 0) {
      const emptyMessage = document.createElement('p');
      emptyMessage.className = 'jr-cart-empty';
      emptyMessage.textContent = 'Tu carrito está vacío. Explora las colecciones y agrega tus piezas favoritas.';
      itemsContainer.appendChild(emptyMessage);
      return;
    }

    cart.forEach(item => {
      const row = document.createElement('article');
      row.className = 'jr-cart-item';

      const image = document.createElement('img');
      image.src = item.image;
      image.alt = '';
      image.loading = 'lazy';

      const details = document.createElement('div');
      details.className = 'jr-cart-item-details';
      const name = document.createElement('h3');
      name.textContent = item.name;
      const price = document.createElement('p');
      price.textContent = formatPrice(item.price * item.quantity);

      const controls = document.createElement('div');
      controls.className = 'jr-cart-item-controls';
      controls.innerHTML = `
        <div class="jr-quantity-control" aria-label="Cantidad">
          <button type="button" data-cart-action="decrease" data-cart-id="${encodeURIComponent(item.id)}" aria-label="Quitar una unidad">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-cart-action="increase" data-cart-id="${encodeURIComponent(item.id)}" aria-label="Agregar una unidad">+</button>
        </div>
        <button type="button" class="jr-cart-remove" data-cart-action="remove" data-cart-id="${encodeURIComponent(item.id)}">Eliminar</button>`;

      details.append(name, price, controls);
      row.append(image, details);
      itemsContainer.appendChild(row);
    });
  }

  function openCart() {
    const panel = document.getElementById('jrCartPanel');
    const overlay = document.getElementById('cartOverlay');
    panel?.classList.add('open');
    overlay?.classList.add('open');
    panel?.setAttribute('aria-hidden', 'false');
    document.getElementById('jrCartToggle')?.setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
  }

  function closeCart() {
    const panel = document.getElementById('jrCartPanel');
    const overlay = document.getElementById('cartOverlay');
    panel?.classList.remove('open');
    overlay?.classList.remove('open');
    panel?.setAttribute('aria-hidden', 'true');
    document.getElementById('jrCartToggle')?.setAttribute('aria-expanded', 'false');
    if (!document.querySelector('.mobile-menu.open')) {
      document.body.classList.remove('no-scroll');
    }
  }

  function addProductToCart(card) {
    const name = card.querySelector('h3')?.textContent.trim();
    const image = card.querySelector('img')?.getAttribute('src');
    const priceElement = card.querySelector('span[style*="color: #c9a961"], .chain-product-price');
    const price = Number(priceElement?.textContent.replace(/[^\d]/g, '')) || 0;
    if (!name || !image || !price) return;

    const id = `${name}|${price}|${image}`;
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ id, name, image, price, quantity: 1 });
    }

    saveCart();
    showToast(`${name} agregado al carrito`);
  }

  function setupProductButtons() {
    document.querySelectorAll('.product-card').forEach(card => {
      if (card.querySelector('.jr-add-to-cart')) return;

      const productName = card.querySelector('h3')?.textContent.trim();
      const info = card.lastElementChild;
      if (!productName || !info) return;

      const priceElement = card.querySelector('span[style*="color: #c9a961"], .chain-product-price');
      const price = Number(priceElement?.textContent.replace(/[^\d]/g, '')) || 0;
      if (price > 0 && card.dataset.available !== 'false') {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'jr-add-to-cart';
        button.textContent = 'Agregar al carrito';
        button.addEventListener('click', () => addProductToCart(card));
        info.appendChild(button);
      } else if (card.dataset.available === 'false') {
        const unavailableLabel = document.createElement('button');
        unavailableLabel.type = 'button';
        unavailableLabel.className = 'jr-add-to-cart jr-sold-out';
        unavailableLabel.disabled = true;
        unavailableLabel.textContent = 'Agotado';
        info.appendChild(unavailableLabel);
      } else {
        const contactLink = document.createElement('a');
        contactLink.className = 'jr-add-to-cart jr-inquire-price';
        contactLink.href = `https://wa.me/573003715460?text=${encodeURIComponent(`Hola, quisiera consultar el precio de ${productName}.`)}`;
        contactLink.target = '_blank';
        contactLink.rel = 'noopener noreferrer';
        contactLink.textContent = 'Consultar disponibilidad';
        info.appendChild(contactLink);
      }
    });
  }

  function setupCartEvents() {
    document.getElementById('jrCartToggle')?.addEventListener('click', openCart);
    document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
    document.querySelector('.jr-cart-close')?.addEventListener('click', closeCart);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeCart();
    });

    document.getElementById('cartItems')?.addEventListener('click', event => {
      const actionButton = event.target.closest('[data-cart-action]');
      if (!actionButton) return;

      const itemId = decodeURIComponent(actionButton.dataset.cartId);
      const item = cart.find(cartItem => cartItem.id === itemId);
      if (!item) return;

      if (actionButton.dataset.cartAction === 'increase') item.quantity += 1;
      if (actionButton.dataset.cartAction === 'decrease') item.quantity -= 1;
      if (actionButton.dataset.cartAction === 'remove' || item.quantity < 1) {
        cart = cart.filter(cartItem => cartItem.id !== itemId);
      }
      saveCart();
    });

    document.getElementById('jrCheckout')?.addEventListener('click', () => {
      if (cart.length === 0) return;
      const orderLines = cart.map(item => `- ${item.name} x${item.quantity}: ${formatPrice(item.price * item.quantity)}`);
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const message = `Hola, quiero hacer este pedido:\n${orderLines.join('\n')}\n\nTotal: ${formatPrice(total)}\n¿Me confirman disponibilidad y envío?`;
      window.open(`https://wa.me/573003715460?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    });

    window.addEventListener('storage', event => {
      if (event.key === cartStorageKey) {
        cart = loadCart();
        renderCart();
      }
    });
  }

  renderImportedCatalog();
  createCartInterface();
  setupProductButtons();
  setupCartEvents();
  renderCart();


function crearBotonWhatsApp() {
  if (document.getElementById("btn-wa-flotante")) return;

  const botonFlotante = document.createElement("a");
  botonFlotante.id = "btn-wa-flotante";
  botonFlotante.href = "https://wa.link/0w7a68";
  botonFlotante.target = "_blank";
  botonFlotante.rel = "noopener noreferrer";
  botonFlotante.setAttribute("aria-label", "Pedir por WhatsApp");
  botonFlotante.className = "fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3 px-5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 no-underline";
  
  botonFlotante.innerHTML = `
    <svg class="w-6 h-6 fill-current text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.332 5.001L2 22l5.163-1.347a9.97 9.97 0 004.848 1.258h.004c5.506 0 9.99-4.478 9.99-9.985 0-2.667-1.038-5.176-2.925-7.062A9.924 9.924 0 0012.012 2zm0 18.326h-.003a8.3 8.3 0 01-4.234-1.164l-.304-.181-3.146.821.839-3.052-.198-.316a8.293 8.293 0 01-1.272-4.448c0-4.577 3.724-8.3 8.303-8.3a8.243 8.243 0 015.867 2.433 8.243 8.243 0 012.428 5.867c0 4.578-3.724 8.301-8.28 8.301zm4.551-6.223c-.25-.125-1.478-.729-1.707-.812-.229-.083-.396-.125-.563.125-.166.25-.646.812-.792.979-.146.166-.292.187-.542.062a6.852 6.852 0 01-2.013-1.24 7.56 7.56 0 01-1.393-1.737c-.146-.25-.016-.385.109-.509.112-.112.25-.292.375-.438.125-.146.166-.25.25-.417.083-.166.042-.312-.021-.437-.063-.125-.563-1.354-.771-1.854-.203-.487-.41-.421-.563-.428l-.48-.007c-.166 0-.437.062-.666.312s-.875.854-.875 2.083c0 1.229.896 2.417 1.02 2.584.125.166 1.761 2.688 4.267 3.771.596.257 1.061.411 1.424.526.598.19 1.142.163 1.572.099.48-.071 1.478-.604 1.687-1.187.208-.583.208-1.083.146-1.187-.063-.104-.229-.166-.479-.291z"/>
    </svg>
    <span class="wa-label">Pedir por WhatsApp</span>
  `;

  document.body.appendChild(botonFlotante);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", crearBotonWhatsApp);
} else {
  crearBotonWhatsApp();
}

/*MEN MOVIL*/
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const mobileOverlay = document.getElementById("mobileOverlay");
const closeMobileMenu = document.getElementById("closeMobileMenu");

function openMobileMenu() {
  mobileMenu.classList.add("open");
  mobileOverlay.classList.add("open");

  document.body.classList.add("no-scroll");
}

function closeMobileMenuFunction() {
  mobileMenu.classList.remove("open");
  mobileOverlay.classList.remove("open");

  document.body.classList.remove("no-scroll");
}

/*Abrir*/
mobileMenuBtn.addEventListener("click", openMobileMenu);

/*errar con X*/
closeMobileMenu.addEventListener("click", closeMobileMenuFunction);

/*Cerrar haciendo clic fuera*/
mobileOverlay.addEventListener("click", closeMobileMenuFunction);

/*Cerrar al seleccionar una opción*/
const mobileLinks = document.querySelectorAll(".mobile-menu-links a");

mobileLinks.forEach(link => {
  link.addEventListener("click", closeMobileMenuFunction);
});


document.addEventListener("DOMContentLoaded", () => {

    const searchInput = document.getElementById("productSearch");
    const categoryFilter = document.getElementById("categoryFilter");
    const priceFilter = document.getElementById("priceFilter");
    const clearSearch = document.getElementById("clearSearch");
    const filterInfo = document.getElementById("filterInfo");
    const productGrid = document.getElementById("productGrid");

    if (
        !searchInput ||
        !categoryFilter ||
        !priceFilter ||
        !clearSearch ||
        !filterInfo ||
        !productGrid
    ) {
        return;
    }

    const products = Array.from(
        productGrid.querySelectorAll(".product-card")
    );

    // Mensaje de "sin resultados"
    const noResults = document.createElement("div");

    noResults.className = "no-results";

    noResults.innerHTML = `
        <h3>No encontramos productos</h3>
        <p>Prueba con otro nombre, categoría, peso o diseño.</p>
    `;

    noResults.style.display = "none";

    productGrid.appendChild(noResults);


    // =========================================
    // NORMALIZAR TEXTO
    // Ignora mayúsculas, minúsculas y tildes
    // =========================================

    function normalizeText(text) {

        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[.,/]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

    }


    // =========================================
    // OBTENER PRECIO
    // =========================================

    function getProductPrice(product) {

    const priceElement = product.querySelector(
        'span[style*="color: #c9a961"], .chain-product-price'
    );

    if (!priceElement) {
        return 0;
    }

    // "$62,000" -> "62000"
    // "$1.250.000" -> "1250000"
    const priceText = priceElement.textContent
        .replace(/[^\d]/g, "");

    return Number(priceText) || 0;
}


    // =========================================
    // FILTRAR
    // =========================================

    function filterProducts() {

        const searchValue = normalizeText(searchInput.value);

        const categoryValue = normalizeText(categoryFilter.value);

        const maxPrice = priceFilter.value === "all"
            ? Infinity
            : Number(priceFilter.value);

        let visibleProducts = 0;

        products.forEach(product => {

            const productText = normalizeText(product.textContent);

            // ---------------------------------
            // BÚSQUEDA
            // ---------------------------------

            // Permite buscar varias palabras:
            // "corazon diamantado"
            // y exige que ambas aparezcan
            const searchWords = searchValue
                .split(" ")
                .filter(word => word.length > 0);

            const matchesSearch = searchWords.every(word =>
                productText.includes(word)
            );


            // ---------------------------------
            // CATEGORÍA
            // ---------------------------------

            let matchesCategory = true;

            if (categoryValue !== "all") {

                matchesCategory = productText.includes(categoryValue);

            }


            // ---------------------------------
            // PRECIO
            // ---------------------------------

            const productPrice = getProductPrice(product);

            const matchesPrice = productPrice <= maxPrice;


            // ---------------------------------
            // RESULTADO FINAL
            // ---------------------------------

            const showProduct =
                matchesSearch &&
                matchesCategory &&
                matchesPrice;


            if (showProduct) {

                product.style.display = "";

                visibleProducts++;

            } else {

                product.style.display = "none";

            }

        });


        // Mostrar / ocultar "sin resultados"

        noResults.style.display =
            visibleProducts === 0 ? "block" : "none";


        // =========================================
        // TEXTO DE RESULTADOS
        // =========================================

        if (visibleProducts === 0) {

            filterInfo.textContent = "0 productos encontrados";

        } else if (
            searchValue === "" &&
            categoryValue === "all" &&
            priceFilter.value === "all"
        ) {

            filterInfo.textContent =
                `Mostrando ${visibleProducts} productos`;

        } else {

            filterInfo.textContent =
                `${visibleProducts} producto${visibleProducts !== 1 ? "s" : ""} encontrado${visibleProducts !== 1 ? "s" : ""}`;

        }


        // Mostrar botón X solamente cuando hay búsqueda

        clearSearch.style.display =
            searchInput.value.length > 0 ? "block" : "none";

    }


    // =========================================
    // EVENTOS
    // =========================================

    searchInput.addEventListener("input", filterProducts);

    categoryFilter.addEventListener("change", filterProducts);

    priceFilter.addEventListener("change", filterProducts);


    // Limpiar búsqueda

    clearSearch.addEventListener("click", () => {

        searchInput.value = "";

        filterProducts();

        searchInput.focus();

    });


    // Ejecutar al cargar

    filterProducts();

});