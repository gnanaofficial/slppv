import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const DonorContext = createContext();

export const useDonor = () => {
  const context = useContext(DonorContext);
  if (!context) {
    throw new Error("useDonor must be used within a DonorProvider");
  }
  return context;
};

export const DonorProvider = ({ children }) => {
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is a donor
        try {
          const donorQuery = query(
            collection(db, "donors"),
            where("uid", "==", user.uid),
          );
          const donorSnapshot = await getDocs(donorQuery);

          if (!donorSnapshot.empty) {
            const donorData = {
              id: donorSnapshot.docs[0].id,
              ...donorSnapshot.docs[0].data(),
            };
            setDonor(donorData);
          } else {
            setDonor(null);
          }
        } catch (err) {
          console.error("Error fetching donor data:", err);
          setError(err.message);
          setDonor(null);
        }
      } else {
        setDonor(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Verify user is a donor
      const donorQuery = query(
        collection(db, "donors"),
        where("uid", "==", userCredential.user.uid),
      );
      const donorSnapshot = await getDocs(donorQuery);

      if (donorSnapshot.empty) {
        await signOut(auth);
        throw new Error(
          "This account is not registered as a donor. Please contact the admin.",
        );
      }

      const donorData = {
        id: donorSnapshot.docs[0].id,
        ...donorSnapshot.docs[0].data(),
      };
      setDonor(donorData);
      return { success: true };
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setDonor(null);
      setError(null);
      return { success: true };
    } catch (err) {
      console.error("Logout error:", err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (err) {
      console.error("Password reset error:", err);
      return { success: false, error: err.message };
    }
  };

  const refreshDonorData = async () => {
    if (!donor?.id) return;

    try {
      const donorDoc = await getDoc(doc(db, "donors", donor.id));
      if (donorDoc.exists()) {
        setDonor({ id: donorDoc.id, ...donorDoc.data() });
      }
    } catch (err) {
      console.error("Error refreshing donor data:", err);
    }
  };

  const value = {
    donor,
    loading,
    error,
    login,
    logout,
    resetPassword,
    refreshDonorData,
    isAuthenticated: !!donor,
  };

  return (
    <DonorContext.Provider value={value}>{children}</DonorContext.Provider>
  );
};
