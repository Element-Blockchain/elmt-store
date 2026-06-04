// components/ProductCard.js
'use client'
import { useState } from 'react'
import styles from './ProductCard.module.css'

export default function ProductCard({ product: p, qty, calcELMT, onChangeQty, onAddToCart }) {
  const [imgError, setImgError] = useState(false)

  const isCollectibleSoldOut = p.soldOut && p.category === 'collectible'
  const elmtPrice = isCollectibleSoldOut
    ? `$${p.priceUSD.toLocaleString()} USD`
    : `${calcELMT(p.priceUSD).toLocaleString()} ELMT`
  const usdLabel = isCollectibleSoldOut
    ? 'Spot price at time of sale'
    : `≈ $${p.priceUSD.toLocaleString()} USD`

  return (
    <div className={`${styles.card} ${p.soldOut ? styles.soldOut : ''}`}>
      <div className={styles.imgWrap}>
        {p.img && !imgError && (
          <img
            src={p.img}
            alt={p.name}
            className={styles.img}
            onError={() => setImgError(true)}
          />
        )}
        {(!p.img || imgError) && (
          <span className={styles.icon}>{p.icon}</span>
        )}
        {p.soldOut && <span className={styles.soldOutBadge}>Sold Out</span>}
        {p.isNew && !p.soldOut && <span className={styles.newBadge}>New</span>}
        <span className={styles.fulfillmentBadge}>{p.fulfillment}</span>
      </div>

      <div className={styles.body}>
        <div className={styles.category}>{p.categoryLabel}</div>
        <div className={styles.name}>{p.name}</div>
        <div className={styles.desc}>{p.desc}</div>

        <div className={styles.priceRow}>
          <div>
            <div className={styles.priceElmt}>{elmtPrice}</div>
            <div className={styles.priceUsd}>{usdLabel}</div>
          </div>
        </div>

        <div className={styles.chips}>
          {p.payments.map(pay => (
            <span key={pay} className={styles.chip}>{pay}</span>
          ))}
        </div>

        {!p.soldOut && !p.comingSoon && (
          <div className={styles.qtyRow}>
            <span className={styles.qtyLabel}>Qty</span>
            <div className={styles.qtyControls}>
              <button className={styles.qtyBtn} onClick={() => onChangeQty(p.id, -1)}>-</button>
              <span className={styles.qtyVal}>{qty}</span>
              <button className={styles.qtyBtn} onClick={() => onChangeQty(p.id, 1)}>+</button>
              <span className={styles.qtyMax}>max {p.maxQty}</span>
            </div>
          </div>
        )}

        <button
          className={styles.addBtn}
          disabled={p.soldOut || p.comingSoon}
          onClick={() => onAddToCart(p.id)}
        >
          {p.soldOut ? 'Sold Out' : p.comingSoon ? 'Coming Soon' : '+ Add to Cart'}
        </button>
      </div>
    </div>
  )
}
