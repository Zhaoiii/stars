import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { AuthProvider } from "./contexts/AuthContext";
import { routes } from "./routes/index";

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* 根路径重定向到登录 */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* 动态路由配置 */}
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
                children={route.children?.map((child) => (
                  <Route
                    key={child.path || "index"}
                    index={child?.index}
                    path={child.path}
                    element={child.element}
                  />
                ))}
              />
            ))}

            {/* 其他路径重定向到登录 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
