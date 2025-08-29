import React, { useMemo } from "react";
import { Table, Button, Space, Modal, Typography, Form } from "antd";
import {
  ExclamationCircleOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Student } from "../../types/student";
import StudentForm from "./components/StudentForm";
import StudentDetail from "./components/StudentDetail";
import StudentSearch from "./components/StudentSearch";
import { getTableColumns } from "./components/tableColumns";
import { useStudentManagement } from "./hooks/useStudentManagement";

const { confirm } = Modal;
const { Title } = Typography;

const StudentManagementPage: React.FC = () => {
  const {
    students,
    loading,
    editingStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    searchStudents,
    resetSearch,
    setEditingStudentData,
  } = useStudentManagement();

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [searchForm] = Form.useForm();

  const [createModalVisible, setCreateModalVisible] = React.useState(false);
  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [viewModalVisible, setViewModalVisible] = React.useState(false);
  const [searchModalVisible, setSearchModalVisible] = React.useState(false);
  const [viewStudent, setViewStudent] = React.useState<Student | null>(null);

  const openCreateModal = (): void => {
    createForm.resetFields();
    setCreateModalVisible(true);
  };

  const openEditModal = (student: Student): void => {
    setEditingStudentData(student);
    editForm.setFieldsValue({
      name: student.name,
      gender: student.gender,
      birthDate: undefined,
    });
    setEditModalVisible(true);
  };

  const openViewModal = (student: Student): void => {
    setViewStudent(student);
    setViewModalVisible(true);
  };

  const openSearchModal = (): void => {
    searchForm.resetFields();
    setSearchModalVisible(true);
  };

  const showDeleteConfirm = (studentId: string, name: string): void => {
    confirm({
      title: "确认删除",
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除学生 "${name}" 吗？此操作不可恢复。`,
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        await deleteStudent(studentId);
      },
    });
  };

  const columns = useMemo(
    () =>
      getTableColumns({
        onView: openViewModal,
        onEdit: openEditModal,
        onDelete: (s) => showDeleteConfirm(s._id, s.name),
      }),
    []
  );

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
        <Title level={3}>学生管理</Title>
        <Space>
          <Button icon={<SearchOutlined />} onClick={openSearchModal}>
            搜索
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            添加学生
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={students}
        rowKey="_id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />

      {/* 创建学生模态框 */}
      <Modal
        title="添加学生"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <StudentForm
          form={createForm}
          onFinish={async (values) => {
            const ok = await createStudent(values);
            if (ok) setCreateModalVisible(false);
          }}
          onCancel={() => setCreateModalVisible(false)}
        />
      </Modal>

      {/* 编辑学生模态框 */}
      <Modal
        title="编辑学生"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingStudentData(null);
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <StudentForm
          form={editForm}
          isEdit
          onFinish={async (values) => {
            if (!editingStudent) return;
            const ok = await updateStudent(editingStudent._id, values);
            if (ok) {
              setEditModalVisible(false);
              setEditingStudentData(null);
            }
          }}
          onCancel={() => {
            setEditModalVisible(false);
            setEditingStudentData(null);
          }}
        />
      </Modal>

      {/* 查看学生信息模态框 */}
      <Modal
        title="学生详情"
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setViewStudent(null);
        }}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={500}
        destroyOnClose
      >
        {viewStudent && <StudentDetail student={viewStudent} />}
      </Modal>

      {/* 搜索学生模态框 */}
      <Modal
        title="搜索学生"
        open={searchModalVisible}
        onCancel={() => setSearchModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <StudentSearch
          form={searchForm}
          onFinish={async (values) => {
            const ok = await searchStudents(values);
            if (ok) setSearchModalVisible(false);
          }}
          onReset={resetSearch}
          onCancel={() => setSearchModalVisible(false)}
        />
      </Modal>
    </div>
  );
};

export default StudentManagementPage;
