import { AnchorProvider, BN, Program, Idl } from "@project-serum/anchor";
import { Connection, PublicKey, sendAndConfirmTransaction, Transaction } from "@solana/web3.js";
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token";


import IDL from "./utils/idl.json"; 
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Offer, OfferAccount } from "./interfaces";


const PROGRAM_ID = new PublicKey("2iNSGAxQTk6Y7Bm7fXZ6eydW7j3i14exSP5SEEyvXEBh");

export const getProgram = (connection: Connection, wallet: AnchorWallet) => {
    const provider = new AnchorProvider(connection, wallet, {
        commitment: "confirmed",
    });

    const program = new Program(IDL as Idl, PROGRAM_ID, provider);
    return program;
};

export const getOfferAddress = (id: number, wallet: AnchorWallet): PublicKey => {
    try {
      return PublicKey.findProgramAddressSync(
        [
          Buffer.from("offer"), 
          wallet.publicKey.toBuffer(), 
          new BN(id).toArrayLike(Buffer, "le", 8), 
        ],
        PROGRAM_ID
      )[0]; 
    } catch (error) {
      console.error("Failed to derive PDA:", error);
      throw new Error("PDA derivation failed");
    }
  };

  // Function to derive the vault address
export const getVaultAddress = async (tokenMint: PublicKey, offer: PublicKey): Promise<PublicKey> => {
    
    try {
      return await getAssociatedTokenAddress(
        tokenMint, // The mint of the token (token_mint_a)
        offer, // The authority of the vault (offer PDA)
        true // Whether the account is a PDA (true because it's derived)
      );
    } catch (error) {
      console.error("Failed to derive Vault ATA:", error);
      throw new Error("Vault ATA derivation failed");
    }
  };

//Function to create the ATA if not exist
  export async function createAtaIfNeeded(
    connection: Connection,
    payer: PublicKey,
    mintPublicKey: PublicKey,
    ownerPublicKey: PublicKey,
    signer: AnchorWallet,
  ): Promise<PublicKey> {
    
    // Derive the ATA address
    const ataAddress = await getAssociatedTokenAddress(mintPublicKey, ownerPublicKey);

    console.log("ataAddress: ", ataAddress.toBase58()); 
  
    // Check if the ATA already exists
    const accountInfo = await connection.getAccountInfo(ataAddress);
    if (!accountInfo) {
      console.log(`Creating ATA for mint ${mintPublicKey.toBase58()} and owner ${ownerPublicKey.toBase58()}`);
      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          payer,          // Payer
          ataAddress,     // Associated token account
          ownerPublicKey, // Token owner
          mintPublicKey   // Token mint
        )
      );
  
      // Send and confirm the transaction
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = payer;
  
      const signedTransaction = await signer.signTransaction(transaction);
      const txId = await connection.sendRawTransaction(signedTransaction.serialize());
      await connection.confirmTransaction({
        signature: txId,
        blockhash,
        lastValidBlockHeight,
      });
      console.log(`ATA created: ${ataAddress.toBase58()}`, signedTransaction);
    } else {
      console.log(`ATA already exists: ${ataAddress.toBase58()}`);
    }
  
    return ataAddress;
  }

// Fetch all the offer data from blockchain
export async function fetchOffers(connection: Connection, wallet: AnchorWallet): Promise<Offer[]> {
    
    const program = getProgram(connection, wallet);
  
    const offers = await program.account.offer.all();
  
    const simplifiedOffers: Offer[] = offers.map((offer) => {
      const account = offer.account as unknown as OfferAccount;
  
      return {
        publicKey: offer.publicKey.toBase58(),
        id: account.id.toString(),
        maker: account.maker.toBase58(),
        tokenMintA: account.tokenMintA.toBase58(),
        tokenMintB: account.tokenMintB.toBase58(),
        tokenBWantedAmount: account.tokenBWantedAmount.toString(),
        tokenAOfferedAmount: account.tokenAOfferedAmount.toString(),
      };
    });

  
    return simplifiedOffers;
  }
