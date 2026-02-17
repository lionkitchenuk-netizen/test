// Static data - can be edited in admin panel and stored in localStorage
const DEFAULT_DATA = {
  menu: [
    { id: "1", name: "Chicken Rice", price: "3.50", category: "Food", subcategory: "Single", has_attrs: "true", printer: "food" },
    { id: "2", name: "Beef Noodles", price: "4.00", category: "Food", subcategory: "Single", has_attrs: "true", printer: "food" },
    { id: "3", name: "Spring Roll", price: "1.50", category: "Food", subcategory: "Single", has_attrs: "false", printer: "food" },
    { id: "4", name: "Fried Rice", price: "4.50", category: "Food", subcategory: "Single", has_attrs: "true", printer: "food" },
    { id: "5", name: "Wonton Soup", price: "3.80", category: "Food", subcategory: "Single", has_attrs: "false", printer: "food" },
    { id: "6", name: "Char Siu Rice", price: "4.20", category: "Food", subcategory: "Single", has_attrs: "false", printer: "food" },
    { id: "7", name: "Fish Ball Noodles", price: "3.90", category: "Food", subcategory: "Single", has_attrs: "true", printer: "food" },
    { id: "8", name: "Sweet & Sour Pork", price: "5.50", category: "Food", subcategory: "Single", has_attrs: "false", printer: "food" },
    { id: "9", name: "Kung Pao Chicken", price: "5.20", category: "Food", subcategory: "Single", has_attrs: "true", printer: "food" },
    { id: "10", name: "Vegetable Chow Mein", price: "4.30", category: "Food", subcategory: "Single", has_attrs: "false", printer: "food" },
    { id: "11", name: "Dumplings (6pcs)", price: "3.50", category: "Food", subcategory: "Single", has_attrs: "false", printer: "food" },
    { id: "12", name: "Egg Fried Rice", price: "3.80", category: "Food", subcategory: "Single", has_attrs: "false", printer: "food" },
    { id: "13", name: "BBQ Pork Bun", price: "2.50", category: "Food", subcategory: "Single", has_attrs: "false", printer: "food" },
    { id: "14", name: "Prawn Toast", price: "3.20", category: "Food", subcategory: "Single", has_attrs: "false", printer: "food" },
    { id: "15", name: "Lunch Set A", price: "6.50", category: "Food", subcategory: "Set", has_attrs: "false", printer: "food" },
    { id: "16", name: "Lunch Set B", price: "7.00", category: "Food", subcategory: "Set", has_attrs: "false", printer: "food" },
    { id: "17", name: "Dinner Set A", price: "8.50", category: "Food", subcategory: "Set", has_attrs: "false", printer: "food" },
    { id: "18", name: "Dinner Set B", price: "9.00", category: "Food", subcategory: "Set", has_attrs: "false", printer: "food" },
    { id: "19", name: "Family Set (4ppl)", price: "28.00", category: "Food", subcategory: "Set", has_attrs: "false", printer: "food" },
    { id: "20", name: "Iced Lemon Tea", price: "1.50", category: "Drink", subcategory: "Cold", has_attrs: "false", printer: "drink" },
    { id: "21", name: "Iced Milk Tea", price: "2.50", category: "Drink", subcategory: "Cold", has_attrs: "false", printer: "drink" },
    { id: "22", name: "Iced Coffee", price: "2.30", category: "Drink", subcategory: "Cold", has_attrs: "false", printer: "drink" },
    { id: "23", name: "Cola", price: "1.80", category: "Drink", subcategory: "Cold", has_attrs: "false", printer: "drink" },
    { id: "24", name: "Sprite", price: "1.80", category: "Drink", subcategory: "Cold", has_attrs: "false", printer: "drink" },
    { id: "25", name: "Orange Juice", price: "2.20", category: "Drink", subcategory: "Cold", has_attrs: "false", printer: "drink" },
    { id: "26", name: "Apple Juice", price: "2.20", category: "Drink", subcategory: "Cold", has_attrs: "false", printer: "drink" },
    { id: "27", name: "Iced Green Tea", price: "1.80", category: "Drink", subcategory: "Cold", has_attrs: "false", printer: "drink" },
    { id: "28", name: "Iced Milo", price: "2.50", category: "Drink", subcategory: "Cold", has_attrs: "false", printer: "drink" },
    { id: "29", name: "Bubble Tea", price: "3.50", category: "Drink", subcategory: "Cold", has_attrs: "false", printer: "drink" },
    { id: "30", name: "Hot Coffee", price: "2.00", category: "Drink", subcategory: "Hot", has_attrs: "false", printer: "drink" },
    { id: "31", name: "Hot Tea", price: "1.50", category: "Drink", subcategory: "Hot", has_attrs: "false", printer: "drink" },
    { id: "32", name: "Hot Green Tea", price: "1.80", category: "Drink", subcategory: "Hot", has_attrs: "false", printer: "drink" },
    { id: "33", name: "Hot Lemon Tea", price: "1.80", category: "Drink", subcategory: "Hot", has_attrs: "false", printer: "drink" },
    { id: "34", name: "Hot Milo", price: "2.30", category: "Drink", subcategory: "Hot", has_attrs: "false", printer: "drink" },
    { id: "35", name: "Hot Milk", price: "2.00", category: "Drink", subcategory: "Hot", has_attrs: "false", printer: "drink" }
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
      food: { ip: "192.168.1.165", port: 8043, portType: "https" },
      drink: { ip: "192.168.1.165", port: 8043, portType: "https" }
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
