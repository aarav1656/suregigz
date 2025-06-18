import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupMathWallet } from "@near-wallet-selector/math-wallet";
import { setupLedger } from "@near-wallet-selector/ledger";
import { setupWalletConnect } from "@near-wallet-selector/wallet-connect";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";

export const CONTRACT_ID = "test.testnet"; // Replace with your contract ID

export const setupWallet = async () => {
  const selector = await setupWalletSelector({
    network: "testnet",
    modules: [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setupMyNearWallet() as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setupMeteorWallet() as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setupSender() as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setupHereWallet() as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setupMathWallet() as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setupLedger() as any,
      setupWalletConnect({
        projectId: "YOUR_PROJECT_ID", // Replace with your WalletConnect project ID
        metadata: {
          name: "SureGigz",
          description: "Your trusted platform for gigs",
          url: "https://suregigz.com",
          icons: ["https://suregigz.com/icon.png"],
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any,
    ],
  });

  const modal = setupModal(selector, {
    contractId: CONTRACT_ID,
  });

  return { selector, modal };
}; 