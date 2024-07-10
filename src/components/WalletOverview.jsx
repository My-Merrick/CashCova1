import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { motion } from "framer-motion";

const WalletOverview = () => {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
      if (doc.exists()) {
        setWalletData(doc.data());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="text-center">Loading wallet data...</div>;
  }

  if (!walletData) {
    return <div className="text-center">No wallet data available.</div>;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-6 rounded-lg shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-6">Transaction Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">Balance</h3>
            <p className="text-3xl font-bold text-secondary">
              GHS {walletData.balance.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(walletData.portfolio || {}).map(
              ([coin, amount]) => (
                <div key={coin} className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold">{coin}</h4>
                  <p>
                    {amount} {coin}
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-2">Type</th>
                  <th className="p-2">Symbol</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Profit/Loss</th>
                  <th className="p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {(walletData.recentTransactions || []).map(
                  (transaction, index) => (
                    <tr key={index} className="border-b border-gray-700">
                      <td className="p-2">{transaction.type}</td>
                      <td className="p-2">{transaction.symbol}</td>
                      <td className="p-2">${transaction.amount.toFixed(2)}</td>
                      <td
                        className="p-2"
                        style={{
                          color: transaction.profit >= 0 ? "green" : "red",
                        }}
                      >
                        ${transaction.profit.toFixed(2)}
                      </td>
                      <td className="p-2">
                        {transaction.date.toDate().toLocaleString()}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default WalletOverview;
