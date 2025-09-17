import React from "react";
import { Card, Row, Col, Statistic, Typography, Space } from "antd";
import { UserOutlined, TeamOutlined, BookOutlined } from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../types/user";

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <Title level={2}>欢迎使用 BA System</Title>
      <Paragraph style={{ color: "#666", marginBottom: 32 }}>
        这是一个基于 MERN 技术栈的用户和学生管理系统
      </Paragraph>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="当前用户"
              value={user?.username || "未知"}
              prefix={<UserOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <span style={{ color: "#666" }}>
                角色: {user?.role === UserRole.ADMIN ? "管理员" : "普通用户"}
              </span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="用户管理"
              value="已启用"
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
            <div style={{ marginTop: 8 }}>
              <span style={{ color: "#666" }}>
                {user?.role === UserRole.ADMIN
                  ? "可以管理所有用户"
                  : "仅查看权限"}
              </span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="学生管理"
              value="已启用"
              prefix={<BookOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
            <div style={{ marginTop: 8 }}>
              <span style={{ color: "#666" }}>
                {user?.role === UserRole.ADMIN
                  ? "可以管理所有学生"
                  : "仅查看权限"}
              </span>
            </div>
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }}>
        <Title level={3}>系统功能</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <h4>🔐 用户认证</h4>
            <ul>
              <li>安全的登录/注册系统</li>
              <li>JWT 令牌认证</li>
              <li>基于角色的权限控制</li>
            </ul>
          </Col>
          <Col xs={24} md={12}>
            <h4>👥 用户管理</h4>
            <ul>
              <li>完整的用户 CRUD 操作</li>
              <li>角色分配和管理</li>
              <li>用户信息维护</li>
            </ul>
          </Col>
          <Col xs={24} md={12}>
            <h4>🎓 学生管理</h4>
            <ul>
              <li>学生信息管理</li>
              <li>高级搜索功能</li>
              <li>数据统计和分析</li>
            </ul>
          </Col>
          <Col xs={24} md={12}>
            <h4>🛡️ 安全特性</h4>
            <ul>
              <li>密码加密存储</li>
              <li>输入验证和清理</li>
              <li>错误处理和日志</li>
            </ul>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default HomePage;
