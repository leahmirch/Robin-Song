import { auth, googleProvider, API_BASE_URL } from "database/firebaseConfig";
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

// Sign-Out Function
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log("User signed out successfully");
  } catch (error) {
    console.error("Sign-out failed:", error);
  }
};

// Register User with Email & Password
export const registerUser = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<{ userId: string } | null> => {
  try {
    console.log("Sending registration request...");

    const response = await fetch(`${API_BASE_URL}/register`, {  
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.log("Registration failed:", data.error || "Unknown error");
      throw new Error(data.error || "Registration failed");
    }

    console.log("User registered successfully:", data);
    return data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};


// Login User with Email & Password
export const loginUser = async (email: string, password: string): Promise<{ userId: string } | null> => {
  if (!email || !password) {
    console.log("Error: Email and password are required.");
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.log("Login failed:", data.error || "Unknown error");
      throw new Error(data.error || "Login failed");
    }

    console.log("Login successful:", data);
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};
