// components/ProductGrid.js
import ProductCard from './ProductCard'
import styles from './ProductGrid.module.css'

export default function ProductGrid({ products, productQty, elmtPrice, onChangeQty, onAddToCart, calcELMT }) {
  return (
    <div className={styles.grid}>
      {products.map(p => (
        <ProductCard
          key={p.id}
          product={p}
          qty={productQty[p.id] || 1}
          calcELMT={calcELMT}
          onChangeQty={onChangeQty}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  )
}
