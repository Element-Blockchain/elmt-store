// app/page.js
'use client'

import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { products, ELEMENT_WALLET, ELMT_CONTRACT, USDC_CONTRACT_BASE, USDT_CONTRACT_BASE, USDC_CONTRACT_ETH, USDT_CONTRACT_ETH } from '../lib/products'
import Nav from '../components/Nav'
import FilterBar from '../components/FilterBar'
import ProductGrid from '../components/ProductGrid'
import CartDrawer from '../components/CartDrawer'
import ConfirmModal from '../components/ConfirmModal'
import Footer from '../components/Footer'
import styles from './page.module.css'

const FALLBACK_ELMT_PRICE = 0.0001932

export default function StorePage() {
  const [elmtPrice, setElmtPrice] = useState(FALLBACK_ELMT_PRICE)
  const [filter, setFilter] = useState('all')
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [walletAddress, setWalletAddress] = useState(null)
  const [productQty, setProductQty] = useState(() =>
    Object.fromEntries(products.map(p => [p.id, 1]))
  )
  const [confirmData, setConfirmData] = useState(null)
  const [checkingOut, setCheckingOut] = useState(false)

  // Fetch live ELMT price
  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/token_price/base?contract_addresses=0x600d601d8b9eb5de5ac90fefc68d0d08801bfd3f&vs_currencies=usd'
        )
        const data = await res.json()
        const key = Object.keys(data)[0]
        if (key && data[key]?.usd) setElmtPrice(data[key].usd)
      } catch {
        console.log('Using fallback ELMT price')
      }
    }
    fetchPrice()
  }, [])

  // Handle Stripe success redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('order') === 'success') {
      const orderId = params.get('id') || 'N/A'
      setConfirmData({
        orderId,
        txHash: null,
        paymentMethod: 'CARD',
        items: [],
        totalUSD: 0,
        stripeSuccess: true,
      })
      window.history.replaceState({}, '', window.location.pathname)
      setCart([])
    }
  }, [])

  // Subscribe to AppKit wallet events
  useEffect(() => {
    let unsub = null
    async function initModal() {
      const { getModal } = await import('../lib/web3')
      const modal = getModal()
      if (!modal) return
      unsub = modal.subscribeAccount(({ address, isConnected }) => {
        if (isConnected && address) {
          setWalletAddress(address)
        } else {
          setWalletAddress(null)
        }
      })
    }
    initModal()
    return () => { if (unsub) unsub() }
  }, [])

  const calcELMT = useCallback((usd) => {
    if (elmtPrice <= 0) return 0
    return Math.round(usd / elmtPrice)
  }, [elmtPrice])

  const generateOrderId = () =>
    'EU-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase()

  const changeQty = (id, delta) => {
    const product = products.find(p => p.id === id)
    setProductQty(prev => ({
      ...prev,
      [id]: Math.max(1, Math.min(product.maxQty, (prev[id] || 1) + delta))
    }))
  }

  const addToCart = (id) => {
    const product = products.find(p => p.id === id)
    const qty = productQty[id] || 1
    setCart(prev => {
      const existing = prev.find(i => i.id === id)
      if (existing) {
        return prev.map(i => i.id === id
          ? { ...i, qty: Math.min(product.maxQty, i.qty + qty) }
          : i
        )
      }
      return [...prev, { ...product, qty }]
    })
    showToast(`${product.name} (x${qty}) added to cart`)
  }

  const updateCartQty = (id, delta) => {
    const product = products.find(p => p.id === id)
    setCart(prev => prev.map(i => i.id === id
      ? { ...i, qty: Math.max(1, Math.min(product.maxQty, i.qty + delta)) }
      : i
    ))
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id))
  }

  const totalUSD = cart.reduce((s, i) => s + i.priceUSD * i.qty, 0)
  const totalELMT = cart.reduce((s, i) => s + calcELMT(i.priceUSD) * i.qty, 0)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  async function getSigner() {
    const { getModal } = await import('../lib/web3')
    const modal = getModal()
    const provider = modal?.getWalletProvider()
    if (!provider) throw new Error('No wallet connected')
    const ethersProvider = new ethers.BrowserProvider(provider)
    return ethersProvider.getSigner()
  }

  async function sendERC20(contractAddress, toAddress, amount, decimals) {
    const signer = await getSigner()
    const erc20Abi = ['function transfer(address to, uint256 amount) returns (bool)']
    const contract = new ethers.Contract(contractAddress, erc20Abi, signer)
    const amountBN = ethers.parseUnits(amount.toFixed(decimals), decimals)
    const tx = await contract.transfer(toAddress, amountBN)
    await tx.wait()
    return tx.hash
  }

  async function sendETH(toAddress, amountUSD) {
    const signer = await getSigner()
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
    const data = await res.json()
    const ethPrice = data.ethereum.usd
    const ethAmount = (amountUSD / ethPrice).toFixed(18)
    const tx = await signer.sendTransaction({
      to: toAddress,
      value: ethers.parseEther(ethAmount),
    })
    await tx.wait()
    return tx.hash
  }

  async function getChainId() {
    const { getModal } = await import('../lib/web3')
    const modal = getModal()
    const provider = modal?.getWalletProvider()
    if (!provider) return null
    const ethersProvider = new ethers.BrowserProvider(provider)
    const network = await ethersProvider.getNetwork()
    return Number(network.chainId)
  }

  async function handleCheckout(customerEmail, paymentMethod, firstName, lastName) {
    if (cart.length === 0) { showToast('Your cart is empty'); return }
    if (!firstName?.trim()) { showToast('Please enter your first name'); return }
    if (!lastName?.trim()) { showToast('Please enter your last name'); return }
    if (!customerEmail || !customerEmail.includes('@')) {
      showToast('Please enter a valid email address')
      return
    }

    const customerName = `${firstName.trim()} ${lastName.trim()}`
    const orderId = generateOrderId()

    if (paymentMethod === 'fiat') {
      await handleStripeCheckout(customerEmail, orderId, customerName)
      return
    }

    if (!walletAddress) {
      showToast('Please connect your wallet first')
      return
    }

    setCheckingOut(true)
    try {
      let txHash
      const chainId = await getChainId()
      const isBase = chainId === 8453
      const usdcContract = isBase ? USDC_CONTRACT_BASE : USDC_CONTRACT_ETH
      const usdtContract = isBase ? USDT_CONTRACT_BASE : USDT_CONTRACT_ETH

      if (paymentMethod === 'elmt') {
        txHash = await sendERC20(ELMT_CONTRACT, ELEMENT_WALLET, totalUSD / elmtPrice, 18)
      } else if (paymentMethod === 'eth') {
        txHash = await sendETH(ELEMENT_WALLET, totalUSD)
      } else if (paymentMethod === 'usdc') {
        txHash = await sendERC20(usdcContract, ELEMENT_WALLET, totalUSD, 6)
      } else if (paymentMethod === 'usdt') {
        txHash = await sendERC20(usdtContract, ELEMENT_WALLET, totalUSD, 6)
      }

      // Send confirmation emails
      const chainId = await getChainId()
      await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail,
          customerName,
          orderId,
          txHash,
          paymentMethod: paymentMethod.toUpperCase(),
          cart: cart.map(i => ({ name: i.name, qty: i.qty, priceUSD: i.priceUSD })),
          total: `${totalELMT.toLocaleString()} ELMT (≈ $${totalUSD.toFixed(2)} USD)`,
          chainId,
        }),
      })

      setConfirmData({
        orderId,
        txHash,
        chainId,
        paymentMethod: paymentMethod.toUpperCase(),
        items: [...cart],
        totalUSD,
        stripeSuccess: false,
      })
      setCart([])
      setCartOpen(false)

    } catch (err) {
      console.error(err)
      if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
        showToast('Transaction cancelled')
      } else {
        showToast('Transaction failed. Please try again.')
      }
    } finally {
      setCheckingOut(false)
    }
  }

  async function handleStripeCheckout(customerEmail, orderId, customerName) {
    setCheckingOut(true)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: cart.map(i => ({ id: i.id, name: i.name, qty: i.qty, priceUSD: i.priceUSD, fulfillment: i.fulfillment })),
          customerEmail,
          customerName,
          successUrl: `${window.location.origin}?order=success&id=${orderId}`,
          cancelUrl: window.location.href,
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        showToast('Stripe error: ' + (data.error || 'Unknown error'))
      }
    } catch {
      showToast('Could not connect to payment processor')
    } finally {
      setCheckingOut(false)
    }
  }

  function showToast(msg) {
    const existing = document.getElementById('elmt-toast')
    if (existing) existing.remove()
    const toast = document.createElement('div')
    toast.id = 'elmt-toast'
    toast.textContent = msg
    toast.style.cssText = `
      position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(80px);
      background:#141414;border:1px solid #e8ff00;color:#fff;padding:12px 24px;
      border-radius:10px;font-size:14px;font-weight:600;z-index:9999;
      transition:transform 0.3s;white-space:nowrap;font-family:Inter,sans-serif;
    `
    document.body.appendChild(toast)
    setTimeout(() => { toast.style.transform = 'translateX(-50%) translateY(0)' }, 10)
    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(80px)'
      setTimeout(() => toast.remove(), 300)
    }, 2800)
  }

  const filteredProducts = filter === 'all' ? products : products.filter(p => p.category === filter)

  return (
    <div className={styles.page}>
      <Nav
        cartCount={cartCount}
        walletAddress={walletAddress}
        onCartClick={() => setCartOpen(true)}
      />

      <main>
        <div className={styles.hero}>
          <h1>The Official <span>ELMT</span> Store</h1>
          <p>Purchase Element United products with ELMT, ETH, USDC, USDT, or fiat.</p>
        </div>

        <div className={styles.rateBar}>
          <span className={styles.rateDot} />
          <span className={styles.rateLabel}>LIVE ELMT RATE</span>
          <span className={styles.rateValue}>
            1 ELMT = ${elmtPrice.toFixed(7)} USD
          </span>
          <span className={styles.rateSep}>·</span>
          <a
            href="https://www.coingecko.com/en/coins/element-2"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.rateLink}
          >
            via CoinGecko
          </a>
        </div>

        <FilterBar filter={filter} onFilter={setFilter} />

        <ProductGrid
          products={filteredProducts}
          productQty={productQty}
          elmtPrice={elmtPrice}
          onChangeQty={changeQty}
          onAddToCart={addToCart}
          calcELMT={calcELMT}
        />
      </main>

      <Footer />

      <div
        className={`${styles.overlay} ${cartOpen ? styles.overlayShow : ''}`}
        onClick={() => setCartOpen(false)}
      />

      <CartDrawer
        open={cartOpen}
        cart={cart}
        totalUSD={totalUSD}
        totalELMT={totalELMT}
        walletAddress={walletAddress}
        checkingOut={checkingOut}
        onClose={() => setCartOpen(false)}
        onUpdateQty={updateCartQty}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
      />

      {confirmData && (
        <ConfirmModal
          data={confirmData}
          onClose={() => setConfirmData(null)}
        />
      )}
    </div>
  )
}
