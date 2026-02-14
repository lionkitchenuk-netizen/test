// Admin functionality

// ==================== Internationalization ====================
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
    printTest: 'Print Test'
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
    printTest: '打印測試'
  }
};

let currentLang = localStorage.getItem('lang') || 'zh-HK';

function t(key) {
  return I18N[currentLang][key] || I18N.en[key] || key;
}

// ==================== CSV Functions ====================
async function loadCSVPreview(name) {
  const res = await fetch(`/api/admin/csv/${name}`);
  if (!res.ok) {
    document.getElementById('csvPreview').textContent = '';
    return;
  }
  const txt = await res.text();
  document.getElementById('csvPreview').textContent = txt;
}

// ==================== Order Functions ====================
async function loadOrders() {
  const res = await fetch('/api/orders');
  const list = await res.json();
  const ul = document.getElementById('ordersList');
  ul.innerHTML = '';
  
  if (list.length === 0) {
    ul.innerHTML = `<li class="empty">${t('noOrders')}</li>`;
    return;
  }
  
  list.forEach(o => {
    const li = document.createElement('li');
    const itemsHtml = (o.items || []).map(it => {
      const pr = (o.printResults || []).filter(p => String(p.itemId) === String(it.id));
      const prText = pr.length ? pr.map(p => `[${p.printerType}@${p.ip}:${p.port} ${p.ok ? 'OK' : 'ERR'}]`).join(', ') : '';
      return `${it.name} x${it.qty} ${prText ? '(' + prText + ')' : ''}`;
    }).join('<br>');
    li.innerHTML = `
      <div class="order-header">
        <strong>Table ${o.table}</strong>
        <span class="order-time">${new Date(o.createdAt).toLocaleString()}</span>
      </div>
      <div class="order-items">${itemsHtml}</div>
      <div class="order-total">Total: $${o.total}</div>
      <button class="mark-paid-btn" data-id="${o.id}">${t('markPaid')}</button>
    `;
    li.querySelector('button').addEventListener('click', async () => {
      const res = await fetch(`/api/orders/${o.id}/pay`, { method: 'POST' });
      if (res.ok) loadOrders();
    });
    ul.appendChild(li);
  });
}

// ==================== Config Functions ====================
async function loadConfig() {
  const res = await fetch('/api/admin/config');
  if (!res.ok) return;
  const cfg = await res.json();
  if (cfg && cfg.printer) {
    const food = cfg.printer.food || {};
    const drink = cfg.printer.drink || {};
    document.getElementById('foodIp').value = food.ip || '';
    document.getElementById('foodPort').value = food.port || 9100;
    document.getElementById('drinkIp').value = drink.ip || '';
    document.getElementById('drinkPort').value = drink.port || 9100;
    // Also set test printer to food printer by default
    document.getElementById('testIp').value = food.ip || '192.168.18.50';
    document.getElementById('testPort').value = food.port || 9100;
  }
}

async function saveConfig() {
  const cfg = {
    printer: {
      food: {
        ip: document.getElementById('foodIp').value,
        port: Number(document.getElementById('foodPort').value)
      },
      drink: {
        ip: document.getElementById('drinkIp').value,
        port: Number(document.getElementById('drinkPort').value)
      }
    }
  };
  const res = await fetch('/api/admin/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cfg)
  });
  const j = await res.json();
  const status = document.getElementById('saveStatus');
  if (j.ok) {
    status.textContent = t('saved');
    setTimeout(() => status.textContent = '', 2000);
  } else {
    status.textContent = 'Error';
  }
}

// ==================== Test Print ====================
async function testPrint() {
  const ip = document.getElementById('testIp').value;
  const port = Number(document.getElementById('testPort').value) || 9100;
  const status = document.getElementById('testStatus');
  
  status.textContent = 'Printing...';
  status.style.color = '#666';
  
  try {
    const res = await fetch('/api/admin/test-print', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip, port })
    });
    const j = await res.json();
    
    if (j.ok) {
      status.textContent = t('printSuccess');
      status.style.color = 'green';
    } else {
      status.textContent = t('printError') + ': ' + (j.error || '');
      status.style.color = 'red';
    }
  } catch (err) {
    status.textContent = t('printError') + ': ' + err.message;
    status.style.color = 'red';
  }
}

// ==================== Initialize ====================
document.addEventListener('DOMContentLoaded', () => {
  // CSV Management
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
    // Validate before uploading
    const v = await fetch(`/api/admin/validate/${sel.value}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: txt
    });
    const r = await v.json();
    if (!r.ok) return alert(t('validationFailed'));
    const res = await fetch(`/api/admin/csv/${sel.value}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: txt
    });
    const j = await res.json();
    if (j.ok) {
      alert(t('uploadSuccess'));
      loadCSVPreview(sel.value);
    } else {
      alert(t('uploadError') + ': ' + (j.error || 'unknown'));
    }
  });

  document.getElementById('validateCsv').addEventListener('click', async () => {
    const f = document.getElementById('csvFile').files[0];
    if (!f) return alert(t('chooseFile'));
    const txt = await f.text();
    const v = await fetch(`/api/admin/validate/${sel.value}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: txt
    });
    const r = await v.json();
    if (r.ok) alert(t('validationPassed'));
    else alert(t('validationFailed'));
  });

  // Orders - refresh every 3 seconds
  loadOrders();
  setInterval(loadOrders, 3000);

  // Printer config
  loadConfig();
  document.getElementById('saveConfig').addEventListener('click', saveConfig);

  // Test print
  document.getElementById('testPrint').addEventListener('click', testPrint);
});
