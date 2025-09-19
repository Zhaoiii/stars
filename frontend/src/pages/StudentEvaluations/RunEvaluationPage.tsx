import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Card,
  Collapse,
  Checkbox,
  Radio,
  Space,
  Typography,
  InputNumber,
  message,
  Spin,
} from "antd";
import { EvaluationAPI } from "@/services/evaluationService";
import { EvaluationRecordAPI } from "@/services/evaluationRecordService";
import { MultipleChoiceAnswerAPI } from "@/services/multipleChoiceAnswerService";
import {
  EvaluationNodeType,
  EvaluationScoringType,
  EvaluationToolNodeDTO,
} from "@/types/evaluation";

const { Panel } = Collapse;
const { Title, Paragraph } = Typography;

type ChildrenState = Record<
  string,
  { loaded: boolean; loading: boolean; children: EvaluationToolNodeDTO[] }
>; // nodeId -> children
type OptionsState = Record<
  string,
  {
    loaded: boolean;
    loading: boolean;
    options: { id: string; label: string }[];
  }
>; // nodeId -> options

const RunEvaluationPage: React.FC = () => {
  const { recordId } = useParams<{ id: string; recordId: string }>();
  const [root, setRoot] = useState<EvaluationToolNodeDTO | null>(null);
  const [childrenMap, setChildrenMap] = useState<ChildrenState>({});
  const [optionsMap, setOptionsMap] = useState<OptionsState>({});
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [bootLoading, setBootLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toolId, setToolId] = useState<string | null>(null);
  const [recordStatus, setRecordStatus] = useState<
    "pending" | "in_progress" | "completed" | null
  >(null);
  const readOnly = recordStatus === "completed";

  // 初始化：start 评估并拿到 toolId，然后仅加载根节点信息（树头），子节点下钻按展开再请求
  useEffect(() => {
    const bootstrap = async () => {
      if (!recordId) return;
      setBootLoading(true);
      try {
        const detail = await EvaluationRecordAPI.getById(recordId);
        setRecordStatus(detail.data.data?.status || null);
        const started = readOnly
          ? detail
          : await EvaluationRecordAPI.start(recordId);
        const tool = (started.data.data?.toolId as string) || null;
        if (tool) {
          setToolId(tool);
          const rootRes = await EvaluationAPI.getToolTree(tool);
          const rootNode = rootRes.data.data as EvaluationToolNodeDTO;
          // 为避免一次性渲染庞大树，仅保留根元信息，并清空其 children，按需加载
          setRoot({ ...rootNode, children: [] });
          setChildrenMap((prev) => ({
            ...prev,
            [rootNode.id]: { loaded: false, loading: false, children: [] },
          }));
          // 拉取已保存的条目用于回显
          const itemsRes = await EvaluationRecordAPI.listItems(recordId);
          const items = itemsRes.data.data || [];
          const mapped: Record<string, any> = {};
          for (const it of items) {
            mapped[it.longTermGoalId] = it.answer ?? {};
          }
          setAnswers(mapped);
        }
      } catch (e: any) {
        message.error(e.response?.data?.message || "初始化失败");
      } finally {
        setBootLoading(false);
      }
    };
    bootstrap();
  }, [recordId]);

  const onExpand = async (node: EvaluationToolNodeDTO) => {
    // 展开分类/目标节点：懒加载子节点
    const entry = childrenMap[node.id];
    if (!entry || (!entry.loaded && !entry.loading)) {
      setChildrenMap((prev) => ({
        ...prev,
        [node.id]: {
          ...(prev[node.id] || { children: [] }),
          loading: true,
          loaded: false,
        },
      }));
      try {
        const res = await EvaluationAPI.getChildren(node.id);
        const children: EvaluationToolNodeDTO[] = res.data.data || [];
        setChildrenMap((prev) => ({
          ...prev,
          [node.id]: { loaded: true, loading: false, children },
        }));
        // 注册可继续展开的子节点（非长期目标）
        setChildrenMap((prev) => {
          const next: ChildrenState = { ...prev };
          for (const child of children) {
            if (child.nodeType !== EvaluationNodeType.LONG_TERM_GOAL) {
              if (!next[child.id]) {
                next[child.id] = {
                  loaded: false,
                  loading: false,
                  children: [],
                };
              }
            }
          }
          return next;
        });
      } catch (e: any) {
        setChildrenMap((prev) => ({
          ...prev,
          [node.id]: { loaded: false, loading: false, children: [] },
        }));
        message.error(e.response?.data?.message || "加载子节点失败");
      }
    }

    // 如果自身是多选题，展开时加载选项
    if (node.scoringType === EvaluationScoringType.MULTIPLE_CHOICE) {
      await loadOptions(node.id);
    }
  };

  const loadOptions = async (nodeId: string) => {
    const opEntry = optionsMap[nodeId];
    if (opEntry && (opEntry.loaded || opEntry.loading)) return;
    setOptionsMap((prev) => ({
      ...prev,
      [nodeId]: {
        ...(prev[nodeId] || { options: [] }),
        loading: true,
        loaded: false,
      },
    }));
    try {
      const res = await MultipleChoiceAnswerAPI.getAnswersByQuery({
        toolId: toolId || undefined,
        longTermGoalId: nodeId,
      });
      const options = (res.data.data || []).map((o: any) => ({
        id: o.id,
        label: o.label,
      }));
      setOptionsMap((prev) => ({
        ...prev,
        [nodeId]: { loaded: true, loading: false, options },
      }));
    } catch (e: any) {
      setOptionsMap((prev) => ({
        ...prev,
        [nodeId]: { loaded: false, loading: false, options: [] },
      }));
      message.error(e.response?.data?.message || "加载选项失败");
    }
  };

  const saveItem = async (longTermGoalId: string, answer: any) => {
    if (!recordId) return;
    if (readOnly) return;
    try {
      setSaving(true);
      await EvaluationRecordAPI.upsertItem(recordId, {
        longTermGoalId,
        answer,
      });
      setAnswers((prev) => ({ ...prev, [longTermGoalId]: answer }));
    } catch (e: any) {
      message.error(e.response?.data?.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const updateQuantity = (id: string, quantity: number) =>
    saveItem(id, { quantity });
  const saveSingle = (id: string, label: string) => saveItem(id, { label });
  const saveMultiple = (id: string, selected: string[]) =>
    saveItem(id, { selected });

  const renderLeaf = (node: EvaluationToolNodeDTO) => {
    if (node.scoringType === EvaluationScoringType.QUANTITY) {
      const current = Number(answers[node.id]?.quantity ?? 0);
      return (
        <Space>
          <span>数量</span>
          <Button
            disabled={readOnly}
            onClick={() => updateQuantity(node.id, Math.max(0, current - 1))}
          >
            -1
          </Button>
          <InputNumber
            disabled={readOnly}
            min={0}
            value={current}
            onChange={(v) => updateQuantity(node.id, Number(v ?? 0))}
          />
          <Button
            type="primary"
            disabled={readOnly}
            onClick={() => updateQuantity(node.id, current + 1)}
          >
            +1
          </Button>
        </Space>
      );
    }
    if (node.scoringType === EvaluationScoringType.SINGLE_CHOICE) {
      const val = answers[node.id]?.label;
      return (
        <Radio.Group
          disabled={readOnly}
          value={val}
          onChange={(e) => saveSingle(node.id, e.target.value)}
        >
          {(node.scoringConfig || []).map((r: any) => (
            <Radio key={r.label} value={r.label}>
              {r.label}
            </Radio>
          ))}
        </Radio.Group>
      );
    }
    if (node.scoringType === EvaluationScoringType.MULTIPLE_CHOICE) {
      const values: string[] = answers[node.id]?.selected || [];
      const opEntry = optionsMap[node.id];
      if (!opEntry) {
        // 首次渲染兜底加载
        void loadOptions(node.id);
        return <Spin size="small" />;
      }
      if (opEntry.loading) return <Spin size="small" />;
      return (
        <Checkbox.Group
          disabled={readOnly}
          value={values}
          onChange={(vals) => saveMultiple(node.id, vals as string[])}
        >
          {(opEntry.options || []).map((op) => (
            <Checkbox key={op.id} value={op.id}>
              {op.label}
            </Checkbox>
          ))}
        </Checkbox.Group>
      );
    }
    return <Paragraph type="secondary">该项无需作答</Paragraph>;
  };

  const renderNode = (node: EvaluationToolNodeDTO) => {
    const entry = childrenMap[node.id];
    const hasChildren = !!entry; // 有 childrenMap 记录的都认为可以展开
    if (hasChildren) {
      const inner = entry?.children || [];
      return (
        <Collapse
          onChange={(keys) => {
            // 当展开该 Panel 时触发加载
            if (
              Array.isArray(keys) ? keys.includes(node.id) : keys === node.id
            ) {
              onExpand(node);
            }
          }}
        >
          <Panel header={node.title} key={node.id}>
            {entry?.loading ? (
              <Spin />
            ) : (
              <div>
                {inner.map((c) => (
                  <div key={c.id} style={{ marginBottom: 12 }}>
                    {renderNode({ ...c, children: [] })}
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </Collapse>
      );
    }
    return (
      <Card size="small" title={node.title} style={{ marginBottom: 8 }}>
        {renderLeaf(node)}
      </Card>
    );
  };

  const submit = async () => {
    if (!recordId) return;
    try {
      await EvaluationRecordAPI.submit(recordId);
      message.success("已提交");
    } catch (e: any) {
      message.error(e.response?.data?.message || "提交失败");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>学生评估</Title>
      {bootLoading || !root ? <Spin /> : renderNode(root)}
      <Space style={{ marginTop: 16 }}>
        <Button
          type="primary"
          onClick={submit}
          loading={saving}
          disabled={readOnly}
        >
          提交评估
        </Button>
      </Space>
    </div>
  );
};

export default RunEvaluationPage;
