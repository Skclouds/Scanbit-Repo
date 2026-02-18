/**
 * Payment flow smoke tests.
 * Run with: node scripts/testPaymentFlow.js
 * Requires server running on FRONTEND_URL / API port (e.g. http://localhost:5006).
 */

const BASE = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5006}`;

async function req(method, path, body = null, token = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body && (method === 'POST' || method === 'PUT')) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text.slice(0, 200) };
  }
  return { status: res.status, data };
}

async function run() {

  let passed = 0;
  let failed = 0;

  // 1. Create order without auth -> 401
  try {
    const r = await req('POST', '/api/payments/create-order', { plan: 'Pro', billingCycle: 'monthly' });
    if (r.status === 401) {

      passed++;
    } else {

      failed++;
    }
  } catch (e) {

    failed++;
  }

  // 2. Verify without auth -> 401 (route is protected)
  try {
    const r = await req('POST', '/api/payments/verify', {});
    if (r.status === 401) {

      passed++;
    } else {

      failed++;
    }
  } catch (e) {

    failed++;
  }


  process.exit(failed > 0 ? 1 : 0);
}

run().catch((e) => {

  process.exit(1);
});
