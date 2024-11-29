import React from "react";
import { useConnection, useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import OfferCard from "./OfferCards";
import { Offer } from "./interfaces";

interface OfferListProps {
  offers: Offer[]; // Array of offers passed to this component
}

const OfferList: React.FC<OfferListProps> = ({ offers }) => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const { publicKey } = useWallet();

  if (!connection || !wallet) {
    return <p>Loading wallet or connection...</p>; // Fallback UI
  }

  return (
    <div className="offer-list">
      {offers.map((offer) => (
        <OfferCard 
          key={offer.id} 
          offer={offer} 
          connection={connection} 
          wallet={wallet} 
          takerPubkey={publicKey?.toBase58() || null} 
        />
      ))}
    </div>
  );
};

export default OfferList;