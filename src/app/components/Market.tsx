import Link from "next/link";
export default function Market() {


  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-gray-900 to-purple-900 text-gray-300 flex flex-col">
      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center py-20 px-4 sm:px-20">
        <h1 className="text-4xl sm:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-600">
          Welcome to the Market
        </h1>
        <p className="text-lg sm:text-xl text-center mt-4">
          Explore and trade Solana tokens in the market.
        </p>

       

        {/* Link back to Home */}
        <Link
          href="/"
          className="mt-8 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:opacity-90"
        >
          Go Back Home
        </Link>
      </main>
    </div>
  );
}