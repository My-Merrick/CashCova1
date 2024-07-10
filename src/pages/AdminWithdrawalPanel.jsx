import { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const AdminWithdrawalPanel = () => {
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    fetchWithdrawalRequests();
  }, []);

  const fetchWithdrawalRequests = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const idTokenResult = await user.getIdTokenResult();
        if (idTokenResult.claims.admin) {
          const q = query(
            collection(db, "withdrawalRequests"),
            where("status", "==", "pending")
          );
          const querySnapshot = await getDocs(q);
          const requests = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setWithdrawalRequests(requests);
        } else {
          setError("You do not have permission to access this page.");
        }
      } else {
        setError("No user is logged in.");
      }
    } catch (error) {
      console.error("Error fetching withdrawal requests:", error);
      setError("Failed to fetch withdrawal requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId, userId, amount, phoneNumber) => {
    try {
      // Update status in withdrawalRequests collection
      await updateDoc(doc(db, "withdrawalRequests", requestId), {
        status: "approved",
        paidAt: new Date(), // Example: mark the time when paid
      });

      // Update user's withdrawal history in their document
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        withdrawalHistory: {
          id: requestId,
          amount: amount,
          status: "approved",
          approvedAt: new Date(),
          paidAt: new Date(), // Example: mark the time when paid
        },
      });

      // Notify the user that their withdrawal has been paid
      setSuccess(
        `Withdrawal request for GHS ${amount.toFixed(2)} approved and paid to mobile money account.`
      );
      fetchWithdrawalRequests(); // Refresh the list
      setTimeout(() => setSuccess(""), 5000); // Clear success message after 5 seconds
    } catch (error) {
      console.error("Error approving withdrawal:", error);
      setError("Failed to approve withdrawal request.");
    }
  };

  const handleReject = async (requestId) => {
    try {
      await updateDoc(doc(db, "withdrawalRequests", requestId), {
        status: "rejected",
      });
      setSuccess("Withdrawal request rejected successfully.");
      fetchWithdrawalRequests(); // Refresh the list
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      setError("Failed to reject withdrawal request.");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Admin Panel</h2>
      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}
      <div className="mt-8">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="w-full bg-gray-100">
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">
                User ID
              </th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">
                Amount
              </th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">
                Phone Number
              </th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">
                Date
              </th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {withdrawalRequests.map((request) => (
              <tr key={request.id} className="border-b border-gray-200">
                <td className="text-left py-3 px-4">{request.userId}</td>
                <td className="text-left py-3 px-4">
                  GHS {request.amount.toFixed(2)}
                </td>
                <td className="text-left py-3 px-4">{request.phoneNumber}</td>
                <td className="text-left py-3 px-4">
                  {request.createdAt.toDate().toLocaleString()}
                </td>
                <td className="text-left py-3 px-4">
                  <button
                    onClick={() =>
                      handleApprove(
                        request.id,
                        request.userId,
                        request.amount,
                        request.phoneNumber
                      )
                    }
                    className="text-green-600 hover:text-green-900 mr-2"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminWithdrawalPanel;
