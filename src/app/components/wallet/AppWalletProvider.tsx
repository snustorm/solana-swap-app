"use client";
 
import dynamic from "next/dynamic";
import React, { useMemo, useCallback } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletError } from '@solana/wallet-adapter-base';
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { PhantomWalletAdapter, SafePalWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
 
// Default styles that can be overridden by your app (很重要，没有就会报错)
require("@solana/wallet-adapter-react-ui/styles.css");


// imports here

export const WalletButton = dynamic(
    async () =>
      (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
  );
 
export default function AppWalletProvider({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const onError = useCallback((error: WalletError) => {
        console.error(error);
      }, []);
    const wallets = useMemo(
      () => [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
        new SafePalWalletAdapter(),
      ],
      [network],
    );
   
    return (
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={[]} onError={onError}  autoConnect={false}>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    );
  }