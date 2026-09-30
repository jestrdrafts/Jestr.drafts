/* =========================================================
   jestr.drafts — main site script
   Renders products, handles the order page (with email
   sending via Formspree), and the custom idea form.
   ========================================================= */

/* ---------- PASTE YOUR FORMSPREE FORM ID HERE ---------- */
const FORMSPREE_ID = 'mwlpaegg';

/* ---------- Products ---------- */
const PRODUCTS = [
  {
    slug: 'lord-pretty-flacko-joedy',
    name: 'LORD PRETTY FLACKO JOEDY',
    tag: 'limited edition',
    front: 'flacko-front.webp',
    back:  'flacko-back.webp',
    premiumPrice: 110,
    standardPrice: 80,
  },
  {
    slug: 'twizzy-mentality',
    name: 'TWIZZY MENTALITY',
    tag: 'limited edition',
    front: 'twizzy-front.webp',
    back:  'twizzy-back.webp',
    premiumPrice: 110,
    standardPrice: 80,
  },
  {
    slug: 'tyler-igor-oversized',
    name: 'TYLER IGOR OVERSIZED',
    tag: 'limited edition',
    front: 'igor-front.webp',
    back:  'igor-back.webp',
    premiumPrice: 110,
    standardPrice: 80,
  },
  {
    slug: 'modern-slavery-oversized',
    name: 'MODERN SLAVERY OVERSIZED',
    tag: 'limited edition',
    front: 'modern-slavery.webp',
    back:  'modern-slavery.webp',
    premiumPrice: 110,
    standardPrice: 80,
  },
  {
    slug: 'in-future-we-trust',
    name: 'IN FUTURE WE TRUST',
    tag: 'limited edition',
    front: 'future-front.webp',
    back:  'future-back.webp',
    premiumPrice: 110,
    standardPrice: 80,
  },
];

/* ---------- Order page options ---------- */
const COLOURS = [
  { value: 'black', label: 'black',        swatch: '#111111' },
  { value: 'white', label: 'white',        swatch: '#f5f5f0' },
  { value: 'cream', label: 'cream',        swatch: '#e2d8c3' },
  { value: 'grey',  label: 'heather grey', swatch: '#9a9a9a' },
];
const SIZES  = ['S', 'M', 'L', 'XL', 'XXL'];
const COLORS = ['#0a0a0a', '#f5f5f0', '#e63946', '#ffd60a', '#3a86ff'];

/* ---------- Helpers ---------- */
const $  = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
const formatPrice = (n) => n + ' DT';

function toast(message, type) {
  type = type || 'success';
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = message;
  const box = $('#toaster');
  if (!box) return;
  box.appendChild(el);
  setTimeout(function () { el.remove(); }, 4000);
}

function placeholder(label) {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">' +
      '<rect width="100%" height="100%" fill="#1f1e18"/>' +
      '<text x="50%" y="50%" font-family="monospace" font-size="44" ' +
            'fill="#c8ff2e" text-anchor="middle" ' +
            'dominant-baseline="middle">' + label + '</text>' +
    '</svg>'
  );
}

function bindImageFallback(img, label) {
  if (!img) return;
  img.addEventListener('error', function onErr() {
    img.removeEventListener('error', onErr);
    img.src = placeholder(label);
  });
}

function isSingleImage(p) {
  return p.front === p.back;
}

/* =========================================================
   HOME PAGE
   ========================================================= */
function initHome() {
  if (!$('#product-grid')) return;

  const marquee = $('#marquee');
  if (marquee) {
    const words = ['from scratch made designs', 'print on demand', 'jestr.drafts', 'no stock'];
    const group = words.map(function (w) { return '<span>' + w + ' ✱</span>'; }).join('');
    marquee.innerHTML = group + group;
  }

  renderHomeProducts();
  initIdeaForm();
}

