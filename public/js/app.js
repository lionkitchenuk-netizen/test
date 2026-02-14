// POS Self Order Application - Static Version with localStorage
let MENU = { items: [], sets: [], attrs: [] };
let CART = [];
let SELECTED_TABLE = null;
let currentView = 'table';

// ==================== Internationalization ====================
const I18N = {
  en: {
    selectTable: 'Select Table',
    tableNumber: 'Table Number',
    confirm: 'Confirm',
    selfOrder: 'Self Order',
    setMenus: 'Set Menus',
    mainMenu: 'Main Menu',
    singleItems: 'Single Items',
    addToCart: 'Add',
    addSet: 'Add Set',
    cart: 'Cart',
    yourOrder: 'Your Order',
    total: 'Total',
    submitOrder: 'Submit Order',
    reviewOrder: 'Review Order',
    emptyCart: 'Cart is empty',
    remove: 'Remove',
    quantity: 'Qty',
    chooseOption: 'Please select',
    cancel: 'Cancel',
    ok: 'OK',
    orderReview: 'Order Review',
    backToMenu: 'Back to Menu',
    confirmSubmit: 'Confirm & Submit',
    item: 'Item',
    price: 'Price',
    subtotal: 'Subtotal',
    orderSubmitted: 'Order Submitted!',
    orderSuccess: 'Your order has been sent to kitchen.',
    orderNumber: 'Order Number',
    language: 'Language',
    english: 'English',
    cantonese: 'Cantonese',
    selectTableFirst: 'Please select a table first',
    noItemsInCart: 'No items in cart',
    table: 'Table',
    lunchSet: 'Lunch Set',
    dinnerSet: 'Dinner Set',
    noSetsAvailable: 'No sets available at this time',
    printQueued: 'Print job queued',
    printFailed: 'Print failed - printer not reachable from browser'
  },
  'zh-HK': {
    selectTable: '選擇枱號',
    tableNumber: '枱號',
    confirm: '確認',
    selfOrder: '自助落單',
    setMenus: '套餐',
    mainMenu: '主菜',
    singleItems: '單點',
    addToCart: '加入',
    addSet: '加套餐',
    cart: '購物籃',
    yourOrder: '你的訂單',
    total: '總計',
    submitOrder: '落單',
    reviewOrder: '查看訂單',
    emptyCart: '購物籃係空既',
    remove: '刪除',
    quantity: '數量',
    chooseOption: '請選擇',
    cancel: '取消',
    ok: '確定',
    orderReview: '訂單詳情',
    backToMenu: '返回菜單',
    confirmSubmit: '確認落單',
    item: '項目',
    price: '價錢',
    subtotal: '小計',
    orderSubmitted: '落單成功！',
    orderSuccess: '你既訂單已經送到廚房.',
    orderNumber: '訂單編號',
    language: '語言',
    english: '英文',
    cantonese: '廣東話',
    selectTableFirst: '請先選擇枱號',
    noItemsInCart: '購物籃係空既',
    table: '枱',
    lunchSet: '午餐套餐',
    dinnerSet: '晚餐套餐',
    noSetsAvailable: '呢個時段冇套餐',
    printQueued: '打印工作已排隊',
    printFailed: '打印失敗 - 瀏覽器無法連接打印機'
  }
};

let currentLang = localStorage.getItem('lang') || 'zh-HK';

function t(key) {
  return I18N[currentLang][key] || I18N.en[key] || key;
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  renderUI();
}

function getLang() {
  return currentLang;
}

// ==================== UI Functions ====================
function $q(sel) { return document.querySelector(sel); }
function $c(tag) { return document.createElement(tag); }

function renderUI() {
  if (currentView === 'table') {
    renderTableSelection();
  } else if (currentView === 'menu') {
    renderMenu();
  } else if (currentView === 'review') {
    renderOrderReview();
  }
}

function renderTableSelection() {
  const app = $q('.app');
  app.innerHTML = `
    <div class="table-selection">
      <h1 data-i18n="selectTable">${t('selectTable')}</h1>
      <div class="table-grid">
        ${[1,2,3,4,5,6,7,8,9,10,11,12].map(n => `
          <button class="table-btn" data-table="${n}">${n}</button>
        `).join('')}
      </div>
      <div class="lang-switch">
        <button class="lang-btn ${currentLang==='en'?'active':''}" data-lang="en">${t('english')}</button>
        <button class="lang-btn ${currentLang==='zh-HK'?'active':''}" data-lang="zh-HK">${t('cantonese')}</button>
      </div>
    </div>
  `;
  
  app.querySelectorAll('.table-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      SELECTED_TABLE = btn.dataset.table;
      currentView = 'menu';
      renderUI();
    });
  });
  
  app.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setLang(btn.dataset.lang);
    });
  });
}

