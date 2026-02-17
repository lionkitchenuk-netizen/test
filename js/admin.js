// Admin functionality - Modern POS with Payment & Table Management

// Load and display pending orders
function loadPendingOrders() {
  const orders = JSON.parse(localStorage.getItem('pos_orders') || '[]');
  const pending = orders.filter(o => o.status === 'pending');
  const container = document.getElementById('pendingOrders');
  
  if (pending.length === 0) {
    container.innerHTML = '<div class="empty">✅ No pending orders</div>';
    return;
  }
  
  container.innerHTML = '';
  pending.forEach(order => {
    const orderDiv = document.createElement('div');
    orderDiv.className = 'order-items';
    orderDiv.innerHTML = `
      <div class="order-header">
        <strong>Table ${order.table} - Order #${order.id}</strong>
        <span class="order-time">${new Date(order.createdAt).toLocaleString()}</span>
      </div>
      <div>
        ${order.items.map(item => `<div>• ${item.name} × ${item.qty} ($${item.price})</div>`).join('')}
      </div>
      <div class="order-total">Total: $${order.total}</div>
      <button class="mark-paid-btn" onclick="markOrderPaid('${order.id}')">✓ Mark Paid & Complete</button>
    `;
    container.appendChild(orderDiv);
  });
}

// Mark order as paid and remove from list
function markOrderPaid(orderId) {
  const orders = JSON.parse(localStorage.getItem('pos_orders') || '[]');
  const updated = orders.filter(o => o.id !== orderId);
  localStorage.setItem('pos_orders', JSON.stringify(updated));
  loadPendingOrders();
  alert('Order marked as paid and removed!');
}

