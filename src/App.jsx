import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import NumberGuessingGame from "./pages/NumberGuessingGame";
import TossCoinsGame from "./pages/TossCoinsGame";
import TicTacToeGame from "./pages/TicTacToeGame";
import EarningsHistory from "./pages/EarningsHistory";
import FAQ from "./pages/FAQ";
import UserSettings from "./pages/UserSettings";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import Navbar from "./components/Navbar";
import BotMarketplace from "./components/BotMarketplace";
import InstantLottery from "./pages/InstantLottery";
import GamePage from "./pages/GamePage";
import SupportIcon from "./pages/SupportIcon";
import Draw from "./pages/Draw";
import Game from "./pages/Game";
import WithdrawalComponent from "./pages/WithdrawalComponent";
import AdminWithdrawalPanel from "./pages/AdminWithdrawalPanel";
import TradingView from "./components/TradingView";
import StakingComponent from "./components/StakingComponent";
import Header from "./components/Header";
import WalletOverview from "./components/WalletOverview";
import Trading from "./pages/Trading";

// import DepositComponent from "./pages/DepositComponent";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/number-guessing" element={<NumberGuessingGame />} />
        <Route path="/toss-coins" element={<TossCoinsGame />} />
        <Route path="/tic-tac-toe" element={<TicTacToeGame />} />
        <Route path="/earnings-history" element={<EarningsHistory />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/settings" element={<UserSettings />} />
        <Route path="/deposit" element={<Deposit />} />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/bot" element={<BotMarketplace />} />
        <Route path="/instant" element={<InstantLottery />} />
        <Route path="/games" element={<GamePage />} />
        <Route path="support" element={<SupportIcon />} />
        <Route path="/draw" element={<Draw />} />
        <Route path="/gamez" element={<Game />} />
        <Route path="/withdrawal-component" element={<WithdrawalComponent />} />
        <Route path="/adminPanel" element={<AdminWithdrawalPanel />} />
        <Route path="/trading" element={<TradingView />} />
        <Route path="/staking" element={<StakingComponent />} />
        <Route path="/wallet" element={<WalletOverview />} />
        <Route path="/header" element={<Header />} />
        <Route path="/trade" element={<Trading />} />
        {/* <Route path="depo" element={<DepositComponent />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
