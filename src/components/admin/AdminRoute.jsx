import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAdmin } from "../../context/AdminContext";

const AdminRoute = ({ children }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const { isAdmin, isMainAdmin, loading: adminLoading } = useAdmin();

  if (authLoading || adminLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FFF5E1]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B0000]"></div>
      </div>
    );
  }

  // Strict check: Must be logged in AND have an admin role in Firestore
  if (!currentUser || (!isAdmin() && !isMainAdmin())) {
    return <Navigate to="/temple-management/login" />;
  }

  return children;
};

export default AdminRoute;
