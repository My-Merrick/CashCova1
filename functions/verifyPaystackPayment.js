const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors");

admin.initializeApp();

const allowedOrigins = [
  "http://localhost:5179",
  "http://localhost:5173",
  "https://unicoins-55169.web.app",
  "https://unicoins-55169.firebaseapp.com",
  "https://unicoins.com",
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
      console.log("Received request with data:", {
        reference,
        uid,
        amount,
        currency,
      });

      try {
        // Verify payment with Paystack API
        const response = await axios.get(
          `https://api.paystack.co/transaction/verify/${reference}`,
          {
            headers: {
              Authorization: `Bearer YOUR_PAYSTACK_SECRET_KEY`,
            },
          }
        );

        console.log("Paystack response data:", response.data);

        if (response.data.data.status === "success") {
          const userRef = admin.firestore().doc(`users/${uid}`);
          await userRef.update({
            balance: admin.firestore.FieldValue.increment(
              response.data.data.amount / 100
            ),
          });

          const transactionRef = admin
            .firestore()
            .doc(`transactions/${reference}`);
          await transactionRef.set({
            userId: uid,
            amount: response.data.data.amount / 100,
            reference: response.data.data.reference,
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
        console.error("Error verifying transaction:", error);
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
