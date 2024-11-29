import { Program, AnchorProvider, BN } from "@project-serum/anchor";
import { toast } from "react-toastify";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { getProgram, getVaultAddress } from "./program";
import { Offer } from "./interfaces";

/**
 * Handles the swap process.
 * @param connection - The Solana connection object.
 * @param wallet - The user's wallet.
 * @param offer - The offer details.
 */
export async function handleSwap(
  connection: any,
  wallet: any,
  offer: Offer
) {

    console.log("handle swap");
  if (!wallet || !connection) {
    toast.error("Please connect your wallet.");
    console.log("Please connect your wallet.");
    return;
  }

  // Check if the current user is the maker
  if (wallet.publicKey.toBase58() === offer.maker) {
    toast.error("You cannot take your own offer!");
    console.log("You cannot take your own offer!"); 
    return;
  }

  console.log("[transaction] take offer  - sending...");

  console.log("offer pubkey: ", offer.publicKey);    

  try {
    // Initialize the program
    const program = getProgram(connection, wallet);

    // Get the user's associated token accounts
    const takerTokenAccountA = await getAssociatedTokenAddress(
      new PublicKey(offer.tokenMintA),
      wallet.publicKey
    );

    console.log("user token account a: ", takerTokenAccountA.toBase58());

    const takerTokenAccountB = await getAssociatedTokenAddress(
      new PublicKey(offer.tokenMintB),
      wallet.publicKey
    );

    console.log("user token account a: ", takerTokenAccountB.toBase58());
    

    const makeTokenAccountB = await getAssociatedTokenAddress(
        new PublicKey(offer.tokenMintB),
        new PublicKey(offer.maker)
      );
  
      console.log("user token account a: ", makeTokenAccountB.toBase58());
  
    const vaultAddress = await getVaultAddress(new PublicKey(offer.tokenMintA), new PublicKey(offer.publicKey));

    // Call the take_offer method
    const tx = await program.methods
      .takeOffer() // No parameters as per the smart contract definition
      .accounts({
        maker: new PublicKey(offer.maker),
        tokenMintA: new PublicKey(offer.tokenMintA),
        tokenMintB: new PublicKey(offer.tokenMintB),
        takerTokenAccountA: takerTokenAccountA,
        takerTokenAccountB: takerTokenAccountB,
        makerTokenAccountB: makeTokenAccountB,
        offer: new PublicKey(offer.publicKey),
        vault: vaultAddress,
      })
      .rpc();

    // Notify user of success
    toast.success("Swap successful! Transaction ID: " + tx);
    console.log("Transaction ID:", tx);
  } catch (error) {
    console.error("Error during swap:", error);
    toast.error("Swap failed. See console for details.");
  }
}