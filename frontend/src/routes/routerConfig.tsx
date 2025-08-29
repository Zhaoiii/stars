import React from "react";
import { RouteObject } from "react-router-dom";
import HomePage from "../pages/HomePage";
import UserManagementPage from "../pages/UserManagementPage";
import StudentManagementPage from "../pages/StudentManagement/StudentManagementPage";
import LoginForm from "../components/LoginForm";
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
            <UserManagementPage />
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
