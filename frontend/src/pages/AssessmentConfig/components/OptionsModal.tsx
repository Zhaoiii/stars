import React, { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Space } from "antd";
import { EvaluationAPI } from "@/services/evaluationService";
import { EvaluationScoringOption } from "@/types/evaluation";

type Props = {
  nodeId: string;
  open: boolean;
  options?: EvaluationScoringOption[];
  onClose: () => void;
  onChanged?: () => void;
};

const OptionsModal: React.FC<Props> = ({
  nodeId,
  open,
  options,
  onClose,
  onChanged,
}) => {
  const [form] = Form.useForm();
  const [initialList, setInitialList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setInitialList(
        (options || []).map((o) => ({
          id: o.id,
          label: o.label,
          score: o.score,
        }))
      );
      form.setFieldsValue({
        list: (options || []).map((o) => ({
          id: o.id,
          label: o.label,
          score: o.score,
        })),
      });
    }
  }, [open, options]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const list = (values.list || []) as Array<{
      id?: string;
      label: string;
      score: number;
    }>;
    setLoading(true);
    try {
      const currentIds = new Set(
        (initialList || []).map((x) => x.id).filter(Boolean)
      );
      const nextIds = new Set(
        list.map((x) => x.id).filter(Boolean) as string[]
      );
      // delete removed
      for (const id of Array.from(currentIds)) {
        if (id && !nextIds.has(id)) {
          await EvaluationAPI.deleteOption(id);
        }
      }
      // upsert
      for (const row of list) {
        if (row.id) {
          await EvaluationAPI.updateOption(row.id, {
            label: row.label,
            score: row.score,
          });
        } else {
          await EvaluationAPI.addOption(nodeId, {
            label: row.label,
            score: row.score,
          });
        }
      }
      onClose();
      onChanged?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="配置选项"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okButtonProps={{ loading }}
    >
      <Form form={form} layout="vertical">
        <Form.List name="list">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...rest }) => (
                <Space
                  key={key}
                  align="baseline"
                  style={{ display: "flex", marginBottom: 8 }}
                >
                  <Form.Item {...rest} name={[name, "id"]} hidden>
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="描述"
                    name={[name, "label"]}
                    rules={[{ required: true, message: "请输入描述" }]}
                    style={{ width: 260 }}
                  >
                    <Input maxLength={255} placeholder="例如：正确/错误" />
                  </Form.Item>
                  <Form.Item
                    label="得分"
                    name={[name, "score"]}
                    rules={[{ required: true, message: "请输入得分" }]}
                    style={{ width: 140 }}
                  >
                    <Input type="number" />
                  </Form.Item>
                  <Button danger type="link" onClick={() => remove(name)}>
                    删除
                  </Button>
                </Space>
              ))}
              <Button
                type="dashed"
                onClick={() => add({ label: "", score: 0 })}
                block
              >
                新增选项
              </Button>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default OptionsModal;
