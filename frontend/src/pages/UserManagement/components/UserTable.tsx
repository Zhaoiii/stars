import React from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  Tooltip,
  FormInstance,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { User, UserRole, UserStatus } from "../../../types/user";
import { SearchFilters } from "./UserSearch";
import { PaginatedRequest } from "../../../services/api";

interface UserTableProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
  onSearch: (filters: PaginatedRequest<SearchFilters>) => void;
  onView: (user: User) => void;
  form: FormInstance<SearchFilters>;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  onEdit,
  onDelete,
  onSearch,
  onView,
  form,
}) => {
  // 获取角色显示文本和颜色
  const getRoleInfo = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return { text: "管理员", color: "red" };
      case UserRole.MANAGER_TEACHER:
        return { text: "管理教师", color: "orange" };
      case UserRole.TEACHER:
        return { text: "普通教师", color: "blue" };
      default:
        return { text: "未知", color: "default" };
    }
  };

  // 获取状态显示文本和颜色
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

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a: User, b: User) => a.id - b.id,
    },
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
      width: 120,
      render: (username: string) => (
        <Space>
          <UserOutlined />
          <span>{username}</span>
        </Space>
      ),
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (email: string) => (
        <Tooltip placement="topLeft" title={email}>
          {email}
        </Tooltip>
      ),
    },
    {
      title: "姓名",
      key: "fullName",
      width: 150,
      render: (_: any, record: User) => {
        return record.name || "-";
      },
    },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      width: 100,
      render: (role: UserRole) => {
        const { text, color } = getRoleInfo(role);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: UserStatus) => {
        const { text, color } = getStatusInfo(status);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "手机号",
      dataIndex: "phone",
      key: "phone",
      width: 130,
      render: (phone: string) => phone || "-",
    },
    {
      title: "所属团队",
      dataIndex: "team",
      key: "team",
      width: 150,
      render: (team: any, record: User) => {
        if (record.role === UserRole.ADMIN) {
          return <Tag color="red">管理员</Tag>;
        }
        return team ? (
          <Tag color="blue">{team.name}</Tag>
        ) : (
          <Tag color="default">未分配</Tag>
        );
      },
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString("zh-CN"),
      sorter: (a: User, b: User) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      fixed: "right" as const,
      render: (_: any, record: User) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="编辑用户">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个用户吗？"
            description="删除后无法恢复，请谨慎操作。"
            onConfirm={() => onDelete(record.id)}
            okText="确定"
            cancelText="取消"
            okType="danger"
          >
            <Tooltip title="删除用户">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={users}
      rowKey="id"
      loading={loading}
      pagination={{
        showTotal: (total, range) =>
          `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
        defaultPageSize: 20,
        onChange: (page, pageSize) => {
          const values = form.getFieldsValue();
          onSearch({
            ...values,
            page,
            pageSize,
          });
        },
      }}
      scroll={{ x: 1200 }}
      size="middle"
    />
  );
};

export default UserTable;
