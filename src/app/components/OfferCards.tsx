import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'; // Import the arrow icon
import { AnchorWallet, useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-toastify"; 
import { handleSwap } from "./swap_handle";
import { Connection } from "@solana/web3.js";

interface OfferCardProps {
    offer: {
        publicKey: string;
        id: string; 
        maker: string;
        tokenMintA: string;
        tokenMintB: string;
        tokenBWantedAmount: string;
        tokenAOfferedAmount: string;
    };
    connection: Connection;
    wallet: AnchorWallet;
    takerPubkey: string | null;
  }

const OfferCard: React.FC<OfferCardProps> = ({ offer }) => {

    const { publicKey } = useWallet();
    const { connection } = useConnection();
    const wallet = useAnchorWallet();


    const handleSwapClick = async () => {
        if (!publicKey) {
          toast.error("Please connect your wallet first.");
          return;
        }
        await handleSwap(connection, wallet, offer);
    };

  return (
    <div className="relative bg-gray-900 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-700 flex flex-col space-y-4">
      {/* Offer ID */}
      <div className="absolute top-2 left-2 text-sm text-gray-400 font-semibold">
        Offer ID: {offer.id}
      </div>

      {/* Top Section: Icons */}
      <div className="flex items-center justify-center space-x-16"> {/* Adjusted space */}
        {/* Left Icon */}
        <Image src="/solana.png" alt="Solana Icon" width={48} height={48} />
        {/* Arrow Icon */}
        <FontAwesomeIcon icon={faArrowRight} className="text-gray-300" size="lg" />
        {/* Right Icon */}
        <Image src="/bitcoin.png" alt="Bitcoin Icon" width={48} height={48} />
      </div>

      {/* Amounts */}
      <div className="flex items-center justify-center space-x-32">
        <p className="text-lg font-semibold  text-purple-700">
          {parseInt(offer.tokenAOfferedAmount).toLocaleString()} tokenA
        </p>
        <p className="text-lg font-semibold  text-orange-500">
          {parseInt(offer.tokenBWantedAmount).toLocaleString()} tokenB
        </p>
      </div>

      {/* Token Addresses */}
      <div className="text-xs text-gray-400 space-y-2">
        <p className="truncate">
          Token A: 
          <a
            href={`https://explorer.solana.com/address/${offer.tokenMintA}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {offer.tokenMintA}
          </a>
        </p>
        <p className="truncate">
          Token B: 
          <a
            href={`https://explorer.solana.com/address/${offer.tokenMintB}`}
            target="_blank"
            rel="noopener noreferrer"
            className=" hover:underline"
          >
            {offer.tokenMintB}
          </a>
        </p>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center mt-4">
        <button 
            onClick={handleSwapClick}
            className="mt-4 px-6 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-green-400 to-blue-600 hover:from-green-500 hover:to-blue-700 transform transition-all duration-300 ease-in-out hover:scale-105"
        >
            Swap
        </button>
      </div>
    </div>
  );
};

export default OfferCard;