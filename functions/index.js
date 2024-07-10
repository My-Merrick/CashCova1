const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors");

admin.initializeApp();

const allowedOrigins = [
  "http://localhost:5179", // Replace with your local development server URL
  "http://localhost:5173", // Replace with your local development server URL
  "https://unicoins-55169.web.app", // Replace with your deployed frontend URL
  "https://unicoins-55169.firebaseapp.com", // Additional deployed frontend URLs
  "https://unicoins.com", // Additional allowed URLs
];

exports.verifyPaystackPayment = functions.https.onRequest((req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    cors({ origin })(req, res, async () => {
      if (req.method === "OPTIONS") {
        res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.set("Access-Control-Allow-Origin", origin);
        res.status(204).send("");
        return;
      }

      const { reference, uid, amount, currency } = req.body;

      try {
        // Retrieve user email from Firestore
        const userSnapshot = await admin.firestore().doc(`users/${uid}`).get();
        if (!userSnapshot.exists) {
          return res
            .status(404)
            .json({ success: false, message: "User not found" });
        }
        const userEmail = userSnapshot.data().email;

        // Convert amount to the supported currency (e.g., NGN)
        const convertedAmount = convertToSupportedCurrency(amount, currency);

        // Verify transaction with Paystack
        const response = await axios.get(
          `https://api.paystack.co/transaction/verify/${reference}`,
          {
            headers: {
              Authorization: `Bearer sk_live_739e40b982cbfc90b37aad16687368aae0ef1f63`, // Use your Paystack secret key
              "Content-Type": "application/json",
            },
          }
        );

        const { status, data } = response.data;
        if (status && data.status === "success") {
          const userRef = admin.firestore().doc(`users/${uid}`);
          await userRef.update({
            balance: admin.firestore.FieldValue.increment(data.amount / 100),
          });

          const transactionRef = admin
            .firestore()
            .collection("transactions")
            .doc(reference);
          await transactionRef.set({
            userId: uid,
            amount: data.amount / 100,
            reference: data.reference,
            status: "success",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          res.set("Access-Control-Allow-Origin", origin);
          res.status(200).json({ success: true });
        } else {
          res.set("Access-Control-Allow-Origin", origin);
          res.status(400).json({
            success: false,
            message: "Transaction verification failed",
          });
        }
      } catch (error) {
        console.error("Error verifying transaction:", error.message);
        res.set("Access-Control-Allow-Origin", origin);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    });
  } else {
    res.status(403).send("Forbidden");
  }
});

function convertToSupportedCurrency(amount, currency) {
  const conversionRates = {
    USD: 400, // Example conversion rate for USD to NGN
    GHS: 60, // Example conversion rate for GHS to NGN
    // Add more currencies and their conversion rates to NGN here
  };

  return amount * conversionRates[currency];
}
