 
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
 
const auth = getAuth();
 
export async function verifyAdmin(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Signed in
    const user = userCredential.user;
    // You can add additional checks here, e.g., check if user has admin role in Firestore
    return true;
  } catch (error) {
    console.error("Error in verifyAdmin:", error);
    return false;
  }
}
 
// Remove Firestore admins collection functions as no longer needed
 
 