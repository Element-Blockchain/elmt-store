// lib/products.js

export const ELEMENT_WALLET = '0xC42E590c134416fC601731F8E682a68B13c8CF75'
export const ELMT_CONTRACT = '0x600d601d8b9eb5de5ac90fefc68d0d08801bfd3f'
export const USDC_CONTRACT_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
export const USDT_CONTRACT_BASE = '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'
export const USDC_CONTRACT_ETH = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
export const USDT_CONTRACT_ETH = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

export const STRIPE_PRICE_IDS = {
  1: 'price_1TccqaE4dO5YNsqV4vLJuPZ8',  // Smart Node Boost NFT
  2: 'price_1TccsmE4dO5YNsqVFoeVBes5',  // Heirloom NFT
  3: 'price_1TccxJE4dO5YNsqVdQYxnSBs',  // Element Swag Pack 1
  99: 'price_1TduHwE4dO5YNsqVdIX2nh4e', // $1 Test Product
}

export const products = [
  {
    id: 1,
    name: 'Smart Node Boost NFT',
    category: 'nft',
    categoryLabel: 'NFT',
    desc: '2x action points on one Element Smart Node for 6 continuous months. Delivered directly to your Element wallet.',
    priceUSD: 500,
    img: 'https://raw.githubusercontent.com/Element-Blockchain/images/main/products/Digital%20Card_Smart%20Node%20Boost%20NFT.png',
    icon: '⚡',
    soldOut: false,
    isNew: true,
    fulfillment: 'Digital',
    payments: ['ELMT', 'ETH', 'USDC', 'USDT', 'FIAT'],
    maxQty: 10,
  },
  {
    id: 2,
    name: 'Heirloom NFT',
    category: 'nft',
    categoryLabel: 'NFT',
    desc: 'A permanent blockchain-secured digital vault for your most treasured possessions. Preserve provenance across generations.',
    priceUSD: 99,
    img: 'https://raw.githubusercontent.com/Element-Blockchain/images/main/products/Digital%20Card_Heirloom%20NFT_V2.png',
    icon: '🏛️',
    soldOut: false,
    isNew: false,
    fulfillment: 'Digital',
    payments: ['ELMT', 'ETH', 'USDC', 'USDT', 'FIAT'],
    maxQty: 10,
  },
  {
    id: 3,
    name: 'Element Swag Pack 1',
    category: 'swag',
    categoryLabel: 'Swag',
    desc: 'Official Element United branded merchandise. Ships directly from the Element team.',
    priceUSD: 35,
    img: 'https://raw.githubusercontent.com/Element-Blockchain/images/main/products/Element%20Swag%20Pack_001.jpg',
    icon: '👕',
    soldOut: false,
    isNew: false,
    fulfillment: 'Physical',
    payments: ['ELMT', 'ETH', 'USDC', 'USDT', 'FIAT'],
    comingSoon: true,
    maxQty: 10,
  },
  {
    id: 99,
    name: '$1 Test Product',
    category: 'swag',
    categoryLabel: 'Test',
    desc: 'Internal test product only. Do not purchase.',
    priceUSD: 1,
    img: null,
    icon: '🧪',
    soldOut: false,
    isNew: false,
    fulfillment: 'Digital',
    payments: ['FIAT'],
    maxQty: 1,
  },
  {
    id: 4,
    name: 'Element Silver Bullion Coin',
    category: 'collectible',
    categoryLabel: 'Collectible',
    desc: '1 Troy Oz .999 Pure Silver. Element United Logo with "Unearth Possibilities" on the front. Grooved edge. Series A. Issued 2022. 39mm, 31.1g.',
    priceUSD: 75.55,
    img: 'https://raw.githubusercontent.com/Element-Blockchain/images/main/products/Silver%20Coin_Nov2023.png',
    icon: '🪙',
    soldOut: true,
    isNew: false,
    fulfillment: 'Physical',
    payments: ['ELMT', 'ETH', 'USDC', 'USDT', 'FIAT'],
    maxQty: 3,
  },
  {
    id: 5,
    name: 'Element Gold Bullion Coin',
    category: 'collectible',
    categoryLabel: 'Collectible',
    desc: '1 Troy Oz .9999 Pure Gold. Element United Logo with "Unearth Possibilities" on the front. Grooved edge. Series A. Issued 2022. 30mm, 31.1g.',
    priceUSD: 4558.48,
    img: 'https://raw.githubusercontent.com/Element-Blockchain/images/main/products/Gold%20Coin_Feb2025.png',
    icon: '🥇',
    soldOut: true,
    isNew: false,
    fulfillment: 'Physical',
    payments: ['ELMT', 'ETH', 'USDC', 'USDT', 'FIAT'],
    maxQty: 3,
  },
]
