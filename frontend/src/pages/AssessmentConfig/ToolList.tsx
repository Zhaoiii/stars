import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  List,
  Modal,
  Space,
  Typography,
} from "antd";
import { useNavigate } from "react-router-dom";
import { EvaluationAPI } from "@/services/evaluationService";
import { EvaluationToolNodeDTO } from "@/types/evaluation";

const { Title } = Typography;

const ToolList: React.FC = () => {
  const [tools, setTools] = useState<EvaluationToolNodeDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const fetchTools = async () => {
    setLoading(true);
    try {
      const { data } = await EvaluationAPI.getTools();
      if (data.success && Array.isArray(data.data)) setTools(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const handleCreate = async () => {
    const values = await form.validateFields();
    const { data } = await EvaluationAPI.createTool(values);
    if (data.success && data.data) {
      setOpen(false);
      form.resetFields();
      fetchTools();
    }
  };

  return (
    <Card>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          评估工具
        </Title>
        <Button type="primary" onClick={() => setOpen(true)}>
          新建工具
        </Button>
      </Space>

      <List
        loading={loading}
        dataSource={tools}
        renderItem={(item) => (
          <List.Item
            actions={[
              <a
                key="config"
                onClick={() => navigate(`/assessment/${item.id}`)}
              >
                配置
              </a>,
            ]}
          >
            <List.Item.Meta
              title={item.title}
              description={item.description || ""}
            />
          </List.Item>
        )}
      />

      <Modal
        title="新建工具"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleCreate}
        okText="创建"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="名称"
            rules={[{ required: true, message: "请输入名称" }]}
          >
            <Input maxLength={255} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} maxLength={10000} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ToolList;
