import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Button, Space, Row, Col } from "antd";
import {
  User,
  CreateUserForm,
  UpdateUserForm,
  UserRole,
  Team,
} from "../../../types/user";
import { teamService } from "../../../services/teamService";

const { Option } = Select;

interface FormModalProps {
  visible: boolean;
  mode: "create" | "edit";
  user?: User | null;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateUserForm | UpdateUserForm) => Promise<void>;
}

const FormModal: React.FC<FormModalProps> = ({
  visible,
  mode,
  user,
  loading = false,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);

  // 加载团队列表
  const loadTeams = async () => {
    setTeamsLoading(true);
    try {
      const teamsData = await teamService.getAllTeams();
      setTeams(teamsData);
    } catch (error) {
      console.error("加载团队列表失败:", error);
    } finally {
      setTeamsLoading(false);
    }
  };

  useEffect(() => {
    if (visible && mode === "edit" && user) {
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        teamId: user.teamId,
      });
    } else if (visible && mode === "create") {
      form.resetFields();
    }

    if (visible) {
      loadTeams();
    }
  }, [visible, mode, user, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error("表单验证失败:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // 处理角色变化
  const handleRoleChange = (role: UserRole) => {
    if (role === UserRole.ADMIN) {
      form.setFieldsValue({ teamId: undefined });
    }
  };

  const isEditMode = mode === "edit";

  return (
    <Modal
      title={isEditMode ? "编辑用户" : "创建用户"}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="username"
              label="用户名"
              rules={[
                { required: true, message: "请输入用户名" },
                { min: 2, max: 50, message: "用户名长度必须在2-50个字符之间" },
                {
                  pattern: /^[a-zA-Z0-9_]+$/,
                  message: "用户名只能包含字母、数字和下划线",
                },
              ]}
            >
              <Input placeholder="请输入用户名" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: "请输入邮箱" },
                {
                  type: "email",
                  message: "请输入有效的邮箱地址",
                },
              ]}
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="name"
              label="姓名"
              rules={[{ max: 50, message: "姓名不能超过50个字符" }]}
            >
              <Input placeholder="请输入姓名" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="手机号"
              rules={[
                {
                  pattern: /^1[3-9]\d{9}$/,
                  message: "请输入有效的手机号",
                },
              ]}
            >
              <Input placeholder="请输入手机号" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="role"
              label="用户角色"
              rules={[{ required: true, message: "请选择用户角色" }]}
            >
              <Select placeholder="请选择用户角色" onChange={handleRoleChange}>
                <Option value={UserRole.ADMIN}>管理员</Option>
                <Option value={UserRole.MANAGER_TEACHER}>管理教师</Option>
                <Option value={UserRole.TEACHER}>普通教师</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="teamId"
              label="所属团队"
              rules={[
                {
                  required:
                    form.getFieldValue("role") === UserRole.TEACHER ||
                    form.getFieldValue("role") === UserRole.MANAGER_TEACHER,
                  message: "教师必须选择所属团队",
                },
              ]}
            >
              <Select
                placeholder="请选择所属团队"
                allowClear
                loading={teamsLoading}
                disabled={form.getFieldValue("role") === UserRole.ADMIN}
              >
                {teams.map((team) => (
                  <Option key={team.id} value={team.id}>
                    {team.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {!isEditMode && (
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: "请输入密码" },
              { min: 6, message: "密码长度至少6个字符" },
            ]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
        )}

        {isEditMode && (
          <Form.Item
            name="password"
            label="新密码"
            rules={[
              { min: 6, message: "密码长度至少6个字符" },
              {
                pattern: /^(?=.*[a-zA-Z])(?=.*\d)/,
                message: "密码必须包含字母和数字",
              },
            ]}
          >
            <Input.Password placeholder="留空则不修改密码" />
          </Form.Item>
        )}

        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
          <Space>
            <Button onClick={handleCancel}>取消</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEditMode ? "更新用户" : "创建用户"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FormModal;
