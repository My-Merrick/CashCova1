import { useState, useEffect, useRef } from "react";
import { auth, db } from "../../firebase";
import { Link, useNavigate } from "react-router-dom";
import {
  doc,
  updateDoc,
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  getDoc,
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
  Snackbar,
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
import backgroundImage from "../../assets/bg.png"; // Adjust the path as needed
import "./TossCoins.css";
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

const TossCoinsGame = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [guess, setGuess] = useState(null); // State to track user's current guess
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        setUserData(userDoc.data());
        const historySnapshot = await getDocs(
          collection(db, "users", currentUser.uid, "tossCoinsHistory")
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

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.play().catch((error) => {
        console.error("Error auto-playing audio:", error);
      });
    }

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  const handleToss = async () => {
    if (amount <= 0) {
      setOpenSnackbar(true);
      return;
    }

    if (amount > userData.balance) {
      setMessage("Insufficient balance. Please deposit more funds.");
      return;
    }

    const result = Math.random() < 0.5 ? "Heads" : "Tails";
    let newBalance;
    if (guess === result) {
      newBalance = userData.balance + amount * 1.5;
      setMessage(`Congratulations! It's ${result}. You won $${amount * 1.5}.`);
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 5000); // Show animation for 5 seconds
    } else {
      newBalance = userData.balance - amount;
      setMessage(`Sorry, it's ${result}. You lost $${amount}.`);
    }

    await updateDoc(doc(db, "users", user.uid), { balance: newBalance });
    const historyRef = collection(db, "users", user.uid, "tossCoinsHistory");
    const historyDocRef = await addDoc(historyRef, {
      guess,
      result,
      amount,
      outcome: guess === result ? "win" : "loss",
      date: new Date(),
    });

    setUserData({ ...userData, balance: newBalance });
    setHistory([
      ...history,
      {
        id: historyDocRef.id,
        guess,
        result,
        amount,
        outcome: guess === result ? "win" : "loss",
        date: new Date(),
      },
    ]);

    setAmount(0);
    setGuess(null);
  };

  const handleDeleteHistory = async (id) => {
    await deleteDoc(doc(db, "users", user.uid, "tossCoinsHistory", id));
    setHistory(history.filter((entry) => entry.id !== id));
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
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
    <ThemeProvider theme={theme}>
      <div
        className="game-background"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        <Container maxWidth="md" className="game-container">
          <audio
            ref={audioRef}
            src="./assets/music/y2mate.com - Background Music for jackpot lottery casino poker TV shows lotto slot machines  Lottery.mp3"
            loop
          />
          {showAnimation && (
            <div className="animation-container">
              <Lottie options={defaultOptions} height={400} width={400} />
            </div>
          )}
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            className="game-title"
          >
            Toss Coins Game
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
            Choose Heads or Tails:
          </Typography>
          <Box display="flex" justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setGuess("Heads");
              }}
              className={`bet-button ${guess === "Heads" ? "selected" : ""}`}
            >
              Heads
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setGuess("Tails");
              }}
              className={`bet-button ${guess === "Tails" ? "selected" : ""}`}
            >
              Tails
            </Button>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleToss}
            className="place-bet-button"
          >
            Place Bet
          </Button>
          {message && (
            <Typography variant="body1" align="center" className="bet-message">
              {message}
            </Typography>
          )}
          <Typography
            variant="h6"
            align="center"
            gutterBottom
            className="bet-history-title"
          >
            Betting History
          </Typography>
          <TableContainer
            component={Paper}
            className="bet-history-table-container"
          >
            <Table aria-label="betting history table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Guess</TableCell>
                  <TableCell align="center">Result</TableCell>
                  <TableCell align="center">Amount</TableCell>
                  <TableCell align="center">Outcome</TableCell>
                  <TableCell align="center">Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell align="center">{entry.guess}</TableCell>
                    <TableCell align="center">{entry.result}</TableCell>
                    <TableCell align="center">GHS {entry.amount}</TableCell>
                    <TableCell align="center">{entry.outcome}</TableCell>
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
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message="Please enter a valid amount before placing the bet."
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        key={"topcenter"}
      />
      <footer className="relative z-10 p-4 text-center text-white bg-gray-800">
        <p>© 2024 CashCova. All rights reserved.</p>
        <Link to="/faq" className="text-blue-400">
          FAQ
        </Link>
      </footer>
    </ThemeProvider>
  );
};

export default TossCoinsGame;
