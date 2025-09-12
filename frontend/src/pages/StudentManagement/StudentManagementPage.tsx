import React, { useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Typography,
  Form,
  Select,
  message,
} from "antd";
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
import { userAPI } from "../../services/userAPI";
import { StudentService } from "./services/studentService";

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

  // 指派老师弹窗
  const [assignModalVisible, setAssignModalVisible] = React.useState(false);
  const [assigningStudent, setAssigningStudent] =
    React.useState<Student | null>(null);
  const [allUsers, setAllUsers] = React.useState<
    { label: string; value: string }[]
  >([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = React.useState<string[]>(
    []
  );

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

  const openAssignModal = async (student: Student): Promise<void> => {
    setAssigningStudent(student);
    setAssignModalVisible(true);

    try {
      // 获取学生详情，包含所在组和已指派的老师信息
      const studentDetail = await StudentService.getStudentById(student._id);

      // 如果学生有 assignedTeachers 信息，预填已指派的老师
      const preselected = Array.isArray(studentDetail.assignedTeachers)
        ? (studentDetail.assignedTeachers as any[]).map((x: any) =>
            typeof x === "string" ? x : x._id
          )
        : [];
      setSelectedTeacherIds(preselected);

      // 只显示学生所在组的老师
      const availableTeachers: { label: string; value: string }[] = [];
      if (Array.isArray(studentDetail.groups)) {
        studentDetail.groups.forEach((group: any) => {
          if (Array.isArray(group.teachers)) {
            group.teachers.forEach((teacher: any) => {
              const teacherId =
                typeof teacher === "string" ? teacher : teacher._id;
              const teacherName =
                typeof teacher === "string" ? "" : teacher.username;
              const teacherPhone =
                typeof teacher === "string" ? "" : teacher.phone;

              // 避免重复添加
              if (!availableTeachers.find((t) => t.value === teacherId)) {
                availableTeachers.push({
                  label: `${teacherName}(${teacherPhone})`,
                  value: teacherId,
                });
              }
            });
          }
        });
      }

      setAllUsers(availableTeachers);

      if (availableTeachers.length === 0) {
        message.warning("该学生未加入任何组，无法指派老师");
      }
    } catch (error) {
      console.error("获取学生详情失败:", error);
      message.error("获取学生信息失败");
    }
  };

  const handleAssignSave = async (): Promise<void> => {
    if (!assigningStudent) return;
    try {
      const existing = Array.isArray(assigningStudent.assignedTeachers)
        ? (assigningStudent.assignedTeachers as any[]).map((x: any) =>
            typeof x === "string" ? x : x._id
          )
        : [];
      const toAssign = selectedTeacherIds.filter(
        (id) => !existing.includes(id)
      );
      const toUnassign = existing.filter(
        (id) => !selectedTeacherIds.includes(id)
      );

      if (toAssign.length) {
        await StudentService.assignTeachers(assigningStudent._id, toAssign);
      }
      if (toUnassign.length) {
        await StudentService.unassignTeachers(assigningStudent._id, toUnassign);
      }

      message.success("保存成功");
      setAssignModalVisible(false);
      setAssigningStudent(null);
    } catch (e) {
      // 全局拦截器提示
    }
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
        onAssign: openAssignModal,
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

      {/* 指派老师模态框 */}
      <Modal
        title="指派老师"
        open={assignModalVisible}
        onCancel={() => setAssignModalVisible(false)}
        onOk={handleAssignSave}
        destroyOnClose
      >
        <Select
          mode="multiple"
          style={{ width: "100%" }}
          placeholder="选择老师"
          value={selectedTeacherIds}
          onChange={setSelectedTeacherIds}
          options={allUsers}
        />
      </Modal>
    </div>
  );
};

export default StudentManagementPage;
