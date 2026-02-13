let MENU = { items: [], sets: [], attrs: [] };
let CART = [];

function showAttrModal(attr, options){
  return new Promise((resolve)=>{
    const modal = document.getElementById('attrModal');
    document.getElementById('attrTitle').textContent = attr;
    const opts = document.getElementById('attrOptions');
    opts.innerHTML = '';
    options.forEach(o=>{
      const btn = document.createElement('button');
      btn.textContent = o;
      btn.addEventListener('click', ()=>{
        resolve(o);
        modal.style.display='none';
      });
      opts.appendChild(btn);
    });
    document.getElementById('attrCancel').onclick = ()=>{ modal.style.display='none'; resolve(null); };
    modal.style.display='block';
  });
}

function $q(sel){return document.querySelector(sel)}

async function loadMenu(){
  const res = await fetch('/api/menu');
  MENU = await res.json();
  // filter sets by current time
  const now = new Date();
  MENU.activeSets = MENU.sets.filter(s=>{
    if (!s.time_start || !s.time_end) return true;
    const toMin = t=>{ const [h,m]=t.split(':').map(Number); return h*60+m };
    const cur = now.getHours()*60 + now.getMinutes();
    const start = toMin(s.time_start);
    const end = toMin(s.time_end);
    if (start <= end) return cur >= start && cur <= end;
    return cur >= start || cur <= end;
  });
  renderMenu();
}

function renderMenu(){
  const root = $q('#menu');
  root.innerHTML = '';
  if (MENU.activeSets && MENU.activeSets.length){
    const setsEl = document.createElement('div');
    setsEl.innerHTML = '<h3>Set Menus</h3>';
    MENU.activeSets.forEach(s=>{
      const el = document.createElement('div');
      el.className='menu-item';
      el.innerHTML = `<strong>${s.name}</strong> - $${s.price} <button data-id="set-${s.id}">Add Set</button>`;
      el.querySelector('button').addEventListener('click', ()=>{
        // parse items listed as ids separated by | and add to cart
        const ids = s.items ? s.items.split('|') : [];
        ids.forEach(id=>{
          const item = MENU.items.find(it=>it.id==id);
          if (item) CART.push({ id: item.id, name: item.name+' (set)', price: parseFloat(item.price), qty: 1, attrs: [] });
        });
        renderCart();
      });
      setsEl.appendChild(el);
    });
    root.appendChild(setsEl);
  }
  MENU.items.forEach(it => {
    const el = document.createElement('div');
    el.className = 'menu-item';
    el.innerHTML = `<strong>${it.name}</strong> - $${it.price} <button data-id="${it.id}">Add</button>`;
    el.querySelector('button').addEventListener('click', ()=> onAddItem(it));
    root.appendChild(el);
  });
}

function onAddItem(item){
  const qty = parseInt(prompt('Quantity', '1')) || 1;
  const attrs = [];
  // check attributes
  const a = MENU.attrs.find(x=>x.item_id==item.id);
  if (a){
    const opts = a.options.split('|');
    // use modal picker
    const pick = await showAttrModal(a.attr_name, opts);
    if (pick) attrs.push(pick);
  }
  CART.push({ id: item.id, name: item.name, price: parseFloat(item.price), qty, attrs });
  renderCart();
}

function renderCart(){
  const list = $q('#cartList');
  list.innerHTML = '';
  let total = 0;
  CART.forEach((c,i)=>{
    const li = document.createElement('li');
    li.textContent = `${c.name} x${c.qty} $${(c.price*c.qty).toFixed(2)}`;
    list.appendChild(li);
    total += c.price*c.qty;
  });
  $q('#total').textContent = total.toFixed(2);
}

document.addEventListener('DOMContentLoaded', ()=>{
  loadMenu();
  $q('#submitOrder').addEventListener('click', async ()=>{
    const table = $q('#tableInput').value || '1';
    const order = { table, items: CART, total: $q('#total').textContent };
    const res = await fetch('/api/order', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify(order) });
    const j = await res.json();
    if (j.ok){
      alert('Order submitted');
      CART = [];
      renderCart();
    } else alert('Error: '+(j.error||'unknown'));
  });
});
