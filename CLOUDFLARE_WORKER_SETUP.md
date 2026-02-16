# 🔧 Cloudflare Worker Setup Guide

## Problem
"Print error: Failed to execute 'json' on 'Response': Unexpected end of JSON input"

This error happens because **Cloudflare Pages is static-only** - there's no Node.js backend. The `/api/admin/test-print` endpoint returns a 404 HTML page instead of JSON.

## Solution
Create a **Cloudflare Worker** to handle the print API.

---

## ✅ Step-by-Step Setup

### **Step 1: Deploy the Worker**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **Workers & Pages** → **Workers** (not Pages)
3. Click **Create a Worker** (or "Create Application")
4. Name it: `print-server`
5. Click **Create Service**
6. Copy the entire code from `cloudflare-worker.js` (in your repo)
7. Paste it into the Worker editor
8. Click **Save and Deploy**

### **Step 2: Connect to Your Domain**

After deployment:

1. In Worker code editor, go to **Settings**
2. Or go to Workers → Your Worker → **Settings** → **Triggers**
3. Click **Add Custom Domain**
4. Enter: `posprint.hklionkitchen.co.uk` (or your domain)
5. Select your zone: `hklionkitchen.co.uk`
6. Click **Add Custom Domain**

Now requests to your domain will route to this Worker!

### **Step 3: Update Routes (Important!)**

1. In Cloudflare Dashboard → **Pages** → Select your `posprint` project
2. Go to **Settings** → **Functions**
3. You should see the Worker connected
4. If not, manually add route:
   - Path: `/api/*`
   - Worker: `print-server`

---

## 🧪 Test It

1. Open: `https://posprint.hklionkitchen.co.uk/admin.html`
2. Set printer IP to your printer
3. **For EPOS/HTTPS mode only**: Select "HTTPS/ePOS (8043)"
4. Click **Test Print (Server)**
5. You should now get proper error messages (or success!)

---

## 📊 What the Worker Does

| Request | Behavior |
|---------|----------|
| POST `/api/admin/test-print` with EPOS mode | ✅ Connects to printer on port 8043 |
| POST `/api/admin/test-print` with TCP mode | ❌ Returns error message with instructions |
| Other `/api/*` requests | ❌ Returns 404 JSON |

---

## 🔄 For TCP Printing (Port 9100)

TCP mode require a **real Node.js backend** because Cloudflare Workers can't do raw TCP connections.

**Options:**

### **Option A: Run Local Node.js Server** (Best for Testing)
```bash
npm install
node server.js
```
Then use `http://localhost:3000/admin.html` instead of Cloudflare.

### **Option B: Deploy Node.js Backend**
Use a service that supports Node.js:
- Railway.app
- Render.com
- Heroku.com
- DigitalOcean App Platform

Then point API calls to your backend instead of `/api/`.

### **Option C: Use EPOS/HTTPS Only**
If your printer supports port 8043 (EPOS SDK), use the Cloudflare Worker setup and only use HTTPS/ePOS mode.

---

## 🐛 Troubleshooting

### "Worker returned error 422"
The Worker code has a syntax error. Check:
- Proper JSON in the code
- No missing quotes or brackets
- Copy the entire file: `cloudflare-worker.js`

### "Print error: TCP mode requires Node.js"
This is expected! Use EPOS mode (8043) or run locally.

### "Print error: EPOS SDK returned error"
The printer either:
- Doesn't support port 8043
- Firewall is blocking port 8043
- IP address is incorrect
- Printer is offline

### "Print error: JSON parse failed"
Your Cloudflare Pages isn't connected to the Worker yet.  
Check Step 2 above - make sure custom domain is added.

---

## 📝 File Summary

| File | Purpose |
|------|---------|
| `cloudflare-worker.js` | Worker code (deploy to Cloudflare) |
| `server.js` | Node.js backend (for local/self-hosted) |
| `admin.html` | Frontend (same for all deployments) |

---

## 🎯 Recommended Setup

### For **Development/Testing**:
```
Local browser → http://localhost:3000
                ↓
         Node.js server.js
                ↓
         Printer (9100 or 8043)
```

### For **Production on Cloudflare**:
```
Browser → https://posprint.hklionkitchen.co.uk
       ↓
Cloudflare Pages (static HTML/JS)
       ↓
Cloudflare Worker (API handler)
       ↓
Printer on port 8043 (EPOS only)
```

---

## ✨ Next Steps

1. ✅ Copy `cloudflare-worker.js` code
2. ✅ Create new Worker in Cloudflare
3. ✅ Add custom domain
4. ✅ Test: Open admin page and try Test Print
5. ✅ Make sure to use EPOS/HTTPS mode (8043)

---

**That should fix the error! 🎉**

**Need help?** Check the console (F12 Developer Tools → Console tab) for more detailed error messages.
