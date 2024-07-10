import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Typography,
  Container,
  Grid,
  TextField,
  Paper,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const GameContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  textAlign: "center",
}));

const GameBoard = styled(Grid)(({ theme }) => ({
  maxWidth: "300px",
  margin: "0 auto",
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const GameCell = styled(Button)(({ theme }) => ({
  height: "80px",
  fontSize: "2rem",
  fontWeight: "bold",
}));

const GameInfo = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const HistoryItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
}));

const TicTacToeGame = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        setUserData(userDoc.data());

        const historySnapshot = await getDocs(
          collection(db, "users", currentUser.uid, "ticTacToeHistory")
        );
        setHistory(historySnapshot.docs.map((doc) => doc.data()));
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const calculateWinner = (board) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const handleClick = async (index) => {
    if (board[index] || winner) return;

    const newBoard = board.slice();
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const newWinner = calculateWinner(newBoard);
    if (newWinner) {
      setWinner(newWinner);
      let newBalance;
      if (newWinner === "X") {
        newBalance = userData.balance + amount * 3;
        setMessage(`Congratulations! You won $${amount * 3}.`);
      } else {
        newBalance = userData.balance - amount;
        setMessage(`Sorry, you lost $${amount}.`);
      }

      await updateDoc(doc(db, "users", user.uid), { balance: newBalance });
      await addDoc(collection(db, "users", user.uid, "ticTacToeHistory"), {
        board: newBoard,
        winner: newWinner,
        amount,
        result: newWinner === "X" ? "win" : "loss",
        date: new Date(),
      });

      setUserData({ ...userData, balance: newBalance });
      setHistory([
        ...history,
        {
          board: newBoard,
          winner: newWinner,
          amount,
          result: newWinner === "X" ? "win" : "loss",
          date: new Date(),
        },
      ]);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setMessage("");
  };

  if (!user || !userData)
    return (
      <Box className="animate-ping flex items-center min-h-screen text-3xl text-gray-800 justify-center align-center px-4 py-2">
        💲CashCova🤑
      </Box>
    );

  return (
    <GameContainer maxWidth="md">
      <Typography variant="h3" gutterBottom>
        Tic Tac Toe Game
      </Typography>

      <GameInfo elevation={3}>
        <Typography variant="h5" gutterBottom>
          Current Balance: ${userData.balance.toFixed(2)}
        </Typography>
        <TextField
          label="Bet Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={resetGame}
          sx={{ mt: 2 }}
        >
          New Game
        </Button>
      </GameInfo>

      <GameBoard container spacing={1}>
        {board.map((value, index) => (
          <Grid item xs={4} key={index}>
            <GameCell
              variant="contained"
              color={value === "X" ? "primary" : "secondary"}
              fullWidth
              onClick={() => handleClick(index)}
              disabled={!!value || !!winner}
            >
              {value}
            </GameCell>
          </Grid>
        ))}
      </GameBoard>

      {message && (
        <Typography variant="h6" color="primary" gutterBottom>
          {message}
        </Typography>
      )}

      <Divider sx={{ my: 4 }} />

      <Typography variant="h4" gutterBottom>
        Betting History
      </Typography>
      <List>
        {history.map((entry, index) => (
          <HistoryItem key={index}>
            <ListItemText
              primary={`Game ${index + 1}`}
              secondary={`
                Winner: ${entry.winner}, 
                Amount: $${entry.amount}, 
                Result: ${entry.result}, 
                Date: ${new Date(entry.date.seconds * 1000).toLocaleString()}
              `}
            />
          </HistoryItem>
        ))}
      </List>
    </GameContainer>
  );
};

export default TicTacToeGame;
