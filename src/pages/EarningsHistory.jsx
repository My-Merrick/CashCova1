// src/pages/EarningsHistory.jsx
import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const EarningsHistory = () => {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user) {
        setUser(user);
        const q = query(
          collection(db, "transactions"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        setHistory(querySnapshot.docs.map((doc) => doc.data()));
      }
    };
    fetchData();
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl mb-4">Earnings History</h1>
        <ul>
          {history.map((entry, index) => (
            <li key={index} className="mb-2 border-b pb-2">
              <p>
                <strong>Type:</strong> {entry.type}
              </p>
              <p>
                <strong>Amount:</strong> ${entry.amount.toFixed(2)}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(entry.date.seconds * 1000).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EarningsHistory;
