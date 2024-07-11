// LoggedInView.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { FiEye, FiEyeOff } from "react-icons/fi";
import {
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import MarketsTable from "./MarketsTable";
import Footer from "./Footer";
import SupportIcon from "./SupportIcon";

const LoggedInView = () => {
  const [user] = useAuthState(auth);
  const [balance, setBalance] = useState(null);
  const [username, setUsername] = useState("");
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setBalance(userDoc.data().balance);
          setUsername(userDoc.data().username);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };

  // Mock data for markets
  const markets = [
    { name: "BTC", price: "45,123.45", change: "+2.5%" },
    { name: "ETH", price: "3,456.78", change: "-1.2%" },
    { name: "XRP", price: "0.5678", change: "+3.7%" },
    { name: "LTC", price: "123.45", change: "+0.8%" },
  ];

  return (
    <>
      <Grid container spacing={3}>
        {/* Balance Card */}
        <Grid item xs={12} md={4} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 240,
              bgcolor: "background.dark",
              color: "text.primary",
            }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="inherit"
              fontWeight={"400px"}
              gutterBottom
            >
              Account Balance
            </Typography>
            <Typography component="p" variant="h6" color="inherit">
              {showBalance ? `GHS ${balance?.toFixed(2) || "0.00"}` : "****"}

              <IconButton
                onClick={toggleBalanceVisibility}
                size="small"
                sx={{ ml: 1 }}
              >
                {showBalance ? <FiEyeOff /> : <FiEye />}
              </IconButton>
            </Typography>
            <Typography color="textSecondary" sx={{ flex: 1 }}>
              Welcome, {username}
            </Typography>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
            >
              <Button
                variant="contained"
                color="primary"
                component={Link}
                to="/deposit"
              >
                Deposit
              </Button>
              {/* <Button
                variant="contained"
                color="secondary"
                component={Link}
                to="/withdraw"
              >
                Withdraw
              </Button> */}
              <Button
                variant="contained"
                color="secondary"
                component={Link}
                to="/withdrawal-component"
              >
                Withdraw
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              marginBottom: "20px",
              backgroundColor: "#2a2c2e",
              color: "white",
            }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="inherit"
              gutterBottom
            >
              Quick Actions
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-around",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Button variant="outlined" component={Link} to="/bot">
                Buy Mining Bot
              </Button>
              <Button variant="outlined" component={Link} to="/games">
                Play Games
              </Button>
              <Button variant="outlined" component={Link} to="/dashboard">
                Dashboard
              </Button>

              <Button variant="outlined" component={Link} to="/trade">
                Trade
              </Button>
            </Box>
            <SupportIcon />
          </Paper>
        </Grid>

        {/* Markets Table */}
        <Grid item xs={12} md={8} lg={9}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              marginBottom: "20px",
            }}
          >
            <Typography
              component="h2"
              variant="h6"
              color="inherit"
              gutterBottom
            >
              Markets
            </Typography>
            <MarketsTable markets={markets} />
          </Paper>
        </Grid>
      </Grid>
      <Footer />
    </>
  );
};

export default LoggedInView;