function showAttrModal(attrName, options) {
  return new Promise((resolve) => {
    const modal = $q('#attrModal');
    $q('#attrTitle').textContent = attrName + ': ' + t('chooseOption');
    const opts = $q('#attrOptions');
    opts.innerHTML = '';
    options.forEach(o => {
      const btn = $c('button');
      btn.textContent = o;
      btn.addEventListener('click', () => {
        resolve(o);
        modal.style.display = 'none';
      });
      opts.appendChild(btn);
    });
    $q('#attrCancel').onclick = () => { modal.style.display = 'none'; resolve(null); };
    modal.style.display = 'block';
  });
}

function loadMenu() {
  // Initialize data from localStorage
  initData();
  const data = getData();
  
  MENU.items = data.items;
  MENU.attrs = data.attrs;
  
  // Filter sets by current time
  const now = new Date();
  MENU.activeSets = data.sets.filter(s => {
    if (!s.time_start || !s.time_end) return true;
    const toMin = t => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const cur = now.getHours() * 60 + now.getMinutes();
    const start = toMin(s.time_start);
    const end = toMin(s.time_end);
    if (start <= end) return cur >= start && cur <= end;
    return cur >= start || cur <= end;
  });
  
  renderUI();
}

function renderMenu() {
  const app = $q('.app');
  app.innerHTML = `
    <div class="menu-view">
      <header>
        <button class="back-btn" id="backToTables">← ${t('selectTable')}</button>
        <h1 data-i18n="selfOrder">${t('selfOrder')}</h1>
        <div class="header-info">
          <span class="table-badge">${t('table')}: ${SELECTED_TABLE}</span>
          <div class="lang-switch-small">
            <button class="lang-btn-sm ${currentLang==='en'?'active':''}" data-lang="en">EN</button>
            <button class="lang-btn-sm ${currentLang==='zh-HK'?'active':''}" data-lang="zh-HK">粵</button>
          </div>
        </div>
      </header>
      <div class="content">
        <section id="menu"></section>
        <aside id="cart">
          <h3 data-i18n="cart">${t('cart')}</h3>
          <ul id="cartList"></ul>
          <div class="cart-total">
            <span data-i18n="total">${t('total')}:</span>
            <span class="total-amount">$<span id="total">0.00</span></span>
          </div>
          <div class="cart-actions">
            <button id="reviewOrder" data-i18n="reviewOrder">${t('reviewOrder')}</button>
            <button id="submitOrder" class="primary" data-i18n="submitOrder">${t('submitOrder')}</button>
          </div>
        </aside>
      </div>
    </div>
    <div id="attrModal" class="modal" style="display:none">
      <div class="modal-content">
        <h4 id="attrTitle">${t('chooseOption')}</h4>
        <div id="attrOptions"></div>
        <div style="margin-top:10px">
          <button id="attrOk" data-i18n="ok">${t('ok')}</button>
          <button id="attrCancel" data-i18n="cancel">${t('cancel')}</button>
        </div>
      </div>
    </div>
    <div id="successModal" class="modal" style="display:none">
      <div class="modal-content success">
        <h2>✓</h2>
        <h3 data-i18n="orderSubmitted">${t('orderSubmitted')}</h3>
        <p data-i18n="orderSuccess">${t('orderSuccess')}</p>
        <p><strong>${t('orderNumber')}:</strong> <span id="orderId"></span></p>
        <button id="newOrder" data-i18n="selectTable">${t('selectTable')}</button>
      </div>
    </div>
  `;
  
  $q('#backToTables').addEventListener('click', () => {
    currentView = 'table';
    renderUI();
  });
  
  $q('#reviewOrder').addEventListener('click', () => {
    if (CART.length === 0) {
      alert(t('noItemsInCart'));
      return;
    }
    currentView = 'review';
    renderUI();
  });
  
  $q('#submitOrder').addEventListener('click', submitOrder);
  
  $q('#newOrder').addEventListener('click', () => {
    CART = [];
    currentView = 'table';
    $q('#successModal').style.display = 'none';
    renderUI();
  });
  
  app.querySelectorAll('.lang-btn-sm').forEach(btn => {
    btn.addEventListener('click', () => {
      setLang(btn.dataset.lang);
    });
  });
  
  renderMenuItems();
  renderCart();
}

