import React from "react";
import { Card, Row, Col, Statistic, Typography, Space } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <Title level={2}>欢迎回来，{user?.username}！</Title>
      <Paragraph type="secondary">
        这是您的个人仪表板，您可以在这里查看系统概览和管理您的账户。
      </Paragraph>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="用户角色"
              value={user?.role === "admin" ? "管理员" : "普通用户"}
              prefix={<UserOutlined />}
              valueStyle={{
                color: user?.role === "admin" ? "#cf1322" : "#3f8600",
              }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="注册时间"
              value={
                user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("zh-CN")
                  : "未知"
              }
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="手机号"
              value={user?.phone || "未知"}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }}>
        <Title level={3}>系统信息</Title>
        <Paragraph>
          BA System
          是一个基于MERN技术栈构建的用户管理系统，支持用户注册、登录和权限管理。
        </Paragraph>
        <Paragraph>
          <strong>技术特性：</strong>
        </Paragraph>
        <ul>
          <li>基于JWT的身份验证</li>
          <li>角色基础的权限控制</li>
          <li>响应式用户界面</li>
          <li>TypeScript类型安全</li>
        </ul>
      </Card>
    </div>
  );
};

export default HomePage;

