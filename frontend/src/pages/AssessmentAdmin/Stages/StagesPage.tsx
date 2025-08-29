import React, { useEffect, useMemo, useState } from "react";
import { Card, Button, Space, Table, Typography, message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { StagesService } from "./services/stagesService";
import StageFormModal from "./components/StageFormModal";

const { Title } = Typography;

const useQuery = () => new URLSearchParams(useLocation().search);

const StagesPage: React.FC = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const domainId = query.get("domainId") || undefined;

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  const load = async () => {
    try {
      if (!domainId) {
        message.warning("缺少领域ID，无法获取阶段");
        return;
      }
      setLoading(true);
      const list = await StagesService.list(domainId);
      setItems(list);
    } catch (e) {
      message.error("获取阶段失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [domainId]);

  const columns = useMemo(
    () => [
      { title: "名称", dataIndex: "name" },
      {
        title: "操作",
        width: 300,
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
              onClick={() =>
                navigate(`/assessment/items?stageId=${record._id}`)
              }
            >
              配置测试项
            </Button>
            <Button
              type="link"
              danger
              onClick={async () => {
                await StagesService.remove(record._id);
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
    [navigate]
  );

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
          阶段配置
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
            新增阶段
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
        />
      </Card>

      <StageFormModal
        open={open}
        initialValues={editItem || undefined}
        onCancel={() => setOpen(false)}
        onSubmit={async (values) => {
          if (editItem) {
            await StagesService.update(editItem._id, values);
            message.success("保存成功");
          } else {
            if (!domainId) {
              message.warning("缺少领域ID，无法创建");
              return;
            }
            await StagesService.create({ domainId, name: values.name });
            message.success("创建成功");
          }
          setOpen(false);
          load();
        }}
      />
    </div>
  );
};

export default StagesPage;
