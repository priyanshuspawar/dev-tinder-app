import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "@/store/authStore";

const PublicRoute = () => {
  // const queryClient = useQueryClient();
  // const user = queryClient.getQueryData(["user"]); // Get cached user data
  // If authenticated, redirect to the dashboard
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, allow access to the public route
  return <Outlet />;
};

export default PublicRoute;
