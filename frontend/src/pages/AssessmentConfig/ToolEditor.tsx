import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Space,
  Tree,
} from "antd";
import { Tooltip } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import ScoringConfig from "./components/ScoringConfig";
import OptionsModal from "./components/OptionsModal";
import { EvaluationAPI } from "@/services/evaluationService";
import {
  EvaluationNodeType,
  EvaluationScoringType,
  EvaluationToolNodeDTO,
} from "@/types/evaluation";

type TreeNode = {
  title: React.ReactNode;
  key: string;
  children?: TreeNode[];
};

const ToolEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tree, setTree] = useState<EvaluationToolNodeDTO | null>(null);
  const [nodeModalOpen, setNodeModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    if (!id) return;
    const { data } = await EvaluationAPI.getToolTree(id);
    if (data.success) setTree(data.data as any);
  };

  useEffect(() => {
    load();
  }, [id]);

  const openCreateNode = (parentId?: string) => {
    setIsEdit(false);
    setNodeModalOpen(true);
    form.resetFields();
    form.setFieldsValue({
      parentId: parentId || id,
      nodeType: EvaluationNodeType.LONG_TERM_GOAL,
      scoringType: EvaluationScoringType.QUANTITY,
    });
  };

  const openEditNode = (node: EvaluationToolNodeDTO) => {
    setIsEdit(true);
    setNodeModalOpen(true);
    form.resetFields();
    form.setFieldsValue({
      id: node?.id || undefined,
      parentId: node.parentId,
      nodeType: node.nodeType,
      title: node.title,
      description: node.description || undefined,
      targetAge: node.targetAge || undefined,
      order: node.order,
      scoringType: node.scoringType,
      // 直接回显数组，避免字符串化导致 Form.List 不渲染
      scoringConfig: node.scoringConfig || undefined,
      _editId: node.id,
    } as any);
  };

  const confirmDeleteNode = (nodeId: string) => {
    Modal.confirm({
      title: "确认删除该节点？",
      content:
        "将级联删除其所有子节点、短期目标、多选答案和评分选项，且不可恢复。",
      okText: "删除",
      okButtonProps: { danger: true },
      onOk: async () => {
        await EvaluationAPI.deleteNode(nodeId);
        load();
      },
    });
  };

  const handleSubmitNode = async () => {
    const values = await form.validateFields();
    if (
      typeof values.scoringConfig === "string" &&
      values.scoringConfig.trim()
    ) {
      try {
        values.scoringConfig = JSON.parse(values.scoringConfig);
      } catch (e) {
        Modal.error({ title: "评分配置 JSON 解析失败" });
        return;
      }
    }
    if (isEdit) {
      const { id: editId, ...payload } = values;
      await EvaluationAPI.updateNode(editId, payload);
    } else {
      await EvaluationAPI.createNode(values);
    }
    setNodeModalOpen(false);
    load();
  };

  const renderTitle = (node: EvaluationToolNodeDTO) => (
    <Space>
      <span>{node.title}</span>
      {node.targetAge && (
        <span style={{ color: "#666", fontSize: "12px" }}>
          ({node.targetAge}月)
        </span>
      )}
      <Space size={8}>
        <Tooltip title="新增子节点">
          <Button
            size="small"
            type="text"
            icon={<PlusOutlined />}
            onClick={() => openCreateNode(node.id)}
          />
        </Tooltip>
        {node.nodeType === EvaluationNodeType.LONG_TERM_GOAL && (
          <Tooltip title="配置短期目标">
            <Button
              size="small"
              type="text"
              icon={<PlusOutlined />}
              onClick={() =>
                window.open(
                  `/short-term-goals?longTermGoalId=${node.id}`,
                  "_blank"
                )
              }
            >
              短期目标
            </Button>
          </Tooltip>
        )}
        <Tooltip title="编辑">
          <Button
            size="small"
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditNode(node)}
          />
        </Tooltip>
        <Tooltip title="删除">
          <Button
            size="small"
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => confirmDeleteNode(node.id)}
          />
        </Tooltip>
      </Space>
    </Space>
  );

  const antdTreeData = useMemo<TreeNode[]>(() => {
    const convert = (node: EvaluationToolNodeDTO): TreeNode => ({
      title: renderTitle(node),
      key: node.id,
      children: (node.children || []).map(convert),
    });
    return tree ? [convert(tree)] : [];
  }, [tree]);

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Card title="工具结构">
        <Tree
          treeData={antdTreeData}
          defaultExpandAll
          draggable
          onDrop={async (info) => {
            // 仅允许同级内重排
            const dragKey = (info.dragNode as any).key as string;
            const dropKey = (info.node as any).key as string;

            // 简易：读取当前 tree，若父不同则忽略
            const findParentId = (
              root: any,
              id: string,
              parentId: string | null = null
            ): string | null => {
              if (!root) return null;
              if (String(root.id) === String(id)) return parentId;
              for (const c of root.children || []) {
                const r = findParentId(c, id, root.id as any);
                if (r !== null) return r;
              }
              return null;
            };
            const parentIdA = findParentId(tree, dragKey);
            const parentIdB = findParentId(tree, dropKey);
            if (String(parentIdA) !== String(parentIdB)) return;

            // 取同级孩子，构造新顺序
            const siblings = ((): any[] => {
              const findSiblings = (root: any, pid: string | null): any[] => {
                if (!root) return [];
                if (String(root.id) === String(pid))
                  return [...(root.children || [])];
                for (const c of root.children || []) {
                  const r = findSiblings(c, pid);
                  if (r.length) return r;
                }
                return [];
              };
              return findSiblings(tree, parentIdA);
            })();

            const dragIndex = siblings.findIndex(
              (s) => String(s.id) === String(dragKey)
            );
            const dropIndex = siblings.findIndex(
              (s) => String(s.id) === String(dropKey)
            );
            if (dragIndex < 0 || dropIndex < 0) return;

            const newOrder = [...siblings];
            const [moved] = newOrder.splice(dragIndex, 1);
            // 非交换：插入到 dropIndex 位置
            newOrder.splice(dropIndex, 0, moved);

            const orderedChildIds = newOrder.map((n) => String(n.id));
            await EvaluationAPI.reorderChildren(
              String(parentIdA || id),
              orderedChildIds
            );
            load();
          }}
        />
      </Card>

      <Modal
        title={isEdit ? "编辑节点" : "新增节点"}
        open={nodeModalOpen}
        onCancel={() => setNodeModalOpen(false)}
        onOk={handleSubmitNode}
        okText={isEdit ? "保存" : "创建"}
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="id" label="ID" hidden>
            <InputNumber />
          </Form.Item>
          <Form.Item
            name="parentId"
            label="父节点ID"
            rules={[{ required: true }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="nodeType"
            label="节点类型"
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Radio.Button value={EvaluationNodeType.CATEGORY}>
                分类
              </Radio.Button>
              <Radio.Button value={EvaluationNodeType.LONG_TERM_GOAL}>
                长期目标
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="title" label="名称" rules={[{ required: true }]}>
            <Input maxLength={255} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} maxLength={10000} />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(p, c) => p.nodeType !== c.nodeType}>
            {({ getFieldValue }) => {
              const nodeType = getFieldValue("nodeType");
              if (nodeType === EvaluationNodeType.LONG_TERM_GOAL) {
                return (
                  <Form.Item
                    name="targetAge"
                    label="目标月龄"
                    rules={[
                      { required: true, message: "长期目标必须填写目标月龄" },
                      {
                        type: "number",
                        min: 1,
                        max: 1440,
                        message: "目标月龄必须在 1-1440 之间",
                      },
                    ]}
                  >
                    <InputNumber
                      type="number"
                      min={1}
                      max={1440}
                      placeholder="请输入目标月龄（1-1440个月）"
                    />
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>
          {/* 移除手动排序，改为自动追加与拖拽重排 */}
          <Form.Item noStyle shouldUpdate={(p, c) => p.nodeType !== c.nodeType}>
            {({ getFieldValue, setFieldsValue }) => {
              const isCategory =
                getFieldValue("nodeType") === EvaluationNodeType.CATEGORY;
              if (isCategory) {
                setFieldsValue({
                  scoringType: EvaluationScoringType.NONE,
                  scoringConfig: undefined,
                });
              }
              return (
                <Form.Item
                  name="scoringType"
                  label="评分方式"
                  rules={[{ required: true }]}
                >
                  <Select
                    disabled={isCategory}
                    options={[
                      { label: "无", value: EvaluationScoringType.NONE },
                      {
                        label: "数量型",
                        value: EvaluationScoringType.QUANTITY,
                      },
                      {
                        label: "单选型",
                        value: EvaluationScoringType.SINGLE_CHOICE,
                      },
                      {
                        label: "多选型",
                        value: EvaluationScoringType.MULTIPLE_CHOICE,
                      },
                    ]}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(p, c) => p.scoringType !== c.scoringType}
          >
            {({ getFieldValue }) => {
              const t = getFieldValue("scoringType");
              return <ScoringConfig scoringType={t} />;
            }}
          </Form.Item>

          {/* 多选：选项管理按钮 */}
          <Form.Item
            noStyle
            shouldUpdate={(p, c) => p.scoringType !== c.scoringType}
          >
            {({ getFieldValue }) => {
              const t = getFieldValue("scoringType");
              const currentNodeId = (form.getFieldValue as any)("_editId");
              if (
                t === EvaluationScoringType.MULTIPLE_CHOICE &&
                isEdit &&
                currentNodeId
              ) {
                return (
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <OptionsModal
                      nodeId={currentNodeId}
                      open={false}
                      onClose={() => {}}
                    />
                    <Form.Item label="配置选项">
                      <Button
                        onClick={() => {
                          // 利用额外的局部状态打开弹窗更优，这里先简单放置
                          (Modal as any).info({
                            title:
                              "请通过节点上的“编辑”进入并使用弹窗按钮配置选项",
                            okText: "知道了",
                          });
                        }}
                      >
                        打开选项配置
                      </Button>
                    </Form.Item>
                  </Space>
                );
              }
              return null;
            }}
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default ToolEditor;
