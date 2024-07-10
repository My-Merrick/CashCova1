import { useEffect, useState } from "react";
import {
  db,
  auth,
  onAuthStateChanged,
  doc,
  getDoc,
  updateDoc,
} from "../../firebase";
import useSound from "use-sound";
import drawSound from "../../assets/music/background.mp3"; // Ensure to have a sound file at this path
import backgroundImage from "../../assets/background2.png"; // Import the background image

const Draw = () => {
  const [balance, setBalance] = useState(0);
  const [user, setUser] = useState(null);
  const [betAmount, setBetAmount] = useState(0);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [winningNumber, setWinningNumber] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true); // State to toggle history visibility
  const [disabled, setDisabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [randomNumbers, setRandomNumbers] = useState([]);

  // Play sound immediately when the user visits the page
  const [play] = useSound(drawSound, { loop: true });

  useEffect(() => {
    play();
  }, [play]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        setBalance(userDoc.data().balance);
        setHistory(userDoc.data().history || []);
      } else {
        setUser(null);
        setBalance(0);
        setHistory([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const placeBet = async () => {
    if (!selectedNumber || betAmount <= 0 || disabled) return;

    const newBalance = balance - betAmount;
    const userRef = doc(db, "users", user.uid);

    // Determine winning number
    const winningNum = generateWinningNumber();

    // Add bet to history with the winningNumber set
    const newBet = { betAmount, selectedNumber, winningNumber: winningNum };
    const newHistory = [...history, newBet];
    await updateDoc(userRef, { balance: newBalance, history: newHistory });

    setBalance(newBalance);
    setHistory(newHistory);
    setWinningNumber(winningNum); // Update winningNumber state

    // Display random numbers that appear and vanish every second
    const interval = setInterval(() => {
      const number = Math.floor(Math.random() * 10) + 1;
      setRandomNumbers((prevNumbers) => [...prevNumbers, number]);
      setTimeout(() => {
        setRandomNumbers((prevNumbers) =>
          prevNumbers.filter((num) => num !== number)
        );
      }, 1000);
    }, 1000);

    // Clear interval after 60 seconds
    setTimeout(() => {
      clearInterval(interval);
    }, 60000);

    // If user has referrer, credit referrer's account
    const userDoc = await getDoc(userRef);
    const referrerId = userDoc.data().referrer;
    if (referrerId) {
      const referrerRef = doc(db, "users", referrerId);
      const referrerDoc = await getDoc(referrerRef);
      const referrerBalance = referrerDoc.data().balance + betAmount * 0.1;
      await updateDoc(referrerRef, { balance: referrerBalance });
    }

    // Reset after some time
    setTimeout(() => {
      setSelectedNumber(null);
      setWinningNumber(null);
      setDisabled(false);
      setTimeLeft(300); // Reset countdown to 5 minutes
    }, 60000); // Reset after 1 minute
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          const winningNum = generateWinningNumber();
          setWinningNumber(winningNum);
          return 300; // Reset countdown to 5 minutes
        }
        return prev - 1;
      });
    }, 1000);

    const disableInterval = setInterval(() => setDisabled(true), 240000); // Disable bets 1 minute before draw

    return () => {
      clearInterval(interval);
      clearInterval(disableInterval);
    };
  }, [history, balance]);

  useEffect(() => {
    const storedTime = localStorage.getItem("countdown");
    if (storedTime) {
      const elapsed = Math.floor((Date.now() - parseInt(storedTime)) / 1000);
      setTimeLeft((prev) => Math.max(prev - elapsed, 0));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("countdown", Date.now().toString());
  }, [timeLeft]);

  const generateWinningNumber = () => {
    return Math.floor(Math.random() * 10) + 1;
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const toggleHistory = () => {
    setShowHistory((prev) => !prev);
  };

  return (
    <div
      className="container relative h-screen p-4 mx-auto bg-center bg-cover"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="mr-4 text-3xl font-bold animate-bounce">Lucky Draw</h1>
        <div>
          <span className="text-lg font-bold text-black-800">Bal: </span>
          <span className="text-2xl font-bold">GHS {balance.toFixed(2)}</span>
        </div>
      </div>

      <div className="mb-8 text-4xl font-bold text-center animate-pulse">
        Time Left: {formatTime(timeLeft)}
      </div>

      <div className="grid grid-cols-5 gap-4 mb-8">
        {[...Array(10).keys()].map((num) => (
          <button
            key={num + 1}
            className={`p-4 rounded ${
              selectedNumber === num + 1
                ? "bg-green-500"
                : "bg-blue-700 text-white text-xl font-bold"
            }`}
            onClick={() => setSelectedNumber(num + 1)}
            disabled={disabled}
          >
            {num + 1}
          </button>
        ))}
      </div>

      <div className="flex items-center mb-8">
        <input
          type="number"
          className="p-2 mr-4 rounded"
          value={betAmount}
          onChange={(e) => setBetAmount(Number(e.target.value))}
          disabled={disabled}
        />
        <button
          className="p-4 text-xl font-bold text-white bg-blue-500 rounded"
          onClick={placeBet}
          disabled={disabled}
        >
          Place Bet
        </button>
      </div>

      <div className="relative m-4 right-15 bottom-30">
        <button
          className="p-2 text-white bg-blue-500 rounded"
          onClick={toggleHistory}
        >
          {showHistory ? "Hide History" : "Show History"}
        </button>
      </div>

      {winningNumber !== null && timeLeft === 0 && (
        <div className="text-4xl font-bold text-center animate-bounce">
          Winning Number: {winningNumber}
        </div>
      )}

      <div className="mt-8">
        {showHistory && (
          <div>
            <h2 className="mb-4 text-2xl font-bold text-white">
              Betting History
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded-lg">
                <thead>
                  <tr className="text-sm leading-normal text-gray-600 uppercase bg-gray-200">
                    <th className="px-6 py-3 text-left">Bet Amount</th>
                    <th className="px-6 py-3 text-left">Selected Number</th>
                    <th className="px-6 py-3 text-left">Winning Number</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-light text-gray-600">
                  {history.map((bet, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-gray-100"
                    >
                      <td className="px-6 py-3 text-left whitespace-nowrap">
                        {bet.betAmount}
                      </td>
                      <td className="px-6 py-3 text-left">
                        {bet.selectedNumber}
                      </td>
                      <td className="px-6 py-3 text-left">
                        {bet.winningNumber ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex justify-center p-4">
        {randomNumbers.map((num, index) => (
          <div
            key={index}
            className="p-2 m-1 text-white bg-blue-500 rounded-md"
            style={{ opacity: Math.random() }}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Draw;
