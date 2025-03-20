import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "@/store/authStore";

const ProtectedRoute = () => {
  // const { data: user } = useQuery(userQueryOptions); // Get cached user data
  const { isAuthenticated } = useAuthStore();
  // If not authenticated, redirect to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
