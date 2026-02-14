// Static data - can be edited in admin panel and stored in localStorage
const DEFAULT_DATA = {
  menu: [
    { id: "1", name: "Chicken Rice", price: "3.50", category: "Main", has_attrs: "true", printer: "food" },
    { id: "2", name: "Beef Noodles", price: "4.00", category: "Main", has_attrs: "true", printer: "food" },
    { id: "3", name: "Iced Tea", price: "1.00", category: "Beverage", has_attrs: "false", printer: "drink" },
    { id: "4", name: "Spring Roll", price: "1.50", category: "Side", has_attrs: "false", printer: "food" }
  ],
  sets: [
    { id: "1", name: "Lunch Set A", price: "6.50", time_start: "11:00", time_end: "14:00", items: "1|3" },
    { id: "2", name: "Dinner Set B", price: "7.00", time_start: "17:00", time_end: "21:00", items: "2|4" }
  ],
  attributes: [
    { id: "1", item_id: "1", attr_name: "Chicken Level", options: "Regular|Spicy|Extra Spicy" },
    { id: "2", item_id: "2", attr_name: "Noodle Type", options: "Thin|Thick" }
  ],
  config: {
    printer: {
      food: { ip: "192.168.18.50", port: 9100 },
      drink: { ip: "192.168.18.50", port: 9100 }
    }
  }
};

// localStorage keys
const STORAGE_KEYS = {
  MENU: 'pos_menu',
  SETS: 'pos_sets',
  ATTRS: 'pos_attributes',
  CONFIG: 'pos_config',
  ORDERS: 'pos_orders'
};

// Initialize data from localStorage or defaults
function getData() {
  const menu = localStorage.getItem(STORAGE_KEYS.MENU);
  const sets = localStorage.getItem(STORAGE_KEYS.SETS);
  const attrs = localStorage.getItem(STORAGE_KEYS.ATTRS);
  const config = localStorage.getItem(STORAGE_KEYS.CONFIG);
  
  return {
    items: menu ? JSON.parse(menu) : DEFAULT_DATA.menu,
    sets: sets ? JSON.parse(sets) : DEFAULT_DATA.sets,
    attrs: attrs ? JSON.parse(attrs) : DEFAULT_DATA.attributes,
    config: config ? JSON.parse(config) : DEFAULT_DATA.config
  };
}

// Save data to localStorage
function saveData(type, data) {
  localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(data));
}

// Get orders from localStorage
function getOrders() {
  const orders = localStorage.getItem(STORAGE_KEYS.ORDERS);
  return orders ? JSON.parse(orders) : [];
}

// Save order to localStorage
function saveOrder(order) {
  const orders = getOrders();
  orders.push(order);
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

// Remove order from localStorage
function removeOrder(orderId) {
  const orders = getOrders();
  const filtered = orders.filter(o => o.id !== orderId);
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(filtered));
}

// Initialize with defaults if empty
function initData() {
  if (!localStorage.getItem(STORAGE_KEYS.MENU)) {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(DEFAULT_DATA.menu));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETS)) {
    localStorage.setItem(STORAGE_KEYS.SETS, JSON.stringify(DEFAULT_DATA.sets));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ATTRS)) {
    localStorage.setItem(STORAGE_KEYS.ATTRS, JSON.stringify(DEFAULT_DATA.attributes));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_DATA.config));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
  }
}

// Export data as CSV format for download
function exportAsCSV(type) {
  const data = getData();
  let headers = [];
  let rows = [];
  
  if (type === 'menu') {
    headers = ['id', 'name', 'price', 'category', 'has_attrs', 'printer'];
    rows = data.items;
  } else if (type === 'sets') {
    headers = ['id', 'name', 'price', 'time_start', 'time_end', 'items'];
    rows = data.sets;
  } else if (type === 'attributes') {
    headers = ['id', 'item_id', 'attr_name', 'options'];
    rows = data.attrs;
  }
  
  return [headers.join(','), ...rows.map(r => headers.map(h => r[h] || '').join(','))].join('\n');
}

// Import data from CSV
function importFromCSV(type, csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return false;
  
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i]?.trim() || '');
    return obj;
  });
  
  const keyMap = { menu: 'MENU', sets: 'SETS', attributes: 'ATTRS' };
  saveData(keyMap[type], rows);
  return true;
}
</parameter>
<task_progress>
- [x] Analyze requirements
- [x] Set up project structure
- [x] Create menu data and configuration
- [x] Implement table selection UI
- [x] Implement set menu display based on time
- [x] Implement single food selection
- [x] Implement food attribute selection
- [x] Implement cart functionality
- [x] Implement order review and submission
- [x] Create admin interface
- [x] Implement printer integration
- [x] Add language support (Cantonese/English)
- [x] Adapt for Cloudflare Pages deployment (fully static with localStorage)
</task_progress>
</invoke>
</minimax:tool_call>