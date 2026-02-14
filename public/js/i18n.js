// Internationalization: Cantonese (zh-HK) and English (en)
const I18N = {
  en: {
    // Table selection
    selectTable: 'Select Table',
    tableNumber: 'Table Number',
    confirm: 'Confirm',
    
    // Menu
    selfOrder: 'Self Order',
    setMenus: 'Set Menus',
    mainMenu: 'Main Menu',
    singleItems: 'Single Items',
    addToCart: 'Add',
    addSet: 'Add Set',
    
    // Cart
    cart: 'Cart',
    yourOrder: 'Your Order',
    total: 'Total',
    submitOrder: 'Submit Order',
    reviewOrder: 'Review Order',
    emptyCart: 'Cart is empty',
    remove: 'Remove',
    quantity: 'Qty',
    
    // Attributes
    chooseOption: 'Please select',
    cancel: 'Cancel',
    ok: 'OK',
    
    // Order review
    orderReview: 'Order Review',
    backToMenu: 'Back to Menu',
    confirmSubmit: 'Confirm & Submit',
    item: 'Item',
    price: 'Price',
    subtotal: 'Subtotal',
    
    // Success
    orderSubmitted: 'Order Submitted!',
    orderSuccess: 'Your order has been sent to kitchen.',
    orderNumber: 'Order Number',
    
    // Language
    language: 'Language',
    english: 'English',
    cantonese: 'Cantonese',
    
    // Admin
    admin: 'Admin',
    csvManagement: 'CSV Management',
    printerSettings: 'Printer Settings',
    foodPrinterIP: 'Food Printer IP',
    drinkPrinterIP: 'Drink Printer IP',
    port: 'Port',
    saveConfig: 'Save Printer Config',
    saved: 'Saved!',
    liveOrders: 'Live Orders',
    markPaid: 'Mark Paid / Remove',
    testPrint: 'Test Print',
    printSuccess: 'Print sent successfully!',
    printError: 'Print error',
    
    // Categories
    beverage: 'Beverage',
    main: 'Main Course',
    side: 'Side Dish',
    dessert: 'Dessert'
  },
  'zh-HK': {
    // Table selection
    selectTable: '選擇枱號',
    tableNumber: '枱號',
    confirm: '確認',
    
    // Menu
    selfOrder: '自助落單',
    setMenus: '套餐',
    mainMenu: '主菜',
    singleItems: '單點',
    addToCart: '加入',
    addSet: '加套餐',
    
    // Cart
    cart: '購物籃',
    yourOrder: '你的訂單',
    total: '總計',
    submitOrder: '落單',
    reviewOrder: '查看訂單',
    emptyCart: '購物籃係空既',
    remove: '刪除',
    quantity: '數量',
    
    // Attributes
    chooseOption: '請選擇',
    cancel: '取消',
    ok: '確定',
    
    // Order review
    orderReview: '訂單詳情',
    backToMenu: '返回菜單',
    confirmSubmit: '確認落單',
    item: '項目',
    price: '價錢',
    subtotal: '小計',
    
    // Success
    orderSubmitted: '落單成功！',
    orderSuccess: '你既訂單已經送到廚房.',
    orderNumber: '訂單編號',
    
    // Language
    language: '語言',
    english: '英文',
    cantonese: '廣東話',
    
    // Admin
    admin: '管理',
    csvManagement: 'CSV管理',
    printerSettings: '打印機設置',
    foodPrinterIP: '食物打印機IP',
    drinkPrinterIP: '飲品打印機IP',
    port: '端口',
    saveConfig: '保存設置',
    saved: '已保存！',
    liveOrders: '即時訂單',
    markPaid: '已收款/刪除',
    testPrint: '測試打印',
    printSuccess: '打印指令已發送！',
    printError: '打印失敗',
    
    // Categories
    beverage: '飲品',
    main: '主菜',
    side: '小食',
    dessert: '甜品'
  }
};

// Current language
let currentLang = localStorage.getItem('lang') || 'zh-HK';

function t(key) {
  return I18N[currentLang][key] || I18N['en'][key] || key;
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  // Trigger a custom event for UI update
  window.dispatchEvent(new CustomEvent('languageChanged'));
}

function getLang() {
  return currentLang;
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
- [ ] Add language support (Cantonese/English)
- [ ] Test the complete system
</task_progress>
</invoke>
