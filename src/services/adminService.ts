import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
 
const auth = getAuth();
const db = getFirestore();
 
export async function verifyAdmin(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
 
    // Query Firestore admins collection to verify admin existence and active status
    const adminsRef = collection(db, "admins");
    const q = query(adminsRef, where("uid", "==", user.uid), where("active", "==", true));
    const querySnapshot = await getDocs(q);
 
    if (!querySnapshot.empty) {
      return true;
    } else {
      // Admin not found or not active
      return false;
    }
  } catch (error) {
    console.error("Error in verifyAdmin:", error);
    return false;
  }
}