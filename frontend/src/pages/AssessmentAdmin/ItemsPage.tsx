import React from "react";
import { Card, Button, Space, Table, Typography } from "antd";

const { Title } = Typography;

const ItemsPage: React.FC = () => {
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
          测试项目配置
        </Title>
        <Space>
          <Button>刷新</Button>
          <Button type="primary">新增项目</Button>
        </Space>
      </div>
      <Card>
        <Table rowKey="_id" columns={[]} dataSource={[]} pagination={false} />
      </Card>
    </div>
  );
};

export default ItemsPage;