function renderHomeProducts() {
  const countEl = $('#product-count');
  const grid = $('#product-grid');
  if (!grid) return;

  if (countEl) countEl.textContent = PRODUCTS.length + ' available';
  grid.innerHTML = '';

  PRODUCTS.forEach(function (p) {
    const li = document.createElement('li');
    li.className = 'product-card';
    li.innerHTML =
      '<div class="product-media">' +
        '<img src="' + p.back + '" alt="' + p.name + ' back" ' +
             'data-front="' + p.front + '" data-back="' + p.back + '" ' +
             'loading="lazy" width="1000" height="1000" />' +
        '<span class="product-tag" data-side>back design</span>' +
        '<button type="button" class="switch-btn">⟳ switch photo</button>' +
      '</div>' +
      '<div class="product-body">' +
        '<span class="product-tag-label">' + p.tag + '</span>' +
        '<h3>' + p.name + '</h3>' +
        '<div class="price-grid">' +
          '<div class="price-row">' +
            '<span class="plabel">highest quality</span>' +
            '<span class="pvalue">' + p.premiumPrice + ' DT</span>' +
          '</div>' +
          '<div class="price-row standard">' +
            '<span class="plabel">standard quality</span>' +
            '<span class="pvalue">' + p.standardPrice + ' DT</span>' +
          '</div>' +
        '</div>' +
        '<a class="btn" href="order.html?product=' +
          encodeURIComponent(p.slug) + '&quality=premium">order this tee</a>' +
      '</div>';

    const img   = $('img', li);
    const tagEl = $('[data-side]', li);
    bindImageFallback(img, p.name);

    const oneImage = isSingleImage(p);
    if (oneImage) $('.switch-btn', li).textContent = '⟳ flip view';

    let showingBack = true;
    $('.switch-btn', li).addEventListener('click', function () {
      showingBack = !showingBack;
      if (oneImage) {
        img.classList.toggle('is-mirrored', !showingBack);
      } else {
        img.src = showingBack ? img.dataset.back : img.dataset.front;
      }
      tagEl.textContent = (showingBack ? 'back' : 'front') + ' design';
    });

    grid.appendChild(li);
  });
}

/* ---------- Idea form ---------- */
function initIdeaForm() {
  const form = $('#idea-form');
  if (!form) return;

  const canvas      = $('#idea-canvas');
  const ctx         = canvas.getContext('2d');
  const swatches    = $('#swatches');
  const sizeInput   = $('#brush-size');
  const textArea    = $('#idea-text');
  const phoneInput  = $('#idea-phone');
  const igInput     = $('#idea-ig');
  const downloadBtn = $('#idea-download');

  let tool = 'pen', color = COLORS[0], size = Number(sizeInput.value);
  let drawing = false, last = null, hasDrawn = false;

  function clearCanvas() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    hasDrawn = false;
  }

  $$('.tool-btn[data-tool]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      tool = btn.dataset.tool;
      $$('.tool-btn[data-tool]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
    });
  });

  COLORS.forEach(function (c) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'swatch';
    btn.style.background = c;
    btn.setAttribute('aria-label', c);
    btn.addEventListener('click', function () {
      color = c;
      tool = 'pen';
      $$('.swatch').forEach(function (s) { s.classList.toggle('active', s === btn); });
      $$('.tool-btn[data-tool]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.dataset.tool === 'pen'));
      });
    });
    if (c === COLORS[0]) btn.classList.add('active');
    swatches.appendChild(btn);
  });

  sizeInput.addEventListener('input', function () { size = Number(sizeInput.value); });
  $('#clear-canvas').addEventListener('click', clearCanvas);

  function posFromEvent(ev) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (ev.clientX - rect.left) * (canvas.width  / rect.width),
      y: (ev.clientY - rect.top)  * (canvas.height / rect.height),
    };
  }

  canvas.addEventListener('pointerdown', function (ev) {
    ev.preventDefault();
    canvas.setPointerCapture(ev.pointerId);
    drawing = true;
    last = posFromEvent(ev);
  });
  canvas.addEventListener('pointermove', function (ev) {
    if (!drawing) return;
    const next = posFromEvent(ev);
    ctx.beginPath();
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth   = tool === 'eraser' ? size * 4 : size;
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();
    last = next;
    hasDrawn = true;
  });
  canvas.addEventListener('pointerup',     function () { drawing = false; last = null; });
  canvas.addEventListener('pointerleave',  function () { drawing = false; last = null; });
  canvas.addEventListener('pointercancel', function () { drawing = false; last = null; });

  clearCanvas();

  downloadBtn.addEventListener('click', function () {
    const text  = textArea.value.trim();
    const phone = phoneInput.value.trim();
    const ig    = igInput.value.trim().replace(/^@/, '');

    if (!hasDrawn && !text) {
      toast('Draw something or write a description first.', 'error');
      return;
    }
    if (!phone) {
      toast('Add your phone number before downloading.', 'error');
      return;
    }
    if (!ig) {
      toast('Add your Instagram before downloading.', 'error');
      return;
    }

    const INFO_BLOCK_HEIGHT = 260;
    const out = document.createElement('canvas');
    out.width  = canvas.width;
    out.height = canvas.height + INFO_BLOCK_HEIGHT;
    const octx = out.getContext('2d');

    octx.fillStyle = '#ffffff';
    octx.fillRect(0, 0, out.width, out.height);
    octx.drawImage(canvas, 0, 0);

    const bandTop = canvas.height;
    octx.fillStyle = '#14140f';
    octx.fillRect(0, bandTop, out.width, INFO_BLOCK_HEIGHT);
    octx.fillStyle = '#c8ff2e';
    octx.fillRect(0, bandTop, out.width, 4);

    octx.fillStyle = '#c8ff2e';
    octx.font = '600 22px "Space Mono", "Courier New", monospace';
    octx.textBaseline = 'top';
    octx.fillText('JESTR.DRAFTS — DRAFT', 32, bandTop + 28);

    octx.fillStyle = '#f5f2e8';
    octx.font = '400 20px "Space Mono", "Courier New", monospace';

    let y = bandTop + 72;
    const lineHeight = 30;
    const maxWidth = out.width - 64;

    octx.fillText('PHONE: ' + phone, 32, y);
    y += lineHeight;
    octx.fillText('INSTAGRAM: @' + ig, 32, y);
    y += lineHeight;

    if (text) {
      const prefix = 'IDEA: ';
      const words = (prefix + text).split(/\s+/);
      let line = '';
      for (let i = 0; i < words.length; i++) {
        const test = line ? line + ' ' + words[i] : words[i];
        if (octx.measureText(test).width > maxWidth) {
          octx.fillText(line, 32, y);
          y += lineHeight;
          line = words[i];
          if (y > out.height - 30) break;
        } else {
          line = test;
        }
      }
      if (line && y <= out.height - 30) octx.fillText(line, 32, y);
    }

    const dataUrl = out.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'jestr-draft-' + ig + '-' + Date.now() + '.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast('Drawing downloaded with your details.', 'success');
  });
}

