import { useState } from "react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "./../../firebase"; // Adjust this import path as needed
import { getAuth } from "firebase/auth";
import PaystackPop from "@paystack/inline-js";

const Payment = () => {
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState("NGN"); // Default currency
  const [mobileNumber, setMobileNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const auth = getAuth();
  const user = auth.currentUser;

  const handlePaystackSuccessAction = async (reference) => {
    setIsLoading(true);
    setMessage("");
    try {
      const verifyResponse = await fetch(
        `https://api.paystack.co/transaction/verify/${reference.reference}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer sk_live_739e40b982cbfc90b37aad16687368aae0ef1f63`, // Replace with your Paystack secret key
            "Content-Type": "application/json",
          },
        }
      );

      const verifyResult = await verifyResponse.json();
      if (verifyResult.status) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          balance: increment(Number(amount)),
        });
        setMessage("Deposit successful!");
        setAmount(0);
      } else {
        setMessage("Transaction verification failed: " + verifyResult.message);
      }
    } catch (error) {
      console.error("Error verifying transaction:", error);
      setMessage("Error verifying transaction: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaystackCloseAction = () => {
    console.log("Payment window closed.");
    setMessage("Transaction was not completed, window closed.");
  };

  const handlePayment = () => {
    console.log("Initiating payment...");
    const paystackHandler = PaystackPop.setup({
      key: "pk_live_6663d6d2bee368ef120854a1c229e27ac27a6f1a", // Replace with your Paystack public key
      email: user.email,
      amount: amount * 100, // Paystack works with kobo
      currency: currency, // Use the selected currency
      callback: (response) => {
        handlePaystackSuccessAction(response);
      },
      onClose: handlePaystackCloseAction,
    });
    paystackHandler.openIframe();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Deposit Funds</h1>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="amount"
          >
            Amount:
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            placeholder="Enter amount"
            min="1"
            disabled={isLoading}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="currency"
          >
            Currency:
          </label>
          <div className="relative">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="GHS">GHS</option>
              <option value="NGN">NGN</option>
              <option value="USD">USD</option>
              {/* Add more currency options here */}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M10 12l-6-6h12z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="mobileNumber"
          >
            Mobile Number:
          </label>
          <input
            id="mobileNumber"
            type="text"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="Enter mobile number"
            disabled={isLoading}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        {amount > 0 && (
          <div className="mb-6">
            <button
              onClick={handlePayment}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Pay Now
            </button>
          </div>
        )}
        {isLoading && (
          <p className="text-blue-500 text-center">Processing...</p>
        )}
        {message && (
          <p
            className={`text-center ${message.includes("Error") ? "text-red-500" : "text-green-500"}`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Payment;
