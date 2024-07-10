import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const OrderBook = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const orderData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(orderData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Order Book</h2>
      <div className="overflow-y-auto max-h-96">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex justify-between py-2 border-b border-gray-700"
          >
            <span>{order.price}</span>
            <span>{order.amount}</span>
            <span>{order.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderBook;
