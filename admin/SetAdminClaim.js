import admin from "firebase-admin";
import serviceAccount from "./../admin/unicoins-55169-firebase-adminsdk-uwcut-262d220fce.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const setAdminCustomClaim = async (uid) => {
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`Successfully set admin claim for user: ${uid}`);
  } catch (error) {
    console.error("Error setting custom claims:", error);
  }
};

// Replace 'USER_UID_HERE' with the actual user UID
setAdminCustomClaim("ky7dIQCnNoSzoI8BzLKctQyE7BJ3");
