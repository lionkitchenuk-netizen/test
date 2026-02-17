// Cloudflare Pages Function: /api/print-order
// Exactly like test-print but for order items

export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const { printerIp, printerPort, order, item, copyNumber } = data;
    
    if (!printerIp || !order || !item) {
      return new Response(
        JSON.stringify({ error: 'missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const port = printerPort || 8043;
    return await sendOrderPrint(printerIp, port, order, item, copyNumber);
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function sendOrderPrint(ip, port, order, item, copyNumber) {
  try {
    const title = `TABLE ${order.table} - ${item.name} (${copyNumber}/${item.qty})`;
    const soapBody = buildOrderXml(title, order.id);
    const printerUrl = `https://${ip}:${port}/cgi-bin/epos/service.cgi?timeout=10000`;
    
    const response = await fetch(printerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': '""'
      },
      body: soapBody
    });
    
    const responseText = await response.text();
    
    if (response.ok && responseText.includes('success')) {
      return new Response(
        JSON.stringify({ 
          ok: true, 
          message: 'Order print sent successfully',
          itemName: item.name,
          table: order.table
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          error: `Printer returned: ${response.statusText}`,
          details: responseText.substring(0, 200)
        }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ 
        error: err.message,
        hint: 'Network or printer connection issue'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function buildOrderXml(title, orderId) {
  return `<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
<s:Body>
<epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">
<text align="center"><![CDATA[${title}]]></text>
<feed line="1"/>
<text><![CDATA[Order: ${orderId}]]></text>
<feed line="1"/>
<text>==========================</text>
<feed line="1"/>
<text><![CDATA[Time: ${new Date().toLocaleTimeString()}]]></text>
<feed line="3"/>
<cut type="feed"/>
</epos-print>
</s:Body>
</s:Envelope>`;
}
