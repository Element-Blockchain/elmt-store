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
    })
  }
  return modal
}
