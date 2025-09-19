import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Space, Table, Tag, Select, message, Flex } from "antd";
import { EvaluationRecordAPI } from "@/services/evaluationRecordService";
import { EvaluationAPI } from "@/services/evaluationService";
import { EvaluationRecordDTO } from "@/types/evaluationRecord";

const StudentEvaluationsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [records, setRecords] = useState<EvaluationRecordDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [tools, setTools] = useState<{ label: string; value: string }[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | undefined>();

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [listRes, toolsRes] = await Promise.all([
        EvaluationRecordAPI.listByStudent(id),
        EvaluationAPI.getTools(),
      ]);
      setRecords(listRes.data.data || []);
      const toolOptions = (toolsRes.data.data || []).map((t) => ({
        label: t.title,
        value: t.id,
      }));
      setTools(toolOptions);
    } catch (e: any) {
      message.error(e.response?.data?.message || "加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const columns = useMemo(
    () => [
      { title: "ID", dataIndex: "id" },
      {
        title: "状态",
        dataIndex: "status",
        render: (s: EvaluationRecordDTO["status"]) => {
          const color =
            s === "completed"
              ? "green"
              : s === "in_progress"
              ? "blue"
              : "default";
          const text =
            s === "completed"
              ? "已完成"
              : s === "in_progress"
              ? "进行中"
              : "待开始";
          return <Tag color={color}>{text}</Tag>;
        },
      },
      { title: "开始时间", dataIndex: "startedAt" },
      { title: "完成时间", dataIndex: "completedAt" },
      { title: "总分", dataIndex: "totalScore" },
      {
        title: "操作",
        key: "action",
        render: (_: any, record: EvaluationRecordDTO) => (
          <Space>
            <Button
              type="link"
              onClick={() =>
                navigate(`/students/${id}/evaluations/${record.id}/run`)
              }
            >
              开始/继续
            </Button>
          </Space>
        ),
      },
    ],
    [id, navigate]
  );

  const createRecord = async () => {
    if (!id || !selectedTool) return message.warning("请选择评估工具");
    try {
      await EvaluationRecordAPI.create({ studentId: id, toolId: selectedTool });
      message.success("创建成功");
      load();
    } catch (e: any) {
      message.error(e.response?.data?.message || "创建失败");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Space>
          <Select
            placeholder="选择评估工具"
            style={{ width: 240 }}
            options={tools}
            value={selectedTool}
            onChange={setSelectedTool}
          />
          <Button type="primary" onClick={createRecord}>
            创建评估
          </Button>
        </Space>
      </Flex>
      <Table
        rowKey="id"
        columns={columns as any}
        dataSource={records}
        loading={loading}
      />
    </div>
  );
};

export default StudentEvaluationsPage;
