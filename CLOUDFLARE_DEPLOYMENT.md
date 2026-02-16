# Cloudflare Deployment Guide - Print Server with EPOS SDK Support

## ✅ What's New

This update adds support for Epson ePOS SDK printing on **port 8043** (HTTPS), while maintaining backward compatibility with **port 9100** (TCP).

### Features
- ✅ **HTTPS/EPOS SDK Support** (Port 8043) - For Epson TM-m30 and compatible printers
- ✅ **TCP Support** (Port 9100) - For legacy ESC/POS printers
- ✅ **Admin Panel UI** - Select port type (TCP vs HTTPS/ePOS) per printer
- ✅ **Auto Port Configuration** - Changing port type auto-updates default port
- ✅ **Test Print Feature** - Test both protocols from admin panel

---

## 📋 Deployment to Cloudflare Pages

### Option A: For Testing (Local Node.js Server)

If you want to test **locally on your machine**:

```bash
# 1. Install Node.js from nodejs.org
# 2. Open terminal in project folder
# 3. Install dependencies
npm install

# 4. Start the server
node server.js

# 5. Open in browser
# Admin: http://localhost:3000/admin.html
# Customer: http://localhost:3000/index.html
```

**Pros:** Works with real printers, full features  
**Cons:** Requires local server running, not accessible from public internet

---

### Option B: For Production (Cloudflare Workers)

Cloudflare Pages is **static-only** (no backend). To enable printing via Cloudflare, use **Cloudflare Workers** with the backend code.

#### Step 1: Create Cloudflare Worker

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **Workers & Pages** → **Create Application** → **Create Worker**
3. Name it: `print-server`
4. Replace the default code with `/cloudflare-worker.js` (see below)

#### Step 2: Update Worker Code

Create a file `/cloudflare-worker.js`:

```javascript
export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // Route API requests to your Node.js backend or handle locally
    if (url.pathname.startsWith('/api/')) {
      // Option 1: Route to a backend server (if you have one)
      // return fetch(`https://your-backend.com${url.pathname}`, request);
      
      // Option 2: Handle printing directly in Worker
      if (url.pathname === '/api/admin/test-print') {
        try {
          const data = await request.json();
          const { ip, port, useEpos } = data;
          
          if (useEpos || port === 8043) {
            // HTTPS/EPOS mode - connect to printer's EPOS SDK
            const soapBody = buildEposXml('TEST PRINT - EPOS SDK');
            const printerUrl = `https://${ip}:${port}/cgi-bin/epos/service.cgi?timeout=10000`;
            
            const response = await fetch(printerUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': '""'
              },
              body: soapBody
            });
            
            return new Response(JSON.stringify({ ok: true, mode: 'EPOS' }), 
              { status: response.status, headers: { 'Content-Type': 'application/json' } });
          } else {
            // TCP mode - not supported in Worker (no raw TCP)
            return new Response(JSON.stringify({ error: 'TCP mode requires Node.js server' }), 
              { status: 400, headers: { 'Content-Type': 'application/json' } });
          }
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), 
            { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
      }
    }
    
    // Serve static files from your Pages project
    return fetch(request);
  }
};

function buildEposXml(title) {
  return `<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
<s:Body>
<epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">
<text align="center"><![CDATA[${title}]]></text>
<feed line="1"/>
<text>==========================</text>
<feed line="1"/>
<text>Hello World!</text>
<feed line="3"/>
<cut type="feed"/>
</epos-print>
</s:Body>
</s:Envelope>`;
}
```

#### Step 3: Deploy to Cloudflare Pages

1. Push your code to **GitHub**:
```bash
git remote add origin https://github.com/yourusername/test.git
git push -u origin main
```

2. In Cloudflare Dashboard:
   - Go to **Pages** → **Create a project** → **Connect to Git**
   - Select your repository
   - Build settings:
     - **Framework preset:** None
     - **Build command:** (leave empty)
     - **Build output directory:** `/` (or `.`)
   - Deploy

#### Step 4: Link Worker to Pages

In Cloudflare Dashboard:
- Go to your Pages project → **Settings** → **Functions**
- Enable **Functions** and set it to use your Worker

---

## 🔧 Admin Panel Configuration

### Adding Printer Settings

1. Open **Admin Page**: `http://localhost:3000/admin.html` or `https://yourapp.pages.dev/admin.html`

2. **Printer Setup Section:**
   - **Food Printer IP**: `192.168.x.x`
   - **Port Type**: Select "TCP (9100)" or "HTTPS/ePOS (8043)"
   - Port auto-updates when you change the type

3. **Test Print:**
   - Enter printer IP
   - Select port type
   - Click "Test Print (Server)"
   - Watch the red/green status indicator

### Settings Saved In:
- `config.json` (server) - stored on backend
- `localStorage` (admin page) - stored in browser

---

## 🖨️ Printer Compatibility

### For Port 8043 (HTTPS/EPOS SDK):
✅ Compatible:
- Epson TM-m30 (with EPOS Device)
- Epson TM-T82III with Ethernet
- Any printer with EPOS SDK Web Service

❌ Not Compatible:
- Printers without HTTPS web service
- Old ESC/POS-only printers

### For Port 9100 (TCP):
✅ Compatible:
- Most network receipt printers
- Epson TM-series (via TCP)
- Zebra, Star, Brother printers

---

## 📝 Implementation Examples

### Using EPOS SDK (Port 8043)

```javascript
// From admin panel
const response = await fetch('/api/admin/test-print', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ip: '192.168.18.50',
    port: 8043,
    useEpos: true  // Flag for EPOS mode
  })
});
```

### Using TCP (Port 9100)

```javascript
const response = await fetch('/api/admin/test-print', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ip: '192.168.18.50',
    port: 9100,
    useEpos: false  // Flag for TCP mode
  })
});
```

---

## 🚀 Testing Checklist

- [ ] Local server starts without errors: `node server.js`
- [ ] Admin page loads: `http://localhost:3000/admin.html`
- [ ] Port type selector visible in Printer Settings
- [ ] Changing port type updates default port (9100 ↔ 8043)
- [ ] Save config button functional
- [ ] Test Print button works (attempts to connect)
- [ ] Config saves to `config.json`
- [ ] Git changes committed successfully

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 already in use | Kill process or use: `node server.js --port 3001` |
| HTTPS timeout | Printer not responding on port 8043, check IP and network |
| TCP connection refused | Printer off or not on network, verify IP/port |
| Settings not saving | Check browser console, ensure localStorage enabled |
| Admin page blank | Check browser console for JavaScript errors |

---

## 📞 Support

For Epson ePOS SDK documentation:
- [Epson ePOS SDK Documentation](https://www.epson.com.tw/pos)
- TM-m30 Manual: https://epson.com/support

For Cloudflare Workers:
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)

---

## 📦 Files Modified

- `server.js` - Added HTTPS/EPOS support, new routes
- `admin.html` - Added port type selector UI
- `admin.js` - Port type change handlers, EPOS flag
- `config.json` - Now includes `portType` field
- `epos-2.27.0.js` - Already included (Epson SDK library)

---

**Version**: 2.0.0  
**Last Updated**: Feb 16, 2026  
**Features**: TCP + HTTPS/EPOS SDK Support
