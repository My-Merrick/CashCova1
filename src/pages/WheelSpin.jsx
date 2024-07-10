import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "./WheelSpin.css"; // Ensure you have the necessary styles

const multipliers = ["2x", "4x", "10x", "1.5x", "100x", "50x", "6x"];
const colors = [
  "#ff0000",
  "#ffa500",
  "#ffff00",
  "#008000",
  "#0000ff",
  "#4b0082",
  "#ee82ee",
];

const WheelSpin = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [betAmount, setBetAmount] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [balance, setBalance] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [spinDegrees, setSpinDegrees] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setBalance(data.balance);
        }
      } else {
        // Navigate to login if user is not authenticated
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSpin = async () => {
    if (betAmount > balance) {
      alert("Insufficient balance!");
      return;
    }

    if (!prediction) {
      alert("Please select a prediction.");
      return;
    }

    setSpinning(true);

    const segmentAngle = 360 / multipliers.length;
    const spinAmount = 360 * 5 + Math.floor(Math.random() * 360); // Random initial spin amount
    setSpinDegrees(spinAmount);

    // Slow down the spin at the end
    setTimeout(async () => {
      setSpinning(false);
      const stoppingIndex = Math.floor(spinDegrees / segmentAngle);
      const stoppingSegment = multipliers[stoppingIndex];
      const stoppingColor = colors[stoppingIndex];
      const result = stoppingSegment === prediction ? "win" : "lose";
      let newBalance = balance;
      let referralBonus = 0;

      if (result === "win") {
        const multiplier = parseFloat(stoppingSegment);
        newBalance += betAmount * multiplier;
      } else {
        newBalance -= betAmount;
      }

      if (userData.referrer) {
        referralBonus = betAmount * 0.1;
        const referrerDoc = await getDoc(doc(db, "users", userData.referrer));
        if (referrerDoc.exists()) {
          const referrerData = referrerDoc.data();
          await updateDoc(doc(db, "users", userData.referrer), {
            balance: referrerData.balance + referralBonus,
          });
        }
      }

      await updateDoc(doc(db, "users", user.uid), {
        balance: newBalance,
      });

      setBalance(newBalance);
      alert(
        `You ${result}! ${
          result === "win" ? "Congratulations!" : "Better luck next time!"
        }`
      );
    }, 5000); // Adjusted spin animation duration to 5 seconds
  };

  return (
    <div className="spin2win-container">
      <div className="wheel-container">
        <div
          className={`wheel ${spinning ? "spinning" : ""}`}
          style={{ transform: `rotate(${spinDegrees}deg)` }}
        >
          {multipliers.map((multiplier, index) => (
            <div
              key={index}
              className={`wheel-segment segment-${index}`}
              style={{
                transform: `rotate(${(360 / multipliers.length) * index}deg)`,
                backgroundColor: colors[index],
              }}
            >
              {multiplier}
            </div>
          ))}
        </div>
        <div className="arrow"></div>
      </div>
      <div className="game-controls">
        <div className="balance">Balance: GHS {balance.toFixed(2)}</div>
        <input
          type="number"
          className="bet-amount"
          placeholder="Enter bet amount"
          value={betAmount}
          onChange={(e) => setBetAmount(Number(e.target.value))}
        />
        <div className="predictions">
          {multipliers.map((multiplier, index) => (
            <button
              key={index}
              className={`prediction ${
                prediction === multiplier ? "selected" : ""
              }`}
              style={{ backgroundColor: colors[index] }}
              onClick={() => setPrediction(multiplier)}
            >
              {multiplier}
            </button>
          ))}
        </div>
        <button
          className={`spin-button ${spinning ? "disabled" : ""}`}
          onClick={handleSpin}
          disabled={spinning}
        >
          {spinning ? "Spinning..." : "Spin"}
        </button>
      </div>
    </div>
  );
};

export default WheelSpin;
