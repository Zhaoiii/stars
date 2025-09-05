import React from "react";
import { Form, Input, Select, DatePicker, Button, Space } from "antd";
import { Gender } from "../../../types/student";

const { Option } = Select;

interface StudentFormProps {
  form: any;
  onFinish: (values: any) => void;
  onCancel: () => void;
  initialValues?: any;
  loading?: boolean;
  isEdit?: boolean;
}

const StudentForm: React.FC<StudentFormProps> = ({
  form,
  onFinish,
  onCancel,
  initialValues,
  loading = false,
  isEdit = false,
}) => {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <Form.Item
        name="name"
        label="姓名"
        rules={[
          { required: true, message: "请输入姓名" },
          { min: 2, max: 50, message: "姓名长度必须在2-50个字符之间" },
        ]}
      >
        <Input placeholder="请输入姓名" />
      </Form.Item>

      <Form.Item
        name="gender"
        label="性别"
        rules={[{ required: true, message: "请选择性别" }]}
      >
        <Select placeholder="请选择性别">
          <Option value={Gender.MALE}>男</Option>
          <Option value={Gender.FEMALE}>女</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="birthDate"
        label="出生日期"
        rules={[{ required: true, message: "请选择出生日期" }]}
      >
        <DatePicker style={{ width: "100%" }} placeholder="请选择出生日期" />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? "更新学生" : "添加学生"}
          </Button>
          <Button onClick={onCancel}>取消</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default StudentForm;
