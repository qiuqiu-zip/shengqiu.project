(() => {
  'use strict';

  const STORAGE = {
    products: 'stellar.mall.products.v1',
    cart: 'stellar.mall.cart.v1',
    orders: 'stellar.mall.orders.v1'
  };

  const seedProducts = [
    { id: 1, name: 'AirDots Pro 无线耳机', category: '数码', price: 399, stock: 28, rating: 4.9, emoji: '🎧', tag: '热卖', desc: '主动降噪、通透模式，全天候舒适佩戴。', c1: '#e8e7ff', c2: '#c6c4ff' },
    { id: 2, name: '极简机械键盘 K87', category: '数码', price: 529, stock: 16, rating: 4.8, emoji: '⌨️', tag: '新品', desc: '三模连接与热插拔轴体，办公游戏都顺手。', c1: '#e5f2ff', c2: '#b8dcff' },
    { id: 3, name: '智能运动手表 S5', category: '数码', price: 699, stock: 12, rating: 4.7, emoji: '⌚', tag: '精选', desc: '全天健康监测，支持百种运动模式。', c1: '#e7f7f1', c2: '#b9ead9' },
    { id: 4, name: '云朵记忆棉枕', category: '家居', price: 169, stock: 34, rating: 4.9, emoji: '🛏️', tag: '舒睡', desc: '慢回弹承托颈椎，亲肤透气可拆洗。', c1: '#fff1e6', c2: '#ffd6b8' },
    { id: 5, name: '北欧香薰台灯', category: '家居', price: 239, stock: 20, rating: 4.6, emoji: '💡', tag: '氛围', desc: '三档暖光与香薰扩散，点亮松弛时刻。', c1: '#fff4d9', c2: '#ffe3a1' },
    { id: 6, name: '恒温随行咖啡杯', category: '家居', price: 129, stock: 45, rating: 4.8, emoji: '☕', tag: '人气', desc: '真空保温 12 小时，单手开合防漏设计。', c1: '#f3e9e2', c2: '#dcc5b5' },
    { id: 7, name: '城市轻跑鞋', category: '运动', price: 459, stock: 24, rating: 4.8, emoji: '👟', tag: '轻盈', desc: '缓震回弹中底，通勤慢跑一双搞定。', c1: '#eaf8ff', c2: '#bfeaff' },
    { id: 8, name: '专业瑜伽垫 6mm', category: '运动', price: 199, stock: 31, rating: 4.7, emoji: '🧘', tag: '防滑', desc: '高密度支撑与双面防滑，卷起即走。', c1: '#f0e9ff', c2: '#d7c1ff' },
    { id: 9, name: '轻量保温运动水壶', category: '运动', price: 119, stock: 38, rating: 4.6, emoji: '🧴', tag: '户外', desc: '食品级不锈钢，冰饮热饮都能轻松携带。', c1: '#e4f8f6', c2: '#b6e9e4' },
    { id: 10, name: '设计思维入门', category: '图书', price: 58, stock: 52, rating: 4.9, emoji: '📘', tag: '好书', desc: '用可执行方法解决真实产品与商业问题。', c1: '#e9f1ff', c2: '#c5d9ff' },
    { id: 11, name: '旅行收纳七件套', category: '生活', price: 89, stock: 42, rating: 4.7, emoji: '🧳', tag: '出行', desc: '衣物分区、防水耐磨，让行李箱井然有序。', c1: '#fff0f3', c2: '#ffc8d2' },
    { id: 12, name: '植萃护手霜礼盒', category: '个护', price: 149, stock: 27, rating: 4.8, emoji: '🧴', tag: '礼赠', desc: '三种自然香调，清爽滋润不黏腻。', c1: '#eef7e6', c2: '#cee9b9' }
  ];

  const load = (key, fallback) => {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch (_) {
      return fallback;
    }
  };
  const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const money = value => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(value);
  const nowText = value => new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);

  let products = load(STORAGE.products, seedProducts);
  let cart = load(STORAGE.cart, []);
  let orders = load(STORAGE.orders, []);
  let currentCategory = '全部';

  const el = id => document.getElementById(id);
  const productGrid = el('productGrid');
  const categoryChips = el('categoryChips');
  const searchInput = el('searchInput');
  const sortSelect = el('sortSelect');
  const cartDrawer = el('cartDrawer');
  const drawerOverlay = el('drawerOverlay');
  const checkoutModal = el('checkoutModal');
  const modalOverlay = el('modalOverlay');

  function persistAll() {
    save(STORAGE.products, products);
    save(STORAGE.cart, cart);
    save(STORAGE.orders, orders);
  }

  function toast(message) {
    const node = document.createElement('div');
    node.className = 'toast';
    node.textContent = message;
    el('toastWrap').appendChild(node);
    setTimeout(() => node.remove(), 2600);
  }

  function categories() {
    return ['全部', ...new Set(products.map(item => item.category))];
  }

  function renderCategories() {
    categoryChips.innerHTML = categories().map(category => `
      <button class="chip ${category === currentCategory ? 'active' : ''}" data-category="${category}">${category}</button>
    `).join('');
  }

  function filteredProducts() {
    const keyword = searchInput.value.trim().toLowerCase();
    let result = products.filter(item => {
      const categoryMatch = currentCategory === '全部' || item.category === currentCategory;
      const keywordMatch = !keyword || `${item.name} ${item.desc} ${item.category}`.toLowerCase().includes(keyword);
      return categoryMatch && keywordMatch;
    });

    const sort = sortSelect.value;
    if (sort === 'priceAsc') result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'priceDesc') result = [...result].sort((a, b) => b.price - a.price);
    if (sort === 'rating') result = [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }

  function renderProducts() {
    const list = filteredProducts();
    el('resultCount').textContent = `共 ${list.length} 件商品`;
    if (!list.length) {
      productGrid.innerHTML = '<div class="empty"><div class="empty-icon">🔎</div><strong>没有找到匹配商品</strong><p>换个关键词或分类试试。</p></div>';
      return;
    }
    productGrid.innerHTML = list.map(item => `
      <article class="product-card">
        <div class="product-art" style="--c1:${item.c1};--c2:${item.c2}">
          <span class="tag">${item.tag}</span>
          <span aria-hidden="true">${item.emoji}</span>
        </div>
        <div class="product-body">
          <div class="product-category">${item.category}</div>
          <h3 class="product-name">${item.name}</h3>
          <div class="product-desc">${item.desc}</div>
          <div class="rating-stock"><span>★ ${item.rating.toFixed(1)}</span><span>${item.stock > 0 ? `库存 ${item.stock}` : '已售罄'}</span></div>
          <div class="product-footer">
            <span class="price"><small>¥</small>${item.price.toFixed(2)}</span>
            <button class="add-btn" data-add="${item.id}" ${item.stock <= 0 ? 'disabled' : ''} aria-label="加入购物车">＋</button>
          </div>
        </div>
      </article>
    `).join('');
  }

  function cartDetails() {
    return cart.map(row => ({ ...row, product: products.find(item => item.id === row.productId) })).filter(row => row.product);
  }

  function totals() {
    const items = cartDetails();
    const subtotal = items.reduce((sum, row) => sum + row.product.price * row.quantity, 0);
    const shipping = subtotal === 0 || subtotal >= 199 ? 0 : 12;
    return { subtotal, shipping, total: subtotal + shipping, count: items.reduce((sum, row) => sum + row.quantity, 0) };
  }

  function renderCart() {
    const items = cartDetails();
    const sum = totals();
    el('cartCount').textContent = sum.count;
    el('cartSubtotal').textContent = money(sum.subtotal);
    el('shippingFee').textContent = sum.shipping ? money(sum.shipping) : '免运费';
    el('cartTotal').textContent = money(sum.total);
    el('checkoutItems').textContent = `${sum.count} 件`;
    el('checkoutShipping').textContent = sum.shipping ? money(sum.shipping) : '免运费';
    el('checkoutTotal').textContent = money(sum.total);
    el('checkoutButton').disabled = items.length === 0;

    el('cartList').innerHTML = items.length ? items.map(row => `
      <div class="cart-item">
        <div class="cart-thumb" style="--c1:${row.product.c1};--c2:${row.product.c2}">${row.product.emoji}</div>
        <div>
          <div class="cart-name">${row.product.name}</div>
          <div class="cart-price">${money(row.product.price)}</div>
          <div class="qty">
            <button data-qty="${row.productId}" data-delta="-1" aria-label="减少数量">−</button>
            <strong>${row.quantity}</strong>
            <button data-qty="${row.productId}" data-delta="1" aria-label="增加数量">＋</button>
          </div>
        </div>
        <button class="remove-link" data-remove="${row.productId}">删除</button>
      </div>
    `).join('') : '<div class="empty" style="margin-top:18px"><div class="empty-icon">🛒</div><strong>购物车还是空的</strong><p>去挑一件喜欢的商品吧。</p></div>';
  }

  function addToCart(productId) {
    const product = products.find(item => item.id === productId);
    if (!product || product.stock <= 0) return;
    const row = cart.find(item => item.productId === productId);
    if (row) {
      if (row.quantity >= product.stock) return toast('已达到当前库存上限');
      row.quantity += 1;
    } else {
      cart.push({ productId, quantity: 1 });
    }
    save(STORAGE.cart, cart);
    renderCart();
    toast(`${product.name} 已加入购物车`);
  }

  function updateQuantity(productId, delta) {
    const row = cart.find(item => item.productId === productId);
    const product = products.find(item => item.id === productId);
    if (!row || !product) return;
    const next = row.quantity + delta;
    if (next <= 0) cart = cart.filter(item => item.productId !== productId);
    else if (next <= product.stock) row.quantity = next;
    else return toast('已达到当前库存上限');
    save(STORAGE.cart, cart);
    renderCart();
  }

  function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    save(STORAGE.cart, cart);
    renderCart();
    toast('商品已从购物车移除');
  }

  function openCart() {
    cartDrawer.classList.add('open');
    drawerOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    cartDrawer.classList.remove('open');
    drawerOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  function openCheckout() {
    if (!cart.length) return;
    closeCart();
    checkoutModal.classList.add('open');
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCheckout() {
    checkoutModal.classList.remove('open');
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function createOrder(form) {
    const items = cartDetails();
    if (!items.length) return toast('购物车为空，无法下单');
    const unavailable = items.find(row => row.quantity > row.product.stock);
    if (unavailable) return toast(`${unavailable.product.name} 库存不足，请调整数量`);

    const sum = totals();
    const timestamp = Date.now();
    const order = {
      id: `XS${new Date(timestamp).toISOString().replace(/\D/g, '').slice(0, 14)}${String(Math.floor(Math.random() * 900 + 100))}`,
      createdAt: timestamp,
      status: '待支付',
      receiver: {
        name: form.receiverName.value.trim(),
        phone: form.receiverPhone.value.trim(),
        address: form.receiverAddress.value.trim()
      },
      paymentMethod: form.paymentMethod.value,
      remark: form.orderRemark.value.trim(),
      items: items.map(row => ({
        productId: row.product.id,
        name: row.product.name,
        emoji: row.product.emoji,
        price: row.product.price,
        quantity: row.quantity
      })),
      subtotal: sum.subtotal,
      shipping: sum.shipping,
      total: sum.total
    };

    products = products.map(product => {
      const row = cart.find(item => item.productId === product.id);
      return row ? { ...product, stock: product.stock - row.quantity } : product;
    });
    orders.unshift(order);
    cart = [];
    persistAll();
    form.reset();
    renderProducts();
    renderCart();
    renderOrders();
    closeCheckout();
    switchView('orders');
    toast(`订单 ${order.id} 创建成功`);
  }

  function statusClass(status) {
    return ({ '待支付': 'status-pending', '已支付': 'status-paid', '已完成': 'status-done', '已取消': 'status-cancelled' })[status] || 'status-cancelled';
  }

  function renderOrders() {
    const list = el('ordersList');
    if (!orders.length) {
      list.innerHTML = '<div class="empty"><div class="empty-icon">📦</div><strong>还没有订单</strong><p>完成一次结算后，订单会出现在这里。</p></div>';
      return;
    }
    list.innerHTML = orders.map(order => {
      const actions = order.status === '待支付'
        ? `<button class="btn btn-primary" data-order-action="pay" data-order-id="${order.id}">立即支付</button><button class="btn btn-soft" data-order-action="cancel" data-order-id="${order.id}">取消订单</button>`
        : order.status === '已支付'
          ? `<button class="btn btn-primary" data-order-action="complete" data-order-id="${order.id}">确认收货</button>`
          : '';
      return `
        <article class="order-card">
          <div class="order-head">
            <div><div class="order-id">订单号：${escapeHtml(order.id)}</div><div class="order-time">${nowText(order.createdAt)} · ${escapeHtml(order.paymentMethod)}</div></div>
            <span class="status ${statusClass(order.status)}">${escapeHtml(order.status)}</span>
          </div>
          <div class="order-body">
            <div class="order-items">
              ${order.items.map(item => `<div class="order-item"><span>${item.emoji} <strong>${escapeHtml(item.name)}</strong> × ${item.quantity}</span><span>${money(item.price * item.quantity)}</span></div>`).join('')}
            </div>
            <div class="order-foot">
              <div>
                <div style="font-size:13px;color:var(--muted)">收货人：${escapeHtml(order.receiver.name)} ${escapeHtml(order.receiver.phone)}</div>
                <div style="font-size:13px;color:var(--muted);margin-top:4px">${escapeHtml(order.receiver.address)}</div>
              </div>
              <div class="order-total">合计 ${money(order.total)}</div>
              <div class="order-actions">${actions}</div>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function updateOrderStatus(id, action) {
    const order = orders.find(item => item.id === id);
    if (!order) return;
    if (action === 'pay' && order.status === '待支付') {
      order.status = '已支付';
      toast('支付成功（演示）');
    } else if (action === 'complete' && order.status === '已支付') {
      order.status = '已完成';
      toast('订单已完成');
    } else if (action === 'cancel' && order.status === '待支付') {
      order.status = '已取消';
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) product.stock += item.quantity;
      });
      toast('订单已取消，库存已恢复');
      save(STORAGE.products, products);
      renderProducts();
    }
    save(STORAGE.orders, orders);
    renderOrders();
  }

  function switchView(view) {
    el('productsView').classList.toggle('hidden', view !== 'products');
    el('ordersView').classList.toggle('hidden', view !== 'orders');
    document.querySelectorAll('.nav-btn[data-view]').forEach(button => button.classList.toggle('active', button.dataset.view === view));
    if (view === 'orders') renderOrders();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.addEventListener('click', event => {
    const target = event.target.closest('button');
    if (!target) return;
    if (target.dataset.add) addToCart(Number(target.dataset.add));
    if (target.dataset.qty) updateQuantity(Number(target.dataset.qty), Number(target.dataset.delta));
    if (target.dataset.remove) removeFromCart(Number(target.dataset.remove));
    if (target.dataset.category) {
      currentCategory = target.dataset.category;
      renderCategories();
      renderProducts();
    }
    if (target.dataset.view) switchView(target.dataset.view);
    if (target.dataset.viewJump) switchView(target.dataset.viewJump);
    if (target.dataset.orderAction) updateOrderStatus(target.dataset.orderId, target.dataset.orderAction);
  });

  searchInput.addEventListener('input', renderProducts);
  sortSelect.addEventListener('change', renderProducts);
  el('openCart').addEventListener('click', openCart);
  el('closeCart').addEventListener('click', closeCart);
  drawerOverlay.addEventListener('click', closeCart);
  el('checkoutButton').addEventListener('click', openCheckout);
  el('closeCheckout').addEventListener('click', closeCheckout);
  modalOverlay.addEventListener('click', closeCheckout);
  el('shopNow').addEventListener('click', () => el('catalog').scrollIntoView({ behavior: 'smooth' }));
  el('checkoutForm').addEventListener('submit', event => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    createOrder(event.currentTarget);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeCart();
      closeCheckout();
    }
  });

  renderCategories();
  renderProducts();
  renderCart();
  renderOrders();
})();
