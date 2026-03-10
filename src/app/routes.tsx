import React from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { PageTransitionLayout } from "./components/PageTransitionLayout";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { KnowledgePage } from "./pages/KnowledgePage";
import { GamesPage } from "./pages/GamesPage";
import { QuizPage } from "./pages/QuizPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ProfilePage } from "./pages/ProfilePage";
import { useAuth } from "./contexts/AuthContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={user?.role === "admin" ? "/admin" : "/knowledge"} replace />;
  }

  return <>{children}</>;
}

function RootPage() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={user?.role === "admin" ? "/admin" : "/knowledge"} replace />;
  }

  return <LandingPage />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PageTransitionLayout />,
    children: [
      {
        index: true,
        Component: RootPage,
      },
      {
        path: "landing",
        element: <Navigate to="/" replace />,
      },
      {
        path: "login",
        element: (
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: "register",
        element: (
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: "knowledge",
        element: (
          <ProtectedRoute>
            <KnowledgePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "games",
        element: (
          <ProtectedRoute>
            <GamesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "quiz",
        element: (
          <ProtectedRoute>
            <QuizPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
