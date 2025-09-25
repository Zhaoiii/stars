import React from "react";
import {
  Button,
  Card,
  Divider,
  Flex,
  Input,
  InputNumber,
  message,
  Popover,
  Radio,
  Space,
  Typography,
} from "antd";
import {
  EvaluationScoringType,
  EvaluationToolNodeDTO,
  QuantityRule,
  SingleChoiceRule,
} from "@/types/evaluation";
import { EvaluationRecordAPI } from "@/services/evaluationRecordService";
import { useParams } from "react-router-dom";
import MutipleNode from "./MutipleNode";

//

const LeafNode = ({
  node,
  answers,
  setAnswers,
  readOnly,
  setSaving,
  remarks,
  setRemarks,
  toolId,
}: {
  node: EvaluationToolNodeDTO;
  answers: Record<string, any>;
  setAnswers: (answers: Record<string, any>) => void;
  readOnly: boolean;
  setSaving: (saving: boolean) => void;
  remarks: Record<string, string | undefined>;
  setRemarks: (r: Record<string, string | undefined>) => void;
  toolId?: string;
}) => {
  const { recordId } = useParams<{ id: string; recordId: string }>();

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

      //   const node = root ? findNode(root, longTermGoalId) : null;
      const score = node ? calculateScore(node, answer) : 0;

      await EvaluationRecordAPI.upsertItem(recordId, {
        longTermGoalId,
        answer,
        score,
        remark: remarks[longTermGoalId] ?? null,
      });
      setAnswers((prev: Record<string, any>) => ({
        ...prev,
        [longTermGoalId]: answer,
      }));
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

  const saveRemark = async (id: string, remark: string) => {
    if (!recordId) return;
    if (readOnly) return;
    try {
      setSaving(true);
      await EvaluationRecordAPI.upsertItem(recordId, {
        longTermGoalId: id,
        answer: answers[id] ?? {},
        score: node ? calculateScore(node, answers[id]) : 0,
        remark: remark || null,
      });
      setRemarks({ ...remarks, [id]: remark || undefined });
      message.success("已保存备注");
    } catch (e: any) {
      message.error(e.response?.data?.message || "保存备注失败");
    } finally {
      setSaving(false);
    }
  };

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
      return (
        <MutipleNode
          node={node}
          readOnly={readOnly}
          disabled={readOnly}
          toolId={toolId}
          values={values}
          onChange={(vals) => saveMultiple(node.id, vals)}
          setSaving={setSaving}
        />
      );
    }
    return (
      <Typography.Paragraph type="secondary">该项无需作答</Typography.Paragraph>
    );
  };
  return (
    <Card
      size="small"
      title={`${node.title} ${node.description ? `(${node.description})` : ""}`}
      style={{ marginBottom: 8 }}
      extra={
        <Popover
          trigger={readOnly ? [] : ["click"]}
          content={
            <Space direction="vertical" style={{ width: 260 }}>
              <Input.TextArea
                disabled={readOnly}
                rows={4}
                value={remarks[node.id] || ""}
                onChange={(e) =>
                  setRemarks({ ...remarks, [node.id]: e.target.value })
                }
                placeholder="请输入备注"
              />
              <Space style={{ width: "100%", justifyContent: "end" }}>
                <Button
                  size="small"
                  type="primary"
                  disabled={readOnly}
                  onClick={() => saveRemark(node.id, remarks[node.id] || "")}
                >
                  保存
                </Button>
              </Space>
            </Space>
          }
        >
          <Button type="link" disabled={readOnly}>
            备注
          </Button>
        </Popover>
      }
    >
      {renderLeaf(node)}
      <Divider style={{ margin: "12px 0" }} />
      <Flex align="center" justify="end">
        <Typography.Paragraph type="secondary">
          分数： {calculateScore(node, answers[node.id])}
        </Typography.Paragraph>
      </Flex>
    </Card>
  );
};

export default LeafNode;
