// components/FilterBar.js
import styles from './FilterBar.module.css'

const FILTERS = [
  { key: 'all', label: 'All Products' },
  { key: 'nft', label: 'NFTs' },
  { key: 'membership', label: 'Membership' },
  { key: 'collectible', label: 'Collectibles' },
  { key: 'swag', label: 'Swag' },
]

export default function FilterBar({ filter, onFilter }) {
  return (
    <div className={styles.bar}>
      {FILTERS.map(f => (
        <button
          key={f.key}
          className={`${styles.btn} ${filter === f.key ? styles.active : ''}`}
          onClick={() => onFilter(f.key)}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
