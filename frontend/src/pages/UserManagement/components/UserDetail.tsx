import React from "react";
import { Modal, Descriptions, Tag, Avatar, Button, Space, Divider } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { User, UserRole, UserStatus } from "../../../types/user";

interface UserDetailProps {
  visible: boolean;
  user: User | null;
  onClose: () => void;
  onEdit: (user: User) => void;
}

const UserDetail: React.FC<UserDetailProps> = ({
  visible,
  user,
  onClose,
  onEdit,
}) => {
  if (!user) return null;

  // 获取角色显示信息
  const getRoleInfo = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return { text: "管理员", color: "red" };
      case UserRole.TEACHER:
        return { text: "教师", color: "blue" };
      default:
        return { text: "未知", color: "default" };
    }
  };

  // 获取状态显示信息
  const getStatusInfo = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return { text: "活跃", color: "green" };
      case UserStatus.INACTIVE:
        return { text: "非活跃", color: "orange" };
      case UserStatus.SUSPENDED:
        return { text: "已暂停", color: "red" };
      default:
        return { text: "未知", color: "default" };
    }
  };

  const roleInfo = getRoleInfo(user.role);
  const statusInfo = getStatusInfo(user.status);
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return (
    <Modal
      title="用户详情"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
        <Button
          key="edit"
          type="primary"
          icon={<EditOutlined />}
          onClick={() => {
            onEdit(user);
            onClose();
          }}
        >
          编辑用户
        </Button>,
      ]}
      width={600}
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Avatar
          size={80}
          icon={<UserOutlined />}
          src={user.avatar}
          style={{ marginBottom: 16 }}
        />
        <div>
          <h3 style={{ margin: 0, fontSize: 20 }}>{user.username}</h3>
          {fullName && (
            <p style={{ margin: "8px 0 0 0", color: "#666" }}>{fullName}</p>
          )}
        </div>
        <Space style={{ marginTop: 16 }}>
          <Tag color={roleInfo.color}>{roleInfo.text}</Tag>
          <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
        </Space>
      </div>

      <Divider />

      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="用户ID">
          <code>{user.id}</code>
        </Descriptions.Item>

        <Descriptions.Item label="用户名">
          <Space>
            <UserOutlined />
            {user.username}
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="邮箱">
          <Space>
            <MailOutlined />
            {user.email}
          </Space>
        </Descriptions.Item>

        {user.phone && (
          <Descriptions.Item label="手机号">
            <Space>
              <PhoneOutlined />
              {user.phone}
            </Space>
          </Descriptions.Item>
        )}

        <Descriptions.Item label="角色">
          <Tag color={roleInfo.color}>{roleInfo.text}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="状态">
          <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="创建时间">
          <Space>
            <CalendarOutlined />
            {new Date(user.createdAt).toLocaleString("zh-CN")}
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="最后更新">
          <Space>
            <CalendarOutlined />
            {new Date(user.updatedAt).toLocaleString("zh-CN")}
          </Space>
        </Descriptions.Item>
      </Descriptions>

      {user.avatar && (
        <>
          <Divider />
          <div>
            <h4>头像预览</h4>
            <img
              src={user.avatar}
              alt="用户头像"
              style={{
                maxWidth: "100%",
                maxHeight: 200,
                borderRadius: 8,
                border: "1px solid #d9d9d9",
              }}
            />
          </div>
        </>
      )}
    </Modal>
  );
};

export default UserDetail;
