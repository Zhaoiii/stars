import React from "react";
import { Descriptions, Card, Progress, Tag, Typography, Divider } from "antd";
import { EvaluationRecord } from "../../../types/evaluationRecord";

const { Text } = Typography;

interface EvaluationRecordDetailProps {
  record: EvaluationRecord;
}

const EvaluationRecordDetail: React.FC<EvaluationRecordDetailProps> = ({
  record,
}) => {
  // 计算总体进度
  const leafScores = record.evaluationScores.filter((score) => score.isLeaf);
  const totalTarget = leafScores.reduce(
    (sum, score) => sum + (score.targetCount || 0),
    0
  );
  const totalCompleted = leafScores.reduce(
    (sum, score) => sum + (score.completedCount || 0),
    0
  );
  const progress =
    totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0;

  // 状态配置
  const statusConfig = {
    in_progress: { color: "processing", text: "进行中" },
    completed: { color: "success", text: "已完成" },
    archived: { color: "default", text: "已归档" },
  };
  const status = statusConfig[record.status] || {
    color: "default",
    text: record.status,
  };

  // 获取学生姓名
  const getStudentName = () => {
    if (typeof record.studentId === "string") {
      return "未知学生";
    }
    return record.studentId.name;
  };

  // 获取工具名称
  const getToolName = () => {
    if (typeof record.toolId === "string") {
      return "未知工具";
    }
    return record.toolId.name;
  };

  return (
    <div>
      <Descriptions title="基本信息" bordered column={2} size="small">
        <Descriptions.Item label="学生姓名">
          {getStudentName()}
        </Descriptions.Item>
        <Descriptions.Item label="评估工具">{getToolName()}</Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={status.color}>{status.text}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="完成进度">
          <Progress
            percent={progress}
            size="small"
            format={() => `${totalCompleted}/${totalTarget}`}
          />
        </Descriptions.Item>
        <Descriptions.Item label="创建时间">
          {new Date(record.createdAt).toLocaleString("zh-CN")}
        </Descriptions.Item>
        <Descriptions.Item label="更新时间">
          {new Date(record.updatedAt).toLocaleString("zh-CN")}
        </Descriptions.Item>
        {record.evaluatedAt && (
          <Descriptions.Item label="评估完成时间" span={2}>
            {new Date(record.evaluatedAt).toLocaleString("zh-CN")}
          </Descriptions.Item>
        )}
      </Descriptions>

      <Divider />

      <Card title="评估详情" size="small">
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {record.evaluationScores.map((score, index) => (
            <div key={score.nodeId} style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text strong>{score.nodeName}</Text>
                {score.isLeaf && <Tag color="blue">叶子节点</Tag>}
              </div>

              {score.isLeaf && (
                <div>
                  <div style={{ marginBottom: 4 }}>
                    <Text type="secondary">
                      完成数: {score.completedCount || 0} /{" "}
                      {score.targetCount || 0}
                    </Text>
                  </div>
                  <Progress
                    percent={
                      score.targetCount
                        ? Math.round(
                            ((score.completedCount || 0) / score.targetCount) *
                              100
                          )
                        : 0
                    }
                    size="small"
                    showInfo={false}
                  />
                </div>
              )}

              {index < record.evaluationScores.length - 1 && (
                <Divider style={{ margin: "12px 0" }} />
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default EvaluationRecordDetail;
