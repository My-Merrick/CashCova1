import { useState, useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TradingView = ({ symbol = "BTC/USDT" }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: symbol,
        data: [],
        borderColor: "rgba(0, 255, 0, 1)",
        borderWidth: 1.5,
        tension: 0.1,
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, "rgba(0, 255, 0, 0.1)");
          gradient.addColorStop(1, "rgba(0, 255, 0, 0)");
          return gradient;
        },
      },
    ],
  });

  const [currentPrice, setCurrentPrice] = useState(35000);
  const [stake, setStake] = useState({
    amount: "",
    type: "",
    price: null,
    time: null,
    duration: null,
  });
  const [stakeResult, setStakeResult] = useState(null);
  const [userBalance, setUserBalance] = useState(0);

  const priceRef = useRef(35000);
  const timeRef = useRef(new Date());
  const chartRef = useRef(null);

  const fetchAndUpdateBalance = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const db = getFirestore();
      const userDoc = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists()) {
        const balance = docSnap.data().balance;
        console.log("Fetched user balance:", balance);
        setUserBalance(balance);
        return balance;
      } else {
        console.log("No such document!");
        return 0;
      }
    }
    return 0;
  };

  useEffect(() => {
    fetchAndUpdateBalance();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 100;
      priceRef.current += change;
      timeRef.current = new Date();
      setCurrentPrice(priceRef.current);

      setChartData((prevData) => {
        const newLabels = [
          ...prevData.labels,
          timeRef.current.toLocaleTimeString(),
        ];
        const newData = [...prevData.datasets[0].data, priceRef.current];
        const newColors = newData.map((price, index) =>
          index === 0
            ? "rgba(0, 255, 0, 1)"
            : price >= newData[index - 1]
              ? "rgba(0, 255, 0, 1)"
              : "rgba(255, 0, 0, 1)"
        );

        if (newLabels.length > 100) {
          newLabels.shift();
          newData.shift();
          newColors.shift();
        }

        return {
          labels: newLabels,
          datasets: [
            {
              ...prevData.datasets[0],
              data: newData,
              borderColor: newColors,
              segment: {
                borderColor: (ctx) => newColors[ctx.p0DataIndex],
              },
            },
          ],
        };
      });

      if (chartRef.current) {
        chartRef.current.update("none");
      }

      if (stake.price && timeRef.current - stake.time >= stake.duration) {
        settleStake();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [symbol, stake]);

  const placeStake = async (type, duration) => {
    const currentBalance = await fetchAndUpdateBalance();
    console.log("Placing stake. Current balance:", currentBalance);
    const stakeAmount = parseFloat(stake.amount);
    if (stakeAmount && stakeAmount > 0 && stakeAmount <= currentBalance) {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const db = getFirestore();
        const userDoc = doc(db, "users", user.uid);
        const newBalance = currentBalance - stakeAmount;
        console.log("New balance after placing stake:", newBalance);
        await updateDoc(userDoc, {
          balance: newBalance,
        });
        await fetchAndUpdateBalance();
        setStake({
          amount: stakeAmount,
          type: type,
          price: currentPrice,
          time: new Date(),
          duration: duration,
        });
      }
    } else {
      alert("Please enter a valid stake amount within your balance.");
    }
  };

  const settleStake = async () => {
    const currentBalance = await fetchAndUpdateBalance();
    console.log("Settling stake. Current balance:", currentBalance);
    const priceDifference = currentPrice - stake.price;
    let profit;

    const leverageFactor = 2;
    const bonusPercentage = Math.random() * 0.05;
    const bonus = stake.amount * bonusPercentage;

    if (stake.type === "buy") {
      profit =
        stake.amount * (priceDifference / stake.price) * leverageFactor + bonus;
    } else {
      profit =
        stake.amount * (-priceDifference / stake.price) * leverageFactor +
        bonus;
    }

    console.log("Calculated profit:", profit);

    const result = {
      initialStake: stake.amount,
      profit: profit,
      total: stake.amount + profit,
    };

    console.log("Total return:", result.total);

    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const db = getFirestore();
      const userDoc = doc(db, "users", user.uid);

      const newBalance = currentBalance + result.total;
      console.log("New balance to be set:", newBalance);
      await updateDoc(userDoc, {
        balance: newBalance,
      });
      await fetchAndUpdateBalance();

      await updateDoc(userDoc, {
        recentTransactions: arrayUnion({
          type: stake.type,
          amount: stake.amount,
          date: new Date(),
          symbol: symbol,
          profit: profit,
          duration: stake.duration === 60000 ? "Short-term" : "Long-term",
        }),
      });
    }

    setStakeResult(result);
    setStake({ amount: "", type: "", price: null, time: null, duration: null });
    console.log("Final balance after settling:", await fetchAndUpdateBalance());
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: "white" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      y: {
        ticks: { color: "white" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
    plugins: {
      legend: {
        labels: { color: "white" },
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  return (
    <div
      style={{
        width: "100%",
        height: "600px",
        backgroundColor: "#1A1A1A",
        padding: "20px",
        borderRadius: "10px",
        color: "white",
        marginBottom: "10px",
      }}
    >
      <Line ref={chartRef} options={options} data={chartData} />
      <div style={{ marginTop: "20px" }}>
        <h3>Current Price: GHS {currentPrice.toFixed(2)}</h3>
        <h3>Your Balance: GHS {userBalance.toFixed(2)}</h3>
        <div style={{ marginTop: "20px" }}>
          <input
            type="number"
            value={stake.amount}
            onChange={(e) => setStake({ ...stake, amount: e.target.value })}
            placeholder="Enter stake amount"
            style={{ marginRight: "8px", padding: "5px", color: "black" }}
          />
          <button
            onClick={() => placeStake("buy", 60000)}
            style={{
              marginRight: "10px",
              padding: "5px 10px",
              backgroundColor: "green",
              color: "white",
            }}
          >
            Buy (Short)
          </button>
          <button
            onClick={() => placeStake("sell", 60000)}
            style={{
              marginRight: "10px",
              padding: "5px 10px",
              backgroundColor: "red",
              color: "white",
            }}
          >
            Sell (Short)
          </button>
          <button
            onClick={() => placeStake("buy", 600000)}
            style={{
              marginRight: "10px",
              padding: "5px 10px",
              backgroundColor: "darkgreen",
              color: "white",
            }}
          >
            Buy (Long)
          </button>
          <button
            onClick={() => placeStake("sell", 600000)}
            style={{
              padding: "5px 10px",
              backgroundColor: "darkred",
              color: "white",
              marginBottom: "20px",
            }}
          >
            Sell (Long)
          </button>
        </div>
        {stake.price && (
          <p className="mb-10">
            Active stake: {stake.type.toUpperCase()} GHS {stake.amount} at GHS
            {stake.price.toFixed(2)} (
            {stake.duration === 60000 ? "Short-term" : "Long-term"})
          </p>
        )}
        {stakeResult && (
          <div className="mb-200">
            <h4>Stake Result:</h4>
            <p>Initial Stake: GHS {stakeResult.initialStake.toFixed(2)}</p>
            <p>Profit/Loss: GHS {stakeResult.profit.toFixed(2)}</p>
            <p className="mb-10">
              Total Return: GHS {stakeResult.total.toFixed(2)}
            </p>
            <p>
              {stakeResult.profit > 0 ? "You won!" : "You lost."}
              {stakeResult.profit > 0
                ? " Your balance has been updated."
                : " Your balance remains unchanged."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingView;
