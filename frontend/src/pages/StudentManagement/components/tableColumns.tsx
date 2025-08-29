import React from "react";
import { Button, Space, Tag, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Student, Gender } from "../../../types/student";

interface TableColumnsProps {
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export const getTableColumns = ({
  onView,
  onEdit,
  onDelete,
}: TableColumnsProps) => {
  const getGenderText = (gender: Gender): string => {
    return gender === Gender.MALE ? "男" : "女";
  };

  const getGenderColor = (gender: Gender): string => {
    return gender === Gender.MALE ? "blue" : "pink";
  };

  const calculateAge = (birthDate: string): number => {
    const birth = dayjs(birthDate);
    const now = dayjs();
    return now.diff(birth, "year");
  };

  return [
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "性别",
      dataIndex: "gender",
      key: "gender",
      render: (gender: Gender) => (
        <Tag color={getGenderColor(gender)}>{getGenderText(gender)}</Tag>
      ),
    },
    {
      title: "出生日期",
      dataIndex: "birthDate",
      key: "birthDate",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD"),
    },
    {
      title: "年龄",
      key: "age",
      render: (_: any, record: Student) => calculateAge(record.birthDate),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: Student) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个学生吗？"
            onConfirm={() => onDelete(record)}
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
};
