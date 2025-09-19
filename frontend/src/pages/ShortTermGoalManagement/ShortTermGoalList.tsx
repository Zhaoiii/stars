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
  Tag,
  Popconfirm,
  Select,
  Row,
  Col,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { ShortTermGoalAPI } from "@/services/shortTermGoalService";
import { EvaluationAPI } from "@/services/evaluationService";
import { ShortTermGoalDTO } from "@/types/shortTermGoal";
import { EvaluationToolNodeDTO } from "@/types/evaluation";

const { Title } = Typography;

const ShortTermGoalList: React.FC = () => {
  const [goals, setGoals] = useState<ShortTermGoalDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<ShortTermGoalDTO | null>(null);
  const [tools, setTools] = useState<EvaluationToolNodeDTO[]>([]);
  const [longTermGoals, setLongTermGoals] = useState<EvaluationToolNodeDTO[]>(
    []
  );
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const fetchTools = async () => {
    try {
      const { data } = await EvaluationAPI.getTools();
      if (data.success && Array.isArray(data.data)) setTools(data.data);
    } catch (error) {
      console.error("获取评估工具失败:", error);
    }
  };

  const fetchLongTermGoals = async (toolId: string) => {
    try {
      const { data } = await EvaluationAPI.getToolTree(toolId);
      if (data.success && data.data) {
        const extractLongTermGoals = (
          node: EvaluationToolNodeDTO
        ): EvaluationToolNodeDTO[] => {
          const results: EvaluationToolNodeDTO[] = [];
          if (node.nodeType === "long_term_goal") {
            results.push(node);
          }
          if (node.children) {
            node.children.forEach((child) => {
              results.push(...extractLongTermGoals(child));
            });
          }
          return results;
        };
        setLongTermGoals(extractLongTermGoals(data.data));
      }
    } catch (error) {
      console.error("获取长期目标失败:", error);
    }
  };

  const fetchGoals = async () => {
    setLoading(true);
    try {
      if (selectedToolId) {
        const { data } = await ShortTermGoalAPI.getGoalsByToolId(
          selectedToolId
        );
        if (data.success && Array.isArray(data.data)) setGoals(data.data);
      } else {
        const { data } = await ShortTermGoalAPI.getAllGoals();
        if (data.success && Array.isArray(data.data)) setGoals(data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
    fetchGoals();
  }, []);

  useEffect(() => {
    if (selectedToolId) {
      fetchLongTermGoals(selectedToolId);
      fetchGoals(); // 重新获取该工具下的短期目标
    } else {
      setLongTermGoals([]);
    }
  }, [selectedToolId]);

  const handleCreate = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      toolId: selectedToolId!,
    };
    const { data } = await ShortTermGoalAPI.createGoal(payload);
    if (data.success && data.data) {
      setModalOpen(false);
      form.resetFields();
      fetchGoals();
    }
  };

  const handleEdit = (goal: ShortTermGoalDTO) => {
    setEditingGoal(goal);
    setModalOpen(true);
    form.setFieldsValue({
      ...goal,
    });
  };

  const handleUpdate = async () => {
    if (!editingGoal) return;
    const values = await form.validateFields();
    const { data } = await ShortTermGoalAPI.updateGoal(editingGoal.id, values);
    if (data.success) {
      setModalOpen(false);
      setEditingGoal(null);
      form.resetFields();
      fetchGoals();
    }
  };

  const handleDelete = async (id: string) => {
    const { data } = await ShortTermGoalAPI.deleteGoal(id);
    if (data.success) fetchGoals();
  };

  // 移除过滤逻辑，因为现在直接根据工具ID获取短期目标
  const filteredGoals = goals;

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
          短期目标管理
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          disabled={!selectedToolId}
          onClick={() => {
            setEditingGoal(null);
            setModalOpen(true);
            form.resetFields();
          }}
        >
          新建短期目标
        </Button>
      </Space>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Select
            placeholder="请选择评估工具"
            style={{ width: "100%" }}
            value={selectedToolId}
            onChange={setSelectedToolId}
            options={tools.map((tool) => ({
              label: tool.title,
              value: tool.id,
            }))}
          />
        </Col>
        <Col span={12}>
          <span style={{ color: "#666" }}>
            {selectedToolId
              ? `已选择工具，共 ${longTermGoals.length} 个长期目标`
              : "请先选择评估工具"}
          </span>
        </Col>
      </Row>

      <List
        loading={loading}
        dataSource={filteredGoals}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button
                key="edit"
                size="small"
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEdit(item)}
              >
                编辑
              </Button>,
              <Popconfirm
                key="delete"
                title="确认删除该短期目标？"
                onConfirm={() => handleDelete(item.id)}
                okText="删除"
                cancelText="取消"
              >
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                >
                  删除
                </Button>
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  <span>{item.title}</span>
                  {item.tool && (
                    <Tag color="green">工具：{item.tool.title}</Tag>
                  )}
                  {item.longTermGoal && (
                    <Tag color="blue">所属：{item.longTermGoal.title}</Tag>
                  )}
                </Space>
              }
              description={item.description || ""}
            />
          </List.Item>
        )}
      />

      <Modal
        title={editingGoal ? "编辑短期目标" : "新建短期目标"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingGoal(null);
          form.resetFields();
        }}
        onOk={editingGoal ? handleUpdate : handleCreate}
        okText={editingGoal ? "保存" : "创建"}
        width={600}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="longTermGoalId"
            label="所属长期目标"
            rules={[{ required: true, message: "请选择所属长期目标" }]}
          >
            <Select
              placeholder="请选择长期目标"
              disabled={!!editingGoal}
              options={longTermGoals.map((goal) => ({
                label: `${goal.title}${
                  goal.targetAge ? ` (${goal.targetAge}月)` : ""
                }`,
                value: goal.id,
              }))}
            />
          </Form.Item>
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

export default ShortTermGoalList;
