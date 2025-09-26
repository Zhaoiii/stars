import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Form,
  message,
  Popconfirm,
  Tag,
  Tooltip,
  Input,
  Flex,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  ProfileOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Student, Gender, Team } from "@/types/student";
import { User } from "@/types/user";
import { StudentService } from "@/services/studentService";
import useTable from "@/hooks/useTable";
import StudentFormModal from "./components/StudentFormModal";
import StudentCourseView from "./components/StudentCourseView";

const StudentManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [courseViewVisible, setCourseViewVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [form] = Form.useForm();

  const [tableProps, { reset }] = useTable<Student>((params) => {
    const values = form.getFieldsValue();
    return StudentService.searchStudents({
      ...params,
      ...values,
    });
  });

  useEffect(() => {
    reset();
  }, []);

  // 打开创建/编辑模态框
  const handleOpenModal = (student?: Student) => {
    setEditingStudent(student || null);
    setModalVisible(true);
  };

  // 关闭模态框
  const handleCloseModal = (needRefresh?: boolean) => {
    if (needRefresh) reset();
    setModalVisible(false);
    setEditingStudent(null);
  };

  // 打开课程查看
  const handleViewCourses = (student: Student) => {
    setSelectedStudent(student);
    setCourseViewVisible(true);
  };

  // 关闭课程查看
  const handleCloseCourseView = () => {
    setCourseViewVisible(false);
    setSelectedStudent(null);
  };

  // 删除学生
  const handleDelete = async (id: number) => {
    try {
      await StudentService.deleteStudent(id.toString());
      reset();
      message.success("学生删除成功");
    } catch (error: any) {
      message.error(error.response?.data?.message || "删除失败");
    }
  };

  // 获取性别显示文本和颜色
  const getGenderInfo = (gender: Gender) => {
    switch (gender) {
      case Gender.MALE:
        return { text: "男", color: "blue" };
      case Gender.FEMALE:
        return { text: "女", color: "pink" };
      case Gender.OTHER:
        return { text: "其他", color: "default" };
      default:
        return { text: "未知", color: "default" };
    }
  };

  // 计算年龄

  // 表格列定义
  const columns = [
    {
      title: "姓名",
      dataIndex: "name",
    },
    {
      title: "性别",
      dataIndex: "gender",
      render: (gender: Gender) => {
        const { text, color } = getGenderInfo(gender);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "年龄",
      dataIndex: "birthDate",
    },
    {
      title: "所属团队",
      dataIndex: "team",
      render: (team: Team) => (
        <Tag color="blue">
          <TeamOutlined /> {team?.name || "未分配"}
        </Tag>
      ),
    },
    {
      title: "分配教师",
      dataIndex: "teachers",
      key: "teachers",
      render: (teachers: User[]) => {
        if (!teachers || teachers.length === 0) {
          return <Tag color="default">未分配</Tag>;
        }
        return (
          <Space wrap>
            {teachers.map((teacher) => (
              <Tag key={teacher.id} color="green">
                {teacher.name || teacher.username}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: "备注",
      dataIndex: "remarks",
      key: "remarks",
      ellipsis: true,
      render: (text: string) => text || "-",
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
      render: (_: any, record: Student) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="课程安排">
            <Button
              type="link"
              icon={<CalendarOutlined />}
              onClick={() => handleViewCourses(record)}
            />
          </Tooltip>
          <Tooltip title="评估记录">
            <Button
              type="link"
              icon={<ProfileOutlined />}
              onClick={() => navigate(`/students/${record.id}/evaluations`)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个学生吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Flex justify="space-between">
        <Space>
          <Form form={form} onFinish={reset}>
            <Form.Item name="keyword" label="搜索">
              <Input.Search onSearch={form.submit} placeholder="name、备注" />
            </Form.Item>
          </Form>
        </Space>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal()}
        >
          创建学生
        </Button>
      </Flex>
      {/* 学生列表 */}
      <Table<Student> columns={columns} {...tableProps} />

      <StudentFormModal
        open={modalVisible}
        initialValues={editingStudent}
        handleCloseModal={handleCloseModal}
      />

      <StudentCourseView
        visible={courseViewVisible}
        student={selectedStudent}
        onCancel={handleCloseCourseView}
      />
    </div>
  );
};

export default StudentManagementPage;
