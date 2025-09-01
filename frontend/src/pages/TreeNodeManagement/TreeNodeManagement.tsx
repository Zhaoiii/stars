import React, { useState } from "react";
import { Button, Card, Space, Table } from "antd";
import { getTreeRoots } from "./apis";
import { useRequest } from "ahooks";
import EditModal from "./components/EditModal";
import { Link } from "react-router-dom";

const TreeNodeManagement = () => {
  const [open, setOpen] = useState(false);
  const { data, loading } = useRequest(getTreeRoots);
  console.log(data);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "操作",
      dataIndex: "action",
      key: "action",
      render: (text: string, record: any) => (
        <Space>
          <Button type="link" onClick={() => setOpen(true)}>
            编辑
          </Button>
          <Link to={`/tree-node-management/config/${record.id}`}>
            <Button type="link">配置</Button>
          </Link>
          <Button type="link" onClick={() => setOpen(true)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setOpen(true)}>
          新增
        </Button>
      </Space>
      <Table
        loading={loading}
        columns={columns}
        dataSource={data?.data?.data || []}
      />

      <EditModal open={open} onCancel={() => setOpen(false)} />
    </Card>
  );
};

export default TreeNodeManagement;
