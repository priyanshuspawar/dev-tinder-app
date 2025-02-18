// App.tsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/protected-route";
import Home from "./pages/home";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import NotFound from "./pages/not-fount";
import Login from "./pages/login";
import PublicRoute from "./components/public-route";
import { Suspense, useEffect } from "react";
import useAuthStore from "./store/authStore";

const App = () => {
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);
  const isLoading = useAuthStore((state) => state.isAppLoading);
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Route>
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Add more protected routes here */}
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
