// app/admin/page.js
'use client'

import { useState } from 'react'
import styles from './admin.module.css'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [orders, setOrders] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [authed, setAuthed] = useState(false)

  async function fetchOrders(pw) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/orders?password=${encodeURIComponent(pw)}`)
      const data = await res.json()
      if (res.status === 401) {
        setError('Incorrect password')
        setAuthed(false)
      } else if (data.error) {
        setError(data.error)
      } else {
        setOrders(data.orders)
        setAuthed(true)
      }
    } catch (err) {
      setError('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  function handleLogin(e) {
    e.preventDefault()
    fetchOrders(password)
  }

  const totalRevenue = orders?.reduce((s, o) => s + (parseFloat(o.total_usd) || 0), 0) || 0
  const cryptoOrders = orders?.filter(o => o.payment_method !== 'CARD') || []
  const fiatOrders = orders?.filter(o => o.payment_method === 'CARD') || []

  if (!authed) {
    return (
      <div className={styles.loginWrap}>
        <div className={styles.loginBox}>
          <img
            src="https://raw.githubusercontent.com/Element-Blockchain/images/main/products/ELMT%20Token.png"
            alt="ELMT"
            className={styles.loginLogo}
          />
          <h1 className={styles.loginTitle}>ELMT<span>.store</span> Admin</h1>
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <input
              className={styles.loginInput}
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
            />
            {error && <div className={styles.loginError}>{error}</div>}
            <button className={styles.loginBtn} type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'View Orders'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <img
            src="https://raw.githubusercontent.com/Element-Blockchain/images/main/products/ELMT%20Token.png"
            alt="ELMT"
            className={styles.headerLogo}
          />
          <span className={styles.headerTitle}>ELMT<span>.store</span> Orders</span>
        </div>
        <button className={styles.refreshBtn} onClick={() => fetchOrders(password)}>
          Refresh
        </button>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statVal}>{orders?.length || 0}</div>
          <div className={styles.statLabel}>Total Orders</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statVal}>${totalRevenue.toFixed(2)}</div>
          <div className={styles.statLabel}>Total Revenue</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statVal}>{cryptoOrders.length}</div>
          <div className={styles.statLabel}>Crypto Orders</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statVal}>{fiatOrders.length}</div>
          <div className={styles.statLabel}>Card Orders</div>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Email</th>
              <th>Items</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Tx / Ship</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders?.length === 0 && (
              <tr>
                <td colSpan={9} className={styles.noOrders}>No orders yet</td>
              </tr>
            )}
            {orders?.map(order => {
              const date = new Date(order.created_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit', timeZone: 'America/Denver'
              })
              const items = order.items?.map(i => `${i.name} x${i.qty}`).join(', ') || '-'
              const explorerUrl = order.chain_id === 1
                ? `https://etherscan.io/tx/${order.tx_hash}`
                : `https://basescan.org/tx/${order.tx_hash}`
              const hasShipping = order.shipping_address

              return (
                <tr key={order.id}>
                  <td className={styles.dateCell}>{date} MT</td>
                  <td className={styles.monoCell}>{order.order_id}</td>
                  <td>{order.customer_name || '-'}</td>
                  <td>{order.customer_email}</td>
                  <td className={styles.itemsCell}>{items}</td>
                  <td>
                    <span className={`${styles.badge} ${order.payment_method === 'CARD' ? styles.badgeFiat : styles.badgeCrypto}`}>
                      {order.payment_method}
                    </span>
                  </td>
                  <td className={styles.totalCell}>${parseFloat(order.total_usd).toFixed(2)}</td>
                  <td>
                    {order.tx_hash && (
                      <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className={styles.txLink}>
                        {order.tx_hash.slice(0, 8)}...
                      </a>
                    )}
                    {hasShipping && (
                      <div className={styles.shipInfo}>
                        📦 {order.shipping_address.city}, {order.shipping_address.state}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={styles.statusBadge}>{order.status}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
