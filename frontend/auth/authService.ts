import { auth, googleProvider, API_BASE_URL } from "database/firebaseConfig";
import { signInWithPopup, signOut, User } from "firebase/auth";

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

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log("User signed out successfully");
  } catch (error) {
    console.error("Sign-out failed:", error);
  }
};

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
  
      credentials: "include", 
      body: JSON.stringify({ firstName, lastName, email, password }),
    });

    if (response.status === 401) {
      throw new Error("Unauthorized (401). Please check your credentials or log in again.");
    } else if (response.status === 403) {
      throw new Error("Forbidden (403). You do not have permission to do this.");
    }

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

export const loginUser = async (
  email: string,
  password: string
): Promise<{ userId: string } | null> => {
  if (!email || !password) {
    console.log("Error: Email and password are required.");
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
   
      credentials: "include",  
      body: JSON.stringify({ email, password }),
    });

    if (response.status === 401) {
      throw new Error("Unauthorized (401). Please check your login credentials.");
    } else if (response.status === 403) {
      throw new Error("Forbidden (403).");
    }

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
