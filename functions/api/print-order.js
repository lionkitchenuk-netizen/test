// Cloudflare Pages Function: /api/print-order
// Uses same approach as test-print - simple text-based printing

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
    
    console.log('[PRINT-ORDER] Received:', { printerIp, item: item?.name, copyNumber });
    
    if (!printerIp || !order || !item) {
      return jsonResponse({ error: 'Missing required fields' }, 400);
    }
    
    const port = printerPort || 8043;
    
    // Build text title like test-print does
    const title = `TABLE ${order.table} - ${item.name} (${copyNumber}/${item.qty})`;
    console.log('[PRINT-ORDER] Sending:', title);
    
    // Build ePOS SOAP XML using simple format like test-print
    const soapBody = buildSimplePrintXml(title, order.id);
    
    // Send to printer via HTTPS - exactly like test-print
    const printerUrl = `https://${printerIp}:${port}/cgi-bin/epos/service.cgi?timeout=10000`;
    
    try {
      console.log(`[PRINT-ORDER] Posting to: ${printerUrl}`);
      const response = await fetch(printerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': '""'
        },
        body: soapBody
      });
      
      const responseText = await response.text();
      console.log(`[PRINT-ORDER] Response: ${response.status}`);
      console.log(`[PRINT-ORDER] Text: ${responseText.substring(0, 200)}`);
      
      // Check if printer accepted it
      if (response.ok && (responseText.includes('success'))) {
        console.log(`[PRINT-ORDER] ✓ Success`);
        return jsonResponse({
          ok: true,
          message: 'Print successful',
          itemName: item.name,
          table: order.table
        });
      } else {
        console.log(`[PRINT-ORDER] Response not ok or no success: status=${response.status}`);
        return jsonResponse(
          { 
            error: `Printer: ${response.statusText}`,
            details: responseText.substring(0, 200)
          },
          response.status
        );
      }
    } catch (fetchErr) {
      console.error('[PRINT-ORDER] Fetch error:', fetchErr.message);
      return jsonResponse(
        { error: 'Cannot reach printer', details: fetchErr.message },
        500
      );
    }
  } catch (err) {
    console.error('[PRINT-ORDER] Error:', err.message);
    return jsonResponse({ error: 'Server error', details: err.message }, 500);
  }
}

// Simple XML format like test-print
function buildSimplePrintXml(title, orderId) {
  return `<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
<s:Body>
<epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">
<text align="center"><![CDATA[${title}]]></text>
<feed line="1"/>
<text><![CDATA[Order ID: ${orderId}]]></text>
<feed line="1"/>
<text><![CDATA[==========================]]></text>
<feed line="1"/>
<text><![CDATA[Time: ${new Date().toLocaleTimeString()}]]></text>
<feed line="3"/>
<cut type="feed"/>
</epos-print>
</s:Body>
</s:Envelope>`;
}

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