/* =========================================================
   ORDER PAGE
   ========================================================= */
function initOrder() {
  if (!$('#order-form')) return;

  const params    = new URLSearchParams(location.search);
  const slugIn    = params.get('product');
  const qualityIn = params.get('quality') === 'standard' ? 'standard' : 'premium';

  const state = {
    slug:    PRODUCTS.some(function (p) { return p.slug === slugIn; }) ? slugIn : PRODUCTS[0].slug,
    colour:  'black',
    size:    'L',
    quality: qualityIn,
    side:    'back',
  };

  function getProduct() {
    return PRODUCTS.find(function (p) { return p.slug === state.slug; });
  }

  const previewImg = $('#order-preview-img');
  const previewLbl = $('#preview-label');
  const toggleBtn  = $('#toggle-photo');
  bindImageFallback(previewImg, 'product preview');

  function refreshPreview() {
    const p = getProduct();
    const oneImage = isSingleImage(p);
    if (oneImage) state.side = 'back';
    previewImg.classList.toggle('is-mirrored', oneImage && state.side === 'front');
    previewImg.src = state.side === 'back' ? p.back : p.front;
    previewImg.alt = p.name + ' ' + state.side;
    previewLbl.textContent = state.side + ' design';
    toggleBtn.textContent = oneImage ? '⟳ flip view' : '⟳ switch photo';
  }

  toggleBtn.addEventListener('click', function () {
    const p = getProduct();
    const oneImage = isSingleImage(p);
    state.side = state.side === 'back' ? 'front' : 'back';
    if (oneImage) {
      previewImg.classList.toggle('is-mirrored', state.side === 'front');
    } else {
      previewImg.classList.remove('is-mirrored');
      previewImg.src = state.side === 'back' ? p.back : p.front;
    }
    previewImg.alt = p.name + ' ' + state.side;
    previewLbl.textContent = state.side + ' design';
  });

  const designList = $('#design-list');
  PRODUCTS.forEach(function (p) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'design-btn' + (p.slug === state.slug ? ' active' : '');
    btn.textContent = p.name;
    btn.addEventListener('click', function () {
      state.slug = p.slug;
      state.side = 'back';
      previewImg.classList.remove('is-mirrored');
      $$('.design-btn').forEach(function (b) { b.classList.toggle('active', b === btn); });
      refreshPreview();
      refreshTotal();
      const u = new URL(location.href);
      u.searchParams.set('product', p.slug);
      u.searchParams.set('quality', state.quality);
      history.replaceState(null, '', u);
    });
    designList.appendChild(btn);
  });

  const colourList = $('#colour-list');
  COLOURS.forEach(function (c) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'colour-btn' + (c.value === state.colour ? ' active' : '');
    btn.innerHTML = '<span class="colour-dot" style="background:' + c.swatch + '"></span>' + c.label;
    btn.addEventListener('click', function () {
      state.colour = c.value;
      $$('.colour-btn').forEach(function (b) { b.classList.toggle('active', b === btn); });
    });
    colourList.appendChild(btn);
  });

  const sizeList = $('#size-list');
  SIZES.forEach(function (s) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'size-btn' + (s === state.size ? ' active' : '');
    btn.textContent = s;
    btn.addEventListener('click', function () {
      state.size = s;
      $$('.size-btn').forEach(function (b) { b.classList.toggle('active', b === btn); });
    });
    sizeList.appendChild(btn);
  });

  const qualityList = $('#quality-list');
  [['premium', 'highest quality'], ['standard', 'standard quality']].forEach(function (pair) {
    const val = pair[0], label = pair[1];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quality-btn' + (val === state.quality ? ' active' : '');
    btn.dataset.value = val;
    btn.innerHTML = '<span class="qlabel">' + label + '</span><span class="qvalue"></span>';
    btn.addEventListener('click', function () {
      state.quality = val;
      $$('.quality-btn').forEach(function (b) { b.classList.toggle('active', b === btn); });
      refreshTotal();
    });
    qualityList.appendChild(btn);
  });

  const totalEl = $('#total-price');
  function refreshTotal() {
    const p = getProduct();
    const price = state.quality === 'premium' ? p.premiumPrice : p.standardPrice;
    totalEl.textContent = formatPrice(price);
    $$('.quality-btn').forEach(function (btn) {
      const val = btn.dataset.value === 'premium' ? p.premiumPrice : p.standardPrice;
      btn.querySelector('.qvalue').textContent = formatPrice(val);
    });
  }

  const phoneInput = $('#order-phone');
  const igInput    = $('#order-ig');
  const submitBtn  = $('#order-submit');

  $('#order-form').addEventListener('submit', async function (ev) {
    ev.preventDefault();

    const phone = phoneInput.value.trim();
    const ig    = igInput.value.trim().replace(/^@/, '');

    if (!phone || !ig) {
      toast('Add your phone number and Instagram so I can reach you.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'sending...';

    const p = getProduct();
    const price = state.quality === 'premium' ? p.premiumPrice : p.standardPrice;

    const payload = {
      /* Formspree requires a field called `email`. We don't ask
         the customer for one, so we synthesize a valid-format
         address from their Instagram handle. */
      email: ig + '@instagram.jestr',

      _replyto: ig + '@instagram.jestr',
      _subject: 'New order — ' + p.name + ' — ' + state.size + ' / ' + state.colour + ' / ' + state.quality,
      product_name:      p.name,
      product_slug:      p.slug,
      size:              state.size,
      color:             state.colour,
      quality:           state.quality,
      design_side:       state.side,
      price:             price + ' DT',
      phone_number:      phone,
      instagram_account: '@' + ig,
      submitted_at:      new Date().toISOString(),
    };

    try {
      const res = await fetch('https://formspree.io/f/' + FORMSPREE_ID, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Formspree returned ' + res.status);
      toast("Order received — I'll message you on Instagram to confirm.", 'success');
      phoneInput.value = '';
      igInput.value = '';
    } catch (err) {
      console.error(err);
      toast('Could not send order. Try again in a moment.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'confirm order';
    }
  });

  refreshPreview();
  refreshTotal();
}

/* =========================================================
   BOOT
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {
  initHome();
  initOrder();
});
