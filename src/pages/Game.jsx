import { useState, useEffect, useRef } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc, updateDoc, collection, addDoc } from "firebase/firestore";
import RouletteTable from "./RouletteTable";
import "./Game.css";
import { Container, Typography, Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Lottie from "react-lottie";
import animationData from "../../assets/won.json"; // Path to your Lottie animation file

const Game = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [balance, setBalance] = useState(0); // Initially set balance to 0
  const [bet, setBet] = useState([]);
  const [winningNumber, setWinningNumber] = useState(null);
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState(0); // Betting amount
  const [showAnimation, setShowAnimation] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const navigate = useNavigate();
  const audioRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          setUserData(userDoc.data());
          setBalance(userDoc.data().balance);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && isMusicPlaying) {
      audio.play();
    }

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [isMusicPlaying]);

  const handleStartMusic = () => {
    setIsMusicPlaying(true);
  };

  const placeBet = (number) => {
    if (amount <= 0) {
      alert("Please enter a valid amount to place a bet.");
      return;
    }

    if (amount > balance) {
      setMessage("Insufficient balance. Please deposit more funds.");
      return;
    }

    if (balance > 0) {
      setBet([...bet, number]);
      setBalance(balance - amount);
    } else {
      setMessage("Insufficient balance!");
    }
  };

  const spinWheel = async () => {
    const randomNumber = Math.floor(Math.random() * 37);
    setWinningNumber(randomNumber);

    let winnings = 0;
    bet.forEach((number) => {
      if (number === randomNumber) {
        winnings += amount * 5; // Win 5 times the bet amount
      }
    });

    let newBalance = balance + winnings;

    try {
      if (userData.referrer) {
        // Calculate referrer's 10% commission (based on the bet amount)
        const commission = amount * 0.1;

        // Update referrer's balance in Firestore by adding the commission
        await updateDoc(doc(db, "users", userData.referrer), {
          balance:
            (await getDoc(doc(db, "users", userData.referrer))).data().balance +
            commission, // Get the current balance and add the commission
        });
      }

      // Update user balance in Firestore
      await updateDoc(doc(db, "users", user.uid), { balance: newBalance });

      setBalance(newBalance);
      setUserData({ ...userData, balance: newBalance });

      setMessage(
        `Winning number is ${randomNumber}. You ${
          winnings > 0 ? `won ${winnings}` : `lost ${amount}`
        }!`
      );
      setBet([]);

      if (winnings > 0) {
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 5000); // Show animation for 5 seconds
      }

      await addDoc(collection(db, "users", user.uid, "rouletteHistory"), {
        bet,
        winningNumber: randomNumber,
        amount,
        result: winnings > 0 ? "win" : "loss",
        date: new Date(),
      });
    } catch (error) {
      console.error("Error updating balances:", error);
    }
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  if (!user || !userData)
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-2 text-3xl text-gray-800 animate-ping align-center">
        💲CashCova🤑
      </div>
    );

  return (
    <Container className="game-container">
      <audio
        ref={audioRef}
        src="/assets/music/y2mate.com - Background Music for jackpot lottery casino poker TV shows lotto slot machines  Lottery.mp3"
        loop
      />
      {!isMusicPlaying && (
        <div className="music-container">
          <Button
            variant="contained"
            color="secondary"
            onClick={handleStartMusic}
          >
            Start Background Music
          </Button>
        </div>
      )}
      {showAnimation && (
        <div className="animation-container">
          <Lottie options={defaultOptions} height={400} width={400} />
        </div>
      )}
      <div className="px-10 py-10 bg-white rounded-lg shadow-lg">
        <Typography variant="h4" gutterBottom>
          Roulette Game
        </Typography>
        <Typography variant="h6">Balance: GHS {balance.toFixed(2)}</Typography>
        <Typography variant="body1" gutterBottom>
          Enter your bet amount:
        </Typography>
        <TextField
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <Typography variant="body1" gutterBottom>
          Your Selections: {bet.join(", ")}
        </Typography>
        <RouletteTable placeBet={placeBet} />
        <div className="mt-4 text-center spin-container">
          <Button
            variant="contained"
            color="primary"
            className="btn-spin"
            onClick={spinWheel}
          >
            Spin
          </Button>
        </div>
        {winningNumber !== null && (
          <Typography
            variant="body1"
            className="mt-4 text-center winning-number"
          >
            Winning Number: {winningNumber}
          </Typography>
        )}
        {message && (
          <Typography
            variant="body1"
            className="mt-4 text-center text-red-500 message"
          >
            {message}
          </Typography>
        )}
      </div>
    </Container>
  );
};

export default Game;
