import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { getAdminByUid, getDonorByUid } from "../lib/firestoreService";

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null); // 'admin' or 'donor'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true); // Prevent race condition in AdminRoute
        setCurrentUser(user);

        try {
          // Check if user is admin
          const admin = await getAdminByUid(user.uid);
          if (admin) {
            setAdminData(admin);
            setUserType("admin");
          } else {
            // Check if user is donor
            const donor = await getDonorByUid(user.uid);
            if (donor) {
              setAdminData(donor);
              setUserType("donor");
            } else {
              setAdminData(null);
              setUserType(null);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setAdminData(null);
          setUserType(null);
        } finally {
          setLoading(false);
        }
      } else {
        setCurrentUser(null);
        setAdminData(null);
        setUserType(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission) => {
    if (!adminData || userType !== "admin") return false;

    // Main admin has all permissions
    if (adminData.role === "main" || adminData.role === "main_admin")
      return true;

    // Check specific permission for sub-admin
    return adminData.permissions?.[permission] === true;
  };

  /**
   * Check if user is main admin
   */
  const isMainAdmin = () => {
    return adminData?.role === "main" || adminData?.role === "main_admin";
  };

  /**
   * Check if user is any type of admin
   */
  const isAdmin = () => {
    return userType === "admin";
  };

  /**
   * Check if user is donor
   */
  const isDonor = () => {
    return userType === "donor";
  };

  const value = {
    currentUser,
    adminData,
    loading,
    userType,
    hasPermission,
    isMainAdmin,
    isAdmin,
    isDonor,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

export default AdminContext;
