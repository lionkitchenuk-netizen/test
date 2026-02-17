// Test endpoint for debugging print-order
export async function onRequest(context) {
  console.log('[TEST-PRINT-ORDER] Request received:', {
    method: context.request.method,
    url: context.request.url,
    headers: Object.fromEntries(context.request.headers)
  });

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await context.request.text();
    console.log('[TEST-PRINT-ORDER] Body:', body.substring(0, 200));
    
    const data = JSON.parse(body);
    console.log('[TEST-PRINT-ORDER] Parsed:', data);
    
    const { printerIp, order, item } = data;

    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Test endpoint working',
        received: { printerIp, orderId: order?.id, itemName: item?.name }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('[TEST-PRINT-ORDER] Error:', e);
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
