// Modern POS System for Staff
let TABLES = [];
let MENU = [];
let ATTRIBUTES = [];
let SELECTED_TABLE = null;
let CART = [];
let CURRENT_CATEGORY = 'all';
let CURRENT_LANG = 'en';

// Translation dictionaries
const TRANSLATIONS = {
  en: {
    'pos-title': '🍽️ POS System',
    'select-table': 'Select Table',
    'your-order': '🛒 Your Order',
    'total': 'Total:',
    'preview-tickets': '📄 Preview Tickets',
    'submit-order': 'Submit Order',
    'ticket-preview': '📄 Ticket Preview',
    'print-submit': 'Print & Submit Order',
    'back-cart': '← Back to Cart',
    'table': 'Table',
    'all': 'All',
    'food': 'Food',
    'drink': 'Drink',
    'single': 'Single',
    'set': 'Set',
    'cold': 'Cold',
    'hot': 'Hot',
    'qty': 'Qty',
    'remove': 'Remove',
    'empty-cart': 'Cart is empty',
    'add-items': 'Add items to get started!',
    'order-submitted': 'Order submitted and sent to printer!',
    'order-failed': 'Failed to submit order',
    'select-table-first': 'Please select a table first!'
  },
  zh: {
    'pos-title': '🍽️ 點餐系統',
    'select-table': '選擇桌號',
    'your-order': '🛒 您的訂單',
    'total': '總計:',
    'preview-tickets': '📄 預覽小票',
    'submit-order': '提交訂單',
    'ticket-preview': '📄 小票預覽',
    'print-submit': '打印並提交訂單',
    'back-cart': '← 返回購物車',
    'table': '桌號',
    'all': '全部',
    'food': '食物',
    'drink': '飲品',
    'single': '單點',
    'set': '套餐',
    'cold': '冷飲',
    'hot': '熱飲',
    'qty': '數量',
    'remove': '移除',
    'empty-cart': '購物車是空的',
    'add-items': '開始添加商品吧!',
    'order-submitted': '訂單已提交並發送至打印機!',
    'order-failed': '提交訂單失敗',
    'select-table-first': '請先選擇桌號!'
  }
};

// Toggle Language
function toggleLanguage() {
  CURRENT_LANG = CURRENT_LANG === 'en' ? 'zh' : 'en';
  localStorage.setItem('pos_lang', CURRENT_LANG);
  
  // Update language button
  document.getElementById('langToggle').textContent = CURRENT_LANG === 'en' ? '中文' : 'EN';
  
  // Update all translated elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = TRANSLATIONS[CURRENT_LANG][key];
    if (translation) {
      el.textContent = translation;
    }
  });
  
  // Refresh UI
  renderCategories();
  renderMenu();
  updateCart();
}

// Get translation
function t(key) {
  return TRANSLATIONS[CURRENT_LANG][key] || key;
}

