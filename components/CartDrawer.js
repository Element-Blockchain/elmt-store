// components/CartDrawer.js
'use client'
import { useState } from 'react'
import styles from './CartDrawer.module.css'

export default function CartDrawer({
  open, cart, totalUSD, totalELMT, walletAddress,
  checkingOut, onClose, onUpdateQty, onRemove, onCheckout
}) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('elmt')

  const isCrypto = paymentMethod !== 'fiat'

  async function handleCheckout() {
    await onCheckout(email, paymentMethod, firstName, lastName)
  }

  return (
    <div className={`${styles.drawer} ${open ? styles.open : ''}`}>
      <div className={styles.header}>
        <h3>Your Cart</h3>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
      </div>

      <div className={styles.items}>
        {cart.length === 0 ? (
          <div className={styles.empty}>
            <div style={{ fontSize: 40 }}>🛒</div>
            <p>Your cart is empty</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className={styles.item}>
              <div className={styles.itemIcon}>
                {item.img
                  ? <img src={item.img} alt={item.name} onError={e => { e.target.style.display = 'none' }} />
                  : item.icon}
              </div>
              <div className={styles.itemInfo}>
                <div className={styles.itemName}>{item.name}</div>
                <div className={styles.itemPrice}>${(item.priceUSD * item.qty).toFixed(2)} USD</div>
                <div className={styles.itemQty}>
                  <button className={styles.qtyBtn} onClick={() => onUpdateQty(item.id, -1)}>-</button>
                  <span className={styles.qtyVal}>{item.qty}</span>
                  <button className={styles.qtyBtn} onClick={() => onUpdateQty(item.id, 1)}>+</button>
                </div>
              </div>
              <button className={styles.removeBtn} onClick={() => onRemove(item.id)}>✕</button>
            </div>
          ))
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.totalRow}>
          <span>Total</span>
          <span className={styles.totalElmt}>{totalELMT.toLocaleString()} ELMT</span>
        </div>
        <div className={styles.totalUsdRow}>
          <span>USD Estimate</span>
          <span>${totalUSD.toFixed(2)}</span>
        </div>

        <div className={styles.nameRow}>
          <input
            className={styles.nameInput}
            type="text"
            placeholder="First name (required)"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
          />
          <input
            className={styles.nameInput}
            type="text"
            placeholder="Last name (required)"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
          />
        </div>
        <input
          className={styles.emailInput}
          type="email"
          placeholder="Email address (required)"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <select
          className={styles.paySelect}
          value={paymentMethod}
          onChange={e => setPaymentMethod(e.target.value)}
        >
          <option value="elmt">Pay with ELMT</option>
          <option value="eth">Pay with ETH</option>
          <option value="usdc">Pay with USDC</option>
          <option value="usdt">Pay with USDT</option>
          <option value="fiat">Pay with Card (Stripe)</option>
        </select>

        {isCrypto && (
          <div className={styles.notice}>
            Wallet connection required for crypto payments.
          </div>
        )}

        {isCrypto && (
          <div className={styles.feeNotice}>
            ⚠️ If your wallet is on Ethereum mainnet, higher gas fees apply. Switch to Base network for lower fees.
          </div>
        )}

        <button
          className={styles.checkoutBtn}
          onClick={handleCheckout}
          disabled={checkingOut || cart.length === 0}
        >
          {checkingOut ? 'Processing...' : 'Proceed to Checkout'}
        </button>

        {walletAddress && (
          <div className={styles.walletInfo}>
            Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </div>
        )}
      </div>
    </div>
  )
}