function renderMenuItems() {
  const root = $q('#menu');
  root.innerHTML = '';
  
  if (MENU.activeSets && MENU.activeSets.length) {
    const setsSection = $c('div');
    setsSection.innerHTML = `<h3 data-i18n="setMenus">${t('setMenus')}</h3>`;
    MENU.activeSets.forEach(s => {
      const el = $c('div');
      el.className = 'menu-item set-item';
      el.innerHTML = `
        <div class="item-info">
          <strong>${s.name}</strong>
          <span class="item-desc">${getSetItemsDesc(s)}</span>
        </div>
        <div class="item-action">
          <span class="price">$${s.price}</span>
          <button class="add-btn" data-id="set-${s.id}" data-i18n="addSet">${t('addSet')}</button>
        </div>
      `;
      el.querySelector('button').addEventListener('click', () => addSetToCart(s));
      setsSection.appendChild(el);
    });
    root.appendChild(setsSection);
  } else {
    const noSets = $c('div');
    noSets.className = 'no-sets';
    noSets.innerHTML = `<p data-i18n="noSetsAvailable">${t('noSetsAvailable')}</p>`;
    root.appendChild(noSets);
  }
  
  const itemsSection = $c('div');
  itemsSection.innerHTML = `<h3 data-i18n="singleItems">${t('singleItems')}</h3>`;
  MENU.items.forEach(it => {
    const el = $c('div');
    el.className = 'menu-item';
    el.innerHTML = `
      <div class="item-info">
        <strong>${it.name}</strong>
        <span class="category">${it.category || ''}</span>
      </div>
      <div class="item-action">
        <span class="price">$${it.price}</span>
        <button class="add-btn" data-id="${it.id}" data-i18n="addToCart">${t('addToCart')}</button>
      </div>
    `;
    el.querySelector('button').addEventListener('click', () => onAddItem(it));
    itemsSection.appendChild(el);
  });
  root.appendChild(itemsSection);
}

function getSetItemsDesc(set) {
  const ids = set.items ? set.items.split('|') : [];
  const names = ids.map(id => {
    const item = MENU.items.find(it => it.id == id);
    return item ? item.name : '';
  }).filter(n => n);
  return names.join(' + ');
}

async function addSetToCart(set) {
  const ids = set.items ? set.items.split('|') : [];
  for (const id of ids) {
    const item = MENU.items.find(it => it.id == id);
    if (item) {
      const attrs = [];
      const a = MENU.attrs.find(x => x.item_id == item.id);
      if (a) {
        const opts = a.options.split('|');
        const pick = await showAttrModal(a.attr_name, opts);
        if (pick) attrs.push(pick);
      }
      CART.push({
        id: item.id,
        name: item.name + ' (set)',
        price: parseFloat(item.price),
        qty: 1,
        attrs: attrs,
        isSetItem: true
      });
    }
  }
  renderCart();
}

async function onAddItem(item) {
  const qty = parseInt(prompt(t('quantity') + '?', '1')) || 1;
  const attrs = [];
  
  const a = MENU.attrs.find(x => x.item_id == item.id);
  if (a) {
    const opts = a.options.split('|');
    const pick = await showAttrModal(a.attr_name, opts);
    if (pick) attrs.push(pick);
  }
  
  CART.push({
    id: item.id,
    name: item.name,
    price: parseFloat(item.price),
    qty: qty,
    attrs: attrs
  });
  
  renderCart();
}

