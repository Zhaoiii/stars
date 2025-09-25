import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Collapse, Space, Typography, message, Spin } from "antd";
import { EvaluationAPI } from "@/services/evaluationService";
import { EvaluationRecordAPI } from "@/services/evaluationRecordService";
import { MultipleChoiceAnswerAPI } from "@/services/multipleChoiceAnswerService";
import {
  EvaluationScoringType,
  EvaluationToolNodeDTO,
} from "@/types/evaluation";
import LeafNode from "./components/LeafNode";

const { Title } = Typography;

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
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [remarks, setRemarks] = useState<Record<string, string | undefined>>(
    {}
  );
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

          // 拉取已保存的条目用于回显
          const itemsRes = await EvaluationRecordAPI.listItems(recordId);
          const items = itemsRes.data.data || [];
          const mapped: Record<string, any> = {};
          const remarkMap: Record<string, string | undefined> = {};
          for (const it of items) {
            mapped[it.longTermGoalId] = it.answer ?? {};
            remarkMap[it.longTermGoalId] = it.remark ?? undefined;
          }
          setAnswers(mapped);
          setRemarks(remarkMap);
        }
      } catch (e: any) {
        message.error(e.response?.data?.message || "初始化失败");
      } finally {
        setBootLoading(false);
      }
    };
    bootstrap();
  }, [recordId]);

  const renderNode = (node: EvaluationToolNodeDTO) => {
    const inner = node.children || [];
    const hasChildren = inner.length > 0;
    const items = inner.map((c) => ({
      key: c.id,
      label: c.title,
      children: renderNode(c),
    }));
    if (hasChildren) {
      return <Collapse accordion items={items} />;
    }
    return (
      <LeafNode
        node={node}
        answers={answers}
        readOnly={readOnly}
        setSaving={setSaving}
        setAnswers={setAnswers}
        remarks={remarks}
        setRemarks={setRemarks}
        toolId={toolId || undefined}
      />
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
