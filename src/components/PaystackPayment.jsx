// src/components/PaystackPayment.jsx
// import React from "react";
import { usePaystackPayment } from "react-paystack";

const PaystackPayment = ({ amount, onSuccess, onClose }) => {
  const config = {
    reference: new Date().getTime().toString(),
    email: "user@example.com", // Replace with the user's email
    amount: amount * 100, // Paystack works with kobo, so multiply amount by 100
    currency: "GHS",
    publicKey: "pk_test_61e74b55959daccf8000b5d088a46b3b0b8c885b",
  };

  const initializePayment = usePaystackPayment(config);

  return (
    <button
      onClick={() => {
        initializePayment(onSuccess, onClose);
      }}
      className="bg-green-500 text-white p-2 rounded"
    >
      Pay with Paystack
    </button>
  );
};

export default PaystackPayment;
