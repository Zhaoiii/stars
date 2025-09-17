import React from "react";
import { RouteObject } from "react-router-dom";
import HomePage from "../pages/HomePage";
import { UserManagement } from "../pages/UserManagement";
import TeamManagement from "../pages/TeamManagement/TeamManagement";
import StudentManagementPage from "../pages/StudentManagement/StudentManagementPage";
import LoginForm from "../pages/LoginForm";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";

// React Router 路由配置
export const routerConfig: RouteObject[] = [
  {
    path: "/login",
    element: <LoginForm />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "users",
        element: (
          <ProtectedRoute requireAdmin>
            <UserManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "teams",
        element: (
          <ProtectedRoute requireAdmin>
            <TeamManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "students",
        element: <StudentManagementPage />,
      },
    ],
  },
];

export default routerConfig;
