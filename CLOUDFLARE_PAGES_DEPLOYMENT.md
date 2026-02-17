# Cloudflare Pages Deployment Guide

## ✅ What's Ready

Your POS printing system is now configured to work with **Cloudflare Pages**:

- ✅ **Frontend**: Static HTML/CSS/JS (index.html, order.html, admin.html)
- ✅ **Print API**: Cloudflare Pages Function at `/api/print`
- ✅ **Browser Integration**: Updated js/pos.js to call API instead of direct SDK
- ✅ **Repository**: Code pushed to GitHub (lionkitchenuk-netizen/test)

---

## 📋 Deployment Steps

### Step 1: Connect GitHub to Cloudflare Pages

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **Pages** → **Create a project**
3. Select **Connect to Git**
4. Authorize GitHub
5. Select **lionkitchenuk-netizen/test** repository
6. Click **Begin setup**

### Step 2: Configure Build Settings

In the setup wizard:

- **Project name**: `posprint` (or your preferred name)
- **Production branch**: `main`
- **Build command**: (leave empty - this is a static site)
- **Build output directory**: `/` (root - files are in root of repo)
- **Environment variables**: (none needed for basic printing)

### Step 3: Deploy

1. Click **Save and Deploy**
2. Cloudflare will build and deploy your site
3. Your site will be available at: `https://posprint.pages.dev` (or your custom domain)

---

## 🚀 How Printing Works Now

### Browser → Cloudflare → Printer Flow

```
1. Customer places order in browser
2. Admin clicks "Print"
3. Browser calls: POST /api/print
   - Sends: {printerIp, order, item, copyNumber}
4. Cloudflare Function processes at /functions/api/print.js
5. Function builds ePOS SOAP XML
6. Function makes HTTPS request to printer (port 8043)
7. Printer receives and prints ticket
8. Function returns: {ok: true, message: "Print sent"}
9. Browser confirms print success
```

### Key Advantages

- ✅ **No browser SDK issues**: ePOS communication happens server-side
- ✅ **Better error handling**: Centralized logging and retry logic
- ✅ **Scalable**: Handles multiple printers from one endpoint
- ✅ **Secure**: Printer IP not exposed to client
- ✅ **Fast**: Cloudflare edge network handles requests globally

---

## 🔧 Testing Before Deployment

### Local Testing (Node.js)

```bash
# Install dependencies (if needed)
npm install

# Start local server
node server.js

# After deployment, you can still test locally:
# Admin: http://localhost:3000/admin.html
# Customer: http://localhost:3000/index.html (or index.html in browser)
```

### After Cloudflare Deployment

1. Go to `https://posprint.pages.dev` (replace with your URL)
2. Create order and add items
3. Click "Print Order"
4. Check browser console for `[PRINT]` log messages
5. Verify printer receives and prints ticket

---

## 📊 API Endpoint Details

### POST /api/print

**Request Body:**
```json
{
  "printerIp": "192.168.1.165",
  "order": {
    "id": "abc123def",
    "table": 5
  },
  "item": {
    "name": "Burger",
    "qty": 2,
    "notes": "Extra cheese"
  },
  "copyNumber": 1
}
```

**Success Response (200):**
```json
{
  "ok": true,
  "message": "Print sent successfully",
  "itemName": "Burger",
  "table": 5,
  "orderId": "abc123def"
}
```

**Error Response (4xx/5xx):**
```json
{
  "error": "Failed to connect to printer",
  "details": "Connection timeout",
  "hint": "Check: 1) Printer IP is correct, 2) Printer is on, 3) Port 8043 is accessible"
}
```

---

## 🐛 Troubleshooting

### Problem: "No endpoint found" error (404)

**Solution**: Ensure your function is at `/functions/api/print.js`

```bash
# Check directory structure
ls -la functions/api/
# Should show: print.js
```

### Problem: "Failed to connect to printer" (503)

**Possible causes:**
1. Printer IP is incorrect - verify IP in admin panel
2. Printer is off or not on network - turn on and check connectivity
3. Port 8043 not open - some networks block this port
4. Printer doesn't support ePOS protocol - use port 9100 TCP instead (requires local server)

**Check printer connectivity:**
- SSH into printer network and run: `ping 192.168.1.165`
- Or use: `curl https://192.168.1.165:8043` (will show cert error but proves port is open)

### Problem: Console shows "Cannot POST /api/print"

**Solution**: This usually means the function isn't deployed yet

1. Check Cloudflare Pages deployment status
2. Ensure `functions/api/print.js` exists in repository
3. Redeploy: Go to Pages → Your Project → Re-deploy

---

## 📱 Multiple Printers

The system supports multiple printers through the admin panel:

1. Go to `/admin.html` → "Configure Printers"
2. Add IP addresses for each printer/kitchen
3. Assign each menu item to a printer in item settings
4. When printing, system routes each item to its assigned printer

---

## 🔐 Security Notes

- Printer IPs are stored in browser localStorage (not exposed to internet)
- Print requests go through Cloudflare's secure network
- Each printer should be on a secure/private network
- Consider using a VPN if accessing from public networks

---

## 📚 Related Documentation

- [BUGFIX_SUMMARY.md](./BUGFIX_SUMMARY.md) - Printer connection fixes
- [TESTING_INSTRUCTIONS.md](./TESTING_INSTRUCTIONS.md) - Testing procedures
- [IMPLEMENTATION_DETAILS.md](./IMPLEMENTATION_DETAILS.md) - Technical architecture

---

## ✨ Next Steps

1. **Deploy to Cloudflare Pages** using steps above
2. **Test printing** with your Epson printer
3. **Configure admin panel** with your printer IPs
4. **Monitor logs** in Cloudflare Pages dashboard for errors
5. **Optimize** based on real-world usage

---

**Quick Start Command:**
```bash
# After Cloudflare connection:
git push origin main
# Cloudflare will auto-deploy on push to main branch
```

**Support**: Check console logs for `[PRINT]` messages to debug issues
