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
  EvaluationScoringType,
  EvaluationToolNodeDTO,
  QuantityRule,
  SingleChoiceRule,
} from "@/types/evaluation";

const { Panel } = Collapse;
const { Title, Paragraph } = Typography;

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
  const [optionsMap, setOptionsMap] = useState<OptionsState>({});
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [bootLoading, setBootLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toolId, setToolId] = useState<string | null>(null);
  const [recordStatus, setRecordStatus] = useState<
    "pending" | "in_progress" | "completed" | null
  >(null);
  const readOnly = recordStatus === "completed";

  // 初始化：start 评估，拿到 toolId，并一次性加载完整树与需要的多选项
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
          // 一次性加载完整树
          setRoot(rootNode);
          // 预加载所有多选节点的选项
          const collectIds = (n: EvaluationToolNodeDTO, acc: string[] = []) => {
            if (n.scoringType === EvaluationScoringType.MULTIPLE_CHOICE) {
              acc.push(n.id);
            }
            (n.children || []).forEach((c) => collectIds(c, acc));
            return acc;
          };
          const allMultiIds = collectIds(rootNode, []);
          await Promise.all(allMultiIds.map((nid) => loadOptions(nid)));
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

  // 计算分数
  const calculateScore = (node: EvaluationToolNodeDTO, answer: any): number => {
    if (!node.scoringConfig || !Array.isArray(node.scoringConfig)) {
      return 0;
    }

    if (node.scoringType === EvaluationScoringType.QUANTITY) {
      const quantity = answer?.quantity || 0;
      // 按数量从大到小排序，找到第一个满足条件的等级
      const sortedRules = [...(node.scoringConfig as QuantityRule[])].sort(
        (a, b) => b.quantity - a.quantity
      );
      for (const rule of sortedRules) {
        if (quantity >= rule.quantity) {
          return rule.score;
        }
      }
      return 0;
    }

    if (node.scoringType === EvaluationScoringType.MULTIPLE_CHOICE) {
      const selectedCount = answer?.selected?.length || 0;
      // 按数量从大到小排序，找到第一个满足条件的等级
      const sortedRules = [...(node.scoringConfig as QuantityRule[])].sort(
        (a, b) => b.quantity - a.quantity
      );
      for (const rule of sortedRules) {
        if (selectedCount >= rule.quantity) {
          return rule.score;
        }
      }
      return 0;
    }

    if (node.scoringType === EvaluationScoringType.SINGLE_CHOICE) {
      const selectedLabel = answer?.label;
      if (!selectedLabel) return 0;
      // 找到匹配的选项
      const rule = (node.scoringConfig as SingleChoiceRule[]).find(
        (r) => r.label === selectedLabel
      );
      return rule?.score || 0;
    }

    return 0;
  };

  const saveItem = async (longTermGoalId: string, answer: any) => {
    if (!recordId) return;
    if (readOnly) return;
    try {
      setSaving(true);

      // 找到对应的节点来计算分数
      const findNode = (
        node: EvaluationToolNodeDTO,
        targetId: string
      ): EvaluationToolNodeDTO | null => {
        if (node.id === targetId) return node;
        for (const child of node.children || []) {
          const found = findNode(child, targetId);
          if (found) return found;
        }
        return null;
      };

      const node = root ? findNode(root, longTermGoalId) : null;
      const score = node ? calculateScore(node, answer) : 0;

      await EvaluationRecordAPI.upsertItem(recordId, {
        longTermGoalId,
        answer,
        score,
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
    const inner = node.children || [];
    const hasChildren = inner.length > 0;
    if (hasChildren) {
      return (
        <Collapse defaultActiveKey={[node.id]}>
          <Panel header={node.title} key={node.id}>
            <div>
              {inner.map((c) => (
                <div key={c.id} style={{ marginBottom: 12 }}>
                  {renderNode(c)}
                </div>
              ))}
            </div>
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
