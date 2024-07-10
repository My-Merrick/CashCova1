import { useState, useEffect } from "react";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const WithdrawalComponent = () => {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchUserBalance = async () => {
      if (auth.currentUser) {
        try {
          const userRef = doc(db, "users", auth.currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setBalance(userData.balance || 0);

            if (Array.isArray(userData.withdrawalHistory)) {
              const historyPromises = userData.withdrawalHistory.map(
                async (entry) => {
                  const userDoc = await getDoc(doc(db, "users", entry.userId));
                  const userData = userDoc.data();
                  return {
                    ...entry,
                    user: userData,
                    createdAt: entry.createdAt.toDate(),
                  };
                }
              );
              const history = await Promise.all(historyPromises);
              setWithdrawalHistory(history);
            } else {
              setWithdrawalHistory([]);
            }

            setIsAdmin(userData.isAdmin || false); // Example: isAdmin field in user document
          } else {
            console.log("No user data found!");
          }
        } catch (error) {
          console.error("Error fetching user balance:", error);
          setError("Failed to fetch balance. Please try again.");
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserBalance();
      } else {
        setIsAdmin(false); // Reset isAdmin state if user is not authenticated
      }
    });

    return () => unsubscribe();
  }, [auth.currentUser, db]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "withdrawalRequests"),
      (snapshot) => {
        const updatedWithdrawalHistory = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWithdrawalHistory(updatedWithdrawalHistory);
      }
    );

    return () => unsubscribe();
  }, [db]);

  const handleWithdrawalRequest = async () => {
    setError("");
    setSuccess("");

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!phoneNumber) {
      setError("Please enter your mobile money number");
      return;
    }

    const withdrawalAmount = parseFloat(amount);

    if (withdrawalAmount > balance) {
      setError("Insufficient funds");
      return;
    }

    try {
      // Create a withdrawal request in Firestore
      const withdrawalRef = await addDoc(collection(db, "withdrawalRequests"), {
        userId: auth.currentUser.uid,
        amount: withdrawalAmount,
        phoneNumber: phoneNumber,
        status: "pending",
        createdAt: new Date(),
      });

      // Update user's balance in Firebase
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        balance: balance - withdrawalAmount,
        withdrawalHistory: [
          ...withdrawalHistory,
          {
            id: withdrawalRef.id,
            userId: auth.currentUser.uid,
            amount: withdrawalAmount,
            phoneNumber: phoneNumber,
            status: "pending",
            createdAt: new Date(),
          },
        ],
      });

      setBalance(balance - withdrawalAmount);
      setSuccess(
        "Withdrawal request submitted successfully. We will process it as soon as possible."
      );
      setAmount("");
      setPhoneNumber("");
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred. Please try again.");
    }
  };

  const markWithdrawalAsApproved = async (withdrawalId) => {
    try {
      const withdrawalDocRef = doc(db, "withdrawalRequests", withdrawalId);
      await updateDoc(withdrawalDocRef, { status: "approved" });

      // Display success message for user
      setSuccess(
        "Withdrawal request approved. Payment sent to mobile money account."
      );
    } catch (error) {
      console.error("Error marking withdrawal as approved:", error);
      setError("Failed to approve withdrawal. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Withdrawal Request
      </h2>
      <div className="mb-4">
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700"
        >
          Amount (GHS)
        </label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter withdrawal amount"
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="phoneNumber"
          className="block text-sm font-medium text-gray-700"
        >
          Mobile Money Number
        </label>
        <input
          id="phoneNumber"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter mobile money number"
        />
      </div>
      <button
        onClick={handleWithdrawalRequest}
        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Request Withdrawal
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-2 text-sm text-green-600">{success}</p>}
      <p className="mt-4 text-sm text-gray-600">
        Your Balance: GHS {balance.toFixed(2)}
      </p>

      {/* Withdrawal History */}
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-4">Withdrawal History</h3>
        <ul>
          {withdrawalHistory.map((request, index) => (
            <li key={index} className="mb-2">
              <span className="font-medium">
                Amount: GHS {request.amount.toFixed(2)}
              </span>
              <br />
              <span>Status: {request.status}</span>
              <br />
              <span>Date: {request.createdAt.toLocaleString()}</span>
              <br />
              {request.user && (
                <span>User: {request.user.email}</span>
                // Replace email with the field you want to display
              )}
              {isAdmin && request.status === "pending" && (
                <button
                  className="mt-2 inline-flex justify-center py-1 px-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={() => markWithdrawalAsApproved(request.id)}
                >
                  Approve
                </button>
              )}
              {request.status === "approved" && (
                <div className="mt-2 bg-gray-100 p-2 rounded-md">
                  <p className="text-sm text-green-600">Approved</p>
                  <p className="text-xs text-gray-600">
                    Withdrawal amount: GHS {request.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600">
                    Mobile Money Number: {request.phoneNumber}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WithdrawalComponent;
