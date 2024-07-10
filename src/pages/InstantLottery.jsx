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
  Grid,
  useTheme,
  styled,
  Snackbar,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  orange,
  lightBlue,
  lightGreen,
  deepPurple,
  deepOrange,
  red,
  green,
  blue,
  yellow,
  purple,
  pink,
} from "@mui/material/colors";
import backgroundImage from "../../assets/bg.png"; // Adjust the path as needed
import DeleteIcon from "@mui/icons-material/Delete";
import Lottie from "react-lottie";
import animationData from "../../assets/won.json"; // Path to your Lottie animation file
import backgroundMusic from "./../../assets/music/background.mp3"; // Replace with your sound file path
import "./Instant.css";
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
    red: {
      main: red[500],
    },
    green: {
      main: green[500],
    },
    blue: {
      main: blue[500],
    },
    yellow: {
      main: yellow[500],
    },
    purple: {
      main: purple[500],
    },
    pink: {
      main: pink[500],
    },
  },
});

// Style the color button for animations
const ColorButton = styled(Button)(({ selected }) => ({
  transition: "all 0.3s ease-in-out",
  transform: selected ? "scale(1.1)" : "scale(1)",
  boxShadow: selected ? "0px 0px 10px 2px rgba(0,0,0,0.75)" : "none",
}));

const InstantLottery = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [showAnimation, setShowAnimation] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  const colors = [
    { name: "Red", color: red[500] },
    { name: "Green", color: green[500] },
    { name: "Blue", color: blue[500] },
    { name: "Yellow", color: yellow[500] },
    { name: "Purple", color: purple[500] },
    { name: "Pink", color: pink[500] },
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        setUserData(userDoc.data());

        const historySnapshot = await getDocs(
          collection(db, "users", currentUser.uid, "instantLotteryHistory")
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

  const handleColorSelection = (color) => {
    setSelectedColor(color);
  };

  const handlePlaceBet = async () => {
    if (selectedColor === null) {
      alert("Please select a color to place a bet.");
      return;
    }

    if (amount <= 0) {
      alert("Please enter a valid amount to place a bet.");
      return;
    }

    if (amount > userData.balance) {
      setMessage("Insufficient balance. Please deposit more funds.");
      return;
    }

    const historyRef = collection(
      db,
      "users",
      user.uid,
      "instantLotteryHistory"
    );
    const historyDocRef = await addDoc(historyRef, {
      selectedColor,
      amount,
      date: new Date(),
    });

    // Update user balance based on win/loss
    const winningColorIndex = Math.floor(Math.random() * colors.length);
    const winningColor = colors[winningColorIndex].name;
    const result = winningColor === selectedColor ? "win" : "loss";
    let newBalance = userData.balance;
    if (result === "win") {
      newBalance += amount * 3;
      setMessage(
        `Congratulations! You won GHS ${
          amount * 3
        }! The winning color was ${winningColor}.`
      );
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 5000); // Show animation for 5 seconds
    } else {
      newBalance -= amount;
      setMessage(
        `Sorry, you lost GHS ${amount}. The winning color was ${winningColor}.`
      );
    }

    await updateDoc(doc(db, "users", user.uid), { balance: newBalance });
    setUserData({ ...userData, balance: newBalance });
    setHistory([
      ...history,
      {
        id: historyDocRef.id,
        selectedColor,
        amount,
        result,
        date: new Date(),
        winningColor,
      },
    ]);

    // Update referrer's balance if they have one
    if (userData.referrer) {
      const commission = amount * 0.05;
      const referrerDoc = await getDoc(doc(db, "users", userData.referrer));
      const referrerBalance = referrerDoc.data().balance + commission;

      await updateDoc(doc(db, "users", userData.referrer), {
        balance: referrerBalance,
      });
    }

    setSelectedColor(null); // Clear selection
    setAmount(0); // Reset amount
  };

  const handleDeleteHistory = async (id) => {
    await deleteDoc(doc(db, "users", user.uid, "instantLotteryHistory", id));
    setHistory(history.filter((entry) => entry.id !== id));
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (!user || !userData)
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-2 text-3xl text-gray-800 animate-ping align-center">
        💲CashCova🤑
      </div>
    );

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
      >
        <Container
          maxWidth="md"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "10px",
            boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.5)",
            padding: "20px",
            marginTop: "50px",
            marginBottom: "50px",
            animation: "fadeIn 1s ease-in-out",
          }}
        >
          <audio ref={audioRef} src={backgroundMusic} loop />
          {showAnimation && (
            <div className="animation-container">
              <Lottie options={defaultOptions} height={400} width={400} />
            </div>
          )}
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            style={{
              color: theme.palette.primary.main,
              marginTop: "20px",
              animation: "bounce 2s infinite",
            }}
          >
            Instant Lottery
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
            Choose a color:
          </Typography>
          <Box display="flex" justifyContent="center" flexWrap="wrap" mb={2}>
            {colors.map((color) => (
              <ColorButton
                key={color.name}
                variant="contained"
                color={color.name.toLowerCase()}
                onClick={() => handleColorSelection(color.name)}
                selected={selectedColor === color.name}
                sx={{
                  margin: 1,
                }}
              >
                {color.name}
              </ColorButton>
            ))}
          </Box>
          <Button
            variant="contained"
            color="success"
            onClick={handlePlaceBet}
            fullWidth
            sx={{
              borderRadius: "5px",
              boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.5)",
            }}
          >
            Place Bet
          </Button>
          {message && (
            <Typography
              variant="body1"
              align="center"
              style={{ marginTop: "10px" }}
            >
              {message}
            </Typography>
          )}
          <Typography
            variant="h6"
            align="center"
            gutterBottom
            style={{ marginTop: "20px", color: theme.palette.primary.main }}
          >
            Betting History
          </Typography>
          {history.length === 0 ? (
            <Typography
              variant="body1"
              align="center"
              style={{ marginTop: "10px" }}
            >
              No betting history yet.
            </Typography>
          ) : (
            <TableContainer
              component={Paper}
              style={{
                borderRadius: "10px",
                boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.5)",
              }}
            >
              <Table aria-label="betting history table">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Selected Color</TableCell>
                    <TableCell align="center">Amount</TableCell>
                    <TableCell align="center">Result</TableCell>
                    <TableCell align="center">Winning Color</TableCell>
                    <TableCell align="center">Date</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell align="center">
                        {entry.selectedColor}
                      </TableCell>
                      <TableCell align="center">GHS {entry.amount}</TableCell>
                      <TableCell align="center">{entry.result}</TableCell>
                      <TableCell align="center">{entry.winningColor}</TableCell>
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
          )}
        </Container>
      </div>
      <footer className="relative z-10 p-4 text-center text-white bg-gray-800">
        <p>© 2024 CashCova. All rights reserved.</p>
        <Link to="/faq" className="text-blue-400">
          FAQ
        </Link>
      </footer>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message="Please enter a valid amount before placing the bet."
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        key={"topcenter"}
      />
    </ThemeProvider>
  );
};

export default InstantLottery;
