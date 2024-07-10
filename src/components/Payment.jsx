// import React, { useState } from "react";
// import { getAuth, httpsCallable } from "firebase/functions";
// import PaystackPop from "paystack-pop";

// const Payment = () => {
//   const [amount, setAmount] = useState(0);
//   const [mobileNumber, setMobileNumber] = useState("");
//   const auth = getAuth();
//   const user = auth.currentUser;

//   const handlePaystackSuccessAction = async (reference) => {
//     try {
//       const response = await fetch("/api/verifyPaystackPayment", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           reference: reference.reference,
//           uid: user.uid,
//           amount,
//           currency: "NGN",
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Network response was not ok");
//       }

//       const data = await response.json();

//       if (data.success) {
//         console.log("Transaction verified and balance updated:", data);
//         alert("Deposit successful!"); // Notify user of success
//       } else {
//         console.error("Transaction verification failed:", data.message);
//         alert("Transaction verification failed: " + data.message); // Notify user of failure
//       }
//     } catch (error) {
//       console.error("Error verifying transaction:", error.message);
//       alert("Error verifying transaction: " + error.message);
//     }
//   };

//   const handlePaystackCloseAction = () => {
//     console.log("Payment window closed."); // Log payment window closure
//     alert("Transaction was not completed, window closed.");
//   };

//   const handlePayment = () => {
//     console.log("Initiating payment..."); // Log payment initiation
//     const paystackHandler = PaystackPop.setup({
//       key: "pk_live_6663d6d2bee368ef120854a1c229e27ac27a6f1a", // Replace with your Paystack public key
//       email: user.email,
//       amount: amount * 100, // Paystack works with kobo
//       mobile_number: mobileNumber, // Include mobile number for mobile money
//       onClose: handlePaystackCloseAction,
//       callback: (response) => {
//         handlePaystackSuccessAction(response);
//       },
//       channels: ["mobile_money"],
//     });
//     paystackHandler.openIframe();
//   };

//   return (
//     <div>
//       <h1>Deposit Funds</h1>
//       <label>
//         Amount:
//         <input
//           type="number"
//           value={amount}
//           onChange={(e) => {
//             console.log("Amount changed:", e.target.value); // Log amount change
//             setAmount(parseFloat(e.target.value));
//           }}
//           placeholder="Enter amount"
//         />
//       </label>
//       <br />
//       <label>
//         Mobile Number:
//         <input
//           type="text"
//           value={mobileNumber}
//           onChange={(e) => {
//             console.log("Mobile number changed:", e.target.value); // Log mobile number change
//             setMobileNumber(e.target.value);
//           }}
//           placeholder="Enter mobile number"
//         />
//       </label>
//       <br />
//       <button onClick={handlePayment}>Pay Now</button>
//     </div>
//   );
// };

// export default Payment;
