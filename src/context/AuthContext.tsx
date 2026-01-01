// ============================================================================
// AUTHENTICATION CONTEXT
// ============================================================================
// This context manages the user's authentication state throughout the application.
// It wraps the Firebase Auth SDK functions into a convenient React Context.

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
// Import Firebase Auth functions
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification as firebaseSendEmailVerification,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore"; // Import Firestore functions
// Import our initialized auth instance and db
import { auth, db } from "@/lib/firebase";

// 1. DEFINE CONTEXT SHAPE
// ----------------------------------------------------------------------------
interface AuthContextType {
  user: User | null;                          // The current logged-in user object (or null)
  login: (email: string, pass: string) => Promise<void>; // Function to log in
  register: (email: string, pass: string) => Promise<void>; // Function to create account
  loginWithGoogle: () => Promise<void>;       // Function for Google Sign-in
  sendEmailVerification: () => Promise<void>; // Function to send verification email
  logout: () => Promise<void>;                // Function to log out
  isLoading: boolean;                         // Loading state (true while checking auth status)
  isEmailVerified: boolean;                   // Helper boolean to check if email is verified
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize Google Provider
const googleProvider = new GoogleAuthProvider();

// 2. PROVIDER COMPONENT
// ----------------------------------------------------------------------------
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  // Start with loading = true. We don't know if the user is logged in until Firebase tells us.
  const [isLoading, setIsLoading] = useState(true);

  // 3. LISTEN FOR AUTH CHANGES
  // ----------------------------------------------------------------------------
  // This useEffect sets up a listener that runs whenever the user's sign-in state changes
  // (e.g. they login, logout, or the app refreshes and restores their session).
  useEffect(() => {
    // Enforce local persistence (keep user logged in even after browser close)
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          // Update our local state with the user object (or null)
          setUser(currentUser);

          // Leaderboard Fix: Ensure user document exists in Firestore
          if (currentUser) {
            try {
              const userDocRef = doc(db, "users", currentUser.uid);
              const userDoc = await getDoc(userDocRef);

              if (!userDoc.exists()) {
                // Generate a unique-ish username: @Name1234
                const baseName = (currentUser.displayName || currentUser.email?.split('@')[0] || 'User').replace(/\s+/g, '');
                const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
                const username = `@${baseName}${randomSuffix}`;

                await setDoc(userDocRef, {
                  email: currentUser.email,
                  displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
                  username: username, // New Unique Username
                  photoURL: currentUser.photoURL,
                  score: 0,
                  createdAt: new Date().toISOString(),
                  lastActive: new Date().toISOString()
                });
              } else if (!userDoc.data().username) {
                // If user exists but HAS NO username (legacy user), give them one
                const baseName = (currentUser.displayName || currentUser.email?.split('@')[0] || 'User').replace(/\s+/g, '');
                const randomSuffix = Math.floor(1000 + Math.random() * 9000);
                const username = `@${baseName}${randomSuffix}`;

                await setDoc(userDocRef, { username }, { merge: true });
              }
            } catch (error) {
              console.error("Error creating user profile:", error);
            }
          }

          // We know the auth status now, so stops loading
          setIsLoading(false);
        });
        // Clean up the listener when the component unmounts
        return () => unsubscribe();
      })
      .catch((error) => {
        console.error("Auth Persistence Error:", error);
        setIsLoading(false);
      });
  }, []);

  // 4. AUTH ACTION WRAPPERS
  // ----------------------------------------------------------------------------
  // We wrap Firebase functions to keep our UI components clean.

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const register = async (email: string, pass: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, pass);

    // Create User Profile in Firestore
    if (result.user) {
      try {
        const baseName = (result.user.email?.split('@')[0] || 'User').replace(/\s+/g, '');
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const username = `@${baseName}${randomSuffix}`;

        await setDoc(doc(db, "users", result.user.uid), {
          email: result.user.email,
          displayName: result.user.email?.split('@')[0] || 'User',
          username: username,
          score: 0,
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString()
        });
      } catch (e) {
        console.error("Error creating profile on register:", e);
      }

      // Automatically send a verification email when a new user registers
      await firebaseSendEmailVerification(result.user);
    }
  };

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const sendEmailVerification = async () => {
    if (user && !user.emailVerified) {
      await firebaseSendEmailVerification(user);
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const isEmailVerified = user?.emailVerified ?? false;

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      loginWithGoogle,
      sendEmailVerification,
      logout,
      isLoading,
      isEmailVerified
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// 5. CUSTOM HOOK
// ----------------------------------------------------------------------------
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
