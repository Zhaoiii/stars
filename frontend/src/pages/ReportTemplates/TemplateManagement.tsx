import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Table,
  Space,
  Tag,
  Typography,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  ReportTemplateAPI,
  ReportTemplateDTO,
} from "@/services/reportTemplateService";
import { EvaluationAPI } from "@/services/evaluationService";

const { Title } = Typography;

const TemplateManagement: React.FC = () => {
  const [templates, setTemplates] = useState<ReportTemplateDTO[]>([]);
  const [tools, setTools] = useState<Array<{ id: string; title: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<ReportTemplateDTO | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const [templatesRes, toolsRes] = await Promise.all([
        ReportTemplateAPI.getAll(),
        EvaluationAPI.getTools(),
      ]);

      if (templatesRes.data.success) {
        setTemplates(templatesRes.data.data || []);
      }

      if (toolsRes.data.success) {
        setTools(toolsRes.data.data || []);
      }
    } catch (error) {
      message.error("加载数据失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 打开创建/编辑模态框
  const openModal = (template?: ReportTemplateDTO) => {
    setEditingTemplate(template || null);
    setModalVisible(true);
    if (template) {
      form.setFieldsValue({
        toolId: template.toolId,
        title: template.title,
        description: template.description,
        status: template.status,
      });
    } else {
      form.resetFields();
    }
  };

  // 关闭模态框
  const closeModal = () => {
    setModalVisible(false);
    setEditingTemplate(null);
    form.resetFields();
  };

  // 保存模板
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (editingTemplate) {
        // 更新模板
        await ReportTemplateAPI.update(editingTemplate.id, values);
        message.success("更新模板成功");
      } else {
        // 创建模板
        await ReportTemplateAPI.create({
          ...values,
          content: { type: "doc", content: [] }, // 默认空内容
        });
        message.success("创建模板成功");
      }

      closeModal();
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || "保存失败");
    }
  };

  // 删除模板
  const handleDelete = async (id: string) => {
    try {
      await ReportTemplateAPI.delete(id);
      message.success("删除模板成功");
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || "删除失败");
    }
  };

  // 发布/取消发布模板
  const handleToggleStatus = async (template: ReportTemplateDTO) => {
    try {
      if (template.status === "draft") {
        await ReportTemplateAPI.publish(template.id);
        message.success("发布模板成功");
      } else {
        await ReportTemplateAPI.unpublish(template.id);
        message.success("取消发布模板成功");
      }
      loadData();
    } catch (error: any) {
      message.error("操作失败");
    }
  };

  // 编辑模板内容
  const handleEditContent = (template: ReportTemplateDTO) => {
    navigate(`/report-templates/editor?templateId=${template.id}`);
  };

  const columns = [
    {
      title: "模板名称",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "绑定工具",
      dataIndex: ["tool", "title"],
      key: "toolTitle",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "published" ? "green" : "orange"}>
          {status === "published" ? "已发布" : "草稿"}
        </Tag>
      ),
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "操作",
      key: "actions",
      render: (_: any, record: ReportTemplateDTO) => (
        <Space>
          <Tooltip title="编辑内容">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditContent(record)}
            />
          </Tooltip>
          <Tooltip title="编辑信息">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => openModal(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === "published" ? "取消发布" : "发布"}>
            <Button
              type="text"
              icon={
                record.status === "published" ? (
                  <CloseOutlined />
                ) : (
                  <CheckOutlined />
                )
              }
              onClick={() => handleToggleStatus(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个模板吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={4}>报告模板管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          创建模板
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={templates}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title={editingTemplate ? "编辑模板" : "创建模板"}
        open={modalVisible}
        onCancel={closeModal}
        onOk={handleSave}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="toolId"
            label="绑定评估工具"
            rules={[{ required: true, message: "请选择评估工具" }]}
          >
            <Select
              placeholder="选择评估工具"
              disabled={!!editingTemplate} // 编辑时不允许更换工具
            >
              {tools.map((tool) => (
                <Select.Option key={tool.id} value={tool.id}>
                  {tool.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="title"
            label="模板名称"
            rules={[{ required: true, message: "请输入模板名称" }]}
          >
            <Input placeholder="请输入模板名称" />
          </Form.Item>
          <Form.Item name="description" label="模板描述">
            <Input.TextArea rows={3} placeholder="请输入模板描述" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="draft">
            <Select>
              <Select.Option value="draft">草稿</Select.Option>
              <Select.Option value="published">已发布</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TemplateManagement;