// Load data from localStorage
function loadData() {
  const tablesData = localStorage.getItem('pos_tables');
  const menuData = localStorage.getItem('pos_menu');
  const attrsData = localStorage.getItem('pos_attributes');
  const savedLang = localStorage.getItem('pos_lang');
  
  // Always load from default first to ensure we have the latest data structure
  MENU = getDefaultMenu();
  TABLES = getDefaultTables();
  ATTRIBUTES = getDefaultAttributes();
  
  // Then override with localStorage if exists and is valid
  if (menuData && menuData.length > 10) { // Basic validation
    try {
      const parsed = JSON.parse(menuData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        MENU = parsed;
        console.log('✓ Loaded menu from localStorage:', MENU.length, 'items');
      } else {
        console.error('Menu data is not a valid array, using defaults');
        MENU = getDefaultMenu();
      }
    } catch (e) {
      console.error('Failed to parse menu from localStorage:', e.message);
      MENU = getDefaultMenu();
    }
  } else {
    console.log('No valid menu data in localStorage, using defaults');
  }
  
  if (tablesData && tablesData.length > 5) {
    try {
      const parsed = JSON.parse(tablesData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        TABLES = parsed;
      } else {
        TABLES = getDefaultTables();
      }
    } catch (e) {
      console.error('Failed to parse tables from localStorage');
      TABLES = getDefaultTables();
    }
  }
  
  if (attrsData && attrsData.length > 5) {
    try {
      const parsed = JSON.parse(attrsData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        ATTRIBUTES = parsed;
      } else {
        ATTRIBUTES = getDefaultAttributes();
      }
    } catch (e) {
      console.error('Failed to parse attributes from localStorage');
      ATTRIBUTES = getDefaultAttributes();
    }
  }
  
  CURRENT_LANG = savedLang || 'en';
  
  // Always save to localStorage to ensure consistency
  localStorage.setItem('pos_menu', JSON.stringify(MENU));
  localStorage.setItem('pos_tables', JSON.stringify(TABLES));
  localStorage.setItem('pos_attributes', JSON.stringify(ATTRIBUTES));
  localStorage.setItem('pos_version', '2.0');
  
  console.log('✓ Data loaded - Menu:', MENU.length, 'items, Tables:', TABLES.length);
  
  // Update language button
  const langBtn = document.getElementById('langToggle');
  if (langBtn) {
    langBtn.textContent = CURRENT_LANG === 'en' ? '中文' : 'EN';
  }
}

function getDefaultTables() {
  return [
    { id: '1', number: '1', capacity: 4, status: 'available' },
    { id: '2', number: '2', capacity: 4, status: 'available' },
    { id: '3', number: '3', capacity: 2, status: 'available' },
    { id: '4', number: '4', capacity: 6, status: 'available' },
    { id: '5', number: '5', capacity: 4, status: 'available' },
    { id: '6', number: '6', capacity: 2, status: 'available' },
    { id: '7', number: '7', capacity: 4, status: 'available' },
    { id: '8', number: '8', capacity: 6, status: 'available' }
  ];
}

