'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchOffers } from "../components/program";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Offer } from "../components/interfaces";
import OfferList from "../components/OfferList";

export default function Market() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOffers() {
      try {
        if (connection && wallet) {
          const fetchedOffers = await fetchOffers(connection, wallet);
          setOffers(fetchedOffers);
        }
      } catch (error) {
        console.error("Failed to fetch offers:", error);
      } finally {
        setLoading(false);
      }
    }

    loadOffers();
  }, [connection, wallet]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-gray-900 to-purple-900 text-gray-300 flex flex-col">
      <main className="flex-grow py-20 px-4 sm:px-20">
        <h1 className="text-4xl sm:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-600">
          Welcome to the Market
        </h1>
        <p className="text-lg sm:text-xl text-center mt-4">
          Explore and trade SPL tokens in the market.
        </p>

        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
                <p className="text-center text-gray-400">Loading offers...</p>
            ) : offers.length > 0 ? (
                <OfferList offers={offers} /> 
            ) : (
                <p className="text-center text-gray-400">No offers available.</p>
            )}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:opacity-90"
          >
            Go Back Home
          </Link>
        </div>
      </main>
    </div>
  );
}