// Load and display tables
function loadTablesManagement() {
  const tables = JSON.parse(localStorage.getItem('pos_tables') || '[]');
  const container = document.getElementById('tablesManagement');
  
  if (tables.length === 0) {
    container.innerHTML = '<div class="empty">No tables configured</div>';
    return;
  }
  
  container.innerHTML = '';
  tables.forEach((table, index) => {
    const tableDiv = document.createElement('div');
    tableDiv.style.padding = '10px';
    tableDiv.style.marginBottom = '10px';
    tableDiv.style.background = '#f8f8f8';
    tableDiv.style.borderRadius = '6px';
    tableDiv.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <strong>Table ${table.number}</strong> - 
          Capacity: ${table.capacity} seats
        </div>
        <button onclick="removeTable('${table.id}')" style="background:#f44336">Delete</button>
      </div>
    `;
    container.appendChild(tableDiv);
  });
}

// Add new table
function addNewTable() {
  const number = prompt('Enter table number:');
  const capacity = prompt('Enter seating capacity:');
  
  if (!number || !capacity) return;
  
  const tables = JSON.parse(localStorage.getItem('pos_tables') || '[]');
  const newTable = {
    id: Date.now().toString(),
    number: number,
    capacity: parseInt(capacity),
    status: 'available'
  };
  
  tables.push(newTable);
  localStorage.setItem('pos_tables', JSON.stringify(tables));
  loadTablesManagement();
}

// Remove table
function removeTable(tableId) {
  if (!confirm('Remove this table?')) return;
  
  const tables = JSON.parse(localStorage.getItem('pos_tables') || '[]');
  const updated = tables.filter(t => t.id !== tableId);
  localStorage.setItem('pos_tables', JSON.stringify(updated));
  loadTablesManagement();
}

const I18N = {
  en: {
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
    validate: 'Validate',
    upload: 'Upload',
    download: 'Download',
    chooseFile: 'Choose file',
    validationPassed: 'CSV looks valid',
    validationFailed: 'CSV invalid for selected type',
    uploadSuccess: 'Uploaded',
    uploadError: 'Upload error',
    noOrders: 'No orders',
    printTest: 'Print Test',
    clearData: 'Clear All Data',
    clearConfirm: 'Are you sure? This will delete all orders and reset menu to defaults.',
    dataManagement: 'Data Management',
    resetToDefaults: 'Reset to Defaults'
  },
  'zh-HK': {
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
    validate: '驗證',
    upload: '上載',
    download: '下載',
    chooseFile: '選擇文件',
    validationPassed: 'CSV格式正確',
    validationFailed: 'CSV格式錯誤',
    uploadSuccess: '已上載',
    uploadError: '上載錯誤',
    noOrders: '沒有訂單',
    printTest: '打印測試',
    clearData: '清除所有數據',
    clearConfirm: '確定嗎？呢個會刪除所有訂單同埋重置菜單。',
    dataManagement: '數據管理',
    resetToDefaults: '重置為默認'
  }
};

let currentLang = localStorage.getItem('lang') || 'zh-HK';

function t(key) {
  return I18N[currentLang][key] || I18N.en[key] || key;
}

function loadCSVPreview(type) {
  const data = getData();
  let rows = [];
  let headers = [];
  
  if (type === 'menu.csv') {
    headers = ['id', 'name', 'price', 'category', 'has_attrs', 'printer'];
    rows = data.items;
  } else if (type === 'sets.csv') {
    headers = ['id', 'name', 'price', 'time_start', 'time_end', 'items'];
    rows = data.sets;
  } else if (type === 'attributes.csv') {
    headers = ['id', 'item_id', 'attr_name', 'options'];
    rows = data.attrs;
  }
  
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => r[h] || '').join(','))].join('\n');
  document.getElementById('csvPreview').textContent = csv;
}

function validateCSV(type, csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return false;
  
  const headers = lines[0].split(',').map(h => h.trim());
  
  if (type === 'menu.csv') {
    const want = ['id', 'name', 'price', 'category', 'has_attrs'];
    return want.every(c => headers.includes(c));
  } else if (type === 'sets.csv') {
    const want = ['id', 'name', 'price', 'time_start', 'time_end', 'items'];
    return want.every(c => headers.includes(c));
  } else if (type === 'attributes.csv') {
    const want = ['id', 'item_id', 'attr_name', 'options'];
    return want.every(c => headers.includes(c));
  }
  return false;
}

function importCSV(type, csvText) {
  if (!validateCSV(type, csvText)) return false;
  
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i]?.trim() || '');
    return obj;
  });
  
  if (type === 'menu.csv') {
    saveData('MENU', rows);
  } else if (type === 'sets.csv') {
    saveData('SETS', rows);
  } else if (type === 'attributes.csv') {
    saveData('ATTRS', rows);
  }
  
  return true;
}

function loadOrders() {
  // Try to load from server first
  fetch('/api/orders')
    .then(res => res.json())
    .then(orders => {
      displayOrders(orders);
    })
    .catch(() => {
      // Fall back to localStorage
      const orders = getOrders();
      displayOrders(orders);
    });
}

function displayOrders(orders) {
  const ul = document.getElementById('ordersList');
  ul.innerHTML = '';
  
  if (!orders || orders.length === 0) {
    ul.innerHTML = '<li class="empty">No orders</li>';
    return;
  }
  
  orders.forEach(o => {
    const li = document.createElement('li');
    const itemsHtml = (o.items || []).map(it => {
      return `${it.name} x${it.qty}`;
    }).join('<br>');
    li.innerHTML = `
      <div class="order-header">
        <strong>Table ${o.table}</strong>
        <span class="order-time">${new Date(o.createdAt).toLocaleString()}</span>
      </div>
      <div class="order-items">${itemsHtml}</div>
      <div class="order-total">Total: $${o.total}</div>
      <button class="mark-paid-btn" data-id="${o.id}">Mark Paid</button>
    `;
    li.querySelector('button').addEventListener('click', () => {
      // Try server first, then localStorage
      fetch('/api/orders/' + o.id + '/pay', { method: 'POST' })
        .then(() => loadOrders())
        .catch(() => {
          removeOrder(o.id);
          loadOrders();
        });
    });
    ul.appendChild(li);
  });
}

function loadConfig() {
  const data = getData();
  if (data.config && data.config.printer) {
    const food = data.config.printer.food || {};
    const drink = data.config.printer.drink || {};
    document.getElementById('foodIp').value = food.ip || '';
    document.getElementById('foodPort').value = food.port || 9100;
    document.getElementById('foodPortType').value = food.portType || 'tcp';
    document.getElementById('drinkIp').value = drink.ip || '';
    document.getElementById('drinkPort').value = drink.port || 9100;
    document.getElementById('drinkPortType').value = drink.portType || 'tcp';
    document.getElementById('testIp').value = food.ip || '192.168.18.50';
    document.getElementById('testPort').value = food.port || 9100;
    document.getElementById('testPortType').value = food.portType || 'tcp';
  }
}

function saveConfig() {
  const config = {
    printer: {
      food: {
        ip: document.getElementById('foodIp').value,
        port: Number(document.getElementById('foodPort').value),
        portType: document.getElementById('foodPortType').value
      },
      drink: {
        ip: document.getElementById('drinkIp').value,
        port: Number(document.getElementById('drinkPort').value),
        portType: document.getElementById('drinkPortType').value
      }
    }
  };
  
  // Save via data.js function
  saveData('CONFIG', config);
  
  // Also save directly to ensure it's accessible
  localStorage.setItem('pos_config', JSON.stringify(config));
  
  console.log('Config saved:', config);
  
  const status = document.getElementById('saveStatus');
  status.textContent = t('saved');
  setTimeout(() => status.textContent = '', 2000);
}

async function testPrint() {
  const ip = document.getElementById('testIp').value;
  const port = Number(document.getElementById('testPort').value) || 9100;
  const portType = document.getElementById('testPortType').value;
  const status = document.getElementById('testStatus');
  
  if (!ip) {
    status.textContent = 'Please enter printer IP';
    status.style.color = 'red';
    return;
  }
  
  status.textContent = 'Sending print job...';
  status.style.color = '#666';
  
  try {
    const response = await fetch('/api/admin/test-print', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ip, 
        port,
        useEpos: portType === 'https'
      })
    });
    
    if (response.ok) {
      status.textContent = 'Print sent successfully!';
      status.style.color = 'green';
    } else {
      // Try to parse as JSON, fallback to status code
      let errorMsg = `HTTP ${response.status}`;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const err = await response.json();
          errorMsg = err.error || err.message || errorMsg;
        } else {
          // Response is not JSON, show status text
          errorMsg = response.statusText || `HTTP ${response.status}`;
        }
      } catch (parseErr) {
        // JSON parsing failed, use status code
        console.log('Could not parse response:', parseErr);
      }
      status.textContent = 'Print error: ' + errorMsg;
      status.style.color = 'red';
    }
  } catch (e) {
    status.textContent = 'Print error: ' + e.message;
    status.style.color = 'red';
    console.error('Test print error:', e);
  }
}

function resetToDefaults() {
  if (confirm(t('clearConfirm'))) {
    localStorage.clear();
    initData();
    loadCSVPreview(document.getElementById('csvSelect').value);
    loadOrders();
    loadConfig();
    alert('Data reset to defaults!');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initData();
  
  const sel = document.getElementById('csvSelect');
  loadCSVPreview(sel.value);
  sel.addEventListener('change', () => loadCSVPreview(sel.value));

  document.getElementById('downloadCsv').addEventListener('click', () => {
    loadCSVPreview(sel.value);
  });

  document.getElementById('uploadCsv').addEventListener('click', async () => {
    const f = document.getElementById('csvFile').files[0];
    if (!f) return alert(t('chooseFile'));
    const txt = await f.text();
    if (!importCSV(sel.value, txt)) {
      return alert(t('validationFailed'));
    }
    alert(t('uploadSuccess'));
    loadCSVPreview(sel.value);
  });

  document.getElementById('validateCsv').addEventListener('click', async () => {
    const f = document.getElementById('csvFile').files[0];
    if (!f) return alert(t('chooseFile'));
    const txt = await f.text();
    if (validateCSV(sel.value, txt)) alert(t('validationPassed'));
    else alert(t('validationFailed'));
  });

  loadOrders();
  setInterval(loadOrders, 3000);

  loadConfig();
  document.getElementById('saveConfig').addEventListener('click', saveConfig);

  document.getElementById('testPrint').addEventListener('click', testPrint);
  
  document.getElementById('resetDefaults').addEventListener('click', resetToDefaults);

  // Port type change handlers - update default port numbers
  ['food', 'drink', 'test'].forEach(prefix => {
    const portTypeSelect = document.getElementById(prefix + 'PortType');
    const portInput = document.getElementById(prefix + 'Port');
    if (portTypeSelect) {
      portTypeSelect.addEventListener('change', (e) => {
        portInput.value = e.target.value === 'https' ? 8043 : 9100;
      });
    }
  });
  
  // Initialize new sections
  if (document.getElementById('pendingOrders')) {
    loadPendingOrders();
    setInterval(loadPendingOrders, 5000); // Refresh every 5 seconds
  }
  
  if (document.getElementById('tablesManagement')) {
    loadTablesManagement();
    document.getElementById('addTable')?.addEventListener('click', addNewTable);
  }
});
