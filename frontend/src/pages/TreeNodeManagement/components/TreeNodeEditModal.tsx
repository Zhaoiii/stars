import React, { useEffect, useRef, useState } from "react";
import { Modal, Form, Input, Switch, InputNumber, Button, Select } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  createTreeNode,
  updateTreeNode,
  getAssistanceTypes,
  ITreeNodeInput,
  ITreeNode,
  ISegmentScore,
  IAssistanceType,
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
  isLongTermGoal: boolean;
  isShortTermGoal: boolean;
  assistanceTypeId?: string;
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
  const nameInputRef = useRef<any>(null);
  const [assistanceTypes, setAssistanceTypes] = useState<IAssistanceType[]>([]);

  useEffect(() => {
    if (open && editData) {
      form.setFieldsValue({
        name: editData.name,
        description: editData.description,
        isLongTermGoal: editData.isLongTermGoal,
        isShortTermGoal: editData.isShortTermGoal,
        assistanceTypeId: editData.assistanceTypeId,
        totalCount: editData.totalCount,
        segmentScores: editData.segmentScores || [],
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, editData, form]);

  // 加载辅助类型
  useEffect(() => {
    if (open) {
      const loadAssistanceTypes = async () => {
        try {
          const { data } = await getAssistanceTypes();
          setAssistanceTypes(data.data || []);
        } catch (error) {
          console.error("加载辅助类型失败:", error);
        }
      };
      loadAssistanceTypes();
    }
  }, [open]);

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
      const isGoal = values.isLongTermGoal || values.isShortTermGoal;
      const submitData: ITreeNodeInput = {
        name: values.name,
        description: values.description,
        isLongTermGoal: values.isLongTermGoal,
        isShortTermGoal: values.isShortTermGoal,
        assistanceTypeId: isGoal ? values.assistanceTypeId : undefined,
        parentId: editData ? editData.parentId : parentId || undefined,
        totalCount: isGoal ? values.totalCount : undefined,
        segmentScores: isGoal ? values.segmentScores : [],
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

        <Form.Item label="长期目标" name="isLongTermGoal" valuePropName="checked">
          <Switch 
            onChange={(checked) => {
              if (checked) {
                form.setFieldValue("isShortTermGoal", false);
              }
            }}
          />
        </Form.Item>

        <Form.Item label="短期目标" name="isShortTermGoal" valuePropName="checked">
          <Switch 
            onChange={(checked) => {
              if (checked) {
                form.setFieldValue("isLongTermGoal", false);
              }
            }}
          />
        </Form.Item>

        <Form.Item dependencies={["isLongTermGoal", "isShortTermGoal"]}>
          {({ getFieldValue }) => {
            const isLongTermGoal = getFieldValue("isLongTermGoal");
            const isShortTermGoal = getFieldValue("isShortTermGoal");
            const isGoal = isLongTermGoal || isShortTermGoal;
            return isGoal ? (
              <>
                <Form.Item
                  label="辅助类别"
                  name="assistanceTypeId"
                  rules={[{ required: true, message: "请选择辅助类别" }]}
                >
                  <Select
                    placeholder="请选择辅助类别"
                    options={assistanceTypes.map(type => ({
                      label: type.name,
                      value: type._id,
                    }))}
                  />
                </Form.Item>

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
                    onChange={(value) => {
                      const numValue = Number(value);
                      if (value && numValue > 0) {
                        // 自动生成三个分段得分：0、中间数、总数
                        const middleValue = Math.ceil(numValue / 2);
                        const segmentScores = [
                          { targetCount: 0, score: 0 },
                          { targetCount: middleValue, score: 0.5 },
                          { targetCount: numValue, score: 1 },
                        ];
                        form.setFieldValue("segmentScores", segmentScores);
                      } else {
                        // 总数为0或空时清空分段得分
                        form.setFieldValue("segmentScores", []);
                      }
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
