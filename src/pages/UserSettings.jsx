// src/pages/UserSettings.jsx
import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const UserSettings = () => {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        setUsername(userDoc.data().username);
      }
    };
    fetchData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (user) {
      await updateProfile(user, { displayName: username });
      await updateDoc(doc(db, "users", user.uid), { username });
      navigate("/dashboard");
    }
  };

  return (
    <div className=" flex items-center justify-center bg-gray-100">
      <div className="bg-white p-2 rounded shadow-md w-96">
        <h1 className="text-2xl mb-4">Update Username</h1>
        <form onSubmit={handleUpdateProfile}>
          <div className="mb-4">
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <button
            className="w-full bg-blue-500 text-white p-2 rounded"
            type="submit"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserSettings;
