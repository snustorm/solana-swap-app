"use client";

import { useState } from "react";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, clusterApiUrl } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createInitializeMintInstruction, createMint, createMintToInstruction, getAssociatedTokenAddress, getMinimumBalanceForRentExemptMint, getOrCreateAssociatedTokenAccount, MINT_SIZE, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import BN from "bn.js";

export default function Mint() {
  const [mintAddress, setMintAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { publicKey, sendTransaction } = useWallet();
  const wallet = useWallet();

  // State for associated token account generation
  const [tokenMint, setTokenMint] = useState<string>('');
  const [tokenOwner, setTokenOwner] = useState<string>('');
  const [ataMessage, setAtaMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // State for quick minting
  const [quickMintTokenMint, setQuickMintTokenMint] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [quickMintAmount, setQuickMintAmount] = useState('');
  const [quickMintMessage, setQuickMintMessage] = useState(''); 
  const [quickMintLoading, setQuickMintLoading] = useState(false);


  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const handleMint = async () => {
    if (!publicKey || !connection ) {
      setError("Wallet is not connected.");
      return;
    }
  
    try {
  
        const mint = Keypair.generate();

        const lamports = await getMinimumBalanceForRentExemptMint(connection);

        const transaction = new Transaction();

        transaction.add(
            SystemProgram.createAccount({
                fromPubkey: publicKey,
                newAccountPubkey: mint.publicKey,
                space: MINT_SIZE,
                lamports,
                programId: TOKEN_PROGRAM_ID,
            }),
            createInitializeMintInstruction(
                mint.publicKey,
                0,
                publicKey,
                publicKey,
                TOKEN_PROGRAM_ID
            )
        );

        sendTransaction(transaction, connection, {
            signers: [mint],
          }).then((sig) => {
            setMintAddress(mint.publicKey.toString());
          });
          setError(null);
        } catch (err) {
            console.error(err);
            setError("An error occurred while minting the token.");
        }
  };

  const handleGenerateAta = async () => {
    if (!publicKey || !wallet) {
      setAtaMessage("Connect your wallet first!");
      return;
    }
    if (!tokenMint || !tokenOwner) {
      setAtaMessage("Please fill in both Token Mint and Token Account Owner.");
      return;
    }
    if (!wallet.publicKey) {
      setAtaMessage("Wallet public key is not available. Please reconnect your wallet.");
      return;
    }
  
    try {
      setAtaMessage(null);
      setLoading(true);
  
      const mintPublicKey = new PublicKey(tokenMint);
      const ownerPublicKey = new PublicKey(tokenOwner);
  
      // Derive the ATA address
      const ataAddress = await getAssociatedTokenAddress(mintPublicKey, ownerPublicKey);
  
      console.log("ATA address:", ataAddress.toBase58());
  
      // Check if the ATA already exists
      const accountInfo = await connection.getAccountInfo(ataAddress);
      if (!accountInfo) {
        console.log(
          `Creating ATA for mint ${mintPublicKey.toBase58()} and owner ${ownerPublicKey.toBase58()}`
        );
  
        // Create the ATA creation instruction
        const transaction = new Transaction().add(
          createAssociatedTokenAccountInstruction(
            publicKey, // Payer
            ataAddress, // Associated token account
            ownerPublicKey, // Token owner
            mintPublicKey // Token mint
          )
        );
  
        // Fetch the latest blockhash for the transaction
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;
  
        // Ensure wallet has `signTransaction`
        if (!wallet.signTransaction) {
          throw new Error("Wallet does not support transaction signing.");
        }
  
        // Sign the transaction
        const signedTransaction = await wallet.signTransaction(transaction);
  
        // Send and confirm the transaction
        const txId = await connection.sendRawTransaction(signedTransaction.serialize());
        await connection.confirmTransaction({
          signature: txId,
          blockhash,
          lastValidBlockHeight,
        });
  
        console.log(`ATA created: ${ataAddress.toBase58()}`);
        setAtaMessage(`ATA created successfully: ${ataAddress.toBase58()}`);
      } else {
        console.log(`ATA already exists: ${ataAddress.toBase58()}`);
        setAtaMessage(`ATA already exists: ${ataAddress.toBase58()}`);
      }
    } catch (error) {
      console.error("Error generating ATA:", error);
      setAtaMessage("Failed to create Associated Token Account.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickMint = async () => {
    if (!wallet?.publicKey) {
      setQuickMintMessage('Connect your wallet first!');
      return;
    }
  
    if (!quickMintTokenMint || !recipientAddress || !quickMintAmount) {
      setQuickMintMessage('All fields are required.');
      return;
    }
  
    try {
      setQuickMintMessage("");
      setQuickMintLoading(true);
  
      const mintPublicKey = new PublicKey(quickMintTokenMint);
      const recipientPublicKey = new PublicKey(recipientAddress);
      const amount = new BN(quickMintAmount);
  
      const ataAddress = await getAssociatedTokenAddress(
        mintPublicKey,
        recipientPublicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
  
      const mintInstruction = createMintToInstruction(
        mintPublicKey,        // Token mint
        ataAddress,   // Recipient ATA
        wallet.publicKey,     // Mint authority
        amount.toNumber()     // Amount to mint
      );
  
      const transaction = new Transaction().add(mintInstruction);
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'processed');
  
      setQuickMintMessage(`Successfully minted ${quickMintAmount} tokens to ${recipientAddress}`);
    } catch (error) {
      console.error('Error minting tokens:', error);
      setQuickMintMessage('Failed to mint tokens.');
    } finally {
      setQuickMintLoading(false);
    }
  };

  
  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-gray-900 to-purple-900 text-gray-300 flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center py-20 px-4 sm:px-20">
        <h1 className="text-4xl sm:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-600">
          Mint SPL Token
        </h1>
  
        <p className="text-lg text-center mt-4">
          Use your connected wallet to mint a new SPL token.
        </p>
  
        <button
          onClick={handleMint}
          className="mt-8 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:opacity-90"
        >
          Mint Token
        </button>
  
        {mintAddress && (
          <div className="mt-4 text-center">
            <p className="text-lg text-green-500">Mint successful!</p>
            <p className="text-sm">
              Token Mint Address: <br />
              <span className="text-purple-400 break-words">{mintAddress}</span>
            </p>
          </div>
        )}
  
        {error && <p className="text-red-500 mt-4">{error}</p>}
  
        {/* ATA Generation Section */}
        <div className="mt-12 w-full max-w-xl p-6 rounded-lg shadow-lg">
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400">Token Mint</label>
                <input
                type="text"
                value={tokenMint}
                onChange={(e) => setTokenMint(e.target.value)}
                className="w-full mt-2 px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter token mint address"
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400">Token Account Owner</label>
                <input
                type="text"
                value={tokenOwner}
                onChange={(e) => setTokenOwner(e.target.value)}
                className="w-full mt-2 px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter owner public key"
                />
            </div>

            {ataMessage && (
                <p
                className={`mt-4 ${
                    ataMessage.includes("success") ? "text-green-500" : "text-red-500"
                }`}
                >
                {ataMessage}
                </p>
            )}

                <div className="flex justify-center mt-10">
                <button
                    onClick={handleGenerateAta}
                    className={`px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-md ${
                    loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                    }`}
                    disabled={loading}
                >
                    {loading ? "Generating..." : "Generate ATA"}
                </button>
                </div>
            </div>


            <div className="mt-8 w-full max-w-xl p-6 rounded-lg shadow-lg">
                <div>
                    <h2 className="text-xl font-semibold text-gray-200 text-center">
                    Quick Mint Tokens
                    </h2>
                    <p className="text-sm text-gray-400 text-center mb-4">
                    Quickly mint tokens to a specific wallet address.
                    </p>

                    <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400">Token Mint</label>
                    <input
                        type="text"
                        value={quickMintTokenMint}
                        onChange={(e) => setQuickMintTokenMint(e.target.value)}
                        className="w-full mt-2 px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter token mint address"
                    />
                    </div>

                    <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400">Recipient Address</label>
                    <input
                        type="text"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        className="w-full mt-2 px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter recipient public key"
                    />
                    </div>

                    <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400">Amount</label>
                    <input
                        type="number"
                        value={quickMintAmount}
                        onChange={(e) => setQuickMintAmount(e.target.value)}
                        className="w-full mt-2 px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter amount to mint"
                    />
                    </div>

                    {quickMintMessage && (
                        <p className={`text-center mt-4 ${quickMintMessage.toLowerCase().includes('success') ? 'text-green-500' : 'text-red-500'}`}>
                            {quickMintMessage}
                        </p>
                    )}

                    <div className="flex justify-center mt-2">
                        <button
                            onClick={handleQuickMint}
                            className={`px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-md ${
                            quickMintLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                            }`}
                            disabled={quickMintLoading}
                        >
                            {quickMintLoading ? 'Minting...' : 'Mint Tokens'}
                        </button>
                    </div>
                </div>
                </div>
      </main>
    </div>
  );
}