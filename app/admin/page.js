// app/admin/page.js
'use client'

import { useState, useMemo } from 'react'
import styles from './admin.module.css'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [orders, setOrders] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [authed, setAuthed] = useState(false)
  const [filterMethod, setFilterMethod] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')

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

  const filteredOrders = useMemo(() => {
    if (!orders) return []
    return orders.filter(o => {
      const matchMethod = filterMethod === 'all' || o.payment_method === filterMethod
      const matchStatus = filterStatus === 'all' || o.status === filterStatus
      const searchLower = search.toLowerCase()
      const matchSearch = !search ||
        o.order_id?.toLowerCase().includes(searchLower) ||
        o.customer_email?.toLowerCase().includes(searchLower) ||
        o.customer_name?.toLowerCase().includes(searchLower)
      return matchMethod && matchStatus && matchSearch
    })
  }, [orders, filterMethod, filterStatus, search])

  const totalRevenue = filteredOrders.reduce((s, o) => s + (parseFloat(o.total_usd) || 0), 0)
  const cryptoOrders = orders?.filter(o => o.payment_method !== 'CARD') || []
  const fiatOrders = orders?.filter(o => o.payment_method === 'CARD') || []

  function downloadCSV() {
    const headers = ['Order ID', 'Date (MT)', 'Customer Name', 'Email', 'Items', 'Payment', 'Total USD', 'Tx Hash', 'Chain', 'Shipping Address', 'Status']
    const rows = filteredOrders.map(o => {
      const date = new Date(o.created_at).toLocaleString('en-US', { timeZone: 'America/Denver' })
      const items = o.items?.map(i => `${i.name} x${i.qty}`).join(' | ') || ''
      const ship = o.shipping_address
        ? `${o.shipping_address.address1}, ${o.shipping_address.city}, ${o.shipping_address.state} ${o.shipping_address.zip}, ${o.shipping_address.country}`
        : ''
      const chain = o.chain_id === 1 ? 'Ethereum' : o.chain_id === 8453 ? 'Base' : ''
      return [
        o.order_id,
        date,
        o.customer_name || '',
        o.customer_email,
        items,
        o.payment_method,
        parseFloat(o.total_usd).toFixed(2),
        o.tx_hash || '',
        chain,
        ship,
        o.status,
      ].map(v => `"${String(v).replace(/"/g, '""')}"`)
    })
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `elmt-store-orders-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

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
        <div className={styles.headerRight}>
          <button className={styles.refreshBtn} onClick={() => fetchOrders(password)} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button className={styles.exportBtn} onClick={downloadCSV} disabled={filteredOrders.length === 0}>
            Export CSV
          </button>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statVal}>{orders?.length || 0}</div>
          <div className={styles.statLabel}>Total Orders</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statVal}>${orders?.reduce((s, o) => s + (parseFloat(o.total_usd) || 0), 0).toFixed(2)}</div>
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

      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search by name, email, or order ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className={styles.filterSelect} value={filterMethod} onChange={e => setFilterMethod(e.target.value)}>
          <option value="all">All Payment Methods</option>
          <option value="ELMT">ELMT</option>
          <option value="ETH">ETH</option>
          <option value="USDC">USDC</option>
          <option value="USDT">USDT</option>
          <option value="CARD">Card</option>
        </select>
        <select className={styles.filterSelect} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
        </select>
        {(filterMethod !== 'all' || filterStatus !== 'all' || search) && (
          <button className={styles.clearBtn} onClick={() => { setFilterMethod('all'); setFilterStatus('all'); setSearch('') }}>
            Clear Filters
          </button>
        )}
        <span className={styles.filterCount}>
          {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} · ${totalRevenue.toFixed(2)}
        </span>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date (MT)</th>
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
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={9} className={styles.noOrders}>
                  {orders?.length === 0 ? 'No orders yet' : 'No orders match your filters'}
                </td>
              </tr>
            )}
            {filteredOrders.map(order => {
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
                  <td className={styles.dateCell}>{date}</td>
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
