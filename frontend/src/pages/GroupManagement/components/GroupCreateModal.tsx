import React from "react";
import { Modal, Form, Input } from "antd";
import { GroupCreateModalProps } from "../types";

const GroupCreateModal: React.FC<GroupCreateModalProps> = ({
    open,
    onCancel,
    onOk,
    form,
}) => {
    return (
        <Modal
            title="新建分组"
            open={open}
            onOk={onOk}
            onCancel={onCancel}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label="名称"
                    rules={[{ required: true, message: "请输入名称" }]}
                >
                    <Input placeholder="请输入分组名称" />
                </Form.Item>
                <Form.Item name="description" label="描述">
                    <Input.TextArea placeholder="可选描述" rows={3} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default GroupCreateModal;
