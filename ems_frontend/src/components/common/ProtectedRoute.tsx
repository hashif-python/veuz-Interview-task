import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

type Props = { children: React.ReactNode };

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { user, authReady } = useAuth();
  const location = useLocation();

  // Wait for auth restoration (prevents redirect on hard reload)
  if (!authReady) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
