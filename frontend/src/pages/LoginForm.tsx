import React, { useState } from "react";
import { Form, Input, Button, Card, message, Tabs } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { LoginForm as LoginFormType } from "../types/user";
import { authService } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const { TabPane } = Tabs;

const LoginForm: React.FC = () => {
  const [loginLoading, setLoginLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onLogin = async (values: LoginFormType): Promise<void> => {
    try {
      setLoginLoading(true);
      const response = await authService.login(values);
      if (!response.success) throw new Error(response?.message);
      login(response.data!.token, response.data!.user);
      message.success("登录成功");
      navigate("/");
    } catch (error: any) {
      message.error(error.response?.data?.message || "登录失败");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f0f2f5",
      }}
    >
      <Card style={{ width: 400, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <h2 style={{ textAlign: "center", marginBottom: 24 }}>BA System</h2>

        <Tabs defaultActiveKey="login" centered>
          <TabPane tab="登录" key="login">
            <Form
              name="login"
              onFinish={onLogin}
              autoComplete="off"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: "请输入用户名" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="用户名" />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: "请输入密码" }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="密码" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loginLoading}
                  style={{ width: "100%" }}
                >
                  登录
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default LoginForm;
