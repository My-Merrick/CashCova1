import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase";

const TradeForm = () => {
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("buy");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "orders"), {
        amount: parseFloat(amount),
        price: parseFloat(price),
        type,
        timestamp: new Date(),
      });
      setAmount("");
      setPrice("");
    } catch (error) {
      console.error("Error adding order: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Place Order</h2>
      <div className="mb-4">
        <label className="block mb-2">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Price</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded"
        >
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
      </div>
      <button
        type="submit"
        className="w-full bg-secondary text-white py-2 rounded"
      >
        Place Order
      </button>
    </form>
  );
};

export default TradeForm;
