// app/api/orders/route.js

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const password = searchParams.get('password')

  if (password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const res = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc&limit=200`,
      {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY,
        },
      }
    )

    if (!res.ok) {
      const err = await res.text()
      throw new Error('Supabase error: ' + err)
    }

    const orders = await res.json()
    return Response.json({ orders })
  } catch (err) {
    console.error('Orders fetch error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
