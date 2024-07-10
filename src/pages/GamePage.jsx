import { Link } from "react-router-dom";
import backgroundImage from "./../../assets/bg.png";
import bettingImage1 from "./../../assets/guess2.png";
import bettingImage2 from "./../../assets/color.png";
import bettingImage3 from "./../../assets/coins.png";
import bettingImage4 from "./../../assets/spin.png";
import bettingImage5 from "./../../assets/roulette.png";
// import bettingImage3 from "./assets/betting3.jpg";
// import bettingImage4 from "./assets/betting4.jpg";

const GamePage = () => {
  return (
    <div
      className="relative flex flex-col min-h-screen bg-center bg-no-repeat bg-cover"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black opacity-70"></div>
      <header className="relative z-10 p-6 text-center text-white">
        <h1 className="text-4xl font-bold animate-bounce">
          Welcome to 💲CashCova🤑 Games!
        </h1>
        <p className="mt-4 text-lg">
          Earn money by betting on games, buying mining bots, and referring new
          users. Earn 10% of the money on every bet that your referee does on
          the site.
        </p>
      </header>
      <main className="relative z-10 flex flex-col items-center justify-center flex-1 p-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/instant"
            className="p-4 text-white transition-all duration-300 ease-in-out transform bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 hover:scale-105"
          >
            <img
              src={bettingImage2}
              alt="Instant Lottery"
              className="w-full h-40 mb-4 rounded-lg"
            />
            <h2 className="text-2xl font-bold">Instant Color Lottery</h2>
            <p className="mt-2">
              Join the excitement and bet on Instant Color Lottery
            </p>
          </Link>
          <Link
            to="/number-guessing"
            className="p-4 text-white transition-all duration-300 ease-in-out transform bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 hover:scale-105"
          >
            <img
              src={bettingImage1}
              alt="Color Betting"
              className="w-full h-40 mb-4 rounded-lg"
            />
            <h2 className="text-2xl font-bold">Instant Number Lottery</h2>
            <p className="mt-2">
              Try your luck on Instant Lottery and win big!
            </p>
          </Link>
          <Link
            to="/toss-coins"
            className="p-4 text-white transition-all duration-300 ease-in-out transform bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 hover:scale-105"
          >
            <img
              src={bettingImage3}
              alt="Color Betting"
              className="w-full h-40 mb-4 rounded-lg"
            />
            <h2 className="text-2xl font-bold">Instant T & H Game</h2>
            <p className="mt-2">
              Try your luck on Instant Lottery and win big!
            </p>
          </Link>

          <Link
            to="/draw"
            className="p-4 text-white transition-all duration-300 ease-in-out transform bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 hover:scale-105"
          >
            <img
              src={bettingImage4}
              alt="draw Betting"
              className="w-full h-40 mb-4 rounded-lg"
            />
            <h2 className="text-2xl font-bold">Instant Draw</h2>
            <p className="mt-2">
              Try your luck on Instant Spinner and win big!
            </p>
          </Link>

          <Link
            to="/gamez"
            className="p-4 text-white transition-all duration-300 ease-in-out transform bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 hover:scale-105"
          >
            <img
              src={bettingImage5}
              alt="draw Betting"
              className="w-full h-40 mb-4 rounded-lg"
            />
            <h2 className="text-2xl font-bold">Roulette</h2>
            <p className="mt-2">
              Try your luck on Instant Roulette Game and win big!
            </p>
          </Link>
        </div>
      </main>
      <footer className="relative z-10 p-4 text-center text-white bg-gray-800">
        <p>&copy; 2024 CashCova. All rights reserved.</p>
        <Link to="/faq" className="text-blue-400">
          FAQ
        </Link>
      </footer>
    </div>
  );
};

export default GamePage;
