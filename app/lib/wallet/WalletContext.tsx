"use client"
import React, { createContext, useContext, useEffect, useState } from 'react';
import { setupWallet } from './wallet-config';
import type { WalletSelector } from '@near-wallet-selector/core';
import type { WalletSelectorModal } from '@near-wallet-selector/modal-ui';

interface WalletContextType {
  selector: WalletSelector | null;
  modal: WalletSelectorModal | null;
  accountId: string | null;
  isConnected: boolean;
}

const WalletContext = createContext<WalletContextType>({
  selector: null,
  modal: null,
  accountId: null,
  isConnected: false,
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selector, setSelector] = useState<WalletSelector | null>(null);
  const [modal, setModal] = useState<WalletSelectorModal | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => {
    const initWallet = async () => {
      const { selector, modal } = await setupWallet();
      setSelector(selector);
      setModal(modal);

      // Get initial account if already connected
      const accounts = await selector.getAccounts();
      if (accounts.length > 0) {
        setAccountId(accounts[0].accountId);
      }
    };

    initWallet();
  }, []);

  return (
    <WalletContext.Provider
      value={{
        selector,
        modal,
        accountId,
        isConnected: !!accountId,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext); 