/* ==========================================================================
   JVMA TECH & GAMING â€” Estado Compartido (localStorage) y LÃ³gica de Vistas
   ========================================================================== */

(function () {
  "use strict";

  const STORAGE_KEY = "jvma_tech_gaming_state_v1";
  const OWNER_SESSION_KEY = "jvma_owner_demo_auth";
  const OWNER_USER = "Jhonatan Menacho";
  const OWNER_PASS = "Sis-2026";
  const LOW_STOCK_THRESHOLD = 5;

  /* ConfiguraciÃ³n centralizada de WhatsApp (Ãºnico lugar para el nÃºmero oficial) */
  const WHATSAPP_CONFIG = {
    phoneIntl: "59169625935",
    phoneDisplay: "+591 69625935",
    storeName: "JVMA TECH & GAMING"
  };

  function buildWhatsAppUrl(messageText) {
    const cleanPhone = WHATSAPP_CONFIG.phoneIntl.replace(/\D/g, "");
    const encoded = encodeURIComponent(String(messageText || ""));
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  }

  function getWhatsAppMessages() {
    return {
      general: `Hola ${WHATSAPP_CONFIG.storeName}, me gustarÃ­a consultar por productos disponibles y coordinar entrega.`,
      catalog: (categoryLabel, queryText) => {
        const parts = [`Hola ${WHATSAPP_CONFIG.storeName}, deseo consultar productos`];
        if (categoryLabel && categoryLabel !== "todos") {
          parts.push(`de la categorÃ­a ${categoryLabel}`);
        }
        if (queryText) {
          parts.push(`sobre "${queryText}"`);
        }
        parts.push("y confirmar disponibilidad.");
        return parts.join(" ");
      },
      product: (product) =>
        `Hola ${WHATSAPP_CONFIG.storeName}, me interesa consultar por "${product.name}" (${formatPrice(product.price, product.currency)}) para verificar disponibilidad y entrega.`,
      cart: (lines, totalAmount) => {
        const summary = lines
          .map((l) => `- ${l.product.name} x${l.qty} (${formatPrice(l.subtotal, l.product.currency)})`)
          .join("\n");
        return `Hola ${WHATSAPP_CONFIG.storeName}, quiero coordinar este pedido de demostraciÃ³n:\n${summary}\nTotal estimado: ${formatPrice(totalAmount, "Bs")}. Por favor indÃ­came disponibilidad y entrega.`;
      },
      afterSale: (saleRecord) => {
        const itemsTxt = Array.isArray(saleRecord.items)
          ? saleRecord.items.map((i) => `${i.name} x${i.qty}`).join(", ")
          : "productos seleccionados";
        return `Hola ${WHATSAPP_CONFIG.storeName}, realicÃ© la compra de demostraciÃ³n #${saleRecord.id} (${itemsTxt}, total ${formatPrice(saleRecord.total, saleRecord.currency)}). Quisiera consultar disponibilidad, entrega y detalles del pedido.`;
      }
    };
  }

  const DEFAULT_PRODUCTS = [
    {
        "id":  "fig-goku-ui",
        "name":  "Goku Ultra Instinto",
        "sku":  "JV-FIG-001",
        "categorySlug":  "anime-figuras",
        "price":  150,
        "image":  "assets/img/productos/goku-ultra-instinto.jpg",
        "categoryLabel":  "ANIME \u0026 FIGURAS",
        "currency":  "Bs",
        "stock":  0,
        "status":  "Activo",
        "collection":  "general",
        "featured":  false,
        "offer":  false,
        "published":  true,
        "description":  "Producto disponible en JVMA Tech \u0026 Gaming. Consulta sus características y disponibilidad."
    },
    {
        "id":  "fig-vegeta-ed",
        "name":  "Vegeta Edición Especial",
        "sku":  "JV-FIG-002",
        "categorySlug":  "anime-figuras",
        "price":  150,
        "image":  "assets/img/productos/vegeta-edicion-especial.jpg",
        "categoryLabel":  "ANIME \u0026 FIGURAS",
        "currency":  "Bs",
        "stock":  0,
        "status":  "Activo",
        "collection":  "general",
        "featured":  false,
        "offer":  false,
        "published":  true,
        "description":  "Producto disponible en JVMA Tech \u0026 Gaming. Consulta sus características y disponibilidad."
    },
    {
        "id":  "fig-majin",
        "name":  "Majin Vegeta",
        "sku":  "JV-FIG-003",
        "categorySlug":  "anime-figuras",
        "price":  170,
        "image":  "assets/img/productos/majin-vegeta.jpg",
        "categoryLabel":  "ANIME \u0026 FIGURAS",
        "currency":  "Bs",
        "stock":  0,
        "status":  "Activo",
        "collection":  "general",
        "featured":  false,
        "offer":  false,
        "published":  true,
        "description":  "Producto disponible en JVMA Tech \u0026 Gaming. Consulta sus características y disponibilidad."
    },
    {
        "id":  "fig-gohan-ssj",
        "name":  "Gohan SSJ Adulto",
        "sku":  "JV-FIG-004",
        "categorySlug":  "anime-figuras",
        "price":  250,
        "image":  "assets/img/productos/gohan-ssj-adulto.jpg",
        "categoryLabel":  "ANIME \u0026 FIGURAS",
        "currency":  "Bs",
        "stock":  0,
        "status":  "Activo",
        "collection":  "general",
        "featured":  false,
        "offer":  false,
        "published":  true,
        "description":  "Producto disponible en JVMA Tech \u0026 Gaming. Consulta sus características y disponibilidad."
    },
    {
        "id":  "fig-bills",
        "name":  "Bills Dios de Destrucción",
        "sku":  "JV-FIG-005",
        "categorySlug":  "anime-figuras",
        "price":  0,
        "image":  "assets/img/productos/bills-dios-destruccion.jpg",
        "categoryLabel":  "ANIME \u0026 FIGURAS",
        "currency":  "Bs",
        "stock":  0,
        "status":  "Activo",
        "collection":  "general",
        "featured":  false,
        "offer":  false,
        "published":  false,
        "description":  "Producto disponible en JVMA Tech \u0026 Gaming. Consulta sus características y disponibilidad."
    },
    {
        "id":  "fig-gohan-bestia",
        "name":  "Gohan Bestia",
        "sku":  "JV-FIG-006",
        "categorySlug":  "anime-figuras",
        "price":  0,
        "image":  "assets/img/productos/gohan-bestia.jpg",
        "categoryLabel":  "ANIME \u0026 FIGURAS",
        "currency":  "Bs",
        "stock":  0,
        "status":  "Activo",
        "collection":  "general",
        "featured":  false,
        "offer":  false,
        "published":  false,
        "description":  "Producto disponible en JVMA Tech \u0026 Gaming. Consulta sus características y disponibilidad."
    },
    {
        "id":  "fig-goku-black",
        "name":  "Goku Black Rosé",
        "sku":  "JV-FIG-007",
        "categorySlug":  "anime-figuras",
        "price":  0,
        "image":  "assets/img/productos/goku-black-rose.jpg",
        "categoryLabel":  "ANIME \u0026 FIGURAS",
        "currency":  "Bs",
        "stock":  0,
        "status":  "Activo",
        "collection":  "general",
        "featured":  false,
        "offer":  false,
        "published":  false,
        "description":  "Producto disponible en JVMA Tech \u0026 Gaming. Consulta sus características y disponibilidad."
    },
    {
        "id":  "fig-goku-blue",
        "name":  "Goku SSJ Blue",
        "sku":  "JV-FIG-008",
        "categorySlug":  "anime-figuras",
        "price":  0,
        "image":  "assets/img/productos/goku-ssj-blue.jpg",
        "categoryLabel":  "ANIME \u0026 FIGURAS",
        "currency":  "Bs",
        "stock":  0,
        "status":  "Activo",
        "collection":  "general",
        "featured":  false,
        "offer":  false,
        "published":  false,
        "description":  "Producto disponible en JVMA Tech \u0026 Gaming. Consulta sus características y disponibilidad."
    },
    {
        "id":  "fig-luffy",
        "name":  "Luffy Gear 2",
        "sku":  "JV-FIG-009",
        "categorySlug":  "anime-figuras",
        "price":  0,
        "image":  "assets/img/productos/luffy-gear-2.jpg",
        "categoryLabel":  "ANIME \u0026 FIGURAS",
        "currency":  "Bs",
        "stock":  0,
        "status":  "Activo",
        "collection":  "general",
        "featured":  false,
        "offer":  false,
        "published":  false,
        "description":  "Producto disponible en JVMA Tech \u0026 Gaming. Consulta sus características y disponibilidad."
    },
    {
        "id":  "fig-trunks",
        "name":  "Trunks SSJ",
        "sku":  "JV-FIG-010",
        "categorySlug":  "anime-figuras",
        "price":  0,
        "image":  "assets/img/productos/trunks-ssj.jpg",
        "categoryLabel":  "ANIME \u0026 FIGURAS",
        "currency":  "Bs",
        "stock":  0,
        "status":  "Activo",
        "collection":  "general",
        "featured":  false,
        "offer":  false,
        "published":  false,
        "description":  "Producto disponible en JVMA Tech \u0026 Gaming. Consulta sus características y disponibilidad."
    },
    {
        "id":  "tec-audifono",
        "name":  "Audífono Gamer Rowell RW-A6 Azul",
        "sku":  "JV-TEC-011",
        "categorySlug":  "accesorios",
        "price":  0,
        "image":  "assets/img/productos/audifono-gamer-rowell-rw-a6-azul.jpg",
        "categoryLabel":  "ACCESORIOS",
        "currency":  "Bs",
        "stock":  0,
        "status":  "Activo",
        "collection":  "general",
        "featured":  false,
        "offer":  false,
        "published":  false,
        "description":  "Producto disponible en JVMA Tech \u0026 Gaming. Consulta sus características y disponibilidad."
    },
    {
        "id":  "tec-cable-a005",
        "name":  "Cable USB TC-A-005",
        "sku":  "JV-TEC-012",
        "categorySlug":  "accesorios",
        "price":  0,
        "image":  "assets/img/productos/cable-usb-tc-a-005.jpg",
        "categoryLabel":  "ACCESORIOS",
        "currency":  "Bs",
        "stock":  0,
        "status":  "Activo",
        "collection":  "general",
        "featured":  false,
        "offer":  false,
        "published":  false,
        "description":  "Producto disponible en JVMA Tech \u0026 Gaming. Consulta sus características y disponibilidad."
    },
    {
        "id":  "tec-cable-c25",
        "name":  "Cable USB TC-C-25",
        "sku":  "JV-TEC-013",
        "categorySlug":  "accesorios",
        "price":  0,
        "image":  "assets/img/productos/cable-usb-tc-c-25.jpg",
        "categoryLabel":  "ACCESORIOS",
        "currency":  "Bs",
        "stock":  0,
        "status":  "Activo",
        "collection":  "general",
        "featured":  false,
        "offer":  false,
        "published":  false,
        "description":  "Producto disponible en JVMA Tech \u0026 Gaming. Consulta sus características y disponibilidad."
    },
    {
        "id":  "tec-cable-su",
        "name":  "Cable USB engomado SU241001",
        "sku":  "JV-TEC-014",
        "categorySlug":  "accesorios",
        "price":  0,
        "image":  "assets/img/productos/cable-usb-tc-engomado-su241001.jpg",
        "categoryLabel":  "ACCESORIOS",
        "currency":  "Bs",
        "stock":  0,
        "status":  "Activo",
        "collection":  "general",
        "featured":  false,
        "offer":  false,
        "published":  false,
        "description":  "Producto disponible en JVMA Tech \u0026 Gaming. Consulta sus características y disponibilidad."
    },
    {
        "id":  "tec-cable-f",
        "name":  "Cable USB TC-F-D003",
        "sku":  "JV-TEC-015",
        "categorySlug":  "accesorios",
        "price":  0,
        "image":  "assets/img/productos/cable-usb-tc-f-d003.jpg",
        "categoryLabel":  "ACCESORIOS",
        "currency":  "Bs",
        "stock":  0,
        "status":  "Activo",
        "collection":  "general",
        "featured":  false,
        "offer":  false,
        "published":  false,
        "description":  "Producto disponible en JVMA Tech \u0026 Gaming. Consulta sus características y disponibilidad."
    },
    {
        "id":  "tec-cable-samsung",
        "name":  "Cable USB Samsung",
        "sku":  "JV-TEC-016",
        "categorySlug":  "accesorios",
        "price":  0,
        "image":  "assets/img/productos/cable-usb-tc-samsung-xx241001.jpg",
        "categoryLabel":  "ACCESORIOS",
        "currency":  "Bs",
        "stock":  0,
        "status":  "Activo",
        "collection":  "general",
        "featured":  false,
        "offer":  false,
        "published":  false,
        "description":  "Producto disponible en JVMA Tech \u0026 Gaming. Consulta sus características y disponibilidad."
    },
    {
        "id":  "tec-cable-starksun",
        "name":  "Cable USB Starksun CZ1103",
        "sku":  "JV-TEC-017",
        "categorySlug":  "accesorios",
        "price":  0,
        "image":  "assets/img/productos/cable-usb-tc-starksun-cz1103.jpg",
        "categoryLabel":  "ACCESORIOS",
        "currency":  "Bs",
        "stock":  0,
        "status":  "Activo",
        "collection":  "general",
        "featured":  false,
        "offer":  false,
        "published":  false,
        "description":  "Producto disponible en JVMA Tech \u0026 Gaming. Consulta sus características y disponibilidad."
    },
    {
        "id":  "tec-cargador25",
        "name":  "Cargador Samsung 25W S21 5G",
        "sku":  "JV-TEC-018",
        "categorySlug":  "tecnologia",
        "price":  0,
        "image":  "assets/img/productos/cargador-samsung-25w-s21-5g.jpg",
        "categoryLabel":  "TECNOLOGÍA",
        "currency":  "Bs",
        "stock":  0,
        "status":  "Activo",
        "collection":  "general",
        "featured":  false,
        "offer":  false,
        "published":  false,
        "description":  "Producto disponible en JVMA Tech \u0026 Gaming. Consulta sus características y disponibilidad."
    },
    {
        "id":  "tec-cargador50",
        "name":  "Cargador Samsung 50W Original",
        "sku":  "JV-TEC-019",
        "categorySlug":  "tecnologia",
        "price":  0,
        "image":  "assets/img/productos/cargador-samsung-50w-original.jpg",
        "categoryLabel":  "TECNOLOGÍA",
        "currency":  "Bs",
        "stock":  0,
        "status":  "Activo",
        "collection":  "general",
        "featured":  false,
        "offer":  false,
        "published":  false,
        "description":  "Producto disponible en JVMA Tech \u0026 Gaming. Consulta sus características y disponibilidad."
    },
    {
        "id":  "tec-tablet",
        "name":  "Combo Tablet Bossney S003",
        "sku":  "JV-TEC-020",
        "categorySlug":  "tecnologia",
        "price":  0,
        "image":  "assets/img/productos/combo-tablet-bossney-s003.jpg",
        "categoryLabel":  "TECNOLOGÍA",
        "currency":  "Bs",
        "stock":  0,
        "status":  "Activo",
        "collection":  "general",
        "featured":  false,
        "offer":  false,
        "published":  false,
        "description":  "Producto disponible en JVMA Tech \u0026 Gaming. Consulta sus características y disponibilidad."
    }
];

  const DEFAULT_CART = [];

  function isInSubpage() {
    return window.location.pathname.includes("/pages/");
  }

  function resolveUrl(rootRelativePath) {
    const clean = rootRelativePath.replace(/^\.\//, "");
    return isInSubpage() ? `../${clean}` : `./${clean}`;
  }

  function createInitialState() {
    return {
      products: DEFAULT_PRODUCTS.slice(),
      cart: DEFAULT_CART.slice(),
      sales: [],
      subscribers: []
    };
  }

  function normalizeProduct(prod, idx) {
    const safeId = String(prod.id || `prod-${idx + 1}`);
    const fallbackSku = `JV-${safeId.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase() || String(idx + 1).padStart(3, "0")}`;
    return {
      id: safeId,
      sku: String(prod.sku || fallbackSku),
      name: String(prod.name || "Producto sin nombre"),
      categoryLabel: String(prod.categoryLabel || "TECNOLOGÃA"),
      categorySlug: String(prod.categorySlug || "tecnologia"),
      price: Number(prod.price) || 0,
      currency: String(prod.currency || "Bs"),
      stock: Math.max(0, Number(prod.stock) || 0),
      status: String(prod.status || "Activo"),
      collection: String(prod.collection || "general"),
      featured: Boolean(prod.featured),
      offer: Boolean(prod.offer),
      published: prod.published !== false,
      image: String(prod.image || ""),
      placeholderLabel: String(prod.placeholderLabel || "VISTA PREVIA Â· MARKER"),
      placeholderFile: String(prod.placeholderFile || "./assets/img/producto.png"),
      description: String(prod.description || "")
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = createInitialState();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      const parsed = JSON.parse(raw);
      const rawProducts = Array.isArray(parsed.products) ? parsed.products : [];
      const productMap = new Map(
        rawProducts.map(p => [String(p.id), p])
      );

      const demoIds = [
        "prod-dualsense-wireless",
        "prod-headset-emerald",
        "prod-figura-goku-24",
        "prod-teclado-rgb",
        "prod-ps5-slim"
      ];

      demoIds.forEach(id => productMap.delete(id));

      DEFAULT_PRODUCTS.forEach(product => {
        productMap.set(String(product.id), product);
      });

      const migratedState = {
        products: Array.from(productMap.values()).map(normalizeProduct),
        cart: [],
        sales: Array.isArray(parsed.sales) ? parsed.sales : [],
        subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers : []
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedState));
      return migratedState;
    } catch (_err) {
      console.error("ERROR EN LA MIGRACIÓN JVMA:", _err);
      return createInitialState();
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_err) {
      // Sin bloqueo si el almacenamiento estÃ¡ restringido
    }
  }

  function getCartTotalItems(cart) {
    return cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  }

  function updateCartCounter(state) {
    const countEl = document.getElementById("header-cart-count");
    if (countEl) {
      countEl.textContent = String(getCartTotalItems(state.cart));
    }
  }

  function formatPrice(price, currency) {
    const num = Number(price) || 0;
    const curr = currency || "Bs";
    return `${curr} ${num.toLocaleString("es-BO")}`;
  }

  function formatSaleDate(isoStr) {
    const d = isoStr ? new Date(isoStr) : new Date();
    if (Number.isNaN(d.getTime())) return String(isoStr || "");
    return d.toLocaleString("es-BO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function getProductAssetPath(product) {
    const raw = product.placeholderFile || "./assets/img/producto.png";
    const normalized = raw.replace(/^(\.\/|\.\.\/)+assets\//, "./assets/");
    return resolveUrl(normalized);
  }

  /* IntegraciÃ³n discreta en footer y secciÃ³n de contacto de inicio */
  function initGlobalWhatsAppLinks() {
    const msgs = getWhatsAppMessages();
    const generalUrl = buildWhatsAppUrl(msgs.general);

    document.querySelectorAll("[data-wa-phone-text]").forEach((el) => {
      el.textContent = WHATSAPP_CONFIG.phoneDisplay;
    });

    document.querySelectorAll("[data-wa-general-link]").forEach((link) => {
      link.setAttribute("href", generalUrl);
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });

    const footerEl = document.querySelector("footer");
    if (footerEl && !footerEl.querySelector("[data-wa-footer-contact]")) {
      const contactStrip = document.createElement("div");
      contactStrip.setAttribute("data-wa-footer-contact", "true");
      contactStrip.style.cssText =
        "margin-top:16px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:11px;color:var(--color-gray-muted);";
      contactStrip.innerHTML = `
        <span>Contacto directo: <strong>${WHATSAPP_CONFIG.phoneDisplay}</strong></span>
        <a href="${generalUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--color-primary);font-weight:600;text-decoration:none;">
          WhatsApp (${WHATSAPP_CONFIG.phoneDisplay}) -&gt;
        </a>
      `;
      footerEl.appendChild(contactStrip);
    }

    if (document.body.dataset.page === "home" || !document.body.dataset.page) {
      const targetSec =
        document.getElementById("contacto") ||
        document.getElementById("newsletter-section") ||
        document.querySelector("main");
      if (targetSec && !targetSec.querySelector("[data-wa-home-contact]")) {
        const box = document.createElement("div");
        box.setAttribute("data-wa-home-contact", "true");
        box.style.cssText =
          "margin-top:14px;padding:12px 16px;border:1px solid var(--color-border);border-radius:var(--radius-md);background-color:var(--color-white);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;";
        box.innerHTML = `
          <div>
            <strong style="display:block;font-size:12px;">Contacto directo por WhatsApp</strong>
            <span style="font-size:11px;color:var(--color-gray);">Consultas, disponibilidad y coordinaciÃ³n de entregas (${WHATSAPP_CONFIG.phoneDisplay}).</span>
          </div>
          <a class="wa-inline-link" href="${generalUrl}" target="_blank" rel="noopener noreferrer">
            Consultar por WhatsApp -&gt;
          </a>
        `;
        targetSec.appendChild(box);
      }
    }
  }

  function renderFeaturedProducts(state) {
    const grid = document.getElementById("featured-products-grid");
    if (!grid) return;

    const publishedProducts = state.products.filter((p) => p.published !== false);
    const featured = publishedProducts.filter((p) => p.featured).slice(0, 4);
    const list = featured.length > 0 ? featured : publishedProducts.slice(0, 4);

    grid.innerHTML = list
      .map((product) => {
        const detailHref = resolveUrl(`./pages/producto.html?id=${encodeURIComponent(product.id)}`);
        const imgSrc = product.image ? resolveUrl(product.image) : "";
        const mediaContent = imgSrc
          ? `<img class="product-card__img" src="${imgSrc}" alt="${product.name}" />`
          : `<span class="product-card__placeholder-label">${product.placeholderLabel}</span>
             <span class="product-card__placeholder-sub">${getProductAssetPath(product)}</span>`;

        return `
          <a class="product-card" href="${detailHref}" aria-label="${product.name} - ${formatPrice(product.price, product.currency)}">
            <div class="product-card__media">
              ${mediaContent}
            </div>
            <div class="product-card__body">
              <span class="product-card__cat">${product.categoryLabel}</span>
              <h3 class="product-card__title">${product.name}</h3>
              <p class="product-card__price">${formatPrice(product.price, product.currency)}</p>
            </div>
          </a>
        `;
      })
      .join("");
  }

  function initSearchForm() {
    const form =
      document.getElementById("home-search-form") ||
      document.getElementById("header-search-form");
    const input =
      document.getElementById("home-search-input") ||
      document.getElementById("header-search-input");
    if (!form || !input) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = input.value.trim();
      const baseCatalog = resolveUrl("./pages/catalogo.html");
      const target = query
        ? `${baseCatalog}?q=${encodeURIComponent(query)}`
        : baseCatalog;
      window.location.href = target;
    });
  }

  function initNewsletterForm(state) {
    const form = document.getElementById("newsletter-form");
    const input = document.getElementById("newsletter-email");
    const feedback = document.getElementById("newsletter-feedback");
    if (!form || !input || !feedback) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = input.value.trim();
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!isValid) {
        feedback.textContent = "Ingresa un correo electrÃ³nico vÃ¡lido para recibir los drops.";
        input.focus();
        return;
      }

      if (!state.subscribers.includes(email)) {
        state.subscribers.push(email);
        saveState(state);
      }
      feedback.textContent = `Listo: ${email} quedÃ³ registrado para prÃ³ximos drops y ofertas.`;
      form.reset();
    });
  }

  function initOwnerAccessModal() {
    const trigger = document.getElementById("owner-access-trigger");
    const modal = document.getElementById("owner-login-modal");
    const closeBtn = document.getElementById("owner-modal-close");
    const form = document.getElementById("owner-login-form");
    const userInput = document.getElementById("owner-username");
    const passInput = document.getElementById("owner-password");
    const errorEl = document.getElementById("owner-login-error");
    if (!trigger || !modal || !form || !userInput || !passInput || !errorEl) return;

    const adminTarget = resolveUrl("./pages/admin.html?login=1");
    const directLink = modal.querySelector(".owner-modal__direct");
    if (directLink) {
      directLink.setAttribute("href", adminTarget);
    }

    function openModal(event) {
      if (event) event.preventDefault();
      errorEl.textContent = "";
      form.reset();
      modal.hidden = false;
      userInput.focus();
    }

    function closeModal() {
      modal.hidden = true;
      errorEl.textContent = "";
    }

    trigger.addEventListener("click", openModal);
    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal);
    }

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const enteredUser = userInput.value.trim();
      const enteredPass = passInput.value;

      if (enteredUser === OWNER_USER && enteredPass === OWNER_PASS) {
        try {
          localStorage.setItem(
            OWNER_SESSION_KEY,
            JSON.stringify({ user: OWNER_USER, authenticatedAt: new Date().toISOString() })
          );
        } catch (_err) {
          // Continuar con redirecciÃ³n acadÃ©mica
        }
        window.location.href = adminTarget;
      } else {
        errorEl.textContent = "Usuario o contraseÃ±a incorrectos.";
      }
    });
  }

  function addProductToCartWithQty(state, productId, qtyToAdd) {
    const qty = Math.max(1, Math.floor(Number(qtyToAdd) || 1));
    const product = state.products.find((p) => p.id === productId && p.published !== false);
    if (!product || product.stock <= 0) {
      return { ok: false, reason: "sin-stock", maxAvailable: 0 };
    }

    const existing = state.cart.find((item) => item.productId === productId);
    const currentQty = existing ? Number(existing.qty) || 0 : 0;
    const remainingStock = Math.max(0, product.stock - currentQty);

    if (qty > remainingStock) {
      return { ok: false, reason: "limite-stock", maxAvailable: remainingStock };
    }

    if (existing) {
      existing.qty = currentQty + qty;
    } else {
      state.cart.push({ productId, qty });
    }

    saveState(state);
    updateCartCounter(state);
    return { ok: true, addedQty: qty, totalInCart: currentQty + qty };
  }

  function addProductToCart(state, productId) {
    return addProductToCartWithQty(state, productId, 1);
  }

  function initCatalogPage(state) {
    if (document.body.dataset.page !== "catalogo") return;

    const gridEl = document.getElementById("catalog-products-grid");
    const countEl = document.getElementById("catalog-results-count");
    const selectionNoteEl = document.getElementById("catalog-selection-note");
    const searchInput = document.getElementById("catalog-search-input");
    const headerSearchInput = document.getElementById("header-search-input");
    const sortSelect = document.getElementById("catalog-sort-select");
    const maxPriceRange = document.getElementById("catalog-max-price-range");
    const maxPriceLabel = document.getElementById("catalog-max-price-label");
    const onlyStockCheck = document.getElementById("catalog-only-stock");
    const onlyOffersCheck = document.getElementById("catalog-only-offers");
    const clearBtn = document.getElementById("catalog-clear-filters");
    const categoryButtons = Array.from(document.querySelectorAll(".filter-cat-btn"));

    if (!gridEl || !countEl) return;

    const msgs = getWhatsAppMessages();
    let waCatLink = document.getElementById("catalog-wa-link");
    if (!waCatLink && countEl.parentElement) {
      waCatLink = document.createElement("a");
      waCatLink.id = "catalog-wa-link";
      waCatLink.className = "wa-inline-link";
      waCatLink.target = "_blank";
      waCatLink.rel = "noopener noreferrer";
      waCatLink.textContent = "Consultar en WhatsApp";
      countEl.parentElement.appendChild(waCatLink);
    }

    const params = new URLSearchParams(window.location.search);
    const initialCategory = params.get("categoria") || "todos";
    const initialQuery = params.get("q") || "";
    const initialOffer = params.get("oferta") === "1";

    const filters = {
      category: initialCategory,
      query: initialQuery,
      maxPrice: maxPriceRange ? Number(maxPriceRange.value) || 6000 : 6000,
      onlyStock: onlyStockCheck ? Boolean(onlyStockCheck.checked) : true,
      onlyOffers: initialOffer,
      sort: sortSelect ? sortSelect.value : "featured"
    };

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }
    if (headerSearchInput && initialQuery) {
      headerSearchInput.value = initialQuery;
    }
    if (onlyOffersCheck) {
      onlyOffersCheck.checked = initialOffer;
    }

    function syncCategoryButtons() {
      categoryButtons.forEach((btn) => {
        const isMatch = btn.dataset.category === filters.category;
        btn.classList.toggle("is-active", isMatch);
      });
    }

    function getFilteredProducts() {
      const term = filters.query.trim().toLowerCase();

      const filtered = state.products.filter((prod) => {
        if (prod.published === false) return false;
        if (filters.category !== "todos" && prod.categorySlug !== filters.category) return false;
        if (prod.price > filters.maxPrice) return false;
        if (filters.onlyStock && prod.stock <= 0) return false;
        if (filters.onlyOffers && !prod.offer) return false;

        if (term) {
          const haystack = `${prod.name} ${prod.categoryLabel} ${prod.categorySlug} ${prod.description}`.toLowerCase();
          if (!haystack.includes(term)) return false;
        }
        return true;
      });

      const sorted = filtered.slice();
      if (filters.sort === "price-asc") {
        sorted.sort((a, b) => a.price - b.price);
      } else if (filters.sort === "price-desc") {
        sorted.sort((a, b) => b.price - a.price);
      } else if (filters.sort === "name-asc") {
        sorted.sort((a, b) => a.name.localeCompare(b.name, "es"));
      } else {
        sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
      }

      return sorted;
    }

    function renderCatalog() {
      syncCategoryButtons();
      if (maxPriceLabel) {
        maxPriceLabel.textContent = `Bs ${Number(filters.maxPrice).toLocaleString("es-BO")}`;
      }
      if (waCatLink) {
        waCatLink.href = buildWhatsAppUrl(msgs.catalog(filters.category, filters.query));
      }

      const items = getFilteredProducts();
      countEl.textContent = `${items.length} ${items.length === 1 ? "producto" : "productos"}`;

      if (items.length === 0) {
        gridEl.innerHTML = `
          <div class="catalog-empty">
            <h2 class="catalog-empty__title">No encontramos productos con esos filtros</h2>
            <p class="catalog-empty__desc">Prueba limpiando los filtros o buscando otro tÃ©rmino en el catÃ¡logo.</p>
            <button class="btn btn--primary" id="catalog-empty-reset" type="button">Restablecer filtros</button>
          </div>
        `;
        if (selectionNoteEl) selectionNoteEl.hidden = true;

        const emptyReset = document.getElementById("catalog-empty-reset");
        if (emptyReset && clearBtn) {
          emptyReset.addEventListener("click", () => clearBtn.click());
        }
        return;
      }

      gridEl.innerHTML = items
        .map((prod) => {
          const detailHref = `./producto.html?id=${encodeURIComponent(prod.id)}`;
          const prodWaHref = buildWhatsAppUrl(msgs.product(prod));
          const imgSrc = prod.image ? resolveUrl(prod.image) : "";
          const badge = prod.offer ? `<span class="catalog-card__badge">Oferta</span>` : "";
          const stockText = prod.stock > 0 ? `En stock (${prod.stock})` : "Agotado";
          const stockClass = prod.stock > 0 ? "catalog-card__stock" : "catalog-card__stock is-out";

          const mediaContent = imgSrc
            ? `<img class="product-card__img" src="${imgSrc}" alt="${prod.name}" />`
            : `<span class="product-card__placeholder-label">${prod.placeholderLabel}</span>
               <span class="product-card__placeholder-sub">${getProductAssetPath(prod)}</span>`;

          return `
            <article class="catalog-card" data-product-id="${prod.id}">
              <a class="catalog-card__link" href="${detailHref}">
                <div class="catalog-card__media">
                  ${badge}
                  ${mediaContent}
                </div>
                <div class="catalog-card__body">
                  <div class="catalog-card__meta-row">
                    <span class="catalog-card__cat">${prod.categoryLabel}</span>
                    <span class="${stockClass}">${stockText}</span>
                  </div>
                  <h2 class="catalog-card__title">${prod.name}</h2>
                  <p class="catalog-card__price">${(prod.price > 0 ? formatPrice(prod.price, prod.currency) : "Consultar precio")}</p>
                </div>
              </a>
              <div class="catalog-card__footer">
                <button
                  class="catalog-card__add-btn"
                  type="button"
                  data-add-to-cart="${prod.id}"
                  ${prod.stock <= 0 ? "disabled" : ""}
                >
                  ${prod.stock > 0 ? "Agregar al carrito" : "Sin stock"}
                </button>
                <a class="wa-inline-link" href="${prodWaHref}" target="_blank" rel="noopener noreferrer" style="display:block;text-align:center;margin-top:8px;">
                  Consultar WhatsApp
                </a>
              </div>
            </article>
          `;
        })
        .join("");

      if (selectionNoteEl) {
        selectionNoteEl.hidden = false;
      }

      gridEl.querySelectorAll("[data-add-to-cart]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const prodId = btn.getAttribute("data-add-to-cart");
          const result = addProductToCart(state, prodId);
          if (result.ok) {
            const originalText = btn.textContent;
            btn.textContent = "Agregado al carrito";
            btn.classList.add("is-added");
            window.setTimeout(() => {
              btn.textContent = originalText;
              btn.classList.remove("is-added");
            }, 1100);
          } else if (result.reason === "limite-stock") {
            btn.textContent = "Stock mÃ¡ximo alcanzado";
            window.setTimeout(() => {
              btn.textContent = "Agregar al carrito";
            }, 1200);
          }
        });
      });
    }

    categoryButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filters.category = btn.dataset.category || "todos";
        renderCatalog();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        filters.query = searchInput.value;
        renderCatalog();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        filters.sort = sortSelect.value;
        renderCatalog();
      });
    }

    if (maxPriceRange) {
      maxPriceRange.addEventListener("input", () => {
        filters.maxPrice = Number(maxPriceRange.value) || 6000;
        renderCatalog();
      });
    }

    if (onlyStockCheck) {
      onlyStockCheck.addEventListener("change", () => {
        filters.onlyStock = onlyStockCheck.checked;
        renderCatalog();
      });
    }

    if (onlyOffersCheck) {
      onlyOffersCheck.addEventListener("change", () => {
        filters.onlyOffers = onlyOffersCheck.checked;
        renderCatalog();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        filters.category = "todos";
        filters.query = "";
        filters.maxPrice = 6000;
        filters.onlyStock = true;
        filters.onlyOffers = false;
        filters.sort = "featured";

        if (searchInput) searchInput.value = "";
        if (headerSearchInput) headerSearchInput.value = "";
        if (maxPriceRange) maxPriceRange.value = "6000";
        if (onlyStockCheck) onlyStockCheck.checked = true;
        if (onlyOffersCheck) onlyOffersCheck.checked = false;
        if (sortSelect) sortSelect.value = "featured";

        renderCatalog();
      });
    }

    renderCatalog();
  }

  function initProductDetailPage(state) {
    if (document.body.dataset.page !== "producto") return;

    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get("id");
    const published = state.products.filter((p) => p.published !== false);

    const product =
      published.find((p) => p.id === requestedId) ||
      published[0] ||
      state.products[0];

    if (!product) return;

    document.title = `${product.name} â€” JVMA TECH & GAMING`;

    const breadcrumbCat = document.getElementById("breadcrumb-category");
    const breadcrumbProd = document.getElementById("breadcrumb-product");
    if (breadcrumbCat) breadcrumbCat.textContent = product.categoryLabel;
    if (breadcrumbProd) breadcrumbProd.textContent = product.name;

    const mainMediaEl = document.getElementById("detail-main-media");
    const thumbsEl = document.getElementById("detail-thumbs");
    const catEl = document.getElementById("detail-product-category");
    const titleEl = document.getElementById("detail-product-title");
    const subtitleEl = document.getElementById("detail-product-subtitle");
    const priceEl = document.getElementById("detail-product-price");
    const comparePriceEl = document.getElementById("detail-product-compare-price");
    const offerPillEl = document.getElementById("detail-product-offer-pill");
    const stockEl = document.getElementById("detail-product-stock");
    const descEl = document.getElementById("detail-product-description");
    const qtyMinus = document.getElementById("detail-qty-minus");
    const qtyPlus = document.getElementById("detail-qty-plus");
    const qtyInput = document.getElementById("detail-qty-input");
    const addBtn = document.getElementById("detail-add-to-cart");
    const feedbackEl = document.getElementById("detail-feedback");

    if (addBtn && addBtn.parentElement && !document.getElementById("detail-wa-consult-btn")) {
      const waBtn = document.createElement("a");
      waBtn.id = "detail-wa-consult-btn";
      waBtn.className = "detail-wa-btn";
      waBtn.target = "_blank";
      waBtn.rel = "noopener noreferrer";
      waBtn.textContent = "Consultar por WhatsApp";
      waBtn.href = buildWhatsAppUrl(getWhatsAppMessages().product(product));
      addBtn.parentElement.appendChild(waBtn);
    }

    if (catEl) catEl.textContent = `JVMA Â· ${product.categoryLabel}`;
    if (titleEl) titleEl.textContent = product.name;
    if (subtitleEl) {
      subtitleEl.textContent = `CategorÃ­a: ${product.categoryLabel} Â· Disponible en JVMA TECH & GAMING`;
    }

    const regularPrice = product.offer ? Math.round(product.price * 1.15) : 0;
    if (priceEl) priceEl.textContent = formatPrice(product.price, product.currency);
    if (comparePriceEl) {
      if (product.offer && regularPrice > product.price) {
        comparePriceEl.textContent = formatPrice(regularPrice, product.currency);
        comparePriceEl.hidden = false;
      } else {
        comparePriceEl.hidden = true;
      }
    }
    if (offerPillEl) {
      offerPillEl.hidden = !product.offer;
    }

    const hasStock = product.stock > 0;
    if (stockEl) {
      stockEl.textContent = hasStock
        ? `Disponible Â· ${product.stock} ${product.stock === 1 ? "unidad en stock" : "unidades en stock"}`
        : "Agotado Â· Sin stock disponible";
      stockEl.classList.toggle("is-out", !hasStock);
    }

    if (descEl) {
      descEl.textContent =
        product.description ||
        "Producto seleccionado de JVMA TECH & GAMING para gaming, tecnologÃ­a y colecciÃ³n.";
    }

    const imgSrc = product.image ? resolveUrl(product.image) : "";
    const assetPath = getProductAssetPath(product);

    function setMediaView(mode) {
      if (!mainMediaEl) return;
      const badgeHtml = `<span class="detail-badge">${product.offer ? "OFERTA ESPECIAL" : "PRODUCTO ORIGINAL"}</span>`;
      if (imgSrc) {
        mainMediaEl.innerHTML = `${badgeHtml}<img class="product-card__img" src="${imgSrc}" alt="${product.name}" />`;
      } else {
        const suffix = mode === "detalle" ? " Â· VISTA 2" : " Â· VISTA PRINCIPAL";
        mainMediaEl.innerHTML = `
          ${badgeHtml}
          <span class="detail-placeholder-title">${product.placeholderLabel}${suffix}</span>
          <span class="detail-placeholder-path">${assetPath}</span>
        `;
      }
    }

    setMediaView("principal");

    if (thumbsEl) {
      thumbsEl.innerHTML = `
        <button class="detail-thumb-btn is-active" type="button" data-view="principal">Vista 1 Â· Principal</button>
        <button class="detail-thumb-btn" type="button" data-view="detalle">Vista 2 Â· Detalle</button>
      `;
      thumbsEl.querySelectorAll(".detail-thumb-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          thumbsEl.querySelectorAll(".detail-thumb-btn").forEach((b) => b.classList.remove("is-active"));
          btn.classList.add("is-active");
          setMediaView(btn.dataset.view || "principal");
        });
      });
    }

    if (qtyInput) {
      qtyInput.max = String(Math.max(1, product.stock));
      qtyInput.value = hasStock ? "1" : "0";
      qtyInput.disabled = !hasStock;
    }
    if (qtyMinus) qtyMinus.disabled = !hasStock;
    if (qtyPlus) qtyPlus.disabled = !hasStock;
    if (addBtn) addBtn.disabled = !hasStock;

    function clampQty() {
      if (!qtyInput || !hasStock) return 1;
      let val = Math.floor(Number(qtyInput.value) || 1);
      if (val < 1) val = 1;
      if (val > product.stock) {
        val = product.stock;
        if (feedbackEl) {
          feedbackEl.textContent = `Cantidad ajustada al stock mÃ¡ximo disponible (${product.stock}).`;
          feedbackEl.classList.add("is-error");
        }
      }
      qtyInput.value = String(val);
      return val;
    }

    if (qtyMinus && qtyInput) {
      qtyMinus.addEventListener("click", () => {
        if (!hasStock) return;
        const current = Math.floor(Number(qtyInput.value) || 1);
        qtyInput.value = String(Math.max(1, current - 1));
        if (feedbackEl) {
          feedbackEl.textContent = "";
          feedbackEl.classList.remove("is-error");
        }
      });
    }

    if (qtyPlus && qtyInput) {
      qtyPlus.addEventListener("click", () => {
        if (!hasStock) return;
        const current = Math.floor(Number(qtyInput.value) || 1);
        if (current + 1 > product.stock) {
          qtyInput.value = String(product.stock);
          if (feedbackEl) {
            feedbackEl.textContent = `Solo hay ${product.stock} ${product.stock === 1 ? "unidad" : "unidades"} en stock.`;
            feedbackEl.classList.add("is-error");
          }
          return;
        }
        qtyInput.value = String(current + 1);
        if (feedbackEl) {
          feedbackEl.textContent = "";
          feedbackEl.classList.remove("is-error");
        }
      });
    }

    if (qtyInput) {
      qtyInput.addEventListener("change", clampQty);
    }

    if (addBtn) {
      addBtn.addEventListener("click", () => {
        if (!hasStock) return;
        const chosenQty = clampQty();
        const result = addProductToCartWithQty(state, product.id, chosenQty);

        if (result.ok) {
          if (feedbackEl) {
            feedbackEl.classList.remove("is-error");
            feedbackEl.innerHTML = `Se ${chosenQty === 1 ? "agregÃ³ 1 unidad" : `agregaron ${chosenQty} unidades`} de <strong>${product.name}</strong> al carrito. <a href="./carrito.html" style="text-decoration:underline;">Ir al carrito</a>`;
          }
        } else if (result.reason === "limite-stock" && feedbackEl) {
          feedbackEl.classList.add("is-error");
          feedbackEl.textContent =
            result.maxAvailable > 0
              ? `No puedes superar el stock disponible. Puedes agregar hasta ${result.maxAvailable} ${result.maxAvailable === 1 ? "unidad mÃ¡s" : "unidades mÃ¡s"}.`
              : "Ya alcanzaste el stock mÃ¡ximo disponible de este producto en tu carrito.";
        }
      });
    }

    const relatedGrid = document.getElementById("detail-related-grid");
    if (relatedGrid) {
      const others = published.filter((p) => p.id !== product.id).slice(0, 2);
      relatedGrid.innerHTML = others
        .map((rel) => {
          const relHref = `./producto.html?id=${encodeURIComponent(rel.id)}`;
          const relImg = rel.image ? resolveUrl(rel.image) : "";
          const mediaHtml = relImg
            ? `<img class="product-card__img" src="${relImg}" alt="${rel.name}" />`
            : `<span class="thumb-badge">${getProductAssetPath(rel)}</span>`;

          return `
            <a class="related-card" href="${relHref}">
              <div class="related-card__media">${mediaHtml}</div>
              <div>
                <h3 class="related-card__title">${rel.name}</h3>
                <p class="related-card__price">${formatPrice(rel.price, rel.currency)}</p>
              </div>
            </a>
          `;
        })
        .join("");
    }
  }

  function initCartPage(state) {
    if (document.body.dataset.page !== "carrito") return;

    const listEl = document.getElementById("cart-items-list");
    const countEl = document.getElementById("cart-items-count");
    const subtotalEl = document.getElementById("cart-subtotal-value");
    const totalEl = document.getElementById("cart-total-value");
    const checkoutBtn = document.getElementById("cart-checkout-btn");
    const clearAllBtn = document.getElementById("cart-clear-all-btn");
    const feedbackEl = document.getElementById("cart-feedback");
    const saleBannerEl = document.getElementById("cart-sale-confirmation");

    if (!listEl || !countEl || !subtotalEl || !totalEl || !checkoutBtn) return;

    const msgs = getWhatsAppMessages();
    let waCartLink = document.getElementById("cart-wa-coordinate-link");
    if (!waCartLink && checkoutBtn.parentElement) {
      waCartLink = document.createElement("a");
      waCartLink.id = "cart-wa-coordinate-link";
      waCartLink.className = "wa-inline-link";
      waCartLink.target = "_blank";
      waCartLink.rel = "noopener noreferrer";
      waCartLink.style.marginTop = "10px";
      waCartLink.textContent = "Coordinar pedido por WhatsApp ->";
      checkoutBtn.parentElement.appendChild(waCartLink);
    }

    function getResolvedCartLines() {
      const lines = [];
      let changed = false;

      state.cart = state.cart.filter((entry) => {
        const prod = state.products.find((p) => p.id === entry.productId && p.published !== false);
        const qty = Math.floor(Number(entry.qty) || 0);
        if (!prod || qty <= 0) {
          changed = true;
          return false;
        }
        const subtotal = prod.price * qty;
        lines.push({ product: prod, qty, subtotal });
        return true;
      });

      if (changed) {
        saveState(state);
        updateCartCounter(state);
      }
      return lines;
    }

    function setFeedback(msg) {
      if (!feedbackEl) return;
      feedbackEl.textContent = msg || "";
    }

    function renderCart() {
      const lines = getResolvedCartLines();
      const totalUnits = lines.reduce((sum, l) => sum + l.qty, 0);
      const totalAmount = lines.reduce((sum, l) => sum + l.subtotal, 0);

      countEl.textContent = `${totalUnits} ${totalUnits === 1 ? "producto" : "productos"}`;
      subtotalEl.textContent = formatPrice(totalAmount, "Bs");
      totalEl.textContent = formatPrice(totalAmount, "Bs");
      updateCartCounter(state);

      if (waCartLink) {
        waCartLink.href =
          lines.length > 0
            ? buildWhatsAppUrl(msgs.cart(lines, totalAmount))
            : buildWhatsAppUrl(msgs.general);
      }

      if (clearAllBtn) {
        clearAllBtn.disabled = lines.length === 0;
      }
      checkoutBtn.disabled = lines.length === 0;

      if (lines.length === 0) {
        listEl.innerHTML = `
          <div class="cart-empty-box">
            <h2 class="cart-empty-box__title">Tu carrito estÃ¡ vacÃ­o</h2>
            <p class="cart-empty-box__desc">Explora el catÃ¡logo o revisa el detalle de un producto para agregar artÃ­culos.</p>
            <a class="btn btn--primary" href="./catalogo.html">Ir al catÃ¡logo <span aria-hidden="true">-&gt;</span></a>
          </div>
        `;
        return;
      }

      listEl.innerHTML = lines
        .map(({ product, qty, subtotal }) => {
          const detailHref = `./producto.html?id=${encodeURIComponent(product.id)}`;
          const imgSrc = product.image ? resolveUrl(product.image) : "";
          const mediaHtml = imgSrc
            ? `<img class="product-card__img" src="${imgSrc}" alt="${product.name}" />`
            : `<span class="thumb-badge">${getProductAssetPath(product)}</span>`;

          const exceedsStock = qty > product.stock;
          const stockText =
            product.stock <= 0
              ? "Sin stock disponible"
              : exceedsStock
              ? `Stock insuficiente (disponibles: ${product.stock})`
              : `En stock (${product.stock} disp.)`;

          return `
            <article class="cart-item-card" data-cart-product="${product.id}">
              <a class="cart-item-media" href="${detailHref}">${mediaHtml}</a>

              <div>
                <h3 class="cart-item-title"><a href="${detailHref}">${product.name}</a></h3>
                <p class="cart-item-meta">${product.categoryLabel} Â· Unitario: ${formatPrice(product.price, product.currency)}</p>
                <p class="cart-item-stock ${exceedsStock || product.stock <= 0 ? "is-warn" : ""}">${stockText}</p>
                <button class="cart-item-remove" type="button" data-remove-item="${product.id}">Eliminar</button>
              </div>

              <div class="cart-item-right">
                <span class="cart-item-subtotal">${formatPrice(subtotal, product.currency)}</span>
                <div class="qty-stepper" aria-label="Cantidad de ${product.name}">
                  <button class="qty-stepper__btn" type="button" data-cart-dec="${product.id}" aria-label="Disminuir cantidad">âˆ’</button>
                  <input
                    class="qty-stepper__input"
                    type="number"
                    min="1"
                    max="${Math.max(1, product.stock)}"
                    value="${qty}"
                    data-cart-qty-input="${product.id}"
                    aria-label="Cantidad de ${product.name}"
                  />
                  <button class="qty-stepper__btn" type="button" data-cart-inc="${product.id}" aria-label="Aumentar cantidad">+</button>
                </div>
                <span class="cart-item-unit">${qty} Ã— ${formatPrice(product.price, product.currency)}</span>
              </div>
            </article>
          `;
        })
        .join("");

      listEl.querySelectorAll("[data-cart-dec]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const prodId = btn.getAttribute("data-cart-dec");
          const entry = state.cart.find((c) => c.productId === prodId);
          if (!entry) return;
          setFeedback("");
          if (entry.qty <= 1) {
            state.cart = state.cart.filter((c) => c.productId !== prodId);
          } else {
            entry.qty -= 1;
          }
          saveState(state);
          renderCart();
        });
      });

      listEl.querySelectorAll("[data-cart-inc]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const prodId = btn.getAttribute("data-cart-inc");
          const entry = state.cart.find((c) => c.productId === prodId);
          const prod = state.products.find((p) => p.id === prodId);
          if (!entry || !prod) return;

          if (entry.qty + 1 > prod.stock) {
            setFeedback(`No hay mÃ¡s stock disponible para "${prod.name}" (mÃ¡ximo: ${prod.stock}).`);
            return;
          }
          setFeedback("");
          entry.qty += 1;
          saveState(state);
          renderCart();
        });
      });

      listEl.querySelectorAll("[data-cart-qty-input]").forEach((input) => {
        input.addEventListener("change", () => {
          const prodId = input.getAttribute("data-cart-qty-input");
          const entry = state.cart.find((c) => c.productId === prodId);
          const prod = state.products.find((p) => p.id === prodId);
          if (!entry || !prod) return;

          let nextQty = Math.floor(Number(input.value) || 1);
          if (nextQty < 1) nextQty = 1;
          if (nextQty > prod.stock) {
            setFeedback(`Cantidad ajustada al stock disponible de "${prod.name}" (${prod.stock}).`);
            nextQty = Math.max(1, prod.stock);
          } else {
            setFeedback("");
          }
          entry.qty = nextQty;
          saveState(state);
          renderCart();
        });
      });

      listEl.querySelectorAll("[data-remove-item]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const prodId = btn.getAttribute("data-remove-item");
          state.cart = state.cart.filter((c) => c.productId !== prodId);
          setFeedback("");
          saveState(state);
          renderCart();
        });
      });
    }

    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", () => {
        if (state.cart.length === 0) return;
        state.cart = [];
        setFeedback("");
        saveState(state);
        renderCart();
      });
    }

    checkoutBtn.addEventListener("click", () => {
      const lines = getResolvedCartLines();
      if (lines.length === 0) {
        setFeedback("Tu carrito estÃ¡ vacÃ­o. Agrega productos antes de finalizar la compra.");
        return;
      }

      const insufficient = lines.find(({ product, qty }) => qty <= 0 || qty > product.stock);
      if (insufficient) {
        setFeedback(
          `Stock insuficiente para "${insufficient.product.name}". Disponible: ${insufficient.product.stock}, en carrito: ${insufficient.qty}.`
        );
        return;
      }

      const saleItems = [];
      let saleTotal = 0;

      lines.forEach(({ product, qty }) => {
        const targetProd = state.products.find((p) => p.id === product.id);
        if (targetProd) {
          targetProd.stock = Math.max(0, targetProd.stock - qty);
        }
        const lineSubtotal = product.price * qty;
        saleTotal += lineSubtotal;
        saleItems.push({
          productId: product.id,
          name: product.name,
          categoryLabel: product.categoryLabel,
          qty,
          unitPrice: product.price,
          currency: product.currency,
          subtotal: lineSubtotal
        });
      });

      const saleRecord = {
        id: `JV-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString(),
        status: "Completada",
        mode: "DEMOSTRACIÃ“N ACADÃ‰MICA",
        items: saleItems,
        total: saleTotal,
        currency: "Bs"
      };

      state.sales.unshift(saleRecord);
      state.cart = [];
      saveState(state);
      setFeedback("");

      if (saleBannerEl) {
        const afterSaleUrl = buildWhatsAppUrl(msgs.afterSale(saleRecord));
        saleBannerEl.hidden = false;
        saleBannerEl.innerHTML = `
          <strong>Compra de demostraciÃ³n registrada (${saleRecord.id})</strong> â€” Total: <strong>${formatPrice(saleRecord.total, saleRecord.currency)}</strong>.
          Se descontaron las unidades del inventario y se guardÃ³ en el historial demo.
          <a href="${afterSaleUrl}" target="_blank" rel="noopener noreferrer" style="margin-left:8px; font-weight:700; text-decoration:underline;">Consultar disponibilidad y entrega por WhatsApp</a>
          <a href="./admin.html?login=1" style="margin-left:8px; font-weight:700; text-decoration:underline;">Ver ventas en panel</a>
        `;
      }

      renderCart();
    });

    renderCart();
  }

  function hasOwnerDemoSession() {
    try {
      const raw = localStorage.getItem(OWNER_SESSION_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return Boolean(parsed && parsed.user === OWNER_USER);
    } catch (_err) {
      return false;
    }
  }

  function categorySlugToLabel(slug) {
    const map = {
      videojuegos: "VIDEOJUEGOS",
      tecnologia: "TECNOLOGÃA",
      accesorios: "ACCESORIOS",
      "anime-figuras": "ANIME & FIGURAS"
    };
    return map[slug] || "TECNOLOGÃA";
  }

  function initAdminPage(state) {
    if (document.body.dataset.page !== "admin") return;

    const gateEl = document.getElementById("admin-auth-gate");
    const shellEl = document.getElementById("admin-shell");
    const gateForm = document.getElementById("admin-gate-form");
    const gateUser = document.getElementById("admin-gate-user");
    const gatePass = document.getElementById("admin-gate-pass");
    const gateError = document.getElementById("admin-gate-error");
    const logoutBtn = document.getElementById("admin-logout-btn");

    function syncAuth() {
      const ok = hasOwnerDemoSession();
      if (gateEl) gateEl.hidden = ok;
      if (shellEl) shellEl.hidden = !ok;
    }

    if (gateForm && gateUser && gatePass && gateError) {
      gateForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (gateUser.value.trim() === OWNER_USER && gatePass.value === OWNER_PASS) {
          try {
            localStorage.setItem(OWNER_SESSION_KEY, JSON.stringify({ user: OWNER_USER }));
          } catch (_err) {}
          gateError.textContent = "";
          syncAuth();
        } else {
          gateError.textContent = "Usuario o contraseÃ±a incorrectos.";
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        try { localStorage.removeItem(OWNER_SESSION_KEY); } catch (_err) {}
        syncAuth();
      });
    }
    syncAuth();

    const tabButtons = Array.from(document.querySelectorAll("[data-admin-tab]"));
    const viewInv = document.getElementById("admin-view-inventario");
    const viewVen = document.getElementById("admin-view-ventas");
    const viewReg = document.getElementById("admin-view-registro");
    const crumbEl = document.getElementById("admin-current-crumb");
    const TITLES = { inventario: "Inventario", ventas: "Ventas", registro: "Registro de productos" };

    let renderSalesFn = null;
    let renderInvFn = null;
    let openEditInRegistroFn = null;
    let refreshRegistroSelectorFn = null;

    function setTab(tab) {
      const active = TITLES[tab] ? tab : document.body.dataset.adminSection || "registro";
      tabButtons.forEach((b) => b.classList.toggle("is-active", b.dataset.adminTab === active));
      if (viewInv) viewInv.hidden = active !== "inventario";
      if (viewVen) viewVen.hidden = active !== "ventas";
      if (viewReg) viewReg.hidden = active !== "registro";
      if (crumbEl) crumbEl.textContent = TITLES[active];
      if (active === "ventas" && typeof renderSalesFn === "function") renderSalesFn();
      if (active === "inventario" && typeof renderInvFn === "function") renderInvFn();
      if (active === "registro" && typeof refreshRegistroSelectorFn === "function") refreshRegistroSelectorFn();
    }

    tabButtons.forEach((b) => b.addEventListener("click", () => setTab(b.dataset.adminTab)));
    const newBtn = document.getElementById("inv-new-product-btn");
    if (newBtn) newBtn.addEventListener("click", () => setTab("registro"));

    /* --- Inventario privado (Plantilla 5) --- */
    const kpiTotal = document.getElementById("kpi-total-products");
    const kpiAvail = document.getElementById("kpi-available-products");
    const kpiUnits = document.getElementById("kpi-available-units");
    const kpiLow = document.getElementById("kpi-low-stock");
    const kpiOut = document.getElementById("kpi-out-of-stock");
    const tbody = document.getElementById("inv-products-tbody");
    const countEl = document.getElementById("inv-table-count");
    const qInput = document.getElementById("inv-search-input");
    const catSel = document.getElementById("inv-category-filter");
    const stockSel = document.getElementById("inv-stock-filter");

    const editPanel = document.getElementById("inv-edit-panel");
    const editForm = document.getElementById("inv-edit-form");
    const editId = document.getElementById("inv-edit-id");
    const editTitle = document.getElementById("inv-edit-title");
    const editName = document.getElementById("inv-edit-name");
    const editPrice = document.getElementById("inv-edit-price");
    const editStock = document.getElementById("inv-edit-stock");
    const editPub = document.getElementById("inv-edit-published");
    const editOffer = document.getElementById("inv-edit-offer");
    const editCancel = document.getElementById("inv-edit-cancel");

    if (editCancel && editPanel) {
      editCancel.addEventListener("click", () => { editPanel.hidden = true; });
    }

    function updateKpis() {
      const total = state.products.length;
      const avail = state.products.filter((p) => p.stock > 0).length;
      const units = state.products.reduce((s, p) => s + (Number(p.stock) || 0), 0);
      const low = state.products.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD).length;
      const out = state.products.filter((p) => p.stock <= 0).length;

      if (kpiTotal) kpiTotal.textContent = String(total);
      if (kpiAvail) kpiAvail.textContent = String(avail);
      if (kpiUnits) kpiUnits.textContent = `${units} unidades en stock`;
      if (kpiLow) kpiLow.textContent = String(low);
      if (kpiOut) kpiOut.textContent = String(out);
    }

    renderInvFn = function renderInv() {
      updateKpis();
      if (!tbody) return;

      const term = qInput ? qInput.value.trim().toLowerCase() : "";
      const cat = catSel ? catSel.value : "todas";
      const st = stockSel ? stockSel.value : "todos";

      const list = state.products.filter((p) => {
        if (cat !== "todas" && p.categorySlug !== cat) return false;
        if (st === "disponible" && p.stock <= 0) return false;
        if (st === "bajo" && !(p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD)) return false;
        if (st === "agotado" && p.stock > 0) return false;
        if (term) {
          const hay = `${p.name} ${p.sku || ""} ${p.categoryLabel} ${p.id}`.toLowerCase();
          if (!hay.includes(term)) return false;
        }
        return true;
      });

      if (countEl) countEl.textContent = `${list.length} productos en vista (total registrados: ${state.products.length})`;

      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--color-gray);">Sin productos para este filtro.</td></tr>`;
        return;
      }

      tbody.innerHTML = list.map((p) => {
        const isOut = p.stock <= 0;
        const isLow = !isOut && p.stock <= LOW_STOCK_THRESHOLD;
        const rowCls = isOut ? "is-out-row" : isLow ? "is-low-row" : "";
        const availLbl = isOut ? "Agotado" : isLow ? "Stock bajo Â· Disponible" : "Disponible";
        const pillCls = isOut ? "inv-status-pill--out" : isLow ? "inv-status-pill--low" : "inv-status-pill--ok";
        const pubLbl = p.published === false ? "Oculto" : "Publicado";

        return `
          <tr class="${rowCls}">
            <td>
              <div class="inv-prod-cell">
                <span class="inv-prod-thumb">${p.categoryLabel.slice(0, 4)}</span>
                <div>
                  <span class="inv-prod-name">${p.name}</span>
                  <span class="inv-prod-sku">${p.sku || p.id}</span>
                </div>
              </div>
            </td>
            <td>${p.categoryLabel}</td>
            <td><strong>${formatPrice(p.price, p.currency)}</strong></td>
            <td><strong>${p.stock}</strong></td>
            <td>
              <span class="inv-status-pill ${pillCls}">${availLbl}</span>
              <span style="display:block;font-size:10px;color:var(--color-gray-muted);margin-top:2px;">${pubLbl}</span>
            </td>
            <td><button class="inv-edit-link" type="button" data-inv-edit="${p.id}">Editar -&gt;</button></td>
          </tr>
        `;
      }).join("");

      tbody.querySelectorAll("[data-inv-edit]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const prod = state.products.find((x) => x.id === btn.dataset.invEdit);
          if (!prod || !editPanel || !editId) return;
          editId.value = prod.id;
          if (editTitle) editTitle.textContent = `Editar: ${prod.name}`;
          if (editName) editName.value = prod.name;
          if (editPrice) editPrice.value = String(prod.price);
          if (editStock) editStock.value = String(prod.stock);
          if (editPub) editPub.value = String(prod.published !== false);
          if (editOffer) editOffer.checked = Boolean(prod.offer);
          editPanel.hidden = false;
        });
      });
    };

    if (editForm && editId) {
      editForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const prod = state.products.find((x) => x.id === editId.value);
        if (!prod) return;
        if (editName && editName.value.trim()) prod.name = editName.value.trim();
        if (editPrice) prod.price = Math.max(0, Number(editPrice.value) || 0);
        if (editStock) prod.stock = Math.max(0, Math.floor(Number(editStock.value) || 0));
        if (editPub) prod.published = editPub.value === "true";
        if (editOffer) prod.offer = editOffer.checked;
        saveState(state);
        if (editPanel) editPanel.hidden = true;
        renderInvFn();
      });
    }

    if (qInput) qInput.addEventListener("input", renderInvFn);
    if (catSel) catSel.addEventListener("change", renderInvFn);
    if (stockSel) stockSel.addEventListener("change", renderInvFn);

    /* --- Ventas privadas (Plantilla 6) --- */
    const salesIncomeEl = document.getElementById("sales-kpi-income");
    const salesIncomeSubEl = document.getElementById("sales-kpi-income-sub");
    const salesTotalAmtEl = document.getElementById("sales-kpi-total-amount");
    const salesOpsEl = document.getElementById("sales-kpi-ops-count");
    const salesUnitsEl = document.getElementById("sales-kpi-units-count");
    const salesAvgEl = document.getElementById("sales-kpi-avg");
    const salesSearchEl = document.getElementById("sales-search-input");
    const salesTbodyEl = document.getElementById("sales-history-tbody");
    const salesCountEl = document.getElementById("sales-table-count");
    const salesPillBtns = Array.from(document.querySelectorAll("[data-sales-status]"));

    let activeSalesStatus = "todas";

    function updateSalesKpis() {
      const salesList = Array.isArray(state.sales) ? state.sales : [];
      const opsCount = salesList.length;
      const totalAmount = salesList.reduce((s, v) => s + (Number(v.total) || 0), 0);
      const totalUnits = salesList.reduce(
        (s, v) => s + (Array.isArray(v.items) ? v.items.reduce((acc, it) => acc + (Number(it.qty) || 0), 0) : 0),
        0
      );
      const avg = opsCount > 0 ? Math.round(totalAmount / opsCount) : 0;

      if (salesIncomeEl) salesIncomeEl.textContent = formatPrice(totalAmount, "Bs");
      if (salesIncomeSubEl) salesIncomeSubEl.textContent = `${opsCount} ${opsCount === 1 ? "operaciÃ³n registrada" : "operaciones registradas"}`;
      if (salesTotalAmtEl) salesTotalAmtEl.textContent = formatPrice(totalAmount, "Bs");
      if (salesOpsEl) salesOpsEl.textContent = String(opsCount);
      if (salesUnitsEl) salesUnitsEl.textContent = `${totalUnits} ${totalUnits === 1 ? "unidad vendida" : "unidades vendidas"}`;
      if (salesAvgEl) salesAvgEl.textContent = formatPrice(avg, "Bs");
    }

    renderSalesFn = function renderSales() {
      updateSalesKpis();
      if (!salesTbodyEl) return;

      const salesList = Array.isArray(state.sales) ? state.sales : [];
      const q = salesSearchEl ? salesSearchEl.value.trim().toLowerCase() : "";

      const filtered = salesList.filter((sale) => {
        const st = sale.status || "Completada";
        if (activeSalesStatus !== "todas" && st !== activeSalesStatus) return false;
        if (q) {
          const itemsTxt = Array.isArray(sale.items)
            ? sale.items.map((i) => `${i.name} x${i.qty}`).join(" ")
            : "";
          const hay = `${sale.id || ""} ${itemsTxt} ${st}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });

      if (salesCountEl) {
        salesCountEl.textContent = `${filtered.length} ${filtered.length === 1 ? "registro" : "registros"} (total historial: ${salesList.length})`;
      }

      if (filtered.length === 0) {
        salesTbodyEl.innerHTML = `
          <tr>
            <td colspan="5" style="text-align:center;padding:24px;color:var(--color-gray);">
              No hay compras de demostraciÃ³n registradas aÃºn. Finaliza una compra desde el carrito para verla aquÃ­.
            </td>
          </tr>
        `;
        return;
      }

      salesTbodyEl.innerHTML = filtered.map((sale) => {
        const st = sale.status || "Completada";
        const badgeCls =
          st === "Pendiente"
            ? "sales-badge--pending"
            : st === "Cancelada"
            ? "sales-badge--cancel"
            : "sales-badge--ok";

        const itemsHtml = Array.isArray(sale.items) && sale.items.length > 0
          ? sale.items.map((it) => `${it.name} <strong>(Ã—${it.qty})</strong>`).join(" Â· ")
          : "Sin detalle de Ã­tems";

        return `
          <tr>
            <td><strong>#${sale.id}</strong></td>
            <td>${formatSaleDate(sale.date)}</td>
            <td>${itemsHtml}</td>
            <td><strong>${formatPrice(sale.total, sale.currency || "Bs")}</strong></td>
            <td><span class="sales-badge ${badgeCls}">${st}</span></td>
          </tr>
        `;
      }).join("");
    };

    salesPillBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        activeSalesStatus = btn.dataset.salesStatus || "todas";
        salesPillBtns.forEach((b) => b.classList.toggle("is-active", b === btn));
        renderSalesFn();
      });
    });

    if (salesSearchEl) salesSearchEl.addEventListener("input", renderSalesFn);

    /* --- Registro de productos (Plantilla 7) --- */
    const regForm = document.getElementById("reg-product-form");
    const regTabNuevo = document.getElementById("reg-tab-nuevo");
    const regTabEditar = document.getElementById("reg-tab-editar");
    const regSelectorWrap = document.getElementById("reg-edit-selector-wrap");
    const regExistingSelect = document.getElementById("reg-existing-select");
    const regEditingId = document.getElementById("reg-editing-id");
    const regName = document.getElementById("reg-name");
    const regCategory = document.getElementById("reg-category");
    const regSku = document.getElementById("reg-sku");
    const regDesc = document.getElementById("reg-description");
    const regPrice = document.getElementById("reg-price");
    const regStock = document.getElementById("reg-stock");
    const regStatus = document.getElementById("reg-status");
    const regCollection = document.getElementById("reg-collection");
    const regPublished = document.getElementById("reg-published");
    const regImagePath = document.getElementById("reg-image-path");
    const regSubmitBtn = document.getElementById("reg-submit-btn");
    const regResetBtn = document.getElementById("reg-reset-btn");
    const regFeedback = document.getElementById("reg-feedback");

    const prevCode = document.getElementById("reg-preview-code");
    const prevCat = document.getElementById("reg-preview-cat");
    const prevTitle = document.getElementById("reg-preview-title");
    const prevPrice = document.getElementById("reg-preview-price");
    const prevStock = document.getElementById("reg-preview-stock");

    let regMode = "nuevo";

    function syncRegistroPreview() {
      const nameVal = regName && regName.value.trim() ? regName.value.trim() : "Nuevo producto JVMA";
      const skuVal = regSku && regSku.value.trim() ? regSku.value.trim().toUpperCase() : "JV-NEW-001";
      const catSlug = regCategory ? regCategory.value : "videojuegos";
      const catLbl = categorySlugToLabel(catSlug);
      const priceVal = regPrice ? Math.max(0, Number(regPrice.value) || 0) : 0;
      const stockVal = regStock ? Math.max(0, Math.floor(Number(regStock.value) || 0)) : 0;
      const pubVal = regPublished ? regPublished.checked : true;

      if (prevCode) prevCode.textContent = skuVal;
      if (prevCat) prevCat.textContent = catLbl;
      if (prevTitle) prevTitle.textContent = nameVal;
      if (prevPrice) prevPrice.textContent = formatPrice(priceVal, "Bs");
      if (prevStock) {
        prevStock.textContent = `Stock: ${stockVal} ${stockVal === 1 ? "unidad" : "unidades"} Â· ${pubVal ? "Visible en catÃ¡logo" : "Oculto"}`;
      }
    }

    function loadProductIntoRegistroForm(prod) {
      if (!prod) return;
      if (regEditingId) regEditingId.value = prod.id;
      if (regName) regName.value = prod.name;
      if (regCategory) regCategory.value = prod.categorySlug || "tecnologia";
      if (regSku) regSku.value = prod.sku || "";
      if (regDesc) regDesc.value = prod.description || "";
      if (regPrice) regPrice.value = String(prod.price);
      if (regStock) regStock.value = String(prod.stock);
      if (regStatus) regStatus.value = prod.status || "Activo";
      if (regCollection) {
        if (prod.featured && prod.offer) regCollection.value = "both";
        else if (prod.featured) regCollection.value = "featured";
        else if (prod.offer) regCollection.value = "offer";
        else regCollection.value = prod.collection || "general";
      }
      if (regPublished) regPublished.checked = prod.published !== false;
      if (regImagePath) regImagePath.value = prod.image || "";
      syncRegistroPreview();
    }

    function resetRegistroFormToNew() {
      if (regEditingId) regEditingId.value = "";
      if (regForm) regForm.reset();
      if (regPrice) regPrice.value = "0";
      if (regStock) regStock.value = "0";
      if (regPublished) regPublished.checked = true;
      if (regSku) {
        const nextNum = String(state.products.length + 1).padStart(3, "0");
        regSku.value = `JV-NEW-${nextNum}`;
      }
      syncRegistroPreview();
    }

    refreshRegistroSelectorFn = function refreshRegistroSelector() {
      if (!regExistingSelect) return;
      regExistingSelect.innerHTML = state.products
        .map((p) => `<option value="${p.id}">${p.name} (${p.sku || p.id})</option>`)
        .join("");
      if (regMode === "editar" && state.products.length > 0) {
        const currentId = regEditingId && regEditingId.value ? regEditingId.value : state.products[0].id;
        const found = state.products.find((p) => p.id === currentId) || state.products[0];
        regExistingSelect.value = found.id;
        loadProductIntoRegistroForm(found);
      }
    };

    function setRegMode(mode) {
      regMode = mode === "editar" ? "editar" : "nuevo";
      if (regTabNuevo) {
        regTabNuevo.classList.toggle("is-active", regMode === "nuevo");
        regTabNuevo.setAttribute("aria-selected", String(regMode === "nuevo"));
      }
      if (regTabEditar) {
        regTabEditar.classList.toggle("is-active", regMode === "editar");
        regTabEditar.setAttribute("aria-selected", String(regMode === "editar"));
      }
      if (regSelectorWrap) regSelectorWrap.hidden = regMode !== "editar";
      if (regSubmitBtn) {
        regSubmitBtn.textContent = regMode === "editar" ? "Guardar cambios" : "Guardar producto";
      }
      if (regFeedback) regFeedback.textContent = "";

      if (regMode === "editar") {
        refreshRegistroSelectorFn();
      } else {
        resetRegistroFormToNew();
      }
    }

    openEditInRegistroFn = function openEditInRegistro(prodId) {
      setTab("registro");
      setRegMode("editar");
      const found = state.products.find((p) => p.id === prodId);
      if (found && regExistingSelect) {
        regExistingSelect.value = found.id;
        loadProductIntoRegistroForm(found);
      }
    };

    if (regTabNuevo) regTabNuevo.addEventListener("click", () => setRegMode("nuevo"));
    if (regTabEditar) regTabEditar.addEventListener("click", () => setRegMode("editar"));
    if (regExistingSelect) {
      regExistingSelect.addEventListener("change", () => {
        const found = state.products.find((p) => p.id === regExistingSelect.value);
        if (found) loadProductIntoRegistroForm(found);
      });
    }
    if (regResetBtn) {
      regResetBtn.addEventListener("click", () => {
        if (regFeedback) regFeedback.textContent = "";
        if (regMode === "editar") refreshRegistroSelectorFn();
        else resetRegistroFormToNew();
      });
    }

    [regName, regCategory, regSku, regPrice, regStock, regPublished].forEach((el) => {
      if (!el) return;
      el.addEventListener("input", syncRegistroPreview);
      el.addEventListener("change", syncRegistroPreview);
    });

    if (regForm) {
      regForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const nameVal = regName ? regName.value.trim() : "";
        if (!nameVal) {
          if (regFeedback) regFeedback.textContent = "Ingresa el nombre del producto.";
          if (regName) regName.focus();
          return;
        }

        const catSlug = regCategory ? regCategory.value : "tecnologia";
        const catLbl = categorySlugToLabel(catSlug);
        const skuVal = regSku && regSku.value.trim() ? regSku.value.trim().toUpperCase() : `JV-${Date.now().toString().slice(-4)}`;
        const descVal = regDesc ? regDesc.value.trim() : "";
        const priceVal = regPrice ? Math.max(0, Number(regPrice.value) || 0) : 0;
        const stockVal = regStock ? Math.max(0, Math.floor(Number(regStock.value) || 0)) : 0;
        const statusVal = regStatus ? regStatus.value : "Activo";
        const colVal = regCollection ? regCollection.value : "general";
        const pubVal = regPublished ? regPublished.checked && statusVal !== "Borrador" : false;
        const imgVal = regImagePath ? regImagePath.value.trim() : "";

        const isFeatured = colVal === "featured" || colVal === "both";
        const isOffer = colVal === "offer" || colVal === "both";

        if (regMode === "editar" && regEditingId && regEditingId.value) {
          const idx = state.products.findIndex((p) => p.id === regEditingId.value);
          if (idx >= 0) {
            state.products[idx] = normalizeProduct(
              {
                ...state.products[idx],
                name: nameVal,
                sku: skuVal,
                categorySlug: catSlug,
                categoryLabel: catLbl,
                description: descVal,
                price: priceVal,
                stock: stockVal,
                status: statusVal,
                collection: colVal,
                featured: isFeatured,
                offer: isOffer,
                published: pubVal,
                image: imgVal
              },
              idx
            );
            saveState(state);
            renderInvFn();
            renderFeaturedProducts(state);
            if (regFeedback) regFeedback.textContent = `Cambios guardados en "${nameVal}" y sincronizados con el catÃ¡logo.`;
          }
        } else {
          const slugBase = nameVal
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 24);
          const newId = `prod-${slugBase || "item"}-${Date.now().toString().slice(-4)}`;
          const newProd = normalizeProduct(
            {
              id: newId,
              sku: skuVal,
              name: nameVal,
              categorySlug: catSlug,
              categoryLabel: catLbl,
              description: descVal,
              price: priceVal,
              stock: stockVal,
              status: statusVal,
              collection: colVal,
              featured: isFeatured,
              offer: isOffer,
              published: pubVal,
              image: imgVal,
              placeholderLabel: `${catLbl} Â· JVMA`,
              placeholderFile: "../assets/img/producto.png"
            },
            state.products.length
          );

          state.products.unshift(newProd);
          saveState(state);
          renderInvFn();
          renderFeaturedProducts(state);
          if (regFeedback) regFeedback.textContent = `Producto "${nameVal}" registrado y sincronizado con inventario y catÃ¡logo.`;
          resetRegistroFormToNew();
        }
      });
    }

    // Permitir abrir ediciÃ³n desde Inventario directamente o en panel rÃ¡pido
    if (typeof openEditInRegistroFn === "function" && tbody) {
      tbody.addEventListener("dblclick", (ev) => {
        const btn = ev.target.closest("[data-inv-edit]");
        if (btn) openEditInRegistroFn(btn.dataset.invEdit);
      });
    }

    renderInvFn();
    renderSalesFn();
    setRegMode("nuevo");
    setTab(document.body.dataset.adminSection || "registro");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const state = loadState();
    updateCartCounter(state);
    initGlobalWhatsAppLinks();
    renderFeaturedProducts(state);
    initSearchForm();
    initNewsletterForm(state);
    initOwnerAccessModal();
    initCatalogPage(state);
    initProductDetailPage(state);
    initCartPage(state);
    initAdminPage(state);
  });
})();



