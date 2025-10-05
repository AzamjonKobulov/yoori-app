import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="fixed inset-0 size-screen z-50 flex-center bg-base-chart-3 bg-auth bg-no-repeat bg-center bg-cover">
        <div className="flex flex-col items-center gap-6">
          <img src="/assets/images/logo.svg" alt="Logo" />
          <div className="w-96 text-sm/3.5 bg-white border border-base-border rounded-lg p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-base-chart-1"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect to home page if already authenticated
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