function getDefaultMenu() {
  return [
    { id: '1', name: 'Chicken Rice', price: '3.50', category: 'Food', subcategory: 'Single', has_attrs: 'true', printer: 'food' },
    { id: '2', name: 'Beef Noodles', price: '4.00', category: 'Food', subcategory: 'Single', has_attrs: 'true', printer: 'food' },
    { id: '3', name: 'Spring Roll', price: '1.50', category: 'Food', subcategory: 'Single', has_attrs: 'false', printer: 'food' },
    { id: '4', name: 'Fried Rice', price: '4.50', category: 'Food', subcategory: 'Single', has_attrs: 'true', printer: 'food' },
    { id: '5', name: 'Wonton Soup', price: '3.80', category: 'Food', subcategory: 'Single', has_attrs: 'false', printer: 'food' },
    { id: '6', name: 'Char Siu Rice', price: '4.20', category: 'Food', subcategory: 'Single', has_attrs: 'false', printer: 'food' },
    { id: '7', name: 'Fish Ball Noodles', price: '3.90', category: 'Food', subcategory: 'Single', has_attrs: 'true', printer: 'food' },
    { id: '8', name: 'Sweet & Sour Pork', price: '5.50', category: 'Food', subcategory: 'Single', has_attrs: 'false', printer: 'food' },
    { id: '9', name: 'Kung Pao Chicken', price: '5.20', category: 'Food', subcategory: 'Single', has_attrs: 'true', printer: 'food' },
    { id: '10', name: 'Vegetable Chow Mein', price: '4.30', category: 'Food', subcategory: 'Single', has_attrs: 'false', printer: 'food' },
    { id: '11', name: 'Dumplings (6pcs)', price: '3.50', category: 'Food', subcategory: 'Single', has_attrs: 'false', printer: 'food' },
    { id: '12', name: 'Egg Fried Rice', price: '3.80', category: 'Food', subcategory: 'Single', has_attrs: 'false', printer: 'food' },
    { id: '13', name: 'BBQ Pork Bun', price: '2.50', category: 'Food', subcategory: 'Single', has_attrs: 'false', printer: 'food' },
    { id: '14', name: 'Prawn Toast', price: '3.20', category: 'Food', subcategory: 'Single', has_attrs: 'false', printer: 'food' },
    { id: '15', name: 'Lunch Set A', price: '6.50', category: 'Food', subcategory: 'Set', has_attrs: 'false', printer: 'food' },
    { id: '16', name: 'Lunch Set B', price: '7.00', category: 'Food', subcategory: 'Set', has_attrs: 'false', printer: 'food' },
    { id: '17', name: 'Dinner Set A', price: '8.50', category: 'Food', subcategory: 'Set', has_attrs: 'false', printer: 'food' },
    { id: '18', name: 'Dinner Set B', price: '9.00', category: 'Food', subcategory: 'Set', has_attrs: 'false', printer: 'food' },
    { id: '19', name: 'Family Set (4ppl)', price: '28.00', category: 'Food', subcategory: 'Set', has_attrs: 'false', printer: 'food' },
    { id: '20', name: 'Iced Lemon Tea', price: '1.50', category: 'Drink', subcategory: 'Cold', has_attrs: 'false', printer: 'drink' },
    { id: '21', name: 'Iced Milk Tea', price: '2.50', category: 'Drink', subcategory: 'Cold', has_attrs: 'false', printer: 'drink' },
    { id: '22', name: 'Iced Coffee', price: '2.30', category: 'Drink', subcategory: 'Cold', has_attrs: 'false', printer: 'drink' },
    { id: '23', name: 'Cola', price: '1.80', category: 'Drink', subcategory: 'Cold', has_attrs: 'false', printer: 'drink' },
    { id: '24', name: 'Sprite', price: '1.80', category: 'Drink', subcategory: 'Cold', has_attrs: 'false', printer: 'drink' },
    { id: '25', name: 'Orange Juice', price: '2.20', category: 'Drink', subcategory: 'Cold', has_attrs: 'false', printer: 'drink' },
    { id: '26', name: 'Apple Juice', price: '2.20', category: 'Drink', subcategory: 'Cold', has_attrs: 'false', printer: 'drink' },
    { id: '27', name: 'Iced Green Tea', price: '1.80', category: 'Drink', subcategory: 'Cold', has_attrs: 'false', printer: 'drink' },
    { id: '28', name: 'Iced Milo', price: '2.50', category: 'Drink', subcategory: 'Cold', has_attrs: 'false', printer: 'drink' },
    { id: '29', name: 'Bubble Tea', price: '3.50', category: 'Drink', subcategory: 'Cold', has_attrs: 'false', printer: 'drink' },
    { id: '30', name: 'Hot Coffee', price: '2.00', category: 'Drink', subcategory: 'Hot', has_attrs: 'false', printer: 'drink' },
    { id: '31', name: 'Hot Tea', price: '1.50', category: 'Drink', subcategory: 'Hot', has_attrs: 'false', printer: 'drink' },
    { id: '32', name: 'Hot Green Tea', price: '1.80', category: 'Drink', subcategory: 'Hot', has_attrs: 'false', printer: 'drink' },
    { id: '33', name: 'Hot Lemon Tea', price: '1.80', category: 'Drink', subcategory: 'Hot', has_attrs: 'false', printer: 'drink' },
    { id: '34', name: 'Hot Milo', price: '2.30', category: 'Drink', subcategory: 'Hot', has_attrs: 'false', printer: 'drink' },
    { id: '35', name: 'Hot Milk', price: '2.00', category: 'Drink', subcategory: 'Hot', has_attrs: 'false', printer: 'drink' }
  ];
}

function getDefaultAttributes() {
  return [
    { id: '1', item_id: '1', attr_name: 'Chicken Level', options: 'Regular|Spicy|Extra Spicy' },
    { id: '2', item_id: '2', attr_name: 'Noodle Type', options: 'Thin|Thick' }
  ];
}

