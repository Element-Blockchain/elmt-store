// components/Nav.js
'use client'

import styles from './Nav.module.css'

export default function Nav({ cartCount, walletAddress, onCartClick }) {
  async function handleConnect() {
    const { getModal } = await import('../lib/web3')
    const modal = getModal()
    if (!modal) return
    if (walletAddress) {
      modal.disconnect()
    } else {
      modal.open()
    }
  }

  const short = walletAddress
    ? walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4)
    : null

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <img
          src="https://raw.githubusercontent.com/Element-Blockchain/images/main/products/ELMT%20Token.png"
          alt="ELMT"
          className={styles.logoImg}
        />
        <span className={styles.logoText}>
          ELMT<span className={styles.logoAccent}>.store</span>
        </span>
      </div>
      <div className={styles.right}>
        <button className={styles.cartBtn} onClick={onCartClick}>
          🛒 Cart
          <span className={styles.cartCount}>{cartCount}</span>
        </button>
        <button
          className={`${styles.connectBtn} ${walletAddress ? styles.connected : ''}`}
          onClick={handleConnect}
        >
          {short || 'Connect Wallet'}
        </button>
      </div>
    </nav>
  )
}
