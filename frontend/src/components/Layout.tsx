import React, { useState } from "react";
import {
  Layout as AntdLayout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  Typography,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { generateMenuItems } from "../routes";

const { Header, Sider, Content } = AntdLayout;
const { Title } = Typography;

const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 使用routes配置生成菜单项
  const menuItems = generateMenuItems(user?.role);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = (): void => {
    logout();
    navigate("/login");
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        个人资料
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  // 根据当前路径确定选中的菜单项
  const getSelectedKeys = () => {
    const path = location.pathname;
    // 如果是根路径，选中首页
    if (path === "/") {
      return ["/"];
    }
    // 返回当前路径
    return [path];
  };

  return (
    <AntdLayout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={200}
        style={{ background: "#001529" }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Title level={4} style={{ margin: 0, color: "white" }}>
            {collapsed ? "BA" : "BA System"}
          </Title>
        </div>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={getSelectedKeys()}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <AntdLayout>
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "white",
            padding: "0 24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
          <Dropdown overlay={userMenu} placement="bottomRight">
            <Space style={{ cursor: "pointer" }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.username}</span>
              <span style={{ color: "#666" }}>
                ({user?.role === "admin" ? "管理员" : "普通用户"})
              </span>
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: "24px",
            padding: 24,
            minHeight: 280,
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Outlet />
        </Content>
      </AntdLayout>
    </AntdLayout>
  );
};

export default Layout;
