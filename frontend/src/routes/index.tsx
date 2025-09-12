import React from "react";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { UserRole } from "../types/user";
import type { MenuProps } from "antd";

// 页面组件
import HomePage from "../pages/HomePage";
import UserManagementPage from "../pages/UserManagementPage";
import StudentManagementPage from "../pages/StudentManagement/StudentManagementPage";
import LoginForm from "../pages/LoginForm";
import ProtectedRoute from "../components/ProtectedRoute";
import Layout from "../components/Layout";
import TreeNodeManagement from "../pages/TreeNodeManagement";
import TreeConfig from "../pages/TreeNodeManagement/TreeConfig";
import EvaluationRecordManagement from "../pages/EvaluationRecordManagement";
import Editor from "../pages/Editor/Editor";
import GroupManagementPage from "../pages/GroupManagementPage";

// 路由配置接口
export interface AppRoute {
  path: string;
  element: React.ReactNode;
  children?: AppRoute[];
  index?: boolean;
  meta?: {
    title: string;
    icon?: React.ReactNode;
    requiresAuth?: boolean;
    requiredRole?: UserRole;
    showInMenu?: boolean;
    order?: number;
  };
}

// 菜单项接口 - 兼容 Ant Design Menu 组件
export type MenuItem = NonNullable<MenuProps["items"]>[0];

// 路由配置
export const routes: AppRoute[] = [
  {
    path: "/login",
    element: <LoginForm />,
    meta: {
      title: "登录",
      showInMenu: false,
    },
  },
  {
    path: "/",
    element: <Layout />,

    meta: {
      title: "仪表板",
      requiresAuth: true,
      showInMenu: false,
    },
    children: [
      {
        path: "/",
        index: true,
        element: (
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        ),
        meta: {
          title: "首页",
          icon: <UserOutlined />,
          requiresAuth: true,
          showInMenu: true,
          order: 1,
        },
      },
      {
        path: "/users",
        element: (
          <ProtectedRoute requireAdmin>
            <UserManagementPage />
          </ProtectedRoute>
        ),
        meta: {
          title: "用户管理",
          icon: <TeamOutlined />,
          requiresAuth: true,
          requiredRole: UserRole.ADMIN,
          showInMenu: true,
          order: 2,
        },
      },
      {
        path: "/groups",
        element: (
          <ProtectedRoute requireAdmin>
            <GroupManagementPage />
          </ProtectedRoute>
        ),
        meta: {
          title: "分组管理",
          icon: <TeamOutlined />,
          requiresAuth: true,
          requiredRole: UserRole.ADMIN,
          showInMenu: true,
          order: 3,
        },
      },
      {
        path: "/students",
        element: <StudentManagementPage />,
        meta: {
          title: "学生管理",
          icon: <BookOutlined />,
          requiresAuth: true,
          showInMenu: true,
          order: 4,
        },
      },
      {
        path: "/tree-node-management",
        element: <TreeNodeManagement />,
        meta: {
          title: "树节点管理",
          icon: <TeamOutlined />,
          showInMenu: true,
          requiresAuth: true,
          order: 5,
        },
      },
      {
        path: "/tree-node-management/config/:id",
        element: <TreeConfig />,
        meta: {
          title: "树节点管理",
          icon: <TeamOutlined />,
          requiresAuth: true,
        },
      },
      {
        path: "/evaluation-records",
        element: (
          <ProtectedRoute>
            <EvaluationRecordManagement />
          </ProtectedRoute>
        ),
        meta: {
          title: "评估记录管理",
          icon: <FileTextOutlined />,
          requiresAuth: true,
          showInMenu: true,
          order: 6,
        },
      },
      {
        path: "/editor",
        element: (
          <ProtectedRoute>
            <Editor />
          </ProtectedRoute>
        ),
        meta: {
          title: "富文本编辑器",
          icon: <FileTextOutlined />,
          requiresAuth: true,
          showInMenu: true,
          order: 7,
        },
      },
      {
        path: "/*",
        element: <div>404</div>,
        meta: {
          title: "404",
        },
      },
    ],
  },
];

// 生成菜单项
export const generateMenuItems = (userRole?: UserRole): MenuItem[] => {
  const dashboardRoute = routes.find((route) => route.path === "/");
  if (!dashboardRoute?.children) return [];

  return dashboardRoute.children
    .filter((route) => {
      if (!route.meta?.showInMenu) return false;
      if (route.meta?.requiredRole && userRole !== route.meta.requiredRole)
        return false;
      return true;
    })
    .sort((a, b) => (a.meta?.order || 0) - (b.meta?.order || 0))
    .map((route) => ({
      key: route.path,
      label: route.meta?.title || "",
      icon: route.meta?.icon,
      order: route.meta?.order,
    }));
};

// 根据路径获取路由信息
export const getRouteByPath = (path: string): AppRoute | undefined => {
  const findRoute = (
    routes: AppRoute[],
    targetPath: string
  ): AppRoute | undefined => {
    for (const route of routes) {
      if (route.path === targetPath) return route;
      if (route.children) {
        const found = findRoute(route.children, targetPath);
        if (found) return found;
      }
    }
    return undefined;
  };

  return findRoute(routes, path);
};

// 检查路由权限
export const checkRoutePermission = (
  path: string,
  userRole?: UserRole
): boolean => {
  const route = getRouteByPath(path);
  if (!route) return false;

  if (route.meta?.requiresAuth && !userRole) return false;
  if (route.meta?.requiredRole && userRole !== route.meta.requiredRole)
    return false;

  return true;
};

export default routes;