// Render Tables
function renderTables() {
  const grid = document.getElementById('tablesGrid');
  grid.innerHTML = '';
  
  TABLES.forEach(table => {
    const btn = document.createElement('button');
    btn.className = 'table-btn';
    if (table.status === 'occupied') btn.classList.add('occupied');
    if (SELECTED_TABLE === table.number) btn.classList.add('selected');
    
    btn.innerHTML = `
      Table ${table.number}
      <div class="table-capacity">👥 ${table.capacity} seats</div>
    `;
    
    btn.onclick = () => selectTable(table.number);
    grid.appendChild(btn);
  });
}

// Select Table
function selectTable(tableNumber) {
  SELECTED_TABLE = tableNumber;
  document.getElementById('headerInfo').textContent = `${t('table')} ${tableNumber}`;
  document.getElementById('tableView').classList.add('hidden');
  document.getElementById('menuView').classList.remove('hidden');
  document.getElementById('cartFab').classList.remove('hidden');
  renderCategories();
  renderMenu();
}

// Render Categories
function renderCategories() {
  const tabs = document.getElementById('categoryTabs');
  tabs.innerHTML = '';
  
  const categories = [
    { id: 'all', name: `🍽️ ${t('all')}`, icon: '' },
    { id: 'Food-Set', name: `🍱 ${t('set')}`, icon: '' },
    { id: 'Food-Single', name: `🍜 ${t('single')}`, icon: '' },
    { id: 'Drink-Cold', name: `🥤 ${t('cold')}`, icon: '' },
    { id: 'Drink-Hot', name: `☕ ${t('hot')}`, icon: '' }
  ];
  
  categories.forEach(cat => {
    const tab = document.createElement('button');
    tab.className = 'category-tab';
    if (CURRENT_CATEGORY === cat.id) tab.classList.add('active');
    tab.textContent = cat.name;
    tab.onclick = () => {
      CURRENT_CATEGORY = cat.id;
      renderCategories();
      renderMenu();
    };
    tabs.appendChild(tab);
  });
}

// Render Menu
function renderMenu() {
  const grid = document.getElementById('menuGrid');
  grid.innerHTML = '';
  
  let filteredMenu = MENU;
  
  if (CURRENT_CATEGORY !== 'all') {
    const [cat, subcat] = CURRENT_CATEGORY.split('-');
    filteredMenu = MENU.filter(item => 
      item.category === cat && item.subcategory === subcat
    );
  }
  
  filteredMenu.forEach(item => {
    const card = document.createElement('div');
    card.className = 'menu-item';
    card.innerHTML = `
      ${item.subcategory === 'Set' ? '<div class="menu-item-badge">SET</div>' : ''}
      <div class="menu-item-name">${item.name}</div>
      <div class="menu-item-price">$${item.price}</div>
    `;
    card.onclick = () => addToCart(item);
    grid.appendChild(card);
  });
  
  if (filteredMenu.length === 0) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🍽️</div><div>No items in this category</div></div>';
  }
}

// Add to Cart
function addToCart(item) {
  const existing = CART.find(c => c.id === item.id);
  
  if (existing) {
    existing.qty++;
  } else {
    CART.push({
      ...item,
      qty: 1,
      attrs: {} // For future attribute selection
    });
  }
  
  updateCartBadge();
  showSuccessMessage(`Added ${item.name} to cart`);
}

// Update Cart Badge
function updateCartBadge() {
  const totalItems = CART.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cartBadge').textContent = totalItems;
}

// Show Success Message
function showSuccessMessage(message) {
  const banner = document.createElement('div');
  banner.className = 'success-banner';
  banner.textContent = message;
  document.body.appendChild(banner);
  
  setTimeout(() => banner.remove(), 2000);
}

// Open Cart
function openCart() {
  renderCartItems();
  document.getElementById('cartModal').classList.add('show');
}

// Close Cart
function closeCart() {
  document.getElementById('cartModal').classList.remove('show');
}

