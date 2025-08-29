import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Select,
  message,
  Popconfirm,
  Tag,
  Form,
  Input,
  Typography,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import api from "../services/api";
import { User, UserRole } from "../types/user";

const { Option } = Select;
const { confirm } = Modal;
const { Title } = Typography;

interface UserFormData {
  username: string;
  phone: string;
  password?: string;
  role: UserRole;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      setUsers(response.data.users);
    } catch (error: any) {
      message.error("获取用户列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (values: UserFormData): Promise<void> => {
    try {
      await api.post("/users", values);
      message.success("用户创建成功");
      fetchUsers();
      setCreateModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.message || "创建用户失败");
    }
  };

  const handleEditUser = async (values: UserFormData): Promise<void> => {
    try {
      if (!editingUser) return;

      const updateData = { ...values };
      if (!updateData.password) {
        delete updateData.password;
      }

      await api.put(`/users/${editingUser._id}`, updateData);
      message.success("用户信息更新成功");
      fetchUsers();
      setEditModalVisible(false);
      setEditingUser(null);
      form.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.message || "更新用户信息失败");
    }
  };

  const handleDeleteUser = async (userId: string): Promise<void> => {
    try {
      await api.delete(`/users/${userId}`);
      message.success("用户删除成功");
      fetchUsers();
    } catch (error: any) {
      message.error("删除用户失败");
    }
  };

  const showDeleteConfirm = (userId: string, username: string): void => {
    confirm({
      title: "确认删除",
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除用户 "${username}" 吗？此操作不可恢复。`,
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      onOk: () => handleDeleteUser(userId),
    });
  };

  const openCreateModal = (): void => {
    setCreateModalVisible(true);
    form.resetFields();
  };

  const openEditModal = (user: User): void => {
    setEditingUser(user);
    setEditModalVisible(true);
    form.setFieldsValue({
      username: user.username,
      phone: user.phone,
      role: user.role,
    });
  };

  const openViewModal = (user: User): void => {
    setViewUser(user);
    setViewModalVisible(true);
  };

  const columns = [
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "手机号",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      render: (role: UserRole) => (
        <Tag color={role === UserRole.ADMIN ? "red" : "blue"}>
          {role === UserRole.ADMIN ? "管理员" : "普通用户"}
        </Tag>
      ),
    },
    {
      title: "注册时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString("zh-CN"),
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => openViewModal(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => showDeleteConfirm(record._id, record.username)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Title level={2}>用户管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateModal}
        >
          创建用户
        </Button>
      </div>

      <p style={{ color: "#666", marginBottom: 24 }}>
        在这里您可以管理所有用户，包括创建、查看、编辑用户信息和删除用户。
      </p>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />

      {/* 创建用户模态框 */}
      <Modal
        title="创建用户"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateUser}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: "请输入用户名" },
              { min: 2, max: 50, message: "用户名长度必须在2-50个字符之间" },
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: "请输入手机号" },
              { pattern: /^1[3-9]\d{9}$/, message: "请输入有效的手机号" },
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>

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

          <Form.Item
            name="role"
            label="用户角色"
            rules={[{ required: true, message: "请选择用户角色" }]}
          >
            <Select placeholder="请选择用户角色">
              <Option value={UserRole.USER}>普通用户</Option>
              <Option value={UserRole.ADMIN}>管理员</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                创建用户
              </Button>
              <Button onClick={() => setCreateModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑用户模态框 */}
      <Modal
        title="编辑用户"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingUser(null);
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleEditUser}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: "请输入用户名" },
              { min: 2, max: 50, message: "用户名长度必须在2-50个字符之间" },
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: "请输入手机号" },
              { pattern: /^1[3-9]\d{9}$/, message: "请输入有效的手机号" },
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ min: 6, message: "密码长度至少6个字符" }]}
          >
            <Input.Password placeholder="留空则不修改密码" />
          </Form.Item>

          <Form.Item
            name="role"
            label="用户角色"
            rules={[{ required: true, message: "请选择用户角色" }]}
          >
            <Select placeholder="请选择用户角色">
              <Option value={UserRole.USER}>普通用户</Option>
              <Option value={UserRole.ADMIN}>管理员</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                更新用户
              </Button>
              <Button
                onClick={() => {
                  setEditModalVisible(false);
                  setEditingUser(null);
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看用户信息模态框 */}
      <Modal
        title="用户详情"
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setViewUser(null);
        }}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={500}
      >
        {viewUser && (
          <div>
            <p>
              <strong>用户名:</strong> {viewUser.username}
            </p>
            <p>
              <strong>手机号:</strong> {viewUser.phone}
            </p>
            <p>
              <strong>角色:</strong>
              <Tag
                color={viewUser.role === UserRole.ADMIN ? "red" : "blue"}
                style={{ marginLeft: 8 }}
              >
                {viewUser.role === UserRole.ADMIN ? "管理员" : "普通用户"}
              </Tag>
            </p>
            <p>
              <strong>注册时间:</strong>{" "}
              {new Date(viewUser.createdAt).toLocaleString("zh-CN")}
            </p>
            <p>
              <strong>最后更新:</strong>{" "}
              {new Date(viewUser.updatedAt).toLocaleString("zh-CN")}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;
