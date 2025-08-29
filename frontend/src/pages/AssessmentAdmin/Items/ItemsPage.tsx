import React, { useEffect, useMemo, useState } from "react";
import { Card, Button, Space, Table, Typography, message, Tag } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { ItemsService } from "./services/itemsService";
import ItemFormModal from "./components/ItemFormModal";

const { Title } = Typography;

const useQuery = () => new URLSearchParams(useLocation().search);

const ItemsPage: React.FC = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const stageId = query.get("stageId") || undefined;
  const domainId = query.get("domainId") || undefined;

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  const load = async () => {
    try {
      if (!stageId && !domainId) {
        message.warning("缺少阶段ID或领域ID，无法获取测试项");
        return;
      }
      setLoading(true);
      const list = await ItemsService.list(stageId, domainId);
      setItems(list);
    } catch (e) {
      message.error("获取测试项失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [stageId, domainId]);

  const getScoreTypeText = (scoreType: string, scoreConfig?: any) => {
    switch (scoreType) {
      case "pass_fail":
        return <Tag color="blue">对错制</Tag>;
      case "scale":
        const levels = scoreConfig?.scaleLevels?.join("、") || "好、中、差";
        return <Tag color="green">好中差: {levels}</Tag>;
      case "custom":
        return (
          <Tag color="orange">
            自定义记分: 0-{scoreConfig?.maxScore || "?"}
            {scoreConfig?.passScore && ` (及格: ${scoreConfig.passScore})`}
          </Tag>
        );
      default:
        return <Tag>未知</Tag>;
    }
  };

  const columns = useMemo(
    () => [
      { title: "名称", dataIndex: "name", width: 200 },
      { 
        title: "描述", 
        dataIndex: "description", 
        width: 300,
        render: (text: string) => text || "-"
      },
      {
        title: "评分类型",
        dataIndex: "scoreType",
        width: 200,
        render: (scoreType: string, record: any) => getScoreTypeText(scoreType, record.scoreConfig)
      },
      {
        title: "必填",
        dataIndex: "isRequired",
        width: 80,
        render: (isRequired: boolean) => (
          <Tag color={isRequired ? "red" : "default"}>
            {isRequired ? "是" : "否"}
          </Tag>
        )
      },
      {
        title: "排序",
        dataIndex: "order",
        width: 80,
        render: (order: number) => order || 0
      },
      {
        title: "操作",
        width: 200,
        render: (_: any, record: any) => (
          <Space>
            <Button
              type="link"
              onClick={() => {
                setEditItem(record);
                setOpen(true);
              }}
            >
              编辑
            </Button>
            <Button
              type="link"
              danger
              onClick={async () => {
                await ItemsService.remove(record._id);
                message.success("已删除");
                load();
              }}
            >
              删除
            </Button>
          </Space>
        ),
      },
    ],
    []
  );

  const getPageTitle = () => {
    if (stageId) return "阶段测试项配置";
    if (domainId) return "领域测试项配置";
    return "测试项配置";
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          {getPageTitle()}
        </Title>
        <Space>
          <Button onClick={load}>刷新</Button>
          <Button
            type="primary"
            onClick={() => {
              setEditItem(null);
              setOpen(true);
            }}
          >
            新增测试项
          </Button>
        </Space>
      </div>
      <Card>
        <Table
          rowKey="_id"
          columns={columns as any}
          dataSource={items}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <ItemFormModal
        open={open}
        initialValues={editItem || undefined}
        onCancel={() => setOpen(false)}
        onSubmit={async (values) => {
          try {
            if (editItem) {
              await ItemsService.update(editItem._id, values);
              message.success("保存成功");
            } else {
              // 创建时需要设置挂靠关系
              const payload = {
                ...values,
                stageId,
                domainId
              };
              await ItemsService.create(payload);
              message.success("创建成功");
            }
            setOpen(false);
            load();
          } catch (error) {
            message.error("操作失败");
          }
        }}
      />
    </div>
  );
};

export default ItemsPage;
