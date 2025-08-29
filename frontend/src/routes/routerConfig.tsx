import React from "react";
import { RouteObject } from "react-router-dom";
import HomePage from "../pages/HomePage";
import UserManagementPage from "../pages/UserManagementPage";
import StudentManagementPage from "../pages/StudentManagement/StudentManagementPage";
import LoginForm from "../components/LoginForm";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import AssessmentToolsPage from "../pages/AssessmentAdmin/AssessmentTools/AssessmentToolsPage";
import ModulesPage from "../pages/AssessmentAdmin/Modules/ModulesPage";
import DomainsPage from "../pages/AssessmentAdmin/Domains/DomainsPage";
import StagesPage from "../pages/AssessmentAdmin/Stages/StagesPage";
import ItemsPage from "../pages/AssessmentAdmin/Items/ItemsPage";

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
      {
        path: "assessment/tools",
        element: <AssessmentToolsPage />,
      },
      {
        path: "assessment/modules",
        element: <ModulesPage />,
      },
      {
        path: "assessment/domains",
        element: <DomainsPage />,
      },
      {
        path: "assessment/stages",
        element: <StagesPage />,
      },
      {
        path: "assessment/items",
        element: <ItemsPage />,
      },
    ],
  },
];

export default routerConfig;
