// Cloudflare Pages Function: /api/print
// Handles print requests by communicating with ePOS printers via HTTPS

export async function onRequest(context) {
  const { request } = context;

  // Add CORS headers to all responses
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  // Only handle POST requests
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const body = await request.json();
    const { printerIp, order, item, copyNumber } = body;

    // Validate required parameters
    if (!printerIp || !order || !item) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: printerIp, order, item' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Build the ePOS SOAP XML command to print
    const soapXml = buildPrintXml(order, item, copyNumber);
    
    console.log(`[PRINT-API] Printing to ${printerIp}: ${item.name}`);
    console.log(`[PRINT-API] Order: ${order.id}, Table: ${order.table}`);

    // Send to printer via HTTPS
    const printerUrl = `https://${printerIp}:8043/cgi-bin/epos/service.cgi`;
    
    try {
      const response = await fetch(printerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': '""'
        },
        body: soapXml,
        // Don't validate SSL cert for local printers (they often use self-signed certs)
        // This is safe in Cloudflare context since we're not exposing credentials
      });

      const responseText = await response.text();
      console.log(`[PRINT-API] Printer response status: ${response.status}`);

      if (response.ok) {
        console.log(`[PRINT-API] Print sent successfully`);
        return new Response(
          JSON.stringify({ 
            ok: true, 
            message: 'Print sent successfully',
            itemName: item.name,
            table: order.table,
            orderId: order.id
          }),
          { 
            status: 200, 
            headers: corsHeaders 
          }
        );
      } else {
        console.error(`[PRINT-API] Printer error status ${response.status}`);
        return new Response(
          JSON.stringify({ 
            error: `Printer returned ${response.status}`,
            details: responseText.substring(0, 300)
          }),
          { 
            status: response.status, 
            headers: corsHeaders 
          }
        );
      }
    } catch (fetchErr) {
      console.error(`[PRINT-API] Fetch error:`, fetchErr.message);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to connect to printer',
          details: fetchErr.message,
          hint: `Check: 1) Printer IP is correct (${printerIp}), 2) Printer is on, 3) Port 8043 is accessible`
        }),
        { 
          status: 503, 
          headers: corsHeaders 
        }
      );
    }
  } catch (err) {
    console.error(`[PRINT-API] Error:`, err.message);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: err.message
      }),
      { 
        status: 500, 
        headers: corsHeaders 
      }
    );
  }
}

/**
 * Build ePOS SOAP XML for printing order item
 */
function buildPrintXml(order, item, copyNumber) {
  const timestamp = new Date().toISOString();
  const itemQty = copyNumber || 1;
  const totalQty = item.qty || 1;

  // ePOS SOAP request format
  return `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
  <s:Body>
    <Action_PrintXMLString xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">
      <devid>local_printer</devid>
      <timeout>30000</timeout>
      <xmlstring>&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print"&gt;
  &lt;text align="center" font="a" smooth="true"&gt;ORDER TICKET&lt;/text&gt;
  &lt;feed&gt;&lt;/feed&gt;
  &lt;text font="a"&gt;Table: ${escapeXml(order.table)}&lt;/text&gt;
  &lt;text font="a"&gt;Order: ${escapeXml(order.id)}&lt;/text&gt;
  &lt;text font="a"&gt;Time: ${timestamp.substring(11, 16)}&lt;/text&gt;
  &lt;feed&gt;&lt;/feed&gt;
  &lt;text font="b" size="2x2"&gt;${escapeXml(item.name)}&lt;/text&gt;
  &lt;feed&gt;&lt;/feed&gt;
  &lt;text font="a"&gt;Qty: ${itemQty}/${totalQty}&lt;/text&gt;
  ${item.notes ? `&lt;text font="a"&gt;Notes: ${escapeXml(item.notes)}&lt;/text&gt;` : ''}
  &lt;feed&gt;&lt;/feed&gt;
  &lt;feed&gt;&lt;/feed&gt;
  &lt;cut type="feed"&gt;&lt;/cut&gt;
&lt;/epos-print&gt;</xmlstring>
    </Action_PrintXMLString>
  </s:Body>
</s:Envelope>`;
}

/**
 * Escape XML special characters
 */
function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
