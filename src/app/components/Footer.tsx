export default function Footer() {
    return (
      <footer className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-t border-gray-700 p-4 mt-10">
        <div className="container mx-auto text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Solana Swap. All rights reserved.
          </p>
        </div>
      </footer>
    );
}