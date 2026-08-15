// backend/src/lib/intasend.js
function intasendConfig() {
  const secretKey = process.env.INTASEND_SECRET_KEY;
  const publishableKey = process.env.INTASEND_PUBLISHABLE_KEY;
  if (!secretKey || !publishableKey) {
    throw new Error('Payment gateway is not configured yet. Add the IntaSend API keys to enable checkout.');
  }
  const live = (process.env.INTASEND_LIVE ?? 'false').toLowerCase() === 'true';
  return {
    baseUrl: live ? 'https://payment.intasend.com/api/v1' : 'https://sandbox.intasend.com/api/v1',
    secretKey,
    publishableKey,
  };
}

async function intasendPost(path, body) {
  const cfg = intasendConfig();
  const response = await fetch(`${cfg.baseUrl}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.secretKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; SafariConnectKenya/1.0)',
    },
    body: JSON.stringify({ public_key: cfg.publishableKey, ...body }),
  });
  const text = await response.text();
  if (!response.ok) {
    console.error(`[IntaSend] ${path} failed [${response.status}]: ${text}`);
    throw new Error(`Payment gateway rejected the request [${response.status}]: ${text}`);
  }
  return JSON.parse(text);
}

function normalisePhone(input) {
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('254')) return digits;
  if (digits.startsWith('0')) return `254${digits.slice(1)}`;
  if (digits.length === 9) return `254${digits}`;
  return digits;
}

function mpesaStkPush(params) {
  return intasendPost('/payment/mpesa-stk-push/', {
    amount: params.amount,
    currency: 'KES',
    phone_number: normalisePhone(params.phone),
    api_ref: params.apiRef,
    narrative: params.narrative,
    ...(params.email ? { email: params.email } : {}),
    ...(params.firstName ? { first_name: params.firstName } : {}),
  });
}

function createCardCheckout(params) {
  return intasendPost('/checkout/', {
    amount: params.amount,
    currency: 'KES',
    email: params.email,
    api_ref: params.apiRef,
    redirect_url: params.redirectUrl,
    comment: params.narrative,
    method: 'CARD-PAYMENT',
  });
}

function queryPaymentStatus(providerInvoiceId) {
  return intasendPost('/payment/status/', { invoice_id: providerInvoiceId });
}

module.exports = {
  intasendConfig,
  normalisePhone,
  mpesaStkPush,
  createCardCheckout,
  queryPaymentStatus,
};