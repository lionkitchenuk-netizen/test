const express = require('express');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const net = require('net');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// In-memory orders store (ephemeral)
const ORDERS = [];

const DATA_DIR = path.join(__dirname, 'data');
const CONFIG_PATH = path.join(__dirname, 'config.json');

function readCSV(file) {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return [];
  const raw = fs.readFileSync(p, 'utf8');
  const records = parse(raw, { columns: true, skip_empty_lines: true });
  return records;
}

function loadMenuMap(){
  const items = readCSV('menu.csv');
  const map = new Map();
  items.forEach(it=> map.set(String(it.id), it));
  return map;
}

function validateCSVContent(name, text) {
  // Basic header validation per known CSV name
  const headers = parse(text, { to_line: 1 })[0];
  const cols = headers.map(h=>h.trim());
  if (name === 'menu.csv') {
    const want = ['id','name','price','category','has_attrs'];
    // allow optional 'printer' column
    return want.every(c=>cols.includes(c));
  }
  if (name === 'sets.csv') {
    const want = ['id','name','price','time_start','time_end','items'];
    return want.every(c=>cols.includes(c));
  }
  if (name === 'attributes.csv') {
    const want = ['id','item_id','attr_name','options'];
    return want.every(c=>cols.includes(c));
  }
  return false;
}

