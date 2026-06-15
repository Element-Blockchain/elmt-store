// lib/web3.js
'use client'

import { createAppKit } from '@reown/appkit'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet, base } from '@reown/appkit/networks'

const projectId = 'e5c89d315442f18024d5eaf69925c63c'

const metadata = {
  name: 'ELMT.Store',
  description: 'The Official Element United Store',
  url: 'https://elmt.store',
  icons: ['https://raw.githubusercontent.com/Element-Blockchain/images/main/products/ELMT%20Token.png'],
}

const ethersAdapter = new EthersAdapter()

let modal = null

export function getModal() {
  if (typeof window === 'undefined') return null
  if (!modal) {
    modal = createAppKit({
      adapters: [ethersAdapter],
      networks: [base, mainnet],
      defaultNetwork: base,
      projectId,
      metadata,
      themeMode: 'dark',
      themeVariables: {
        '--w3m-accent': '#e8ff00',
        '--w3m-border-radius-master': '8px',
        '--w3m-font-family': 'Inter, sans-serif',
      },
      features: {
        analytics: false,
        email: false,
        socials: false,
      },
      featuredWalletIds: [
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
        'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
      ],
    })
  }
  return modal
}
