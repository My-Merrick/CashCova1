import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { auth, db } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  query,
  where,
  collection,
  getDocs,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [referrerUsername, setReferrerUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const referralCodeFromUrl = queryParams.get("referralCode");
    if (referralCodeFromUrl) {
      setReferralCode(referralCodeFromUrl);
      fetchReferrerUsername(referralCodeFromUrl);
    }
  }, [location.search]);

  const generateRandomReferralCode = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const length = 6;
    let code = "";
    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  const fetchReferrerUsername = async (referrerReferralCode) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("referralCode", "==", referrerReferralCode)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const referrerDoc = querySnapshot.docs[0];
        setReferrerUsername(referrerDoc.data().username);
      } else {
        console.error("Invalid referral code or referrer not found");
      }
    } catch (error) {
      console.error("Error fetching referrer data:", error);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      console.log("Authenticated user ID:", user.uid);

      let referrerId = null;
      let referrerDoc = null;

      if (referralCode) {
        console.log("Referral code provided:", referralCode);
        const referrersRef = collection(db, "users");
        const q = query(
          referrersRef,
          where("referralCode", "==", referralCode)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          referrerDoc = querySnapshot.docs[0];
          referrerId = referrerDoc.id;
          console.log("Referrer found, referrer ID:", referrerId);
        } else {
          console.error("Invalid referral code or referrer not found");
          return; // Exit early if referral code is invalid
        }
      }

      // Generate a random referral code
      const generatedReferralCode = generateRandomReferralCode();

      // Create user document with generated referral code
      await setDoc(doc(db, "users", user.uid), {
        username,
        email,
        balance: 0,
        referralCode: generatedReferralCode,
        activated: false,
        referrer: referrerId,
      });

      console.log("User document created successfully");

      navigate("/dashboard");
    } catch (error) {
      console.error("Error during signup:", error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl mb-4">Signup</h1>
        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-2 border border-gray-300 rounded mt-1 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputAdornment
                position="end"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={togglePasswordVisibility}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">
              Referral Code (Optional)
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
            />
            {referrerUsername && (
              <p className="text-sm text-gray-500 mt-1">
                Referred by: {referrerUsername}
              </p>
            )}
          </div>
          <button
            className="w-full bg-blue-500 text-white p-2 rounded"
            type="submit"
          >
            Signup
          </button>
        </form>
        <div className="mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
