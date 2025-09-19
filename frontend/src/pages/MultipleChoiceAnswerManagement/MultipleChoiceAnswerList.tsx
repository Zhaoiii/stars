import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Row,
  Col,
  Select,
  Space,
  Table,
  Tag,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { MultipleChoiceAnswerAPI } from "@/services/multipleChoiceAnswerService";
import {
  MultipleChoiceAnswerDTO,
  CreateMultipleChoiceAnswerPayload,
  UpdateMultipleChoiceAnswerPayload,
} from "@/types/multipleChoiceAnswer";
import { EvaluationAPI } from "@/services/evaluationService";
import { EvaluationToolNodeDTO } from "@/types/evaluation";

const MultipleChoiceAnswerList: React.FC = () => {
  const [answers, setAnswers] = useState<MultipleChoiceAnswerDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const [tools, setTools] = useState<EvaluationToolNodeDTO[]>([]);
  const [longTermGoals, setLongTermGoals] = useState<EvaluationToolNodeDTO[]>(
    []
  );

  const [selectedToolId, setSelectedToolId] = useState<string | undefined>();
  const [selectedLongTermGoalId, setSelectedLongTermGoalId] = useState<
    string | undefined
  >();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MultipleChoiceAnswerDTO | null>(null);
  const [form] = Form.useForm();

  // 工具列表
  const fetchTools = async () => {
    try {
      const { data } = await EvaluationAPI.getTools();
      if (data.success && Array.isArray(data.data)) setTools(data.data);
    } catch (e) {
      // ignore
    }
  };

  // 根据工具ID提取长期目标
  const fetchLongTermGoals = async (toolId: string) => {
    try {
      const { data } = await EvaluationAPI.getToolTree(toolId);
      if (data.success && data.data) {
        const extractLongTermGoals = (
          node: EvaluationToolNodeDTO
        ): EvaluationToolNodeDTO[] => {
          const res: EvaluationToolNodeDTO[] = [];
          if (node.nodeType === "long_term_goal") res.push(node);
          (node.children || []).forEach((child) =>
            res.push(...extractLongTermGoals(child))
          );
          return res;
        };
        setLongTermGoals(extractLongTermGoals(data.data));
      } else {
        setLongTermGoals([]);
      }
    } catch (e) {
      setLongTermGoals([]);
    }
  };

  const fetchAnswers = async () => {
    setLoading(true);
    try {
      if (selectedToolId || selectedLongTermGoalId) {
        const { data } = await MultipleChoiceAnswerAPI.getAnswersByQuery({
          toolId: selectedToolId,
          longTermGoalId: selectedLongTermGoalId,
        });
        if (data.success && Array.isArray(data.data)) setAnswers(data.data);
      } else {
        const { data } = await MultipleChoiceAnswerAPI.getAllAnswers();
        if (data.success && Array.isArray(data.data)) setAnswers(data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
    fetchAnswers();
  }, []);

  useEffect(() => {
    if (selectedToolId) {
      fetchLongTermGoals(selectedToolId);
    } else {
      setLongTermGoals([]);
      setSelectedLongTermGoalId(undefined);
    }
  }, [selectedToolId]);

  const onSearch = () => fetchAnswers();
  const onReset = () => {
    setSelectedToolId(undefined);
    setSelectedLongTermGoalId(undefined);
    fetchAnswers();
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
    form.resetFields();
    form.setFieldsValue({
      toolId: selectedToolId,
      longTermGoalId: selectedLongTermGoalId,
    });
  };

  const openEdit = (record: MultipleChoiceAnswerDTO) => {
    setEditing(record);
    setModalOpen(true);
    form.resetFields();
    form.setFieldsValue({
      label: record.label,
      toolId: record.toolId,
      longTermGoalId: record.longTermGoalId,
    });
  };

  const handleSubmit = async () => {
    const values =
      (await form.validateFields()) as CreateMultipleChoiceAnswerPayload &
        UpdateMultipleChoiceAnswerPayload;
    if (editing) {
      const { data } = await MultipleChoiceAnswerAPI.updateAnswer(
        editing.id,
        values
      );
      if (data.success) {
        setModalOpen(false);
        setEditing(null);
        fetchAnswers();
      }
    } else {
      const { data } = await MultipleChoiceAnswerAPI.createAnswer(values);
      if (data.success) {
        setModalOpen(false);
        fetchAnswers();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { data } = await MultipleChoiceAnswerAPI.deleteAnswer(id);
    if (data.success) fetchAnswers();
  };

  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
        width: 120,
      },
      {
        title: "标签",
        dataIndex: "label",
      },
      {
        title: "工具",
        dataIndex: ["tool", "title"],
        render: (_: any, r: MultipleChoiceAnswerDTO) => r.tool?.title || "-",
      },
      {
        title: "长期目标",
        dataIndex: ["longTermGoal", "title"],
        render: (_: any, r: MultipleChoiceAnswerDTO) => (
          <Space>
            <span>{r.longTermGoal?.title || "-"}</span>
            {r.longTermGoal?.targetAge ? (
              <Tag color="blue">{r.longTermGoal.targetAge}月</Tag>
            ) : null}
          </Space>
        ),
      },
      {
        title: "创建人",
        dataIndex: ["creator", "username"],
        render: (_: any, r: MultipleChoiceAnswerDTO) =>
          r.creator?.username || (r.createdBy ? r.createdBy : "系统"),
        width: 160,
      },
      {
        title: "创建时间",
        dataIndex: "createdAt",
        width: 180,
      },
      {
        title: "操作",
        key: "actions",
        width: 160,
        render: (_: any, record: MultipleChoiceAnswerDTO) => (
          <Space>
            <Button
              size="small"
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            >
              编辑
            </Button>
            <Popconfirm
              title="确认删除该答案？"
              onConfirm={() => handleDelete(record.id)}
              okText="删除"
              cancelText="取消"
            >
              <Button size="small" type="text" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [answers]
  );

  return (
    <Card
      title="多选答案管理"
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchAnswers}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建答案
          </Button>
        </Space>
      }
    >
      <Row gutter={12} style={{ marginBottom: 12 }}>
        <Col span={8}>
          <Select
            allowClear
            placeholder="选择评估工具"
            style={{ width: "100%" }}
            value={selectedToolId}
            onChange={setSelectedToolId}
            options={tools.map((t) => ({ label: t.title, value: t.id }))}
          />
        </Col>
        <Col span={8}>
          <Select
            allowClear
            placeholder="选择长期目标"
            style={{ width: "100%" }}
            value={selectedLongTermGoalId}
            onChange={setSelectedLongTermGoalId}
            options={longTermGoals.map((g) => ({
              label: `${g.title}${g.targetAge ? ` (${g.targetAge}月)` : ""}`,
              value: g.id,
            }))}
            disabled={!selectedToolId}
          />
        </Col>
      </Row>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={onSearch}>
          查询
        </Button>
        <Button onClick={onReset}>重置</Button>
      </Space>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={answers}
        columns={columns as any}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editing ? "编辑答案" : "新建答案"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onOk={handleSubmit}
        okText={editing ? "保存" : "创建"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="label"
            label="标签"
            rules={[{ required: true, message: "请输入标签" }]}
          >
            <Input maxLength={255} />
          </Form.Item>
          <Form.Item
            name="toolId"
            label="所属评估工具"
            rules={[{ required: true, message: "请选择评估工具" }]}
          >
            <Select
              placeholder="请选择评估工具"
              options={tools.map((t) => ({ label: t.title, value: t.id }))}
              onChange={(val) => {
                form.setFieldsValue({ longTermGoalId: undefined });
                setSelectedToolId(val);
              }}
            />
          </Form.Item>
          <Form.Item
            name="longTermGoalId"
            label="所属长期目标"
            rules={[{ required: true, message: "请选择长期目标" }]}
          >
            <Select
              placeholder="请选择长期目标"
              disabled={!form.getFieldValue("toolId")}
              options={longTermGoals.map((g) => ({
                label: `${g.title}${g.targetAge ? ` (${g.targetAge}月)` : ""}`,
                value: g.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default MultipleChoiceAnswerList;
