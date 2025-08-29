import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Switch, InputNumber, Button, Space, Tag } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;

interface Props {
  open: boolean;
  initialValues?: any;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void> | void;
}

const ItemFormModal: React.FC<Props> = ({ open, initialValues, onCancel, onSubmit }) => {
  const [form] = Form.useForm();
  const [scoreType, setScoreType] = useState<string>("pass_fail");

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (initialValues) {
        form.setFieldsValue(initialValues);
        setScoreType(initialValues.scoreType || "pass_fail");
      }
    }
  }, [open, initialValues]);

  const handleScoreTypeChange = (value: string) => {
    setScoreType(value);
    // 清空评分配置
    form.setFieldsValue({
      scoreConfig: {
        maxScore: undefined,
        passScore: undefined,
        scaleLevels: value === "scale" ? ["好", "中", "差"] : undefined,
        customScoring: false
      }
    });
  };

  const renderScoreConfig = () => {
    switch (scoreType) {
      case "pass_fail":
        return null; // 对错制不需要额外配置
        
      case "scale":
        return (
          <Form.List name={["scoreConfig", "scaleLevels"]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Form.Item
                    {...restField}
                    name={[name]}
                    key={key}
                    rules={[{ required: true, message: "请输入等级名称" }]}
                  >
                    <Space>
                      <Input placeholder="等级名称" style={{ width: 120 }} />
                      {fields.length > 1 && (
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      )}
                    </Space>
                  </Form.Item>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加等级
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        );
        
      case "custom":
        return (
          <>
            <Form.Item
              name={["scoreConfig", "maxScore"]}
              label="最大分数"
              rules={[{ required: true, message: "请输入最大分数" }]}
            >
              <InputNumber min={1} placeholder="最大分数" />
            </Form.Item>
            <Form.Item
              name={["scoreConfig", "passScore"]}
              label="及格分数"
            >
              <InputNumber min={0} placeholder="及格分数" />
            </Form.Item>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={initialValues ? "编辑测试项" : "新增测试项"}
      okText={initialValues ? "保存" : "创建"}
      onOk={() => form.submit()}
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="name"
          label="名称"
          rules={[{ required: true, message: "请输入测试项名称" }]}
        >
          <Input placeholder="测试项名称" />
        </Form.Item>
        
        <Form.Item name="description" label="描述">
          <TextArea rows={3} placeholder="测试项描述（可选）" />
        </Form.Item>
        
        <Form.Item
          name="scoreType"
          label="评分类型"
          rules={[{ required: true, message: "请选择评分类型" }]}
        >
          <Select onChange={handleScoreTypeChange} placeholder="选择评分类型">
            <Option value="pass_fail">对错制</Option>
            <Option value="scale">好中差</Option>
            <Option value="custom">自定义记分</Option>
          </Select>
        </Form.Item>
        
        {scoreType !== "pass_fail" && (
          <Form.Item label="评分配置">
            {renderScoreConfig()}
          </Form.Item>
        )}
        
        <Form.Item name="isRequired" label="是否必填" valuePropName="checked">
          <Switch checkedChildren="是" unCheckedChildren="否" />
        </Form.Item>
        
        <Form.Item name="order" label="排序">
          <InputNumber min={0} placeholder="排序值" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ItemFormModal;
