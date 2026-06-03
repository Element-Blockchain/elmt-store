// components/ConfirmModal.js
import styles from './ConfirmModal.module.css'

export default function ConfirmModal({ data, onClose }) {
  const { orderId, txHash, paymentMethod, items, totalUSD, stripeSuccess } = data

  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        <div className={styles.icon}>✓</div>
        <h2>Order Confirmed!</h2>
        <p>
          {stripeSuccess
            ? 'Your card payment was successful. A confirmation email has been sent to you.'
            : 'Your transaction was successful. A confirmation email has been sent to you.'}
        </p>

        <div className={styles.orderId}>
          Order ID: <span>{orderId}</span>
        </div>

        {txHash && (
          <div className={styles.txSection}>
            <p>Transaction Hash</p>
            <a
              href={`${data.chainId === 1 ? 'https://etherscan.io' : 'https://basescan.org'}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {txHash}
            </a>
          </div>
        )}

        {items.length > 0 && (
          <div className={styles.items}>
            {items.map((item, i) => (
              <div key={i} className={styles.item}>
                <span>{item.name} x{item.qty}</span>
                <span>${(item.priceUSD * item.qty).toFixed(2)}</span>
              </div>
            ))}
            <div className={`${styles.item} ${styles.totalRow}`}>
              <span>Total</span>
              <span>${totalUSD.toFixed(2)}</span>
            </div>
          </div>
        )}

        {stripeSuccess && (
          <div className={styles.items}>
            <div className={styles.item}>
              <span>Payment processed via Stripe</span>
            </div>
          </div>
        )}

        <button className={styles.closeBtn} onClick={onClose}>
          Continue Shopping
        </button>
      </div>
    </div>
  )
}
