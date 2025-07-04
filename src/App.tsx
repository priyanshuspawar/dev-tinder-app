// App.tsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/protected-route";
import Home from "./pages/home";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import DashboardLayout from "./pages/layouts/dashboardLayout";
import NotFound from "./pages/not-fount";
import Login from "./pages/login";
import PublicRoute from "./components/public-route";
import { Suspense } from "react";
import ProfileView from "./pages/profile-view";
import ProfileEdit from "./pages/profile-edit";
import DocsPage from "./pages/about";
import { Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import RequestReview from "./pages/request-review";
import { userQueryOptions } from "./queries/profile";
import ConnectionProfileView from "./pages/connection-profile-view";
import { useMediaQuery } from "usehooks-ts";
import Chat from "./pages/chat";
import ConnectionsPage from "./pages/connectionsPage";
const App = () => {
  // Queries
  const { isLoading } = useQuery(userQueryOptions);
  const isBottomNavActive = useMediaQuery("(max-width: 895px)");
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<DocsPage />} />
        </Route>
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route
              path="connection/profile/:id"
              element={<ConnectionProfileView />}
            />
            <Route path="chat/:connectionId" element={<Chat />} />
            {isBottomNavActive && (
              <Route path="connections" element={<ConnectionsPage />} />
            )}
            {isBottomNavActive && (
              <Route path="connections/review" element={<RequestReview />} />
            )}
            <Route path="profile" element={<ProfileView />} />
            <Route path="profile/edit" element={<ProfileEdit />} />
          </Route>
          {/* Add more protected routes here */}
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