app.get('/api/menu', (req, res) => {
  try {
    const items = readCSV('menu.csv');
    const sets = readCSV('sets.csv');
    const attrs = readCSV('attributes.csv');
    res.json({ items, sets, attrs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function sendToPrinter(ip, port, data) {
  return new Promise((resolve, reject) => {
    console.log(`Connecting to ${ip}:${port}...`);
    const client = new net.Socket();
    
    client.setTimeout(5000);
    
    client.connect(port, ip, () => {
      console.log('Connected, sending data...');
      
      // Convert string to raw bytes (latin1 encoding for ESC/POS)
      let buf;
      if (Buffer.isBuffer(data)) {
        buf = data;
      } else {
        buf = Buffer.from(data, 'latin1');
      }
      
      console.log('Sending buffer length:', buf.length);
      client.write(buf);
      console.log('Data sent, waiting for response...');
      
      // Wait a bit before closing to ensure data is sent
      setTimeout(() => {
        client.end();
      }, 1000);
    });
    
    client.on('data', (data) => {
      console.log('Received data:', data.toString());
    });
    
    client.on('error', (err) => {
      console.error('Connection error:', err.message);
      reject(err);
    });
    
    client.on('close', () => {
      console.log('Connection closed');
      resolve();
    });
    
    client.on('timeout', () => {
      console.error('Connection timeout');
      client.destroy();
      reject(new Error('Connection timeout'));
    });
  });
}

function buildEscPosData(order) {
  // Basic ESC/POS formatting. This creates a Buffer with some commands.
  // Init, center header, bold table line, items left-aligned, cut.
  const ESC = '\x1B';
  const GS = '\x1D';
  let parts = [];

  parts.push(ESC + '@'); // initialize
  parts.push(ESC + 'a' + '\x01'); // center
  parts.push(ESC + 'E' + '\x01'); // bold on
  parts.push(`Table: ${order.table}\n`);
  parts.push(ESC + 'E' + '\x00'); // bold off
  parts.push(`${new Date().toLocaleString()}\n`);
  parts.push('-------------------------\n');
  parts.push(ESC + 'a' + '\x00'); // left align
  order.items.forEach((it, i) => {
    const line = `${i + 1}. ${it.name} x${it.qty}  ${Number(it.price).toFixed(2)}\n`;
    parts.push(line);
    if (it.attrs && it.attrs.length) {
      it.attrs.forEach(a => {
        parts.push(`   - ${a}\n`);
      });
    }
  });
  parts.push('-------------------------\n');
  parts.push(`Total: ${order.total}\n`);
  parts.push('\n\n');

  // Feed and cut - common sequence (may vary by printer model)
  parts.push(GS + 'V' + '\x01'); // full cut

  return Buffer.from(parts.join(''), 'binary');
}

function buildEscPosForItem(order, item){
  const ESC = '\x1B';
  const GS = '\x1D';
  let parts = [];
  parts.push(ESC + '@');
  parts.push(ESC + 'a' + '\x01'); // center
  parts.push(ESC + 'E' + '\x01'); // bold on
  parts.push(`Table: ${order.table}\n`);
  parts.push(ESC + 'E' + '\x00');
  parts.push(`${new Date().toLocaleString()}\n`);
  parts.push('-------------------------\n');
  parts.push(ESC + 'a' + '\x00'); // left

  const line = `${item.name} x${item.qty || 1}  ${Number(item.price||0).toFixed(2)}\n`;
  parts.push(line);
  if (item.attrs && item.attrs.length){
    item.attrs.forEach(a=> parts.push(`   - ${a}\n`));
  }

  parts.push('-------------------------\n');
  parts.push(`Total: ${order.total}\n`);
  parts.push('\n\n');
  parts.push(GS + 'V' + '\x01');
  return Buffer.from(parts.join(''), 'binary');
}

app.post('/api/order', async (req, res) => {
  try {
    const order = req.body;
    // assign id and push to in-memory orders
    order.id = Date.now().toString(36) + Math.random().toString(36).slice(2,6);
    order.createdAt = new Date().toISOString();
    order.status = 'pending';
    ORDERS.push(order);

    // read config for default printer
    let cfg = {};
    if (fs.existsSync(CONFIG_PATH)) cfg = JSON.parse(fs.readFileSync(CONFIG_PATH,'utf8'));
    const printerIp = order.printerIp || (cfg.printer && cfg.printer.ip);
    const printerPort = order.printerPort || (cfg.printer && cfg.printer.port) || 9100;

    // build map of menu items to detect categories
    const menuMap = loadMenuMap();

    // Print one ticket per item. Route to food/drink printer by category.
      // initialize printResults container on order
      order.printResults = [];
      for (const it of order.items){
        const menuItem = menuMap.get(String(it.id));
        const category = menuItem && menuItem.category ? menuItem.category.toLowerCase() : '';
        const isDrink = category.includes('beverage') || category.includes('drink');

        // Determine target printer type: menu override > category auto
        let targetType = null;
        if (menuItem && menuItem.printer) targetType = String(menuItem.printer).toLowerCase();
        else targetType = isDrink ? 'drink' : 'food';

        const targetPrinter = (cfg.printer && cfg.printer[targetType]) || null;
        const targetIp = it.printerIp || (targetPrinter && targetPrinter.ip) || printerIp;
        const targetPort = it.printerPort || (targetPrinter && targetPrinter.port) || printerPort;

        // print as many tickets as quantity
        const qty = Number(it.qty || 1);
        for (let k=0;k<qty;k++){
          const payload = buildEscPosForItem(order, it);
          let ok = false;
          try{
            if (targetIp) {
              await sendToPrinter(targetIp, targetPort, payload);
              ok = true;
            }
          }catch(err){
            ok = false;
            console.error('Print item error', err.message);
          }
          // record print attempt
          order.printResults.push({ itemId: it.id, itemName: it.name, printerType: targetType, ip: targetIp, port: targetPort, ok, time: new Date().toISOString() });
        }
      }

    res.json({ ok: true, id: order.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: list orders
app.get('/api/orders', (req, res) => {
  res.json(ORDERS);
});

// Admin: mark order paid (removes it)
app.post('/api/orders/:id/pay', (req, res) => {
  const id = req.params.id;
  const idx = ORDERS.findIndex(o=>o.id===id);
  if (idx===-1) return res.status(404).json({ error: 'not found' });
  ORDERS.splice(idx,1);
  res.json({ ok: true });
});

// Admin: download CSV
app.get('/api/admin/csv/:name', (req, res) => {
  const name = req.params.name;
  const file = path.join(DATA_DIR, name);
  if (!fs.existsSync(file)) return res.status(404).send('');
  res.type('text/csv').send(fs.readFileSync(file,'utf8'));
});

// Admin: upload CSV (raw text body)
app.post('/api/admin/csv/:name', express.text({ type: '*/*' }), (req, res) => {
  const name = req.params.name;
  const file = path.join(DATA_DIR, name);
  try{
    // validate before writing
    if (!validateCSVContent(name, req.body)) return res.status(400).json({ error: 'invalid csv format' });
    fs.writeFileSync(file, req.body, 'utf8');
    res.json({ ok: true });
  }catch(err){ res.status(500).json({ error: err.message }); }
});

// Validate CSV without saving
app.post('/api/admin/validate/:name', express.text({ type: '*/*' }), (req, res) => {
  const name = req.params.name;
  try{
    const ok = validateCSVContent(name, req.body);
    res.json({ ok });
  }catch(err){ res.status(500).json({ error: err.message }); }
});

// Admin: get/save config.json
app.get('/api/admin/config', (req, res) => {
  try{
    if (!fs.existsSync(CONFIG_PATH)) return res.json({});
    const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH,'utf8'));
    res.json(cfg);
  }catch(err){ res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/config', (req, res) => {
  try{
    const cfg = req.body;
    // Basic validation
    if (!cfg.printer) return res.status(400).json({ error: 'missing printer config' });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), 'utf8');
    res.json({ ok: true });
  }catch(err){ res.status(500).json({ error: err.message }); }
});

// Admin: test print
app.post('/api/admin/test-print', async (req, res) => {
  try{
    const { ip, port } = req.body;
    if (!ip) return res.status(400).json({ error: 'missing ip' });
    
    const testData = buildTestPrintData();
    await sendToPrinter(ip, port || 9100, testData);
    res.json({ ok: true });
  }catch(err){ 
    res.status(500).json({ error: err.message }); 
  }
});

// HTTP Print via printer's web interface
app.post('/api/print/http', async (req, res) => {
  try {
    const { ip, data } = req.body;
    if (!ip) return res.status(400).json({ error: 'missing ip' });
    
    // Fall back to raw TCP
    const rawData = Buffer.from(data, 'latin1');
    await sendToPrinter(ip, 9100, rawData);
    res.json({ ok: true, message: 'Printed via raw TCP' });
  } catch (err) {
    console.error('HTTP Print error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

function buildTestPrintData(){
  // Just plain ASCII text with line feeds - no ESC/POS commands at all
  const text = 'TEST PRINT\n==========\n\nHello World!\n\n\n\n\n';
  return Buffer.from(text, 'ascii');
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
