import { useState } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";

const StakingComponent = () => {
  const [amount, setAmount] = useState("");

  const handleStake = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      if (userData.balance >= parseFloat(amount)) {
        await updateDoc(userRef, {
          balance: userData.balance - parseFloat(amount),
          stakedAmount: (userData.stakedAmount || 0) + parseFloat(amount),
        });
        setAmount("");
      } else {
        alert("Insufficient balance");
      }
    } catch (error) {
      console.error("Error staking: ", error);
    }
  };

  return (
    <form onSubmit={handleStake} className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Stake Your Crypto</h2>
      <div className="mb-4">
        <label className="block mb-2">Amount to Stake</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-secondary text-white py-2 rounded"
      >
        Stake
      </button>
    </form>
  );
};

export default StakingComponent;
