// Modern POS System for Staff
let TABLES = [];
let MENU = [];
let ATTRIBUTES = [];
let SELECTED_TABLE = null;
let CART = [];
let CURRENT_CATEGORY = 'all';

// Load data from localStorage
function loadData() {
  const tablesData = localStorage.getItem('pos_tables');
  const menuData = localStorage.getItem('pos_menu');
  const attrsData = localStorage.getItem('pos_attributes');
  
  TABLES = tablesData ? JSON.parse(tablesData) : getDefaultTables();
  MENU = menuData ? JSON.parse(menuData) : getDefaultMenu();
  ATTRIBUTES = attrsData ? JSON.parse(attrsData) : getDefaultAttributes();
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
    { id: '4', name: 'Lunch Set A', price: '6.50', category: 'Food', subcategory: 'Set', has_attrs: 'false', printer: 'food' },
    { id: '5', name: 'Dinner Set B', price: '7.50', category: 'Food', subcategory: 'Set', has_attrs: 'false', printer: 'food' },
    { id: '6', name: 'Iced Lemon Tea', price: '1.50', category: 'Drink', subcategory: 'Cold', has_attrs: 'false', printer: 'drink' },
    { id: '7', name: 'Hot Coffee', price: '2.00', category: 'Drink', subcategory: 'Hot', has_attrs: 'false', printer: 'drink' },
    { id: '8', name: 'Iced Milk Tea', price: '2.50', category: 'Drink', subcategory: 'Cold', has_attrs: 'false', printer: 'drink' },
    { id: '9', name: 'Hot Green Tea', price: '1.80', category: 'Drink', subcategory: 'Hot', has_attrs: 'false', printer: 'drink' }
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
  document.getElementById('headerInfo').textContent = `Table ${tableNumber}`;
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
    { id: 'all', name: '🍽️ All', icon: '' },
    { id: 'Food-Set', name: '🍱 Set Meals', icon: '' },
    { id: 'Food-Single', name: '🍜 Single Items', icon: '' },
    { id: 'Drink-Cold', name: '🥤 Cold Drinks', icon: '' },
    { id: 'Drink-Hot', name: '☕ Hot Drinks', icon: '' }
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
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">🛒</div><div>Cart is empty</div></div>';
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
  document.getElementById('headerInfo').textContent = 'Select Table';
  
  showSuccessMessage(`Order #${orderId} submitted!`);
}

// Save Order
function saveOrder(order) {
  const orders = JSON.parse(localStorage.getItem('pos_orders') || '[]');
  orders.push(order);
  localStorage.setItem('pos_orders', JSON.stringify(orders));
}

// Print Order - 1 ticket per item
async function printOrder(order) {
  const config = JSON.parse(localStorage.getItem('pos_config') || '{}');
  const foodPrinter = config.printer?.food;
  const drinkPrinter = config.printer?.drink;
  
  console.log('Printing order:', order);
  console.log('Printer config:', config);
  
  // Group items by printer
  const printTasks = [];
  
  order.items.forEach(item => {
    const printerConfig = item.printer === 'food' ? foodPrinter : drinkPrinter;
    
    if (printerConfig && printerConfig.ip) {
      // Print each item 'qty' times
      for (let i = 0; i < item.qty; i++) {
        printTasks.push(
          printSingleItem(printerConfig.ip, order, item, i + 1)
            .then(() => console.log(`Printed: ${item.name} (${i+1}/${item.qty})`))
            .catch(err => console.error(`Print failed: ${item.name}`, err))
        );
      }
    }
  });
  
  await Promise.allSettled(printTasks);
}

// Print Single Item Ticket
function printSingleItem(printerIp, order, item, copyNumber) {
  return new Promise((resolve, reject) => {
    try {
      const eposDevice = new epson.ePOSDevice();
      
      eposDevice.connect(printerIp, 8043, function(data) {
        if (data === 'OK' || data === 'SSL_CONNECT_OK') {
          eposDevice.createDevice('local_printer', eposDevice.DEVICE_TYPE_PRINTER, {
            crypto: false,
            buffer: false
          }, function(devobj, retcode) {
            if (retcode === 'OK') {
              const printer = devobj;
              
              // Build single-item receipt
              printer.addTextAlign(printer.ALIGN_CENTER);
              printer.addTextSize(2, 2);
              printer.addText(`TABLE ${order.table}\\n`);
              printer.addTextSize(1, 1);
              printer.addText(`Order: ${order.id}\\n`);
              printer.addText(`Time: ${new Date().toLocaleTimeString()}\\n`);
              printer.addText('================================\\n');
              
              printer.addTextSize(2, 2);
              printer.addText(`${item.name}\\n`);
              printer.addTextSize(1, 1);
              
              if (item.attrs && Object.keys(item.attrs).length > 0) {
                Object.entries(item.attrs).forEach(([key, value]) => {
                  printer.addText(`  ${key}: ${value}\\n`);
                });
              }
              
              printer.addText('\\n');
              printer.addTextAlign(printer.ALIGN_CENTER);
              printer.addTextSize(1, 1);
              printer.addText(`Copy ${copyNumber} of ${item.qty}\\n`);
              printer.addText(`${item.printer.toUpperCase()} PRINTER\\n`);
              
              printer.addFeedLine(3);
              printer.addCut(printer.CUT_FEED);
              
              printer.send();
              
              printer.onreceive = function(res) {
                eposDevice.deleteDevice(printer);
                eposDevice.disconnect();
                if (res.success) {
                  resolve();
                } else {
                  reject(new Error('Print failed: ' + res.code));
                }
              };
              
              printer.onerror = function(err) {
                eposDevice.deleteDevice(printer);
                eposDevice.disconnect();
                reject(new Error('Printer error: ' + err.status));
              };
            } else {
              eposDevice.disconnect();
              reject(new Error('Failed to create printer: ' + retcode));
            }
          });
        } else {
          reject(new Error('Connection failed: ' + data));
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

// Event Listeners
document.getElementById('cartFab').addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', closeCart);
document.getElementById('submitOrder').addEventListener('click', submitOrder);

// Close modal on backdrop click
document.getElementById('cartModal').addEventListener('click', (e) => {
  if (e.target.id === 'cartModal') closeCart();
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderTables();
});
