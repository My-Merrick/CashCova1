import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore"; // Adjust imports based on your Firebase setup
import { auth } from "./../../firebase"; // Adjust the path as per your file structure
import BotCard from "./BotCard";

const InvestmentDashboard = () => {
  const [purchasedBots, setPurchasedBots] = useState([]);

  useEffect(() => {
    const fetchPurchasedBots = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          console.error("No user logged in");
          return;
        }

        console.log("User logged in:", user.uid);

        const db = getFirestore();
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const purchasedBotIds = userData.purchasedBots || [];

          const botDetailsPromises = purchasedBotIds.map(async (botId) => {
            const botDoc = await getDoc(doc(db, "bots", botId));
            if (botDoc.exists()) {
              return {
                id: botDoc.id,
                ...botDoc.data(),
              };
            } else {
              console.error(`Bot with ID ${botId} not found`);
              return null;
            }
          });

          const botDetails = await Promise.all(botDetailsPromises);
          console.log("Fetched bots:", botDetails);
          setPurchasedBots(botDetails.filter((bot) => bot !== null));
        } else {
          console.error("User document not found");
        }
      } catch (error) {
        console.error("Error fetching purchased bots:", error);
      }
    };

    fetchPurchasedBots();
  }, []);

  const handleStartStop = async (botId, isRunning) => {
    try {
      console.log("Toggling bot:", botId);
      // Implement your logic here to start or stop the bot
    } catch (error) {
      console.error("Error toggling bot:", error);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold text-center mb-8">Purchased Bot(s)</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {purchasedBots.length > 0 ? (
          purchasedBots.map((bot) => (
            <BotCard
              key={bot.id}
              bot={bot}
              onToggle={() => handleStartStop(bot.id, bot.isRunning)}
            />
          ))
        ) : (
          <p className="text-center">No purchased bots found.</p>
        )}
      </div>
    </div>
  );
};

export default InvestmentDashboard;
