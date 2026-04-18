export const config = {
  moduleId: 'crypto-wallet',
  name: 'Crypto Wallet Tracker',
  description: 'Analyze cryptocurrency wallets for fraud or scams',
  apiBase: '/api/modules/crypto-wallet',
  fields: {
    wallet_info: {
      title: '💰 Wallet Information',
      description: 'Wallet details',
      fields: [
        { id: 'wallet_address', label: 'Wallet Address', type: 'text', placeholder: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', required: true, help: 'Cryptocurrency wallet address' },
        { id: 'blockchain', label: 'Blockchain', type: 'select', options: ['Ethereum', 'Bitcoin', 'Solana', 'Binance Smart Chain', 'Polygon', 'Other'], help: 'Which blockchain?' },
        { id: 'wallet_provider', label: 'Wallet Provider', type: 'text', placeholder: 'MetaMask, Trust Wallet, etc.', help: 'Wallet service used' }
      ]
    },
    transaction_analysis: {
      title: '💸 Transaction Analysis',
      description: 'Transaction details',
      fields: [
        { id: 'transaction_hash', label: 'Transaction Hash', type: 'text', placeholder: '0x...', help: 'Specific transaction to investigate' },
        { id: 'amount_sent', label: 'Amount Sent', type: 'text', placeholder: '0.5 ETH', help: 'Amount of crypto sent' },
        { id: 'recipient_address', label: 'Recipient Address', type: 'text', placeholder: '0x...', help: 'Where funds were sent' },
        { id: 'transaction_date', label: 'Transaction Date', type: 'datetime-local', help: 'When transaction occurred' }
      ]
    },
    red_flags: {
      title: '⚠️ Red Flags',
      description: 'Suspicious indicators',
      fields: [
        { id: 'known_scam', label: 'Known Scam Wallet', type: 'select', options: ['Yes', 'No', 'Unknown'], help: 'Is this a known scam address?' },
        { id: 'scam_reports', label: 'Scam Reports', type: 'textarea', placeholder: 'Reports from other users...', help: 'Known scam reports', rows: 3 },
        { id: 'suspicious_patterns', label: 'Suspicious Patterns', type: 'textarea', placeholder: 'Unusual transaction patterns...', help: 'Red flags in activity', rows: 3 }
      ]
    },
    evidence: {
      title: '📎 Upload Evidence',
      description: 'Upload transaction screenshots',
      fields: [
        { id: 'files', label: 'Upload Evidence Files', type: 'file', help: 'Screenshots of transactions, messages, etc.', multiple: true, accept: '.jpg,.jpeg,.png,.pdf' },
        { id: 'notes', label: 'Investigation Notes', type: 'textarea', placeholder: 'Add your findings...', help: 'Detailed notes', rows: 4 }
      ]
    }
  }
};

export default config;