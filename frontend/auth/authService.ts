import { auth, googleProvider } from "database/firebaseConfig";
import { signInWithPopup, signOut, User } from "firebase/auth";

//Google Sign-In Function
export const googleSignIn = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Google Sign-In successful:", result.user);
    return result.user;
  } catch (error) {
    console.error("Google Sign-In failed:", error);
    return null;
  }
};

//Sign-Out Function
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log("User signed out successfully");
  } catch (error) {
    console.error("Sign-out failed:", error);
  }
};