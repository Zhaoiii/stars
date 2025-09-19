import useAllTools from "@/hooks/useAllTools";
import { Form, Select } from "antd";
import React from "react";

const MultipleChoiceAnswer = () => {
  const [form] = Form.useForm();
  const tools = useAllTools();

  return (
    <>
      <Form form={form}>
        <Form.Item name="tool_id" label="工具">
          <Select
            options={tools.map((tool) => ({
              label: tool.title,
              value: tool.id,
            }))}
          />
        </Form.Item>
        <Form.Item name="long_term_goal_id" label="长期目标"></Form.Item>
      </Form>
    </>
  );
};

export default MultipleChoiceAnswer;
