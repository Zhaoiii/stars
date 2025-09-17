import React, { useState } from "react";
import { Button, Typography, Card, Form } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useUserManagement } from "./hooks/useUserManagement";
import UserTable from "./components/UserTable";
import UserSearch from "./components/UserSearch";
import FormModal from "./components/FormModal";
import UserDetail from "./components/UserDetail";
import { User, CreateUserForm, UpdateUserForm } from "../../types/user";
import { SearchFilters } from "./components/UserSearch";

const { Title, Paragraph } = Typography;

const UserManagement: React.FC = () => {
  const {
    filteredUsers,
    loading,
    searchUsers,
    resetSearch,
    createUser,
    updateUser,
    deleteUser,
  } = useUserManagement();

  // 模态框状态
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [filterForm] = Form.useForm<SearchFilters>();
  // 处理创建用户
  const handleCreateUser = async (values: CreateUserForm | UpdateUserForm) => {
    try {
      await createUser(values as CreateUserForm);
      setCreateModalVisible(false);
      searchUsers({
        ...filterForm.getFieldsValue(),
        page: 1,
        pageSize: 20,
      });
    } catch (error) {
      // 错误已在 hook 中处理
    }
  };

  // 处理编辑用户
  const handleEditUser = async (values: CreateUserForm | UpdateUserForm) => {
    if (!editingUser) return;

    try {
      await updateUser(editingUser.id, values as UpdateUserForm);
      setEditModalVisible(false);
      setEditingUser(null);
    } catch (error) {
      // 错误已在 hook 中处理
    }
  };

  // 处理删除用户
  const handleDeleteUser = async (id: number) => {
    try {
      await deleteUser(id);
    } catch (error) {
      // 错误已在 hook 中处理
    }
  };

  // 打开创建模态框
  const openCreateModal = () => {
    setCreateModalVisible(true);
  };

  // 打开编辑模态框
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditModalVisible(true);
  };

  // 打开详情模态框
  const openDetailModal = (user: User) => {
    setViewingUser(user);
    setDetailModalVisible(true);
  };

  // 关闭模态框
  const closeCreateModal = () => {
    setCreateModalVisible(false);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditingUser(null);
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setViewingUser(null);
  };

  // 处理搜索
  const handleSearch = (filters: SearchFilters) => {
    searchUsers({
      ...filters,
      page: 1,
      pageSize: 20,
    });
  };

  const handleResetSearch = () => {
    resetSearch();
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 页面标题和操作 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            用户管理
          </Title>
          <Paragraph type="secondary" style={{ margin: "8px 0 0 0" }}>
            管理系统中的所有用户，包括管理员和教师账户
          </Paragraph>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateModal}
          size="large"
        >
          创建用户
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <UserSearch
        form={filterForm}
        onSearch={handleSearch}
        onReset={handleResetSearch}
        loading={loading}
      />

      {/* 用户表格 */}
      <Card>
        <UserTable
          form={filterForm}
          users={filteredUsers}
          loading={loading}
          onSearch={handleSearch}
          onEdit={openEditModal}
          onDelete={handleDeleteUser}
          onView={openDetailModal}
        />
      </Card>

      {/* 创建用户模态框 */}
      <FormModal
        visible={createModalVisible}
        mode="create"
        loading={loading}
        onCancel={closeCreateModal}
        onSubmit={handleCreateUser}
      />

      {/* 编辑用户模态框 */}
      <FormModal
        visible={editModalVisible}
        mode="edit"
        user={editingUser}
        loading={loading}
        onCancel={closeEditModal}
        onSubmit={handleEditUser}
      />

      {/* 用户详情模态框 */}
      <UserDetail
        visible={detailModalVisible}
        user={viewingUser}
        onClose={closeDetailModal}
        onEdit={openEditModal}
      />
    </div>
  );
};

export default UserManagement;
