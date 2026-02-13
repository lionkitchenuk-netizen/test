async function loadCSVPreview(name){
  const res = await fetch(`/api/admin/csv/${name}`);
  if (!res.ok){ document.getElementById('csvPreview').textContent = ''; return; }
  const txt = await res.text();
  document.getElementById('csvPreview').textContent = txt;
}

document.addEventListener('DOMContentLoaded', ()=>{
  const sel = document.getElementById('csvSelect');
  loadCSVPreview(sel.value);
  sel.addEventListener('change', ()=> loadCSVPreview(sel.value));

  document.getElementById('downloadCsv').addEventListener('click', ()=>{
    loadCSVPreview(sel.value);
  });

  document.getElementById('uploadCsv').addEventListener('click', async ()=>{
    const f = document.getElementById('csvFile').files[0];
    if (!f) return alert('Choose file');
    const txt = await f.text();
    // Validate before uploading
    const v = await fetch(`/api/admin/validate/${sel.value}`, { method: 'POST', headers: {'content-type':'text/plain'}, body: txt });
    const r = await v.json();
    if (!r.ok) return alert('Validation failed: invalid CSV format');
    const res = await fetch(`/api/admin/csv/${sel.value}`, { method: 'POST', headers: {'content-type':'text/plain'}, body: txt });
    const j = await res.json();
    if (j.ok){ alert('Uploaded'); loadCSVPreview(sel.value); }
    else alert('Upload error: '+(j.error||'unknown'));
  });

  document.getElementById('validateCsv').addEventListener('click', async ()=>{
    const f = document.getElementById('csvFile').files[0];
    if (!f) return alert('Choose file');
    const txt = await f.text();
    const v = await fetch(`/api/admin/validate/${sel.value}`, { method: 'POST', headers: {'content-type':'text/plain'}, body: txt });
    const r = await v.json();
    if (r.ok) alert('CSV looks valid'); else alert('CSV invalid for selected type');
  });

  // orders
  async function loadOrders(){
    const res = await fetch('/api/orders');
    const list = await res.json();
    const ul = document.getElementById('ordersList');
    ul.innerHTML = '';
    list.forEach(o=>{
      const li = document.createElement('li');
      const itemsHtml = (o.items || []).map(it=>{
        // find print results for this item
        const pr = (o.printResults || []).filter(p=>String(p.itemId)===String(it.id));
        const prText = pr.length ? pr.map(p=>`[${p.printerType}@${p.ip}:${p.port} ${p.ok? 'OK':'ERR'} ${p.time}]`).join('\n') : '';
        return `${it.name} x${it.qty} \n${prText}`;
      }).join('\n\n');
      li.innerHTML = `<strong>Table ${o.table}</strong> ${o.createdAt} <button data-id="${o.id}">Mark Paid / Remove</button><pre>${itemsHtml}</pre>`;
      li.querySelector('button').addEventListener('click', async ()=>{
        const res = await fetch(`/api/orders/${o.id}/pay`, { method: 'POST' });
        if (res.ok) loadOrders();
      });
      ul.appendChild(li);
    });
  }
  loadOrders();
  setInterval(loadOrders, 3000);
  // printer config load/save
  async function loadConfig(){
    const res = await fetch('/api/admin/config');
    if (!res.ok) return;
    const cfg = await res.json();
    if (cfg && cfg.printer){
      const food = cfg.printer.food || {};
      const drink = cfg.printer.drink || {};
      document.getElementById('foodIp').value = food.ip || '';
      document.getElementById('foodPort').value = food.port || 9100;
      document.getElementById('drinkIp').value = drink.ip || '';
      document.getElementById('drinkPort').value = drink.port || 9100;
    }
  }
  document.getElementById('saveConfig').addEventListener('click', async ()=>{
    const cfg = { printer: { food: { ip: document.getElementById('foodIp').value, port: Number(document.getElementById('foodPort').value) }, drink: { ip: document.getElementById('drinkIp').value, port: Number(document.getElementById('drinkPort').value) } } };
    const res = await fetch('/api/admin/config', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify(cfg) });
    const j = await res.json();
    const status = document.getElementById('saveStatus');
    if (j.ok){ status.textContent = 'Saved'; setTimeout(()=>status.textContent='',2000); }
    else { status.textContent = 'Error'; }
  });
  loadConfig();
});
