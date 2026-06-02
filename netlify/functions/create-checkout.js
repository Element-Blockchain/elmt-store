const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PRICE_IDS = {
  1: 'price_1TccqaE4dO5YNsqV4vLJuPZ8', // Smart Node Boost NFT
  2: 'price_1TccsmE4dO5YNsqVFoeVBes5', // Heirloom NFT
  3: 'price_1TccxJE4dO5YNsqVdQYxnSBs', // Element Swag Pack 1
  99: 'price_1TduHwE4dO5YNsqVdIX2nh4e', // $1 Test Product
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { cart, customerEmail, successUrl, cancelUrl } = JSON.parse(event.body);

    const lineItems = cart.map(item => {
      const priceId = PRICE_IDS[item.id];
      if (!priceId) throw new Error(`No Stripe price found for product ID ${item.id}`);
      return { price: priceId, quantity: item.qty };
    });

    // Check if any physical items in cart (need shipping)
    const hasPhysical = cart.some(i => i.fulfillment === 'Physical');

    const sessionParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        source: 'elmt-store',
        cart: JSON.stringify(cart.map(i => ({ id: i.id, name: i.name, qty: i.qty })))
      }
    };

    if (hasPhysical) {
      sessionParams.shipping_address_collection = { allowed_countries: ['US', 'CA', 'GB', 'AU'] };
      sessionParams.shipping_options = [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 999, currency: 'usd' },
            display_name: 'Standard Shipping',
            delivery_estimate: { minimum: { unit: 'business_day', value: 5 }, maximum: { unit: 'business_day', value: 10 } }
          }
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 1999, currency: 'usd' },
            display_name: 'Express Shipping',
            delivery_estimate: { minimum: { unit: 'business_day', value: 2 }, maximum: { unit: 'business_day', value: 3 } }
          }
        }
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.id, url: session.url })
    };

  } catch (err) {
    console.error('Stripe error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