// Render Cart Items
function renderCartItems() {
  const container = document.getElementById('cartItems');
  
  if (CART.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">🛒</div><div>${t('empty-cart')}</div><p style="font-size: 0.9rem; color: #999; margin-top: 0.5rem;">${t('add-items')}</p></div>`;
    document.getElementById('submitOrder').disabled = true;
    return;
  }
  
  container.innerHTML = '';
  document.getElementById('submitOrder').disabled = false;
  
  CART.forEach((item, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price} × ${item.qty} = $${(parseFloat(item.price) * item.qty).toFixed(2)}</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
        <div class="qty-display">${item.qty}</div>
        <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
        <button class="remove-btn" onclick="removeFromCart(${index})">🗑️</button>
      </div>
    `;
    container.appendChild(itemDiv);
  });
  
  updateCartTotal();
}

// Update Quantity
function updateQty(index, delta) {
  CART[index].qty += delta;
  if (CART[index].qty <= 0) {
    CART.splice(index, 1);
  }
  updateCartBadge();
  renderCartItems();
}

// Remove from Cart
function removeFromCart(index) {
  CART.splice(index, 1);
  updateCartBadge();
  renderCartItems();
}

// Update Cart Total
function updateCartTotal() {
  const total = CART.reduce((sum, item) => sum + (parseFloat(item.price) * item.qty), 0);
  document.getElementById('cartTotal').textContent = '$' + total.toFixed(2);
}

// Submit Order
async function submitOrder() {
  if (!SELECTED_TABLE || CART.length === 0) return;
  
  const orderId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const total = CART.reduce((sum, item) => sum + (parseFloat(item.price) * item.qty), 0);
  
  const order = {
    id: orderId,
    table: SELECTED_TABLE,
    items: CART.map(item => ({
      ...item,
      qty: item.qty
    })),
    total: total.toFixed(2),
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  
  // Save order to localStorage
  saveOrder(order);
  
  // Print each item separately
  await printOrder(order);
  
  // Clear cart and go back to table selection
  CART = [];
  SELECTED_TABLE = null;
  updateCartBadge();
  closeCart();
  
  document.getElementById('menuView').classList.add('hidden');
  document.getElementById('tableView').classList.remove('hidden');
  document.getElementById('cartFab').classList.add('hidden');
  document.getElementById('headerInfo').textContent = t('select-table');
  
  showSuccessMessage(t('order-submitted'));
}

// Save Order
function saveOrder(order) {
  const orders = JSON.parse(localStorage.getItem('pos_orders') || '[]');
  orders.push(order);
  localStorage.setItem('pos_orders', JSON.stringify(orders));
}

// Print Order - via test-print endpoint (working proof)
async function printOrder(order) {
  const config = JSON.parse(localStorage.getItem('pos_config') || '{}');
  const foodPrinter = config.printer?.food;
  const drinkPrinter = config.printer?.drink;
  
  console.log('=== PRINT ORDER ===');
  console.log('Order:', order.id, 'Table:', order.table);
  
  let itemCount = 0;
  
  for (const item of order.items) {
    const printerConfig = item.printer === 'food' ? foodPrinter : drinkPrinter;
    
    if (!printerConfig || !printerConfig.ip) {
      console.warn(`⚠ No printer for ${item.printer}: ${item.name}`);
      continue;
    }
    
    for (let i = 0; i < item.qty; i++) {
      itemCount++;
      const copyNum = i + 1;
      
      try {
        await printSingleItem(printerConfig.ip, printerConfig.port, order, item, copyNum);
        console.log(`✓ Item ${itemCount}: ${item.name} (${copyNum}/${item.qty})`);
        await new Promise(r => setTimeout(r, 200));
      } catch (err) {
        console.error(`✗ Item ${itemCount}: ${item.name} - ${err.message}`);
      }
    }
  }
  
  console.log(`=== PRINT COMPLETE (${itemCount} items) ===\n`);
}

// Print Single Item - Use working test-print endpoint
function printSingleItem(printerIp, printerPort, order, item, copyNumber) {
  return new Promise((resolve, reject) => {
    console.log(`[PRINT] Printing: ${item.name} (#${copyNumber}/${item.qty}) to ${printerIp}`);
    
    // Call the working test-print endpoint
    const port = printerPort || 8043;
    const payload = {
      ip: printerIp,
      port: port,
      useEpos: true
    };
    
    fetch('/api/admin/test-print', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => {
      console.log(`[PRINT] Response: ${res.status}`);
      
      if (!res.ok) {
        return res.json().then(data => {
          throw new Error(data.error || `HTTP ${res.status}`);
        });
      }
      return res.json();
    })
    .then(data => {
      console.log(`[PRINT] ✓ Printed successfully`);
      resolve(data);
    })
    .catch(err => {
      console.error(`[PRINT] ✗ Failed:`, err.message);
      reject(err);
    });
  });
}


