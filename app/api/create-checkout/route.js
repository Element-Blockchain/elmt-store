// app/api/create-checkout/route.js
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const PRICE_IDS = {
  1: 'price_1TccqaE4dO5YNsqV4vLJuPZ8',
  2: 'price_1TccsmE4dO5YNsqVFoeVBes5',
  3: 'price_1TccxJE4dO5YNsqVdQYxnSBs',
  99: 'price_1TduHwE4dO5YNsqVdIX2nh4e',
  100: 'price_1TeO6gE4dO5YNsqVEvHFBIr1',
}

export async function POST(request) {
  try {
    const { cart, customerEmail, customerName, successUrl, cancelUrl } = await request.json()

    const lineItems = cart.map(item => {
      const priceId = PRICE_IDS[item.id]
      if (!priceId) throw new Error(`No Stripe price for product ID ${item.id}`)
      return { price: priceId, quantity: item.qty }
    })

    const hasPhysical = cart.some(i => i.fulfillment === 'Physical')

    const sessionParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        source: 'elmt-store',
        customer_name: customerName || '',
        cart: JSON.stringify(cart.map(i => ({ id: i.id, name: i.name, qty: i.qty }))),
      },
    }

    if (hasPhysical) {
      sessionParams.shipping_address_collection = { allowed_countries: ['US', 'CA'] }

      const physicalTotal = cart
        .filter(i => i.fulfillment === 'Physical')
        .reduce((s, i) => s + i.priceUSD * i.qty, 0)

      const isTestPhysical = cart.every(i => i.id === 100)
      const isFreeShipping = physicalTotal >= 200

      if (isTestPhysical) {
        // $0.50 shipping for test product only
        sessionParams.shipping_options = [
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: { amount: 50, currency: 'usd' },
              display_name: 'Standard Shipping',
              delivery_estimate: {
                minimum: { unit: 'business_day', value: 5 },
                maximum: { unit: 'business_day', value: 10 },
              },
            },
          },
        ]
      } else if (isFreeShipping) {
        // Free shipping for orders over $200
        sessionParams.shipping_options = [
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: { amount: 0, currency: 'usd' },
              display_name: 'Free Standard Shipping',
              delivery_estimate: {
                minimum: { unit: 'business_day', value: 5 },
                maximum: { unit: 'business_day', value: 10 },
              },
            },
          },
        ]
      } else {
        // Standard $6.99 shipping
        sessionParams.shipping_options = [
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: { amount: 699, currency: 'usd' },
              display_name: 'Standard Shipping',
              delivery_estimate: {
                minimum: { unit: 'business_day', value: 5 },
                maximum: { unit: 'business_day', value: 10 },
              },
            },
          },
        ]
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return Response.json({ sessionId: session.id, url: session.url })
  } catch (err) {
    console.error('Stripe error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
