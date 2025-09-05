import React from "react";
import { Form, Select, Button, Space } from "antd";
import { Student, TreeNode } from "../../../types/evaluationRecord";

const { Option } = Select;

interface EvaluationRecordFilterProps {
  form: any;
  students: Student[];
  tools: TreeNode[];
  onFinish: (values: any) => void;
  onReset: () => void;
  onCancel: () => void;
}

const EvaluationRecordFilter: React.FC<EvaluationRecordFilterProps> = ({
  form,
  students,
  tools,
  onFinish,
  onReset,
  onCancel,
}) => {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        studentId: undefined,
        toolId: undefined,
        status: undefined,
      }}
    >
      <Form.Item name="studentId" label="学生">
        <Select
          placeholder="请选择学生"
          allowClear
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.children as unknown as string)
              ?.toLowerCase()
              .includes(input.toLowerCase())
          }
        >
          {students.map((student) => (
            <Option key={student._id} value={student._id}>
              {student.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="toolId" label="评估工具">
        <Select
          placeholder="请选择评估工具"
          allowClear
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.children as unknown as string)
              ?.toLowerCase()
              .includes(input.toLowerCase())
          }
        >
          {tools.map((tool) => (
            <Option key={tool._id} value={tool._id}>
              {tool.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="status" label="状态">
        <Select placeholder="请选择状态" allowClear>
          <Option value="in_progress">进行中</Option>
          <Option value="completed">已完成</Option>
          <Option value="archived">已归档</Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            筛选
          </Button>
          <Button onClick={onReset}>重置</Button>
          <Button onClick={onCancel}>取消</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default EvaluationRecordFilter;
