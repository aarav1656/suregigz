'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/frontend/app/lib/wallet/WalletContext';

export const ConnectWallet: React.FC = () => {
  const router = useRouter();
  const { modal, accountId, isConnected } = useWallet();

  useEffect(() => {
    if (isConnected) {
      router.push('/onboarding');
    }
  }, [isConnected, router]);

  const handleConnect = () => {
    if (modal) {
      modal.show();
    }
  };

  return (
    <button
      onClick={handleConnect}
      className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-lg hover:from-cyan-500 hover:to-purple-500 transition-colors font-['Press_Start_2P'] text-sm"
    >
      {isConnected ? `Connected: ${accountId}` : 'Connect Wallet'}
    </button>
  );
}; 