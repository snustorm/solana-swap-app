'use client'

import { useRouter } from "next/navigation";
import MakeOfferModal from "./components/MakeOffer";
import { useState } from "react";

export default function Home() {

  const router = useRouter();
  const [isMakeOfferModalOpen, setIsMakeOfferModalOpen] = useState(false);

  const handleMakeOffer = (formData: {
    id: string;
    tokenMintA: string;
    tokenMintB: string;
    tokenAOfferAmount: string;
    tokenBWantedAmount: string;
  }) => {
    console.log("Form Submitted", formData);
    setIsMakeOfferModalOpen(false);

    // Add code here to integrate with Anchor program
    // Example: send the formData to the smart contract
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-gray-900 to-purple-900 text-gray-300 flex flex-col">
      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center py-20 px-4 sm:px-20">
        <h1 className="text-4xl sm:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Welcome to Solana Swap
        </h1>
        <p className="text-lg sm:text-xl text-center mt-4">
          Swap your favorite Solana tokens securely and effortlessly.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          {/* Maker Button */}
          <button
            onClick={() => setIsMakeOfferModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:opacity-90"
          >
            I am a Maker
          </button>

          {/* Taker Button */}
          <button
            onClick={() => router.push("/market")}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-md hover:opacity-90"
          >
            I am a Taker
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-t border-gray-700 p-4">
        <div className="container mx-auto text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Solana Swap. All rights reserved.</p>
        </div>
      </footer>

      {/* MakeOfferModal */}
      {isMakeOfferModalOpen && (
        <MakeOfferModal
          isOpen={true}
          onClose={() => setIsMakeOfferModalOpen(false)}
        />
      )}
    </div>
  );
}