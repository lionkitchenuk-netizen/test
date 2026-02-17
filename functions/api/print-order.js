// Cloudflare Pages Function: /api/print-order
// Handles order printing by sending ePOS SOAP commands via HTTPS

export async function onRequest(context) {
  // Handle OPTIONS for CORS
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }
  
  // Only handle POST
  if (context.request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }
  
  return handlePrintRequest(context);
}

async function handlePrintRequest(context) {
  try {
    const data = await context.request.json();
    const { printerIp, printerPort, order, item, copyNumber } = data;
    
    console.log('[PRINT-ORDER] Received print request:', { printerIp, printerPort, item: item?.name, copyNumber });
    
    if (!printerIp || !order || !item) {
      return jsonResponse(
        { error: 'Missing required fields: printerIp, order, item' },
        400
      );
    }
    
    const port = printerPort || 8043;
    
    // Build ePOS SOAP XML
    const soapBody = buildOrderPrintXml(order, item, copyNumber);
    
    // Send to printer
    const printerUrl = `https://${printerIp}:${port}/cgi-bin/epos/service.cgi?timeout=10000`;
    
    try {
      console.log(`[PRINT-ORDER] Sending to ${printerUrl}`);
      const response = await fetch(printerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': '""'
        },
        body: soapBody,
        timeout: 15000
      });
      
      if (response.ok) {
        console.log(`[PRINT-ORDER] ✓ Print successful to ${item.name}`);
        return jsonResponse({
          ok: true,
          message: 'Print sent successfully',
          itemName: item.name,
          copyNumber: copyNumber,
          table: order.table
        });
      } else {
        console.error(`[PRINT-ORDER] Printer error: ${response.status}`);
        return jsonResponse(
          { 
            error: `Printer error: ${response.status}`,
            hint: 'Check printer power and network connection'
          },
          response.status
        );
      }
    } catch (fetchErr) {
      console.error('[PRINT-ORDER] Fetch error:', fetchErr.message);
      return jsonResponse(
        {
          error: 'Cannot connect to printer',
          details: fetchErr.message,
          hint: `Verify printer IP: ${printerIp}:${port}`
        },
        503
      );
    }
  } catch (err) {
    console.error('[PRINT-ORDER] Request error:', err.message);
    return jsonResponse(
      { error: 'Server error', details: err.message },
      500
    );
  }
}

/**
 * Build ePOS SOAP XML for order item printing
 * Uses same format as working test-print
 */
function buildOrderPrintXml(order, item, copyNumber) {
  const timestamp = new Date().toLocaleTimeString();
  const table = order.table?.toString() || '?';
  const orderId = order.id || '?';
  const itemName = item.name || 'ITEM';
  const printerType = item.printer?.toUpperCase() || 'KITCHEN';
  const qty = item.qty || 1;
  const copy = copyNumber || 1;

  return `<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
<s:Body>
<epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">
<text align="center"><![CDATA[TABLE ${table}]]></text>
<feed line="1"/>
<text align="center"><![CDATA[Order: ${orderId}]]></text>
<text align="center"><![CDATA[Time: ${timestamp}]]></text>
<feed line="1"/>
<text align="center"><![CDATA[================================]]></text>
<feed line="1"/>
<text align="center" size="2x2"><![CDATA[${itemName}]]></text>
<feed line="1"/>
<text align="center"><![CDATA[Copy ${copy} of ${qty}]]></text>
<text align="center"><![CDATA[${printerType} PRINTER]]></text>
<feed line="3"/>
<cut type="feed"/>
</epos-print>
</s:Body>
</s:Envelope>`;
}

/**
 * Helper to return JSON response with CORS headers
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
