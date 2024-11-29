import { PublicKey } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";

export interface OfferAccount {
  id: number; // Adjust if necessary
  maker: PublicKey;
  tokenMintA: PublicKey;
  tokenMintB: PublicKey;
  tokenBWantedAmount: BN;
  tokenAOfferedAmount: BN;
}

export interface Offer {
  publicKey: string;
  id: string; 
  maker: string;
  tokenMintA: string;
  tokenMintB: string;
  tokenBWantedAmount: string;
  tokenAOfferedAmount: string;
}