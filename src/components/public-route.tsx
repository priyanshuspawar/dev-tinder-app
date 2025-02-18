import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore";

const PublicRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // If authenticated, redirect to the dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, allow access to the public route
  return <Outlet />;
};

export default PublicRoute;
