import React from "react";
import { Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { Container, Grid, Paper, Typography, Button, Box } from "@mui/material";

// Import components for logged-in state (you can move these to separate files)
import LoggedInView from "./LoggedInView";
import MarketsTable from "./MarketsTable";
import Footer from "./Footer";

const Home = () => {
  const [user] = useAuthState(auth);

  // Mock data for markets (you can move this to a separate file or fetch from an API)
  const markets = [
    { name: "BTC", price: "45,123.45", change: "+2.5%" },
    { name: "ETH", price: "3,456.78", change: "-1.2%" },
    { name: "XRP", price: "0.5678", change: "+3.7%" },
    { name: "LTC", price: "123.45", change: "+0.8%" },
  ];

  if (user) {
    return <LoggedInView />;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Hero Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h3" gutterBottom>
              Welcome to CashCova
            </Typography>
            <Typography variant="h5" gutterBottom>
              Your Gateway to the World of Crypto Bot Mining
            </Typography>
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={Link}
                to="/signup"
                sx={{ mr: 2 }}
              >
                Sign Up
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                component={Link}
                to="/login"
              >
                Log In
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Markets Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>
              Markets
            </Typography>
            <MarketsTable markets={markets} />
          </Paper>
        </Grid>

        {/* Features Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
              Why Choose Crypto Bot Miner?
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="h6">Secure Trading</Typography>
                <Typography>
                  State-of-the-art security measures to protect your assets
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6">Advanced Tools</Typography>
                <Typography>
                  Access to professional mining tools and real-time market data
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6">24/7 Support</Typography>
                <Typography>
                  Round-the-clock customer support to assist you
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      <Footer />
    </Container>
  );
};

export default Home;
