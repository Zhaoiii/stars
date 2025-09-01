import { Form, Input, Modal, Switch } from "antd";
import React from "react";
import { createTreeNode } from "../apis";

type TProps = { open: boolean; onCancel: () => void };

type TFormData = {
  name: string;
  description: string;
  isRoot: boolean;
};

const EditModal: React.FC<TProps> = ({ open, onCancel }) => {
  const [form] = Form.useForm<TFormData>();

  const onFinish = (values: TFormData) => {
    createTreeNode(values);
  };

  return (
    <Modal open={open} onCancel={onCancel} title="编辑节点" onOk={form.submit}>
      <Form form={form} onFinish={onFinish}>
        <Form.Item label="名称" name="name">
          <Input />
        </Form.Item>

        <Form.Item label="描述" name="description">
          <Input />
        </Form.Item>

        <Form.Item label="是否叶子节点" name="isRoot" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditModal;