// Generate Ticket Preview Text
function generateTicketPreview(order, item, copyNumber) {
  let preview = '';
  preview += `       TABLE ${order.table}        \n\n`;
  preview += `Order: ${order.id}\n`;
  preview += `Time: ${new Date().toLocaleTimeString()}\n`;
  preview += `================================\n\n`;
  preview += `${item.name}\n\n`;
  
  if (item.attrs && Object.keys(item.attrs).length > 0) {
    Object.entries(item.attrs).forEach(([key, value]) => {
      preview += `  ${key}: ${value}\n`;
    });
    preview += '\n';
  }
  
  preview += `Copy ${copyNumber} of ${item.qty}\n`;
  preview += `${item.printer.toUpperCase()} PRINTER\n`;
  
  return preview;
}

// Generate Order ID
function generateOrderId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Show Preview Modal
function showPreview() {
  if (CART.length === 0) {
    alert(t('empty-cart'));
    return;
  }

  if (!SELECTED_TABLE) {
    alert(t('select-table-first'));
    return;
  }

  const order = {
    id: generateOrderId(),
    table: SELECTED_TABLE,
    items: CART,
    total: CART.reduce((sum, item) => sum + (parseFloat(item.price) * item.qty), 0).toFixed(2),
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const previewContainer = document.getElementById('previewTickets');
  previewContainer.innerHTML = '';

  let ticketNumber = 0;
  order.items.forEach((item, itemIndex) => {
    for (let i = 0; i < item.qty; i++) {
      ticketNumber++;
      const ticketDiv = document.createElement('div');
      ticketDiv.className = 'ticket-preview';
      
      const titleDiv = document.createElement('div');
      titleDiv.className = 'ticket-preview-title';
      titleDiv.textContent = `Ticket #${ticketNumber} - ${item.name} (${i+1}/${item.qty})`;
      
      const contentDiv = document.createElement('div');
      contentDiv.textContent = generateTicketPreview(order, item, i + 1);
      
      ticketDiv.appendChild(titleDiv);
      ticketDiv.appendChild(contentDiv);
      previewContainer.appendChild(ticketDiv);
    }
  });

  document.getElementById('previewModal').classList.add('show');
}

// Close Preview Modal
function closePreview() {
  document.getElementById('previewModal').classList.remove('show');
}

// Event Listeners
document.getElementById('cartFab').addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', closeCart);
document.getElementById('submitOrder').addEventListener('click', submitOrder);
document.getElementById('previewOrder').addEventListener('click', showPreview);
document.getElementById('closePreview').addEventListener('click', closePreview);
document.getElementById('submitFromPreview').addEventListener('click', () => {
  closePreview();
  submitOrder();
});
document.getElementById('backToCart').addEventListener('click', () => {
  closePreview();
  openCart();
});

// Close modal on backdrop click
document.getElementById('cartModal').addEventListener('click', (e) => {
  if (e.target.id === 'cartModal') closeCart();
});

document.getElementById('previewModal').addEventListener('click', (e) => {
  if (e.target.id === 'previewModal') closePreview();
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderTables();
});
