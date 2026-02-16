// Cloudflare Pages Function for Test Print
// This file handles POST /api/admin/test-print

export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const { ip, port, useEpos } = data;
    
    if (!ip) {
      return new Response(
        JSON.stringify({ error: 'missing ip' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const actualPort = port || 9100;
    
    if (useEpos || actualPort === 8043) {
      // HTTPS/EPOS mode
      return await testPrintEpos(ip, actualPort);
    } else {
      // TCP mode - not supported in Cloudflare (no raw TCP)
      return new Response(
        JSON.stringify({ 
          error: 'TCP mode (9100) requires a Node.js backend server. Please run: node server.js',
          info: 'Use HTTPS/ePOS (8043) mode for Cloudflare, or run locally for TCP printing'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function testPrintEpos(ip, port) {
  try {
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
    
    const responseText = await response.text();
    
    if (response.ok && responseText.includes('success')) {
      return new Response(
        JSON.stringify({ 
          ok: true, 
          message: 'Print sent successfully via EPOS SDK',
          mode: 'HTTPS/EPOS'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          error: `EPOS SDK returned: ${response.statusText}`,
          details: responseText.substring(0, 200)
        }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ 
        error: err.message,
        hint: 'Check: 1) Printer is on, 2) IP is correct, 3) Port 8043 is accessible'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

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
