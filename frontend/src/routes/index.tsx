import React, { lazy, Suspense } from "react";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { UserRole } from "../types/user";
import type { MenuProps } from "antd";
import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Layout from "../components/Layout";

// 懒加载页面组件
const HomePage = lazy(() => import("../pages/HomePage"));
const UserManagement = lazy(
  () => import("../pages/UserManagement/UserManagement")
);
const TeamManagement = lazy(
  () => import("../pages/TeamManagement/TeamManagement")
);
const StudentManagementPage = lazy(
  () => import("../pages/StudentManagement/StudentManagementPage")
);
const LoginForm = lazy(() => import("../pages/LoginForm"));
const AssessmentConfig = lazy(
  () => import("@/pages/AssessmentConfig/AssessmentConfig")
);

// 路由配置接口
export interface AppRoute {
  path: string;
  element: React.ReactNode;
  children?: AppRoute[];
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
    element: (
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    ),
    meta: { title: "登录", showInMenu: false },
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    meta: { title: "仪表板", requiresAuth: true, showInMenu: false },
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={null}>
            <HomePage />
          </Suspense>
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
            <Suspense fallback={null}>
              <UserManagement />
            </Suspense>
          </ProtectedRoute>
        ),
        meta: {
          title: "用户管理",
          icon: <UserOutlined />,
          requiresAuth: true,
          requiredRole: UserRole.ADMIN,
          showInMenu: true,
          order: 2,
        },
      },
      {
        path: "/teams",
        element: (
          <ProtectedRoute requireAdmin>
            <Suspense fallback={null}>
              <TeamManagement />
            </Suspense>
          </ProtectedRoute>
        ),
        meta: {
          title: "团队管理",
          icon: <TeamOutlined />,
          requiresAuth: true,
          requiredRole: UserRole.MANAGER_TEACHER,
          showInMenu: true,
          order: 3,
        },
      },
      {
        path: "/students",
        element: (
          <Suspense fallback={null}>
            <StudentManagementPage />
          </Suspense>
        ),
        meta: {
          title: "学生管理",
          icon: <BookOutlined />,
          requiresAuth: true,
          requiredRole: UserRole.TEACHER,
          showInMenu: true,
          order: 4,
        },
      },
      {
        path: "/assessment",
        element: (
          <ProtectedRoute requireAdmin>
            <Suspense fallback={null}>
              <AssessmentConfig />
            </Suspense>
          </ProtectedRoute>
        ),
        meta: {
          title: "评估配置",
          icon: <ToolOutlined />,
          requiresAuth: true,
          requiredRole: UserRole.TEACHER,
          showInMenu: true,
          order: 5,
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
      if (route.meta?.requiredRole) {
        // 管理员可以看到所有页面
        if (userRole === UserRole.ADMIN) return true;
        // 管理教师可以看到团队管理和学生管理
        if (
          userRole === UserRole.MANAGER_TEACHER &&
          (route.meta.requiredRole === UserRole.MANAGER_TEACHER ||
            route.meta.requiredRole === UserRole.TEACHER)
        )
          return true;
        // 普通教师只能看到学生管理
        if (
          userRole === UserRole.TEACHER &&
          route.meta.requiredRole === UserRole.TEACHER
        )
          return true;
        return false;
      }
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
  if (route.meta?.requiredRole) {
    // 管理员可以看到所有页面
    if (userRole === UserRole.ADMIN) return true;
    // 管理教师可以看到团队管理和学生管理
    if (
      userRole === UserRole.MANAGER_TEACHER &&
      (route.meta.requiredRole === UserRole.MANAGER_TEACHER ||
        route.meta.requiredRole === UserRole.TEACHER)
    )
      return true;
    // 普通教师只能看到学生管理
    if (
      userRole === UserRole.TEACHER &&
      route.meta.requiredRole === UserRole.TEACHER
    )
      return true;
    return false;
  }

  return true;
};

export default routes;

// 将自定义路由结构转换为 React Router 的 RouteObject
export const buildRouteObjects = (): RouteObject[] => {
  const transform = (route: AppRoute): RouteObject => ({
    path: route.path,
    element: route.element,
    children: route.children?.map(transform),
  });

  return routes.map(transform);
};
