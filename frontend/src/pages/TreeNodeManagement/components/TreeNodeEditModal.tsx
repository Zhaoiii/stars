import React, { useEffect, useRef } from "react";
import { Modal, Form, Input, Switch, InputNumber, Button, Space } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  createTreeNode,
  updateTreeNode,
  ITreeNodeInput,
  ITreeNode,
  ISegmentScore,
} from "../apis";

type TProps = {
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  editData?: ITreeNode | null;
  parentId?: string | null;
};

type TFormData = {
  name: string;
  description: string;
  isLeaf: boolean;
  totalCount?: number;
  segmentScores?: ISegmentScore[];
};

const TreeNodeEditModal: React.FC<TProps> = ({
  open,
  onCancel,
  onSuccess,
  editData,
  parentId,
}) => {
  const [form] = Form.useForm<TFormData>();
  const isLeaf = Form.useWatch("isLeaf", form);
  const nameInputRef = useRef<any>(null);

  useEffect(() => {
    if (open && editData) {
      form.setFieldsValue({
        name: editData.name,
        description: editData.description,
        isLeaf: editData.isLeaf,
        totalCount: editData.totalCount,
        segmentScores: editData.segmentScores || [],
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, editData, form]);

  // 弹窗打开时自动聚焦到 name 字段
  useEffect(() => {
    if (open && nameInputRef.current) {
      // 使用 setTimeout 确保 Modal 完全渲染后再聚焦
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const onFinish = async (values: TFormData) => {
    try {
      const submitData: ITreeNodeInput = {
        name: values.name,
        description: values.description,
        isLeaf: values.isLeaf,
        parentId: editData ? editData.parentId : parentId || undefined,
        totalCount: values.isLeaf ? values.totalCount : undefined,
        segmentScores: values.isLeaf ? values.segmentScores : [],
      };

      if (editData) {
        await updateTreeNode(editData._id, submitData);
      } else {
        await createTreeNode(submitData);
      }

      onSuccess?.();
      onCancel();
    } catch (error) {
      console.error("保存失败:", error);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={editData ? "编辑节点" : "新增节点"}
      onOk={form.submit}
      afterClose={form.resetFields}
      width={600}
    >
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item
          label="名称"
          name="name"
          rules={[{ required: true, message: "请输入名称" }]}
        >
          <Input ref={nameInputRef} />
        </Form.Item>

        <Form.Item label="描述" name="description">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item label="是否叶子节点" name="isLeaf" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item dependencies={["isLeaf"]}>
          {({ getFieldValue }) => {
            const isLeaf = getFieldValue("isLeaf");
            return isLeaf ? (
              <>
                <Form.Item
                  label="总数"
                  name="totalCount"
                  rules={[
                    { required: true, message: "请输入总数" },
                    { type: "number", min: 0, message: "总数必须大于等于0" },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="请输入总数"
                    onChange={() => {
                      // 总数变化时清空分段得分
                      form.setFieldValue("segmentScores", []);
                    }}
                  />
                </Form.Item>

                <Form.Item label="分段得分">
                  <Form.List name="segmentScores">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <div
                            key={key}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: 8,
                              padding: 8,
                              border: "1px solid #d9d9d9",
                              borderRadius: 4,
                            }}
                          >
                            <Form.Item
                              {...restField}
                              name={[name, "targetCount"]}
                              label="目标数"
                              rules={[
                                { required: true, message: "请输入目标数" },
                                {
                                  type: "number",
                                  min: 0,
                                  message: "目标数必须大于等于0",
                                },
                              ]}
                              style={{ marginRight: 16, marginBottom: 0 }}
                            >
                              <InputNumber
                                placeholder="目标数"
                                style={{ width: 120 }}
                              />
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, "score"]}
                              label="得分"
                              rules={[
                                { required: true, message: "请输入得分" },
                                {
                                  type: "number",
                                  min: 0,
                                  max: 1,
                                  message: "得分必须在0-1之间",
                                },
                              ]}
                              style={{ marginRight: 16, marginBottom: 0 }}
                            >
                              <InputNumber
                                placeholder="得分"
                                style={{ width: 120 }}
                                step={0.1}
                                min={0}
                                max={1}
                              />
                            </Form.Item>

                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => remove(name)}
                            />
                          </div>
                        ))}
                        <Button
                          type="dashed"
                          onClick={() => add()}
                          block
                          icon={<PlusOutlined />}
                        >
                          添加分段得分
                        </Button>
                      </>
                    )}
                  </Form.List>
                </Form.Item>
              </>
            ) : null;
          }}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TreeNodeEditModal;
