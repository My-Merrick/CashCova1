import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import backgroundImage from "../../assets/bg.png";
import { FiCopy } from "react-icons/fi";
import "./Home.css";
import InvestmentDashboard from "../components/InvestmentDashboard";
import UserSettings from "./UserSettings";
import SupportIcon from "./SupportIcon";
import { Line } from "react-chartjs-2";
import "chart.js/auto"; // Import Chart.js library

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [earningsHistory, setEarningsHistory] = useState([]);
  const [showEarnings, setShowEarnings] = useState(false);
  const [purchasedBots, setPurchasedBots] = useState([]);
  const [botData, setBotData] = useState([]);
  const [botHistory, setBotHistory] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserData(userData);
            setPurchasedBots(userData.purchasedBots || []);
          } else {
            console.error("No user data found!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
        setLoading(false);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchEarningsHistory = async () => {
    if (user) {
      try {
        const earningsCollection = collection(
          db,
          "users",
          user.uid,
          "earningsHistory"
        );
        const earningsSnapshot = await getDocs(earningsCollection);
        const earningsData = earningsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEarningsHistory(earningsData);
      } catch (error) {
        console.error("Error fetching earnings history:", error);
      }
    }
  };

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

  useEffect(() => {
    if (purchasedBots.length > 0) {
      fetchBotData();
    }
  }, [purchasedBots]);

  const getBotEarningsHistory = async (botId) => {
    try {
      if (!user) {
        return [];
      }
      const historyRef = collection(db, "users", user.uid, "earningsHistory");
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
      return [];
    }
  };

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
    if (user && purchasedBots.length > 0) {
      updateBotHistories();
    }
  }, [user, purchasedBots]);

  const generateChartData = () => {
    const labels = [];
    const data = [];

    earningsHistory.forEach((entry) => {
      const date = new Date(entry.timestamp.seconds * 1000).toLocaleString();
      if (!labels.includes(date)) {
        labels.push(date);
      }
      data.push(entry.amount);
    });

    return {
      labels,
      datasets: [
        {
          label: "Earnings Over Time",
          data,
          fill: false,
          backgroundColor: "rgb(75, 192, 192)",
          borderColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.1,
        },
      ],
    };
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const copyReferralLink = () => {
    const referralLink = `http://localhost:5173/signup?ref=${userData.referralCode}`;
    navigator.clipboard
      .writeText(referralLink)
      .then(() => {
        alert("Referral link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  };

  const handleShowEarnings = () => {
    if (!showEarnings) {
      fetchEarningsHistory();
    }
    setShowEarnings(!showEarnings);
  };

  const handleDeleteHistory = async () => {
    if (user) {
      try {
        const earningsCollection = collection(
          db,
          "users",
          user.uid,
          "earningsHistory"
        );
        const earningsSnapshot = await getDocs(earningsCollection);

        const deletePromises = earningsSnapshot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );

        await Promise.all(deletePromises);
        setEarningsHistory([]);
      } catch (error) {
        console.error("Error deleting earnings history:", error);
      }
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-2 text-3xl text-gray-800 animate-ping align-center">
        💲CashCova🤑
      </div>
    );

  if (!user || !userData)
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-2 text-3xl text-gray-800 animate-ping align-center">
        💲CashCova🤑
      </div>
    );

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-center bg-no-repeat bg-cover"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <div className="absolute inset-0 bg-black opacity-80"></div>
      <div className="container relative z-10 px-4 py-8 mx-auto">
        <div className="overflow-hidden bg-white rounded-lg shadow-md opacity-80">
          <div className="flex items-center justify-between px-6 py-4 text-white bg-gray-800">
            <h1 className="text-2xl">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="p-2 text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-400"
            >
              Logout
            </button>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <p className="text-lg">
                <strong>Username:</strong> {userData.username}
              </p>
              <p className="text-lg">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="text-lg">
                <strong>Balance:</strong> GHS {userData.balance.toFixed(2)}
              </p>
              <p className="text-lg">
                <strong>Referral Code:</strong> {userData.referralCode}
              </p>
              <p className="flex items-center mb-4 text-lg">
                <strong>Referral Link:</strong>{" "}
                <a
                  href={`http://localhost:5173/signup?ref=${userData.referralCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  http://localhost:5173/signup?ref={userData.referralCode}
                </a>
                <FiCopy
                  className="ml-2 cursor-pointer"
                  onClick={copyReferralLink}
                  title="Copy Referral Link"
                />
              </p>
              <UserSettings />
              <SupportIcon />
              <InvestmentDashboard />
            </div>
            <div className="mb-4">
              <button
                onClick={handleShowEarnings}
                className="p-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400"
              >
                {showEarnings
                  ? "Hide Earnings History Chart"
                  : "Show All Earnings History Chart"}
              </button>
              {showEarnings && (
                <div className="mt-4">
                  {earningsHistory.length > 0 ? (
                    <Line data={generateChartData()} />
                  ) : (
                    <p>No earnings history found.</p>
                  )}
                </div>
              )}
            </div>
            {showEarnings && (
              <button
                onClick={handleDeleteHistory}
                className="p-2 text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-400"
              >
                Delete Earnings History
              </button>
            )}
          </div>
        </div>
      </div>

      <footer className="relative z-10 p-4 text-center text-white bg-gray-800">
        <p>&copy; 2024 CashCova. All rights reserved.</p>
        <Link to="/faq" className="text-blue-400">
          FAQ
        </Link>
      </footer>
    </div>
  );
};

export default Dashboard;
