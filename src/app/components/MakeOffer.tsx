'use client'

import { useMemo, useState } from "react";
import { web3 } from "@project-serum/anchor";
import { XIcon } from '@heroicons/react/outline';
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { createAtaIfNeeded, getProgram } from "./program";
import { BN } from "bn.js";

import { getOfferAddress, getVaultAddress } from "./program";
import { getAssociatedTokenAddress } from "@solana/spl-token";

export default function MakeOfferModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const [offerId, setOfferId] = useState<number | undefined>();
  const [tokenMintA, setTokenMintA] = useState<string>('');
  const [tokenMintB, setTokenMintB] = useState<string>('');
  const [tokenAAmount, setTokenAAmount] = useState<number>(0);
  const [tokenBAmount, setTokenBAmount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const program = useMemo(() => {
    if (connected && wallet) {
      return getProgram(connection, wallet);
    }
    return null;
  }, [connection, wallet, connected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet?.publicKey) {
      setError("Wallet is not connected");
      return;
    }

    if (!offerId || !tokenMintA || !tokenMintB || !tokenAAmount || !tokenBAmount) {
      setError("All fields are required");
      return;
    }

    const offerAddress = getOfferAddress(offerId, wallet);
    const vaultAddress = await getVaultAddress(new web3.PublicKey(tokenMintA), offerAddress);
    const makerTokenAccountA = await getAssociatedTokenAddress(
        new web3.PublicKey(tokenMintA),
        wallet.publicKey
      );

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      console.log("Making offer...");

      const transaction = await program?.methods
        .makeOffer(
          new BN(offerId),
          new BN(tokenAAmount),
          new BN(tokenBAmount)
        )
        .accounts({
          tokenMintA: new web3.PublicKey(tokenMintA),
          tokenMintB: new web3.PublicKey(tokenMintB),
          //makerTokenAccountA: new web3.PublicKey("6QBsi9GWyTjBWM7K1JJNg7vqCzDewba5w4JgqDe6Z2dP"),
          makerTokenAccountA: makerTokenAccountA,
          offer: offerAddress,
          vault: vaultAddress,
        })
        .rpc();

      console.log("Transaction successful:", transaction);
      setSuccess(true);
    } catch (err) {
      console.error("Error occurred:", err);
      setError("An error occurred while processing your offer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 transition-opacity ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white focus:outline-none"
        >
          <XIcon className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-semibold text-white mb-4">Make Offer</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400">Offer ID</label>
            <input
              type="number"
              value={offerId || ''}
              onChange={(e) => setOfferId(Number(e.target.value))}
              className="w-full mt-2 px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter offer ID"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400">Token Mint A</label>
            <input
              type="text"
              value={tokenMintA}
              onChange={(e) => setTokenMintA(e.target.value)}
              className="w-full mt-2 px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter token mint A"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400">Token Mint B</label>
            <input
              type="text"
              value={tokenMintB}
              onChange={(e) => setTokenMintB(e.target.value)}
              className="w-full mt-2 px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter token mint B"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400">Token A Amount</label>
            <input
              type="number"
              value={tokenAAmount || ''}
              onChange={(e) => setTokenAAmount(Number(e.target.value))}
              className="w-full mt-2 px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter amount of Token A"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400">Token B Amount</label>
            <input
              type="number"
              value={tokenBAmount || ''}
              onChange={(e) => setTokenBAmount(Number(e.target.value))}
              className="w-full mt-2 px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter amount of Token B"
            />
          </div>

          {error && <p className="text-red-500 mt-4">{error}</p>}
          {success && <p className="text-green-500 mt-4">Offer made successfully!</p>}

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className={`px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-md ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
              } focus:outline-none focus:ring-2 focus:ring-green-300`}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Offer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}