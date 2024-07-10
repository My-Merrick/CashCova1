import { useState, useEffect } from "react";
import { auth, db, doc, getDoc, updateDoc } from "../../firebase"; // Adjust path as needed
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";

const Withdraw = () => {
  const [amount, setAmount] = useState(0);
  const [mobileNumber, setMobileNumber] = useState("");
  const [currency, setCurrency] = useState("GHS");
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchBalance(currentUser);
      } else {
        setUser(null);
        setBalance(0);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchBalance = async (currentUser) => {
    if (!currentUser) {
      setError("User not authenticated.");
      return;
    }

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        setBalance(docSnap.data().balance || 0);
        setError(null);
      } else {
        setError("User document not found.");
        console.error("User document not found.");
      }
    } catch (error) {
      setError("Error fetching balance: " + error.message);
      console.error("Error fetching balance:", error);
    }
  };

  const handleWithdraw = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (amount <= 0) {
        throw new Error("Withdrawal amount must be greater than zero.");
      }

      if (amount > balance) {
        throw new Error("Insufficient balance.");
      }

      // Process Paystack withdrawal
      console.log("Starting Paystack withdrawal processing...");
      const withdrawalStatus = await processPaystackWithdrawal();

      if (withdrawalStatus === "success") {
        console.log("Paystack withdrawal processed successfully.");
        // Update balance in Firestore
        await updateBalanceAfterWithdrawal(user.uid, amount);

        // Clear form fields
        setAmount(0);
        setMobileNumber("");
        setCurrency("GHS");
      } else {
        throw new Error("Failed to process withdrawal with Paystack.");
      }

      setIsLoading(false);
    } catch (error) {
      setError("Error processing withdrawal: " + error.message);
      console.error("Error processing withdrawal:", error);
      setIsLoading(false);
    }
  };

  const processPaystackWithdrawal = async () => {
    // Simulate successful withdrawal
    return "success";
  };

  const updateBalanceAfterWithdrawal = async (userId, withdrawalAmount) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        balance: balance - withdrawalAmount,
      });
      console.log("User balance updated after withdrawal.");
    } catch (error) {
      console.error("Error updating user balance:", error);
      throw new Error("Failed to update balance after withdrawal.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Withdraw Funds
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Current Balance:{" "}
            <span className="font-semibold text-indigo-600">{balance} GHS</span>
          </p>
        </div>
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="amount" className="sr-only">
                Amount to Withdraw (GHS)
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Amount to Withdraw (GHS)"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="mobileNumber" className="sr-only">
                Mobile Money Number
              </label>
              <input
                id="mobileNumber"
                name="mobileNumber"
                type="tel"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Mobile Money Number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="currency" className="sr-only">
                Currency
              </label>
              <select
                id="currency"
                name="currency"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="GHS">GHS</option>
                {/* Add more currency options as needed */}
              </select>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading}
              onClick={handleWithdraw}
            >
              {isLoading ? "Processing..." : "Withdraw"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Withdraw;
