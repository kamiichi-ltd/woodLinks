const Stripe = require('stripe');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Load env
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    // Basic .env parser: Match KEY="VALUE" or KEY=VALUE
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        let key = match[1].trim();
        let value = match[2].trim();
        // Remove surrounding quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.slice(1, -1);
        }
        env[key] = value;
    }
});

const secret = env.STRIPE_WEBHOOK_SECRET;
const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' });

const orderId = process.argv[2];

if (!orderId) {
    console.error('Usage: node misc/simulate_webhook.js <ORDER_ID>');
    process.exit(1);
}

const payload = {
    id: 'evt_test_webhook',
    object: 'event',
    type: 'checkout.session.completed',
    created: Math.floor(Date.now() / 1000),
    data: {
        object: {
            id: 'cs_test_session',
            object: 'checkout.session',
            metadata: {
                order_id: orderId,
            },
            payment_status: 'paid',
        }
    }
};

const payloadString = JSON.stringify(payload, null, 2); // Next.js body might be formatted differently? No, usually raw. 
// BUT `stripe` CLI sends minified JSON?
// Let's try minified first (JSON.stringify(payload)).
// Wait, `req.text()` in Next.js receives exactly what is sent over wire.
// `header` is generated from the payload passed to it.
// The matching key is `secret`.

// Ensure secret is present
if (!secret || !secret.startsWith('whsec_')) {
    console.error('Error: STRIPE_WEBHOOK_SECRET is missing or invalid in .env.local');
    console.error('Value found:', secret);
    process.exit(1);
}

const header = stripe.webhooks.generateTestHeaderString({
    payload: payloadString,
    secret: secret,
});

const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/webhooks/stripe',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': header,
    },
}, (res) => {
    console.log(`Status: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (e) => {
    console.error(e);
});

req.write(payloadString);
req.end();
console.log(`Sending mock webhook for Order ID: ${orderId}...`);
