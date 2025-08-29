import React, { useEffect } from "react";
import { Modal, Form, Input, Switch } from "antd";

interface Props {
  open: boolean;
  initialValues?: any;
  onCancel: () => void;
  onSubmit: (values: {
    name: string;
    hasStages: boolean;
  }) => Promise<void> | void;
}

const DomainFormModal: React.FC<Props> = ({
  open,
  initialValues,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (initialValues) form.setFieldsValue(initialValues);
    }
  }, [open, initialValues]);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={initialValues ? "编辑领域" : "新增领域"}
      okText={initialValues ? "保存" : "创建"}
      onOk={() => form.submit()}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="name"
          label="名称"
          rules={[{ required: true, message: "请输入领域名称" }]}
        >
          <Input placeholder="领域名称" />
        </Form.Item>
        <Form.Item name="hasStages" label="包含阶段" valuePropName="checked">
          <Switch checkedChildren="是" unCheckedChildren="否" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DomainFormModal;
