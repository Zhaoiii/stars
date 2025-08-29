import React, { useEffect } from "react";
import { Modal, Form, Input } from "antd";

interface Props {
  open: boolean;
  initialValues?: any;
  onCancel: () => void;
  onSubmit: (values: { name: string }) => Promise<void> | void;
}

const StageFormModal: React.FC<Props> = ({
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
      title={initialValues ? "编辑阶段" : "新增阶段"}
      okText={initialValues ? "保存" : "创建"}
      onOk={() => form.submit()}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="name"
          label="名称"
          rules={[{ required: true, message: "请输入阶段名称" }]}
        >
          <Input placeholder="阶段名称" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StageFormModal;
