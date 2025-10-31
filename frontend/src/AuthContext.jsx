import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { authService } from '../services/authService';

const AuthContext = createContext();


export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
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
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const token = await user.getIdToken();
    localStorage.setItem('firebaseIdToken', token);

    const userData = { role, first_name: firstName, last_name: lastName };
    const djangoUser = await authService.syncUser(userData);

    setFirebaseUser(user);
    setDbUser(djangoUser);
    
    return userCredential;
  };

  const logout = async () => {
    await signOut(auth);
    // The useEffect listener will handle clearing state
  };

  // The value provided to consuming components
  const value = {
    firebaseUser,   // The user from Firebase (has email, uid, etc.)
    dbUser,         // The user from your DB (has role, name, etc.)
    loading,        // True while auth state is being determined
    login,
    register,
    logout,
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