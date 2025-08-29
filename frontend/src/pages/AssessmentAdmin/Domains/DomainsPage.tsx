import React, { useEffect, useMemo, useState } from "react";
import { Card, Button, Space, Table, Typography, message, Tag } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { DomainsService } from "./services/domainsService";
import DomainFormModal from "./components/DomainFormModal";

const { Title } = Typography;

const useQuery = () => new URLSearchParams(useLocation().search);

const DomainsPage: React.FC = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const moduleId = query.get("moduleId") || undefined;

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  const load = async () => {
    try {
      if (!moduleId) {
        message.warning("缺少模块ID，无法获取领域");
        return;
      }
      setLoading(true);
      const list = await DomainsService.list(moduleId);
      setItems(list);
    } catch (e) {
      message.error("获取领域失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [moduleId]);

  const columns = useMemo(
    () => [
      { title: "名称", dataIndex: "name" },
      {
        title: "包含阶段",
        dataIndex: "hasStages",
        render: (hasStages: boolean) => (
          <Tag color={hasStages ? "green" : "red"}>
            {hasStages ? "是" : "否"}
          </Tag>
        ),
      },
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
            {record.hasStages && (
              <Button
                type="link"
                onClick={() =>
                  navigate(`/assessment/stages?domainId=${record._id}`)
                }
              >
                配置阶段
              </Button>
            )}
            <Button
              type="link"
              danger
              onClick={async () => {
                await DomainsService.remove(record._id);
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
          领域配置
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
            新增领域
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

      <DomainFormModal
        open={open}
        initialValues={editItem || undefined}
        onCancel={() => setOpen(false)}
        onSubmit={async (values) => {
          if (editItem) {
            await DomainsService.update(editItem._id, values);
            message.success("保存成功");
          } else {
            if (!moduleId) {
              message.warning("缺少模块ID，无法创建");
              return;
            }
            await DomainsService.create({ moduleId, ...values });
            message.success("创建成功");
          }
          setOpen(false);
          load();
        }}
      />
    </div>
  );
};

export default DomainsPage;
