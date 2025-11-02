// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Your Firebase auth instance
import { authService } from '../services/authService'; // Your Django API service

// 1. Create the Context
const AuthContext = createContext();

// 2. Create the Provider component
export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null); // Firebase auth user
  const [dbUser, setDbUser] = useState(null); // Your Django DB user (with role)
  const [loading, setLoading] = useState(true);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        // User is logged in to Firebase
        setFirebaseUser(user);
        
        // Get the Firebase ID token
        const token = await user.getIdToken();
        localStorage.setItem('firebaseIdToken', token); // Store token for apiClient

        try {
          // Fetch user data (and role) from your Django backend
          const djangoUser = await authService.getCurrentUser();
          setDbUser(djangoUser);
        } catch (error) {
          // This error (e.g., 404) likely means the user is
          // new and not yet synced to the Django DB.
          console.warn("User not found in Django DB. Needs sync.");
          setDbUser(null);
        }
      } else {
        // User is logged out
        setFirebaseUser(null);
        setDbUser(null);
        localStorage.removeItem('firebaseIdToken');
      }
      setLoading(false);
    });

    return unsubscribe; // Cleanup on unmount
  }, []);

  // --- Auth Functions ---

  const login = async (email, password) => {
    // This logs in with Firebase. The useEffect listener
    // will handle fetching the Django user data.
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email, password, role, firstName, lastName) => {
    try {
      // Validate password length (Firebase requires at least 6 characters)
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Validate email format
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // 1. Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Get token and store it (so apiClient can use it)
      const token = await user.getIdToken();
      localStorage.setItem('firebaseIdToken', token);

      // 3. Sync user to your Django DB and set role
      const userData = { role, first_name: firstName, last_name: lastName };
      const djangoUser = await authService.syncUser(userData);

      // 4. Update local state
      setFirebaseUser(user);
      setDbUser(djangoUser);
      
      return userCredential;
    } catch (error) {
      // Handle Firebase Auth errors with user-friendly messages
      let errorMessage = error.message;
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please use a different email or try logging in.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/operation-not-allowed' || error.code === 'auth/configuration-not-found') {
        errorMessage = 'Email/Password authentication is not enabled in Firebase Console. Please enable it: 1) Go to Firebase Console → Authentication → Sign-in method → Email/Password → Enable → Save';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password (at least 6 characters).';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid request. Please check that Email/Password authentication is enabled in Firebase Console.';
      }
      
      console.error('Registration error:', error.code || error.message, error);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    await signOut(auth);
    // The useEffect listener will handle clearing state
  };

  // Function to refresh user data from backend
  const refreshUser = async () => {
    if (firebaseUser) {
      try {
        const djangoUser = await authService.getCurrentUser();
        setDbUser(djangoUser);
        return djangoUser;
      } catch (error) {
        console.error("Error refreshing user data:", error);
        throw error;
      }
    }
    return null;
  };

  // The value provided to consuming components
  const value = {
    firebaseUser,   // The user from Firebase (has email, uid, etc.)
    dbUser,         // The user from your DB (has role, name, etc.)
    setDbUser,      // Function to update dbUser (useful for profile updates)
    loading,        // True while auth state is being determined
    login,
    register,
    logout,
    refreshUser,    // Function to refresh user data from backend
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// 3. Create a custom hook for easy consumption
export function useAuth() {
  return useContext(AuthContext);
}