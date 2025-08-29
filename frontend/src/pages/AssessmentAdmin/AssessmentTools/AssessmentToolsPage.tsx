import React, { useEffect, useState } from "react";
import { Card, Button, Space, Table, Typography, message } from "antd";
import { ToolsService } from "./services/toolsService";
import ToolFormModal from "./components/ToolFormModal";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const AssessmentToolsPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const navigate = useNavigate();

  const load = async () => {
    try {
      setLoading(true);
      const list = await ToolsService.list();
      setItems(list);
    } catch (e) {
      message.error("获取工具失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns = [
    { title: "名称", dataIndex: "name" },
    {
      title: "操作",
      width: 280,
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
            onClick={() => navigate("/assessment/modules?toolId=" + record._id)}
          >
            配置模块
          </Button>
          <Button
            type="link"
            danger
            onClick={async () => {
              await ToolsService.remove(record._id);
              message.success("已删除");
              load();
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

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
          评估工具管理
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
            新建工具
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

      <ToolFormModal
        open={open}
        initialValues={editItem || undefined}
        onCancel={() => setOpen(false)}
        onSubmit={async (values) => {
          if (editItem) {
            await ToolsService.update(editItem._id, values);
            message.success("保存成功");
          } else {
            await ToolsService.create(values);
            message.success("创建成功");
          }
          setOpen(false);
          load();
        }}
      />
    </div>
  );
};

export default AssessmentToolsPage;
