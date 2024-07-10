import { useState, useEffect, useRef } from "react";
import { auth, db } from "../../firebase";
import { Link, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import {
  Button,
  TextField,
  Typography,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  orange,
  lightBlue,
  lightGreen,
  deepPurple,
  deepOrange,
} from "@mui/material/colors";
import DeleteIcon from "@mui/icons-material/Delete";
import Lottie from "react-lottie";
import animationData from "../../assets/won.json"; // Path to your Lottie animation file
import backgroundImage from "../../assets/bgs1.png"; // Adjust the path as needed

// Define a custom color palette
const theme = createTheme({
  palette: {
    primary: {
      main: orange[500],
    },
    secondary: {
      main: lightBlue[500],
    },
    success: {
      main: lightGreen[500],
    },
    error: {
      main: deepOrange[500],
    },
    info: {
      main: deepPurple[500],
    },
  },
});

const NumberGuessingGame = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [guess, setGuess] = useState(null);
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        setUserData(userDoc.data());

        const historySnapshot = await getDocs(
          collection(db, "users", currentUser.uid, "numberGuessingHistory")
        );
        setHistory(
          historySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const startMusic = () => {
    const audio = audioRef.current;
    if (audio) {
      audio
        .play()
        .then(() => {
          setIsMusicPlaying(true);
        })
        .catch((error) => {
          console.error("Error playing audio:", error);
        });
    }
  };

  const handleGuess = async (prediction) => {
    if (amount <= 0) {
      alert("Please enter a valid amount to place a bet.");
      return;
    }

    if (amount > userData.balance) {
      setMessage("Insufficient balance. Please deposit more funds.");
      return;
    }

    // Algorithm for 2% win probability:
    const randomNumber = generateRandomNumberWithBias(0.02, prediction);

    let newBalance = userData.balance;
    if (prediction === randomNumber) {
      newBalance = userData.balance + amount * 3;
      setMessage(
        `Congratulations! You Won (${randomNumber}) and won GHS ${amount * 3}.`
      );
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 5000); // Show animation for 5 seconds
    } else {
      newBalance = userData.balance - amount;
      setMessage(
        `Sorry, incorrect guess. The correct number was ${randomNumber}. You lost GHS ${amount}.`
      );
    }

    await updateDoc(doc(db, "users", user.uid), { balance: newBalance });

    // Check if the user has a referrer
    if (userData.referrer) {
      // Calculate referrer's 5% commission (based on the bet amount)
      const commission = amount * 0.05;

      // Update referrer's balance in Firestore by adding the commission
      await updateDoc(doc(db, "users", userData.referrer), {
        balance:
          (await getDoc(doc(db, "users", userData.referrer))).data().balance +
          commission, // Get the current balance and add the commission
      });
    }

    const historyRef = collection(
      db,
      "users",
      user.uid,
      "numberGuessingHistory"
    );
    const historyDocRef = await addDoc(historyRef, {
      prediction,
      randomNumber,
      amount,
      result: prediction === randomNumber ? "win" : "loss",
      date: new Date(),
    });

    setUserData({ ...userData, balance: newBalance });
    setHistory([
      ...history,
      {
        id: historyDocRef.id,
        prediction,
        randomNumber,
        amount,
        result: prediction === randomNumber ? "win" : "loss",
        date: new Date(),
      },
    ]);

    setGuess(null); // Reset guess after bet is placed
  };

  const handleDeleteHistory = async (id) => {
    await deleteDoc(doc(db, "users", user.uid, "numberGuessingHistory", id));
    setHistory(history.filter((entry) => entry.id !== id));
  };

  const handlePlaceBet = () => {
    if (guess === null) {
      alert("Please select a number to place a bet.");
      return;
    }
    handleGuess(guess);
  };

  if (!user || !userData)
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-2 text-3xl text-gray-800 animate-ping align-center">
        💲CashCova🤑
      </div>
    );

  // Custom function to generate a color for each button
  const getColorForNumber = (num) => {
    switch (num % 5) {
      case 0:
        return "primary";
      case 1:
        return "secondary";
      case 2:
        return "success";
      case 3:
        return "error";
      case 4:
        return "info";
      default:
        return "primary";
    }
  };

  // Algorithm to generate a biased random number
  const generateRandomNumberWithBias = (winProbability, prediction) => {
    const randomValue = Math.random();
    if (randomValue <= winProbability) {
      return Math.floor(Math.random() * 10) + 1; // Random winning number
    } else {
      let winningNumber = Math.floor(Math.random() * 10) + 1;
      while (winningNumber === prediction) {
        winningNumber = Math.floor(Math.random() * 10) + 1; // Ensure winning number is different from the prediction
      }
      return winningNumber;
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

  return (
    <ThemeProvider theme={theme}>
      <header className="relative z-10 p-6 text-center text-white bg-gray-800">
        <h1 className="text-4xl font-bold animate-bounce">
          Welcome to 💲CashCova🤑!
        </h1>
      </header>
      <div
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
        className="game-background"
      >
        <Container
          maxWidth="md"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "10px",
            boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.5)",
            padding: "20px",
            marginTop: "1px",
            marginBottom: "50px",
          }}
          className="game-container"
        >
          <audio
            ref={audioRef}
            src="./../../assets/music/background.mp3"
            loop
          />
          {!isMusicPlaying && (
            <div className="music-container">
              <Button
                variant="contained"
                color="secondary"
                onClick={startMusic}
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
          <Typography
            className="animate-pulse"
            variant="h4"
            align="center"
            gutterBottom
            style={{ color: theme.palette.primary.main, marginTop: "20px" }}
          >
            Number Guessing Game
          </Typography>
          <Typography variant="h6" align="center" gutterBottom>
            Current Balance: GHS {userData.balance.toFixed(2)}
          </Typography>
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            fullWidth
            margin="normal"
            InputProps={{
              style: { backgroundColor: "#ffffff", borderRadius: "5px" },
            }}
          />
          <Typography variant="h6" align="center" gutterBottom>
            Guess a number between 1 and 10:
          </Typography>
          <Box display="flex" justifyContent="center" flexWrap="wrap">
            {[...Array(10).keys()].map((num) => (
              <Button
                key={num + 1}
                variant="contained"
                color={getColorForNumber(num + 1)}
                onClick={() => setGuess(num + 1)}
                sx={{
                  margin: 1,
                  boxShadow:
                    guess === num + 1
                      ? "0px 0px 10px 2px rgba(0,0,0,0.75)"
                      : "none",
                  transition: "all 0.3s ease-in-out",
                  transform: guess === num + 1 ? "scale(1.05)" : "scale(1)",
                }}
              >
                {num + 1}
              </Button>
            ))}
          </Box>
          <Button
            variant="contained"
            color="success"
            onClick={handlePlaceBet}
            fullWidth
            style={{ marginTop: "20px" }}
            sx={{
              borderRadius: "5px",
              boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.5)",
            }}
            className="place-bet-button"
          >
            Place Bet
          </Button>
          {message && (
            <Typography
              variant="body1"
              align="center"
              style={{ marginTop: "10px" }}
              className="bet-message"
            >
              {message}
            </Typography>
          )}
          <Typography
            variant="h6"
            align="center"
            gutterBottom
            style={{ marginTop: "20px", color: theme.palette.primary.main }}
            className="bet-history-title"
          >
            Betting History
          </Typography>
          <TableContainer
            component={Paper}
            style={{
              borderRadius: "10px",
              boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.5)",
            }}
            className="bet-history-table-container"
          >
            <Table aria-label="betting history table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Prediction</TableCell>
                  <TableCell align="center">Correct Number</TableCell>
                  <TableCell align="center">Amount</TableCell>
                  <TableCell align="center">Result</TableCell>
                  <TableCell align="center">Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell align="center">{entry.prediction}</TableCell>
                    <TableCell align="center">{entry.randomNumber}</TableCell>
                    <TableCell align="center">GHS {entry.amount}</TableCell>
                    <TableCell align="center">{entry.result}</TableCell>
                    <TableCell align="center">
                      {new Date(entry.date.seconds * 1000).toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      <Button onClick={() => handleDeleteHistory(entry.id)}>
                        <DeleteIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </div>
      <footer className="relative z-10 p-4 text-center text-white bg-gray-800">
        <p>© 2024 CashCova. All rights reserved.</p>
        <Link to="/faq" className="text-blue-400">
          FAQ
        </Link>
      </footer>
    </ThemeProvider>
  );
};

export default NumberGuessingGame;
