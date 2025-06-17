import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "./components/layout/LayoutWrapper";
import { WalletProvider } from "./lib/wallet/WalletContext";
import "@near-wallet-selector/modal-ui/styles.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "suregigz - Decentralized Freelancing Platform",
  description: "Freelance without fear on NEARProtocol",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </WalletProvider>
      </body>
    </html>
  );
}
