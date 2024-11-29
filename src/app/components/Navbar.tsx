import Link from "next/link";
import { WalletButton } from "@/app/components/wallet/AppWalletProvider";

export default function Navbar() {
    return (
      <nav className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-gray-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          {/* Left Section: Title + Links */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-lg font-semibold text-white">
              Solana Swap App
            </Link>
            <div className="flex space-x-4">
              <Link href="/" className="hover:text-gray-400 text-gray-300">
                Home
              </Link>
              <Link href="/market" className="hover:text-gray-400 text-gray-300">
                Market
              </Link>
              <Link href="/mint" className="hover:text-gray-400 text-gray-300">
                Mint
              </Link>
            </div>
          </div>
  
          {/* Right Section: Wallet Button */}
          <div>
            <WalletButton />
          </div>
        </div>
      </nav>
    );
  }