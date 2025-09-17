import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Form,
  message,
  Popconfirm,
  Tag,
  Tooltip,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Team,
  CreateTeamData,
  UpdateTeamData,
  TeamSearchParams,
} from "../../types/team";
import { teamService } from "../../services/teamService";
import { User, UserRole } from "../../types/user";
import { useAuth } from "../../contexts/AuthContext";

const { Search } = Input;

const TeamManagement: React.FC = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchParams, setSearchParams] = useState<TeamSearchParams>({
    keyword: "",
    page: 1,
    pageSize: 10,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [form] = Form.useForm();

  // 加载团队列表
  const loadTeams = async () => {
    setLoading(true);
    try {
      const result = await teamService.searchTeams(searchParams);
      if (result.success) {
        setTeams(result.data || []);
        setPagination({
          current: result.page,
          pageSize: result.pageSize,
          total: result.total,
        });
      }
    } catch (error) {
      message.error("加载团队列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, [searchParams]);

  // 搜索处理
  const handleSearch = (value: string) => {
    setSearchParams({
      ...searchParams,
      keyword: value,
      page: 1,
    });
  };

  // 分页处理
  const handleTableChange = (pagination: any) => {
    setSearchParams({
      ...searchParams,
      page: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  // 打开创建/编辑模态框
  const handleOpenModal = (team?: Team) => {
    setEditingTeam(team || null);
    setModalVisible(true);
    if (team) {
      form.setFieldsValue(team);
    } else {
      form.resetFields();
    }
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingTeam(null);
    form.resetFields();
  };

  // 提交表单
  const handleSubmit = async (values: CreateTeamData | UpdateTeamData) => {
    try {
      if (editingTeam) {
        await teamService.updateTeam(editingTeam.id, values);
        message.success("团队更新成功");
      } else {
        await teamService.createTeam(values as CreateTeamData);
        message.success("团队创建成功");
      }
      handleCloseModal();
      loadTeams();
    } catch (error: any) {
      message.error(error.response?.data?.message || "操作失败");
    }
  };

  // 删除团队
  const handleDelete = async (id: number) => {
    try {
      await teamService.deleteTeam(id);
      message.success("团队删除成功");
      loadTeams();
    } catch (error: any) {
      message.error(error.response?.data?.message || "删除失败");
    }
  };

  // 表格列定义
  const columns = [
    {
      title: "团队名称",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Team) => (
        <Space>
          <TeamOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text: string) => text || "-",
    },
    {
      title: "成员数量",
      dataIndex: "users",
      key: "memberCount",
      render: (users: User[]) => (
        <Tag color="blue">
          <UserOutlined /> {users?.length || 0} 人
        </Tag>
      ),
    },
    {
      title: "管理教师",
      dataIndex: "users",
      key: "managerTeachers",
      render: (users: User[]) => {
        const managerTeachers =
          users?.filter((user) => user.role === "manager_teacher") || [];
        if (managerTeachers.length === 0) {
          return <Tag color="default">无</Tag>;
        }
        return (
          <Space wrap>
            {managerTeachers.map((teacher) => (
              <Tag key={teacher.id} color="orange">
                {teacher.name || teacher.username}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: Team) =>
        canManageTeams ? (
          <Space>
            <Tooltip title="编辑">
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleOpenModal(record)}
              />
            </Tooltip>
            <Popconfirm
              title="确定要删除这个团队吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Tooltip title="删除">
                <Button type="link" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          </Space>
        ) : (
          <span>-</span>
        ),
    },
  ];

  // 检查权限
  const canManageTeams =
    user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER_TEACHER;

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title="团队管理"
        extra={
          canManageTeams ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenModal()}
            >
              创建团队
            </Button>
          ) : null
        }
      >
        {/* 搜索区域 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Search
              placeholder="搜索团队名称或描述"
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
            />
          </Col>
        </Row>

        {/* 统计信息 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="团队总数"
                value={pagination.total}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* 团队列表 */}
        <Table
          columns={columns}
          dataSource={teams}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* 创建/编辑团队模态框 */}
      <Modal
        title={editingTeam ? "编辑团队" : "创建团队"}
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="团队名称"
            rules={[
              { required: true, message: "请输入团队名称" },
              { min: 2, message: "团队名称至少需要2个字符" },
              { max: 50, message: "团队名称不能超过50个字符" },
            ]}
          >
            <Input placeholder="请输入团队名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="团队描述"
            rules={[{ max: 200, message: "团队描述不能超过200个字符" }]}
          >
            <Input.TextArea placeholder="请输入团队描述" rows={4} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={handleCloseModal}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingTeam ? "更新" : "创建"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeamManagement;
