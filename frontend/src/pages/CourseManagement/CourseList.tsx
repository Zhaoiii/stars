import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  Input,
  Select,
  DatePicker,
  Card,
  Tooltip,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Course, CourseType, CourseStatus } from "../../types/course";
import dayjs from "dayjs";
import { formatDateTime } from "../../utils/datetime";
import "./CourseList.css";
import useTable from "@/hooks/useTable";
import { PaginatedResponse } from "@/services/api";
import { courseService } from "../../services/courseService";
import { Form } from "antd";
import { courseTypeConfigs, courseStatusConfigs } from "../../constants/course";

const { RangePicker } = DatePicker;

interface CourseListProps {
  onEdit: (course: Course) => void;
  onDelete: (id: number) => void;
}

const CourseList: React.FC<CourseListProps> = ({ onEdit, onDelete }) => {
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<CourseType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<CourseStatus | "all">("all");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    [dayjs().startOf("day"), dayjs().endOf("day")]
  );
  const [form] = Form.useForm();
  // 服务端分页：使用 useTable
  const [tableProps, { reset, refresh }] = useTable<Course>(
    async ({ page, pageSize }): Promise<PaginatedResponse<Course>> => {
      const params: any = { page, limit: pageSize };
      if (filterType !== "all") params.type = filterType;
      if (filterStatus !== "all") params.status = filterStatus;
      if (dateRange) {
        params.startDate = dateRange[0].startOf("day").toISOString();
        params.endDate = dateRange[1].endOf("day").toISOString();
      }
      if (searchText) params.search = searchText;
      const resp = await courseService.getCourses(params);
      return resp as PaginatedResponse<Course>;
    },
    { current: 1, pageSize: 10 }
  );

  useEffect(() => {
    reset();
  }, []);

  // 过滤条件变化时重置到第一页
  useEffect(() => {
    reset();
  }, [filterType, filterStatus, JSON.stringify(dateRange), searchText]);

  // 获取课程类型标签
  const getCourseTypeTag = (type: CourseType) => {
    const typeConfig = {
      evaluation: { color: "blue", text: "评估" },
      individual_training: { color: "green", text: "个训" },
    };
    const config = typeConfig[type];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 获取课程状态标签
  const getCourseStatusTag = (status: CourseStatus) => {
    const statusConfig = {
      scheduled: { color: "blue", text: "已安排" },
      in_progress: { color: "orange", text: "进行中" },
      completed: { color: "green", text: "已完成" },
      cancelled: { color: "red", text: "已取消" },
    };
    const config = statusConfig[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 表格列配置
  const columns = [
    {
      title: "类型",
      dataIndex: "type",
      render: (type: CourseType) => getCourseTypeTag(type),
    },
    {
      title: "状态",
      dataIndex: "status",
      render: (status: CourseStatus) => getCourseStatusTag(status),
    },
    {
      title: "学生",
      dataIndex: "student",
      render: (student: Course["student"]) => student?.name || "未知",
    },
    {
      title: "教师",
      dataIndex: "teacher",
      render: (teacher: Course["teacher"]) => teacher?.name || "未知",
    },
    {
      title: "开始时间",
      dataIndex: "startTime",
      render: (time: string) => formatDateTime(time),
    },
    {
      title: "结束时间",
      dataIndex: "endTime",
      render: (time: string) => formatDateTime(time),
    },
    {
      title: "地点",
      dataIndex: "location",
    },
    {
      title: "操作",
      key: "actions",
      width: 120,
      fixed: "right" as const,
      render: (_: any, record: Course) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            size="small"
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个课程吗？"
            description="此操作不可撤销"
            onConfirm={() => onDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="course-list">
      {/* 搜索和过滤工具栏 */}
      <Card className="list-toolbar" size="small">
        <Form
          form={form}
          layout="inline"
          initialValues={{
            searchText: "",
            type: filterType,
            status: filterStatus,
            dateRange: dateRange,
          }}
          onValuesChange={(_, all) => {
            setSearchText(all.searchText || "");
            setFilterType(all.type || "all");
            setFilterStatus(all.status || "all");
            setDateRange(all.dateRange || null);
          }}
        >
          <Form.Item name="searchText">
            <Input
              placeholder="搜索课程、学生、教师..."
              prefix={<SearchOutlined />}
              allowClear
              style={{ width: 300 }}
            />
          </Form.Item>

          <Form.Item name="type" initialValue={filterType}>
            <Select placeholder="课程类型" style={{ width: 140 }} allowClear>
              <Select.Option value="all">全部类型</Select.Option>
              {courseTypeConfigs.map((cfg) => (
                <Select.Option key={cfg.type} value={cfg.type}>
                  {cfg.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="status" initialValue={filterStatus}>
            <Select placeholder="课程状态" style={{ width: 140 }} allowClear>
              <Select.Option value="all">全部状态</Select.Option>
              {courseStatusConfigs.map((cfg) => (
                <Select.Option key={cfg.status} value={cfg.status}>
                  {cfg.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="dateRange">
            <RangePicker style={{ width: 260 }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => refresh()}>
                刷新
              </Button>
              <Button
                onClick={() => {
                  form.resetFields();
                }}
              >
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 课程表格 */}
      <Card className="list-content">
        <Table
          columns={columns}
          rowKey="id"
          {...tableProps}
          scroll={{ x: 1200 }}
          size="small"
          className="course-table"
        />
      </Card>
    </div>
  );
};

export default CourseList;
