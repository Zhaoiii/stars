import React from "react";
import { Form, Input, Select, Button, Space, Row, Col } from "antd";
import { Gender, StudentSearchParams } from "../../../types/student";

const { Option } = Select;

interface StudentSearchProps {
  form: any;
  onFinish: (values: StudentSearchParams) => void;
  onReset: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const StudentSearch: React.FC<StudentSearchProps> = ({
  form,
  onFinish,
  onReset,
  onCancel,
  loading = false,
}) => {
  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="name" label="姓名">
            <Input placeholder="请输入姓名关键词" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="gender" label="性别">
            <Select placeholder="请选择性别" allowClear>
              <Option value={Gender.MALE}>男</Option>
              <Option value={Gender.FEMALE}>女</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="minAge" label="最小年龄">
            <Input type="number" placeholder="最小年龄" min={0} max={150} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="maxAge" label="最大年龄">
            <Input type="number" placeholder="最大年龄" min={0} max={150} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            搜索
          </Button>
          <Button onClick={onReset}>重置</Button>
          <Button onClick={onCancel}>取消</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default StudentSearch;
