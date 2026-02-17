# Testing Instructions for Bug Fixes

## Prerequisites
1. Printer at 192.168.1.165:8043 (or update config in admin)
2. Browser console open (F12 or Ctrl+Shift+I)
3. Both order.html and admin.html pages ready

---

## Test 1: Single Item Print (Basic Test)

### Steps
1. Open `order.html`
2. Select a table (e.g., "Table 1")
3. Add 1 item to cart (e.g., "Spring Roll")
4. Click "Print Order"
5. Watch browser console

### Expected Results
✓ Console shows: `[DEBUG] Starting print for: Spring Roll on 192.168.1.165`
✓ Console shows: `[DEBUG] Connect callback: SSL_CONNECT_OK`
✓ Console shows: `[DEBUG] Device created successfully`
✓ Console shows: `[DEBUG] Sending print job...`
✓ Printer outputs 1 ticket
✓ No "DEVICE_NOT_FOUND" errors
✓ Console shows: `✓ Successfully printed ticket 1`

---

## Test 2: Multiple Items Print (Connection Reuse Test)

### Steps
1. Open `order.html`
2. Select a table
3. Add 3 DIFFERENT items to cart:
   - Spring Roll
   - Fish Ball Noodles  
   - Cola
4. Click "Print Order"
5. Watch console and printer

### Expected Results
✓ First item prints successfully
✓ Console shows device is reused for 2nd item (no new "Creating new ePOSDevice" message)
✓ 2nd item prints without reconnection
✓ 3rd item also reuses same connection
✓ All 3 items print successfully
✓ No DEVICE_NOT_FOUND errors on any item

**Console Pattern** (should see similar):
```
[DEBUG] Starting print for: Spring Roll on 192.168.1.165
[DEBUG] Creating new ePOSDevice for 192.168.1.165
[DEBUG] Connect callback: SSL_CONNECT_OK
[DEBUG] Successfully connected to 192.168.1.165
[DEBUG] Creating device with ID: device_[timestamp]_[id1]
[DEBUG] Device created successfully
[DEBUG] Sending print job...
✓ Successfully printed ticket 1

[DEBUG] Starting print for: Fish Ball Noodles on 192.168.1.165
[DEBUG] Using existing connected device for 192.168.1.165  ← Reuse!
[DEBUG] Creating device with ID: device_[timestamp]_[id2]
[DEBUG] Device created successfully
[DEBUG] Sending print job...
✓ Successfully printed ticket 2

[DEBUG] Starting print for: Cola on 192.168.1.165
[DEBUG] Using existing connected device for 192.168.1.165  ← Reuse!
[DEBUG] Creating device with ID: device_[timestamp]_[id3]
[DEBUG] Device created successfully
[DEBUG] Sending print job...
✓ Successfully printed ticket 3
```

---

## Test 3: Multiple Quantity Single Item (Device ID Uniqueness Test)

### Steps
1. Open `order.html`
2. Select a table
3. Add 1 item with quantity 3 (qty spinner)
4. Click "Print Order"
5. Check printer output and console

### Expected Results
✓ Printer outputs 3 separate tickets
✓ Each ticket has "Copy X of 3" on it correctly
✓ Connection is reused for all 3 prints
✓ Console shows unique device IDs:
  - `device_[timestamp]_[random1]`
  - `device_[timestamp]_[random2]`
  - `device_[timestamp]_[random3]`

---

## Test 4: CSV Menu Import Workflow

### Steps

**Part A: Upload CSV**
1. Open `admin.html`
2. Go to "CSV Management" section
3. Ensure "menu.csv" is selected in dropdown
4. Click "Choose File" and select `data/menu.csv`
5. Click "Upload" button
6. Read the alert that appears

**Part B: Verify Import**
7. Alert should say: `"Already uploaded! ⚠️ Please refresh the Order page (Ctrl+R or Cmd+R) to load the new data."`
8. Do NOT close the alert yet

**Part C: Load Menu**
9. Go back to order.html
10. Press Ctrl+R (Windows) or Cmd+R (Mac) to refresh
11. Open browser console (F12)
12. Look for: `✓ Loaded menu from localStorage: 35 items`

### Expected Results
✓ Admin alert includes refresh instruction
✓ order.html console shows checkmark (✓) for successful load
✓ Menu categories display correctly
✓ Menu items match your CSV data (not default items)

---

## Test 5: Test with No Prior Connection

### Steps
1. Open order.html
2. DO NOT attempt any print first
3. Hard refresh page (Ctrl+Shift+R or Cmd+Shift+R)
4. Add item to cart
5. Click Print Order

### Expected Results
✓ Creates NEW ePOSDevice (first time)
✓ Connects successfully
✓ Prints without errors
✓ Console shows: "Creating new ePOSDevice for [IP]"

---

## Test 6: Connection Persistence Test

### Steps
1. Print an item (order.html) - this establishes connection
2. Wait 5 seconds
3. Print another item without refreshing
4. Check console closely

### Expected Results
✓ 2nd print immediately shows: "Using existing connected device..."
✓ No reconnection delay
✓ Device is reused without creating new instance

---

## Test 7: Error Handling

### Steps
1. Update printer IP in admin to invalid IP: `1.1.1.1`
2. Open order.html
3. Add item and try to print

### Expected Results
✓ Console shows clear error message
✓ No infinite retries or hangs
✓ Error message like: "Connection failed: ERROR_TIMEOUT"
✓ Back in ePosDeviceInstances, device is deleted (cleanup works)

---

## Console Log Reference

| Log Pattern | Meaning |
|-------------|---------|
| `[DEBUG] Creating new ePOSDevice` | First print or reconnecting |
| `[DEBUG] Using existing connected device` | Reusing connection ✓ |
| `[DEBUG] Connect callback: SSL_CONNECT_OK` | Connected successfully ✓ |
| `[DEBUG] Device created successfully` | Ready to print ✓ |
| `✓ Successfully printed ticket X` | Print completed ✓ |
| `Failed to create printer: DEVICE_NOT_FOUND` | BUG - should not see ✗ |
| `[DEBUG] Sending print job...` | Print command sent |
| `✓ Loaded menu from localStorage: 35 items` | CSV menu loaded ✓ |

---

## Troubleshooting

### Still Getting DEVICE_NOT_FOUND?
1. Check printer IP is correct (`192.168.1.165`)
2. Verify printer is reachable: ping the IP
3. Check printer ePOS service is running on port 8043
4. Try clearing localStorage: `localStorage.clear()` in console
5. Refresh page and try again

### CSV Menu Not Loading?
1. Verify CSV file is in `data/menu.csv`
2. After uploading CSV, did you see refresh instruction?
3. Did you actually refresh order.html (Ctrl+R)?
4. Check admin console for import messages
5. Check order.html console for menu load messages
6. Verify localStorage contains data: `localStorage.getItem('pos_menu').length`

### Connection Drops Between Items?
1. Check network stability
2. Verify printer isn't rebooting
3. Try power cycling printer
4. Check if printer has timeout settings that are too short

---

## Success Criteria

All tests should pass with:
1. ✅ No DEVICE_NOT_FOUND errors
2. ✅ Connection reused for multiple items
3. ✅ All items print correctly
4. ✅ CSV menu loads after refresh
5. ✅ Clear console logging for debugging
6. ✅ Proper error handling for network issues

