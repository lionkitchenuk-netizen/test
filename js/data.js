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

const STORAGE_KEYS = {
  MENU: 'pos_menu',
  SETS: 'pos_sets',
  ATTRS: 'pos_attributes',
  CONFIG: 'pos_config',
  ORDERS: 'pos_orders'
};

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

function saveData(type, data) {
  localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(data));
}

function getOrders() {
  const orders = localStorage.getItem(STORAGE_KEYS.ORDERS);
  return orders ? JSON.parse(orders) : [];
}

function saveOrder(order) {
  const orders = getOrders();
  orders.push(order);
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

function removeOrder(orderId) {
  const orders = getOrders();
  const filtered = orders.filter(o => o.id !== orderId);
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(filtered));
}

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
