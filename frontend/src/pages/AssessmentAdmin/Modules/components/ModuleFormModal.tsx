import React, { useEffect } from "react";
import { Modal, Form, Input } from "antd";

interface Props {
  open: boolean;
  initialValues?: any;
  onCancel: () => void;
  onSubmit: (values: { name: string }) => Promise<void> | void;
}

const ModuleFormModal: React.FC<Props> = ({
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
      title={initialValues ? "编辑模块" : "新增模块"}
      okText={initialValues ? "保存" : "创建"}
      onOk={() => form.submit()}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="name"
          label="名称"
          rules={[{ required: true, message: "请输入模块名称" }]}
        >
          <Input placeholder="模块名称" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModuleFormModal;
