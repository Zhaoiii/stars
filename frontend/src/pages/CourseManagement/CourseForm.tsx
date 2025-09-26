import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Row,
  Col,
  message,
  Switch,
} from "antd";
import {
  Course,
  CreateCourseRequest,
  UpdateCourseRequest,
} from "../../types/course";
import { StudentService } from "@/services/studentService";
import { Student } from "../../types/student";
import { User } from "../../types/user";
import dayjs from "dayjs";
import { useStudentSearch } from "@/hooks/useUserSearch";

const { Option } = Select;
const { TextArea } = Input;

interface CourseFormProps {
  visible: boolean;
  course?: Course | null;
  onSave: (data: CreateCourseRequest | UpdateCourseRequest) => void;
  onCancel: () => void;
  loading?: boolean;
}

const CourseForm: React.FC<CourseFormProps> = ({
  visible,
  course,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [availableTeachers, setAvailableTeachers] = useState<User[]>([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const {
    options: studentsOptions,
    loading: studentsLoading,
    onSearch: onSearchStudents,
  } = useStudentSearch();

  // 当选择学生时，加载该学生的教师
  const handleStudentChange = async (studentId: number) => {
    setSelectedStudent(studentId);
    form.resetFields(["teacherId"]);
    try {
      const student = await StudentService.getStudentById(studentId.toString());
      if (student && student.teachers) {
        setAvailableTeachers(student.teachers);
      } else {
        setAvailableTeachers([]);
      }
    } catch (error) {
      message.error("加载学生教师信息失败");
    }
  };

  // 表单初始化
  useEffect(() => {
    if (visible) {
      if (course) {
        const { startTime, endTime, repeatEndDate, ...rest } = course;
        form.setFieldsValue({
          ...rest,
          startTime: dayjs(startTime),
          endTime: dayjs(endTime),
          repeatEndDate: repeatEndDate ? dayjs(repeatEndDate) : null,
        });

        setSelectedStudent(course.studentId);
        setIsRecurring(course.repeatMode !== "none");
      } else {
        form.resetFields();
        setSelectedStudent(null);
        setAvailableTeachers([]);
        setIsRecurring(false);
      }
    }
  }, [visible, course, form]);

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const formData = {
        ...values,
        startTime: values.startTime.toISOString(),
        endTime: values.endTime.toISOString(),
        repeatEndDate: values.repeatEndDate?.toISOString(),
        repeatMode: isRecurring ? values.repeatMode : "none",
      };

      onSave(formData);
    } catch (error) {
      console.error("表单验证失败:", error);
    }
  };

  // 处理取消
  const handleCancel = () => {
    form.resetFields();
    setSelectedStudent(null);
    setAvailableTeachers([]);
    setIsRecurring(false);
    onCancel();
  };

  return (
    <Modal
      title={course ? "编辑课程" : "新建课程"}
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={800}
      className="course-form-modal"
    >
      <Form form={form} layout="vertical" className="course-form">
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="type"
              label="课程类型"
              rules={[{ required: true, message: "请选择课程类型" }]}
            >
              <Select placeholder="请选择课程类型">
                <Option value="evaluation">评估</Option>
                <Option value="individual_training">个训</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="课程描述">
          <TextArea rows={3} placeholder="请输入课程描述（可选）" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="studentId"
              label="学生"
              rules={[{ required: true, message: "请选择学生" }]}
            >
              <Select
                placeholder="请选择学生"
                onChange={handleStudentChange}
                showSearch
                onSearch={onSearchStudents}
                options={studentsOptions}
                loading={studentsLoading}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="teacherId"
              label="教师"
              rules={[{ required: true, message: "请选择教师" }]}
            >
              <Select
                placeholder="请选择教师"
                disabled={!selectedStudent}
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {availableTeachers.map((teacher) => (
                  <Option key={teacher.id} value={teacher.id}>
                    {teacher.name || teacher.username}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="startTime"
              label="开始时间"
              rules={[{ required: true, message: "请选择开始时间" }]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                style={{ width: "100%" }}
                placeholder="请选择开始时间"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="endTime"
              label="结束时间"
              rules={[{ required: true, message: "请选择结束时间" }]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                style={{ width: "100%" }}
                placeholder="请选择结束时间"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="location" label="上课地点">
          <Input placeholder="请输入上课地点（可选）" />
        </Form.Item>

        <Form.Item label="重复设置">
          <Space direction="vertical" style={{ width: "100%" }}>
            <Switch
              checked={isRecurring}
              onChange={(checked) => {
                setIsRecurring(checked);
                if (!checked) {
                  form.setFieldValue("repeatMode", "none");
                  form.setFieldValue("repeatEndDate", null);
                }
              }}
              checkedChildren="启用重复"
              unCheckedChildren="不重复"
            />
            {isRecurring && (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="repeatMode"
                    label="重复模式"
                    rules={[
                      { required: isRecurring, message: "请选择重复模式" },
                    ]}
                  >
                    <Select placeholder="请选择重复模式">
                      <Option value="daily">每天</Option>
                      <Option value="weekly">每周</Option>
                      <Option value="monthly">每月</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="repeatEndDate"
                    label="重复结束日期"
                    rules={[
                      { required: isRecurring, message: "请选择重复结束日期" },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="请选择重复结束日期"
                    />
                  </Form.Item>
                </Col>
              </Row>
            )}
          </Space>
        </Form.Item>

        {/* 隐藏的重复模式字段，用于非重复课程 */}
        <Form.Item name="repeatMode" hidden initialValue="none">
          <Input />
        </Form.Item>

        <Form.Item name="notes" label="备注">
          <TextArea rows={3} placeholder="请输入备注（可选）" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CourseForm;
