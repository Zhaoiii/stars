import React from "react";
import { Button, Card, Space, Table } from "antd";

const TreeNodeManagement = () => {
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
  ];
  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary">新增</Button>
      </Space>
      <Table columns={columns} dataSource={[]} />
    </Card>
  );
};

export default TreeNodeManagement;
