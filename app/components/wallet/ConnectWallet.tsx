import React from 'react';
import { useWallet } from '@/app/lib/wallet/WalletContext';

export const ConnectWallet: React.FC = () => {
  const { modal, accountId, isConnected } = useWallet();

  const handleConnect = () => {
    if (modal) {
      modal.show();
    }
  };

  return (
    <button
      onClick={handleConnect}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      {isConnected ? `Connected: ${accountId}` : 'Connect Wallet'}
    </button>
  );
}; 