// app/api/send-confirmation/route.js

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'
const FROM_EMAIL = 'support@elementunited.com'
const FROM_NAME = 'ELMT.Store'
const INTERNAL_EMAILS = ['support@elementunited.com', 'pbarlow@elementunited.com']

function orderRows(cart) {
  return cart.map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;vertical-align:middle;">
        ${item.img ? `<img src="${item.img}" alt="${item.name}" width="48" height="48" style="border-radius:8px;object-fit:contain;background:#1a1a1a;display:block;"/>` : `<div style="width:48px;height:48px;background:#1a1a1a;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:24px;">${item.icon || '📦'}</div>`}
      </td>
      <td style="padding:10px 0 10px 12px;border-bottom:1px solid #2a2a2a;color:#fff;font-size:14px;vertical-align:middle;">${item.name}</td>
      <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#888;font-size:14px;text-align:center;vertical-align:middle;">x${item.qty}</td>
      <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#e8ff00;font-size:14px;text-align:right;vertical-align:middle;">$${(item.priceUSD * item.qty).toFixed(2)}</td>
    </tr>
  `).join('')
}

function shippingSection(shippingAddress) {
  if (!shippingAddress) return ''
  const { address1, address2, city, state, zip, country } = shippingAddress
  return `
    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="color:#888;font-size:12px;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.08em;">Shipping Address</p>
      <p style="color:#fff;font-size:14px;line-height:1.6;margin:0;">
        ${address1}${address2 ? '<br>' + address2 : ''}<br>
        ${city}, ${state} ${zip}<br>
        ${country === 'US' ? 'United States' : 'Canada'}
      </p>
    </div>
  `
}
  if (!txHash) return ''
  return `
    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:16px;margin:20px 0;">
      <p style="color:#888;font-size:12px;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.08em;">Transaction Hash</p>
      <p style="color:#e8ff00;font-size:12px;word-break:break-all;font-family:monospace;">${txHash}</p>
      <a href="https://basescan.org/tx/${txHash}" style="color:#888;font-size:11px;text-decoration:none;">View on BaseScan</a>
    </div>
  `
}

function customerTemplate({ customerName, orderId, cart, paymentMethod, total, txHash, shippingAddress }) {
  return `<!DOCTYPE html>
<html>
<body style="background:#0d0d0d;margin:0;padding:40px 20px;font-family:Inter,sans-serif;">
  <div style="max-width:560px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:32px;">
      <img src="https://raw.githubusercontent.com/Element-Blockchain/images/main/products/ELMT%20Token.png" width="48" style="border-radius:50%;margin-bottom:12px;"/>
      <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0;">ELMT<span style="color:#e8ff00;">.store</span></h1>
    </div>
    <div style="background:#141414;border:1px solid #2a2a2a;border-radius:16px;padding:32px;">
      <h2 style="color:#fff;font-size:18px;font-weight:700;margin:0 0 8px;">Order Confirmed</h2>
      <p style="color:#888;font-size:14px;margin:0 0 24px;">Thanks${customerName ? ', ' + customerName : ''}! Your order has been received.</p>
      <div style="background:#1a1a1a;border-radius:8px;padding:4px 12px;display:inline-block;margin-bottom:24px;">
        <span style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;">Order ID: </span>
        <span style="color:#fff;font-size:11px;font-family:monospace;">${orderId}</span>
      </div>
      <table style="width:100%;border-collapse:collapse;">${orderRows(cart)}</table>
      <div style="display:flex;justify-content:space-between;margin-top:16px;">
        <span style="color:#888;font-size:14px;">Payment Method</span>
        <span style="color:#fff;font-size:14px;font-weight:700;">${paymentMethod}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:8px;padding-top:12px;border-top:1px solid #2a2a2a;">
        <span style="color:#fff;font-size:16px;font-weight:700;">Total</span>
        <span style="color:#e8ff00;font-size:16px;font-weight:800;">${total}</span>
      </div>
      ${txSection(txHash)}
      ${shippingSection(shippingAddress)}
    </div>
    <p style="color:#444;font-size:11px;text-align:center;margin-top:24px;">Questions? Contact us at <a href="mailto:support@elementunited.com" style="color:#888;">support@elementunited.com</a></p>
    <p style="color:#333;font-size:10px;text-align:center;margin-top:8px;">© 2026 Element United. All rights reserved.</p>
  </div>
</body>
</html>`
}

function internalTemplate({ customerEmail, customerName, orderId, cart, paymentMethod, total, txHash, shippingAddress }) {
  return `<!DOCTYPE html>
<html>
<body style="background:#0d0d0d;margin:0;padding:40px 20px;font-family:Inter,sans-serif;">
  <div style="max-width:560px;margin:0 auto;">
    <div style="background:#141414;border:1px solid #2a2a2a;border-radius:16px;padding:32px;">
      <h2 style="color:#e8ff00;font-size:18px;font-weight:700;margin:0 0 4px;">New Order Received</h2>
      <p style="color:#888;font-size:13px;margin:0 0 24px;">Order ID: <span style="color:#fff;font-family:monospace;">${orderId}</span></p>
      <p style="color:#888;font-size:13px;margin:0 0 4px;">Customer</p>
      <p style="color:#fff;font-size:14px;font-weight:600;margin:0 0 4px;">${customerName || 'N/A'}</p>
      <p style="color:#888;font-size:13px;margin:0 0 24px;">${customerEmail}</p>
      <p style="color:#888;font-size:13px;margin:0 0 8px;">Items</p>
      <table style="width:100%;border-collapse:collapse;">${orderRows(cart)}</table>
      <div style="display:flex;justify-content:space-between;margin-top:16px;padding-top:12px;border-top:1px solid #2a2a2a;">
        <span style="color:#fff;font-size:15px;font-weight:700;">Total</span>
        <span style="color:#e8ff00;font-size:15px;font-weight:800;">${total}</span>
      </div>
      <div style="margin-top:16px;">
        <span style="color:#888;font-size:13px;">Payment: </span>
        <span style="color:#fff;font-size:13px;font-weight:700;">${paymentMethod}</span>
      </div>
      ${txSection(txHash)}
      ${shippingSection(shippingAddress)}
    </div>
  </div>
</body>
</html>`
}

async function sendEmail({ to, subject, html }) {
  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Brevo error: ${err}`)
  }
  return res.json()
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { customerEmail, customerName, orderId, txHash, paymentMethod, cart, total, shippingAddress } = body

    // Customer email
    await sendEmail({
      to: customerEmail,
      subject: 'Your ELMT.Store Order Confirmation',
      html: customerTemplate({ customerName, orderId, cart, paymentMethod, total, txHash, shippingAddress }),
    })

    // Internal notifications
    for (const email of INTERNAL_EMAILS) {
      await sendEmail({
        to: email,
        subject: `New ELMT.Store Order - ${orderId}`,
        html: internalTemplate({ customerEmail, customerName, orderId, cart, paymentMethod, total, txHash, shippingAddress }),
      })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('Email error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
