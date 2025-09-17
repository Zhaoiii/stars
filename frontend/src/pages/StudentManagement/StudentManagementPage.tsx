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
} from "@ant-design/icons";
import { Student, Gender, Team } from "@/types/student";
import { User } from "@/types/user";
import { StudentService } from "@/services/studentService";
import useTable from "@/hooks/useTable";
import StudentFormModal from "./components/StudentFormModal";

const StudentManagementPage: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form] = Form.useForm();

  const [tableProps, { reset }] = useTable((params) => {
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
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

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
      <Table columns={columns} {...tableProps} />

      <StudentFormModal
        open={modalVisible}
        initialValues={editingStudent}
        handleCloseModal={handleCloseModal}
      />
    </div>
  );
};

export default StudentManagementPage;