function renderCart() {
  const list = $q('#cartList');
  if (!list) return;
  
  list.innerHTML = '';
  let total = 0;
  
  if (CART.length === 0) {
    list.innerHTML = `<li class="empty">${t('emptyCart')}</li>`;
  } else {
    CART.forEach((c, i) => {
      const li = $c('li');
      li.innerHTML = `
        <div class="cart-item">
          <div class="cart-item-info">
            <span class="cart-item-name">${c.name}</span>
            ${c.attrs && c.attrs.length ? `<span class="cart-item-attrs">${c.attrs.join(', ')}</span>` : ''}
          </div>
          <div class="cart-item-action">
            <span class="cart-item-qty">x${c.qty}</span>
            <span class="cart-item-price">$${(c.price * c.qty).toFixed(2)}</span>
            <button class="remove-btn" data-index="${i}">×</button>
          </div>
        </div>
      `;
      list.appendChild(li);
    });
    
    list.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        CART.splice(idx, 1);
        renderCart();
      });
    });
  }
  
  CART.forEach(c => {
    total += c.price * c.qty;
  });
  
  if ($q('#total')) {
    $q('#total').textContent = total.toFixed(2);
  }
}

function renderOrderReview() {
  const app = $q('.app');
  let total = 0;
  
  const itemsHtml = CART.map((c, i) => {
    const itemTotal = c.price * c.qty;
    total += itemTotal;
    return `
      <tr>
        <td>
          <div>${c.name}</div>
          ${c.attrs && c.attrs.length ? `<div class="attrs">${c.attrs.join(', ')}</div>` : ''}
        </td>
        <td class="qty">x${c.qty}</td>
        <td class="price">$${itemTotal.toFixed(2)}</td>
      </tr>
    `;
  }).join('');
  
  app.innerHTML = `
    <div class="review-view">
      <header>
        <button class="back-btn" id="backToMenu">← ${t('backToMenu')}</button>
        <h1 data-i18n="orderReview">${t('orderReview')}</h1>
      </header>
      <div class="review-content">
        <div class="review-table">
          <span class="table-badge">${t('table')}: ${SELECTED_TABLE}</span>
        </div>
        <table class="review-table-items">
          <thead>
            <tr>
              <th data-i18n="item">${t('item')}</th>
              <th data-i18n="quantity">${t('quantity')}</th>
              <th data-i18n="subtotal">${t('subtotal')}</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2"><strong data-i18n="total">${t('total')}</strong></td>
              <td class="total"><strong>$${total.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>
        <div class="review-actions">
          <button id="backToMenuBtn" data-i18n="backToMenu">${t('backToMenu')}</button>
          <button id="confirmSubmit" class="primary" data-i18n="confirmSubmit">${t('confirmSubmit')}</button>
        </div>
      </div>
    </div>
  `;
  
  $q('#backToMenu').addEventListener('click', () => {
    currentView = 'menu';
    renderUI();
  });
  
  $q('#backToMenuBtn').addEventListener('click', () => {
    currentView = 'menu';
    renderUI();
  });
  
  $q('#confirmSubmit').addEventListener('click', submitOrder);
}

// Print function using raw TCP socket (browser limitation - may not work)
async function sendToPrinter(ip, port, data) {
  // Note: Browsers cannot directly connect to TCP sockets
  // This is a simulation - in production you'd need a backend service
  console.log('Print simulation:', { ip, port, data: data.substring(0, 50) });
  return { success: true, message: 'Print job queued (browser cannot directly print - use admin panel)' };
}

async function submitOrder() {
  if (!SELECTED_TABLE) {
    alert(t('selectTableFirst'));
    return;
  }
  
  if (CART.length === 0) {
    alert(t('noItemsInCart'));
    return;
  }
  
  const total = CART.reduce((sum, c) => sum + (c.price * c.qty), 0);
  const orderId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  
  const order = {
    id: orderId,
    table: SELECTED_TABLE,
    items: CART.map(c => ({
      id: c.id,
      name: c.name,
      price: c.price,
      qty: c.qty,
      attrs: c.attrs
    })),
    total: total.toFixed(2),
    createdAt: new Date().toISOString(),
    printResults: []
  };
  
  // Save order to localStorage
  saveOrder(order);
  
  // Try to print (will show simulation message)
  const data = getData();
  if (data.config && data.config.printer) {
    for (const item of order.items) {
      const printData = `Table: ${order.table}\n${item.name} x${item.qty}\n${item.attrs ? item.attrs.join(', ') : ''}\nTotal: $${order.total}\n`;
      await sendToPrinter(data.config.printer.food.ip, data.config.printer.food.port, printData);
    }
  }
  
  $q('#orderId').textContent = orderId;
  $q('#successModal').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
  currentView = 'table';
  loadMenu();
});
