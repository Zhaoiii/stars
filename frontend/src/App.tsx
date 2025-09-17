import React, { Suspense } from "react";
import { BrowserRouter as Router, useRoutes, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { AuthProvider } from "./contexts/AuthContext";
import { buildRouteObjects } from "./routes";

const AppRoutes: React.FC = () => {
  const routeObjects = buildRouteObjects();
  const element = useRoutes([
    // 根路径重定向
    { path: "/", element: <Navigate to="/users" replace /> },
    ...routeObjects,
    // 兜底重定向
    { path: "*", element: <Navigate to="/login" replace /> },
  ]);
  return element;
};

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <AuthProvider>
        <Router>
          <Suspense fallback={null}>
            <AppRoutes />
          </Suspense>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
