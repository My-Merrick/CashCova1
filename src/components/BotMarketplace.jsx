import { useState, useEffect } from "react";
import { getCurrentUser } from "./../../FirebaseUtils";
import { db } from "./../../firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import {
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  orange,
  lightBlue,
  lightGreen,
  deepPurple,
  deepOrange,
} from "@mui/material/colors";
import backgroundImage from "../../assets/bg.png"; // Import your background image
import { Link } from "react-router-dom";
import Lottie from "react-lottie";
import animationData from "../../assets/won.json"; // Path to your Lottie animation file
import { Line } from "react-chartjs-2";
import "chart.js/auto"; // Import Chart.js library

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

const BotMarketplace = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [purchasedBots, setPurchasedBots] = useState([]);
  const [botData, setBotData] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [earningsHistory, setEarningsHistory] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [botHistory, setBotHistory] = useState({});
  const [showEarningsHistory, setShowEarningsHistory] = useState(false); // State to toggle earnings history
  const [confirmClearHistory, setConfirmClearHistory] = useState(false); // State to control the confirmation dialog

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);

        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userPurchasedBots = userData.purchasedBots || [];
            setPurchasedBots(userPurchasedBots);
            setUserBalance(userData.balance || 0);

            // Fetch earnings history from the user's document
            const historyRef = collection(
              db,
              "users",
              user.uid,
              "earningsHistory"
            );
            const historySnapshot = await getDocs(historyRef);
            const historyData = historySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setEarningsHistory(historyData);
          } else {
            // If the user document doesn't exist, create it
            await addDoc(doc(db, "users", user.uid), {
              balance: 0,
              purchasedBots: [],
            });

            // Fetch the newly created user document
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUserBalance(userData.balance || 0);
            }
          }
        }

        // Fetching bot data directly from the "bots" collection
        const botSnapshot = await getDocs(collection(db, "bots"));
        const botsData = botSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBotData(botsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handlePurchase = async (bot) => {
    try {
      if (!currentUser) {
        throw new Error("User not logged in");
      }

      if (!bot) {
        throw new Error("No bot selected");
      }

      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error("User document not found");
      }

      const userData = userDoc.data();
      const userBalance = userData.balance || 0;

      // Check if the user has enough balance to purchase the bot
      if (userBalance < bot.price) {
        throw new Error("Insufficient balance");
      }

      const referralBonus = bot.price * 0.1; // 10% of the bot's price
      const purchasedBotsArray = Array.isArray(userData.purchasedBots)
        ? userData.purchasedBots
        : [];
      // Deduct the bot price from the user's balance
      const updatedBalance = userBalance - bot.price;

      // Update the user's document in Firestore
      await updateDoc(userRef, {
        balance: updatedBalance,
        purchasedBots: [...purchasedBotsArray, bot.id],
      });

      // Credit the referral bonus to the referrer
      const referrerId = userData.referrer;
      if (referrerId) {
        const referrerRef = doc(db, "users", referrerId);
        const referrerDoc = await getDoc(referrerRef);

        if (referrerDoc.exists()) {
          const referrerData = referrerDoc.data();
          const referrerBalance = referrerData.balance || 0;
          // Credit the referral bonus
          const updatedReferrerBalance = referrerBalance + referralBonus;
          await updateDoc(referrerRef, {
            balance: updatedReferrerBalance,
          });

          console.log(
            `Referrer bonus of ${referralBonus} credited to referrer.`
          );
        } else {
          console.error("Referrer document not found");
        }
      }

      setPurchasedBots((prevBots) => [...prevBots, bot.id]);

      setSnackbarSeverity("success");
      setSnackbarMessage("Bot purchased successfully!");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error purchasing bot:", error);

      setSnackbarSeverity("error");
      setSnackbarMessage(`Error purchasing bot: ${error.message}`);
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // Helper functions
  const getBotEndTime = (botId) => {
    const bot = botData.find((bot) => bot.id === botId);
    if (bot) {
      return Date.now() + bot.duration * 24 * 60 * 60 * 1000;
    } else {
      return null;
    }
  };

  const getBotEarningsPerMinute = (botId) => {
    const bot = botData.find((bot) => bot.id === botId);
    if (bot) {
      const earningsPerDay = bot.potentialEarnings / bot.duration; // Earnings per day
      const earningsPerMinute = earningsPerDay / (24 * 60); // Earnings per minute
      return earningsPerMinute;
    } else {
      return 0;
    }
  };

  // Function to update user balance and earnings history
  const updateBalanceAndHistory = async () => {
    try {
      if (!currentUser) {
        return; // No user, no update
      }

      const newEarningsHistory = [];
      for (const botId of purchasedBots) {
        // Fetch the bot object from botData
        const bot = botData.find((b) => b.id === botId);
        if (!bot) {
          console.warn(`Bot not found for ID: ${botId}`);
          continue; // Skip to the next botId if the bot wasn't found
        }

        const botEndTime = getBotEndTime(botId);
        if (botEndTime !== null && botEndTime >= Date.now()) {
          const botEarningsPerMinute = getBotEarningsPerMinute(botId);

          // Get the bot's purchase time from earningsHistory
          const purchaseEntry = earningsHistory.find(
            (entry) => entry.botId === botId
          );
          const purchaseTimestamp =
            purchaseEntry?.timestamp?.seconds * 1000 || 0;

          // Correct Calculation for Elapsed Time
          const elapsedTimeInMinutes =
            (Date.now() - purchaseTimestamp) / (60 * 1000);

          // Credit only the botEarningsPerMinute to the user's balance in Firestore
          const userRef = doc(db, "users", currentUser.uid);
          await updateDoc(userRef, {
            // Credit the earnings per minute to the user's balance
            balance:
              (await getDoc(userRef)).data().balance + botEarningsPerMinute,
          });

          // Add the earnings to earningsHistory in Firestore
          const historyRef = collection(
            db,
            "users",
            currentUser.uid,
            "earningsHistory"
          );
          await addDoc(historyRef, {
            botId: botId,
            amount: botEarningsPerMinute, // Store botEarningsPerMinute in earningsHistory
            timestamp: new Date(),
          });

          // Log the earnings per minute to the developer console
          console.log("Earnings for Bot", botId, ":", botEarningsPerMinute);
        }
      }

      // Update the earningsHistory state
      const historyRef = collection(
        db,
        "users",
        currentUser.uid,
        "earningsHistory"
      );
      const historySnapshot = await getDocs(historyRef);
      const historyData = historySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEarningsHistory(historyData);

      console.log("Updated earningsHistory:", earningsHistory); // Log the updated earningsHistory
    } catch (error) {
      console.error("Error updating balance and history:", error);
    }
  };

  // Function to fetch individual bot's earnings history
  const getBotEarningsHistory = async (botId) => {
    try {
      if (!currentUser) {
        return []; // No user, return empty array
      }
      const historyRef = collection(
        db,
        "users",
        currentUser.uid,
        "earningsHistory"
      );
      const historySnapshot = await getDocs(
        query(historyRef, where("botId", "==", botId))
      );
      const historyData = historySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return historyData;
    } catch (error) {
      console.error("Error fetching bot earnings history:", error);
      return []; // Return empty array on error
    }
  };

  // Update bot history whenever purchasedBots changes
  useEffect(() => {
    const updateBotHistories = async () => {
      for (const botId of purchasedBots) {
        const historyData = await getBotEarningsHistory(botId);
        setBotHistory((prevHistory) => ({
          ...prevHistory,
          [botId]: historyData,
        }));
      }
    };
    if (currentUser && purchasedBots.length > 0) {
      updateBotHistories();
    }
  }, [currentUser, purchasedBots]);

  // This useEffect is to calculate the earnings every minute.
  // However, this is NOT a good approach because it will not give the correct
  // earnings as it will calculate from the last timestamp each time.
  // You need to handle the earnings calculation as outlined above.
  useEffect(() => {
    const updateEarnings = async () => {
      if (currentUser && purchasedBots.length > 0) {
        await updateBalanceAndHistory();
      }
    };
    const intervalId = setInterval(updateEarnings, 60000); // Update every minute
    return () => clearInterval(intervalId); // Clear interval on unmount
  }, [currentUser, purchasedBots]); // Run when currentUser or purchasedBots change

  useEffect(() => {
    const fetchBotData = async () => {
      try {
        const botSnapshot = await getDocs(collection(db, "bots"));
        const botsData = botSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBotData(botsData);
      } catch (error) {
        console.error("Error fetching bot data:", error);
      }
    };

    fetchBotData();
  }, []); // Only runs once when the component mounts

  // Fetch bot data again when purchasedBots changes
  useEffect(() => {
    const fetchBotData = async () => {
      try {
        const botSnapshot = await getDocs(collection(db, "bots"));
        const botsData = botSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBotData(botsData);
      } catch (error) {
        console.error("Error fetching bot data:", error);
      }
    };

    if (purchasedBots.length > 0) {
      // Only fetch if purchasedBots has any items
      fetchBotData();
    }
  }, [purchasedBots]); // Reruns whenever purchasedBots changes

  const handleClearHistory = async () => {
    try {
      if (!currentUser) {
        throw new Error("User not logged in");
      }
      const historyRef = collection(
        db,
        "users",
        currentUser.uid,
        "earningsHistory"
      );
      const historySnapshot = await getDocs(historyRef);

      // Delete each document in the history collection
      historySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      setEarningsHistory([]); // Update the local state
      setBotHistory({});
      setSnackbarSeverity("success");
      setSnackbarMessage("Earnings history cleared successfully!");
      setSnackbarOpen(true);
      setConfirmClearHistory(false); // Close the confirmation dialog
    } catch (error) {
      console.error("Error clearing earnings history:", error);
      setSnackbarSeverity("error");
      setSnackbarMessage(`Error clearing earnings history: ${error.message}`);
      setSnackbarOpen(true);
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

  // Function to generate chart data
  const generateChartData = () => {
    const labels = [];
    const data = [];
    const botEarnings = [];

    earningsHistory.forEach((entry) => {
      const date = new Date(entry.timestamp.seconds * 1000).toLocaleString();
      if (!labels.includes(date)) {
        labels.push(date);
      }
      data.push(entry.amount);
      botEarnings.push(entry.amount);
    });

    return {
      labels,
      datasets: [
        {
          label: "Earnings Over Time",
          data: botEarnings,
          fill: false,
          backgroundColor: "rgb(75, 192, 192)",
          borderColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.1,
        },
      ],
    };
  };

  return (
    <ThemeProvider theme={theme}>
      <div
        className="relative min-h-screen"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-80"></div>

        <div className="relative">
          <Typography
            variant="h2"
            align="center"
            gutterBottom
            style={{
              color: "#fff",
              zIndex: 1,
              fontSize: "2.5rem",
              fontWeight: "bold",
              marginTop: "1rem",
            }}
          >
            Bot Market
          </Typography>
          <Typography
            variant="h6"
            align="center"
            gutterBottom
            style={{ color: "#fff", zIndex: 1 }}
          >
            Current Balance: GHS {userBalance.toFixed(2)}
          </Typography>

          <Grid container spacing={3} justifyContent="center">
            {botData.map(
              (
                bot // Using botData to map the bots
              ) => (
                <Grid item key={bot.id} xs={12} sm={6} md={4}>
                  <Card
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      height: "100%",
                    }}
                    className="bot-card"
                  >
                    <img
                      src={bot.imgURL} // Assuming bot.imgURL is the field from Firestore containing image URL
                      alt={bot.name}
                      style={{ width: "100%", height: "auto" }}
                      className="bot-image"
                    />
                    <CardContent>
                      <Typography
                        variant="h5"
                        component="div"
                        sx={{
                          color: theme.palette.primary.main,
                          textAlign: "left",
                          fontSize: "1.2rem",
                          fontWeight: "bold",
                          marginBottom: "0.5rem",
                          textTransform: "uppercase",
                          lineHeight: 1.5,
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        {bot.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Price: GHS {bot.price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Potential Earnings: GHS {bot.potentialEarnings}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Duration: {bot.duration} days
                      </Typography>
                    </CardContent>
                    <CardActions>
                      {purchasedBots.includes(bot.id) ? (
                        <Button
                          variant="contained"
                          disabled
                          sx={{ backgroundColor: "red", color: "#fff" }}
                        >
                          Purchased
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          onClick={() => handlePurchase(bot)}
                          sx={{ color: "#fff" }}
                        >
                          Purchase
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              )
            )}
          </Grid>

          {/* Button to show earnings history */}
          <Button
            variant="contained"
            onClick={() => setShowEarningsHistory(true)}
            style={{ margin: "2rem auto", display: "block" }}
          >
            Show Earnings History
          </Button>

          {/* Dialog to confirm clearing history */}
          <Dialog
            open={confirmClearHistory}
            onClose={() => setConfirmClearHistory(false)}
          >
            <DialogTitle>Clear Earnings History?</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to clear your earnings history? This
                action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmClearHistory(false)}>
                Cancel
              </Button>
              <Button onClick={handleClearHistory} color="primary">
                Clear History
              </Button>
            </DialogActions>
          </Dialog>

          {/* Display Earnings History when showEarningsHistory is true */}
          {showEarningsHistory && (
            <div style={{ margin: "2rem 0" }}>
              <Typography
                variant="h4"
                align="center"
                gutterBottom
                style={{ color: "#fff" }}
              >
                Earnings History
              </Typography>
              <Line data={generateChartData()} />
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Bot Name</TableCell>
                      <TableCell>Earnings Per Minute</TableCell>
                      <TableCell>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(earningsHistory || []).map(
                      (
                        entry,
                        index // Use index as key
                      ) => {
                        const bot = botData.find(
                          (bot) => bot.id === entry.botId
                        );
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              {bot ? bot.name : entry.botId}
                            </TableCell>
                            <TableCell>GHS {entry.amount.toFixed(3)}</TableCell>
                            <TableCell>
                              {new Date(
                                entry.timestamp.seconds * 1000
                              ).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        );
                      }
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {/* Button to clear the history */}
              <Button
                variant="contained"
                color="error"
                style={{ margin: "2rem auto", display: "block" }}
                onClick={() => setConfirmClearHistory(true)}
              >
                Clear History
              </Button>
              {/* Button to close the earnings history */}
              <Button
                variant="contained"
                onClick={() => setShowEarningsHistory(false)}
                style={{ margin: "2rem auto", display: "block" }}
              >
                Hide Earnings History
              </Button>
            </div>
          )}
        </div>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
          >
            {snackbarMessage}
          </MuiAlert>
        </Snackbar>

        <footer className="relative z-10 p-4 text-center text-white bg-gray-800">
          <Typography variant="body2">
            © 2024 CashCova. All rights reserved.
          </Typography>
          <Link to="/faq" className="text-blue-400">
            FAQ
          </Link>
        </footer>
      </div>
    </ThemeProvider>
  );
};

export default BotMarketplace;
