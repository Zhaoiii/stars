import React from "react";
import { Card, Button, Space, Table, Typography } from "antd";

const { Title } = Typography;

const StagesPage: React.FC = () => {
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
          <Button>刷新</Button>
          <Button type="primary">新增阶段</Button>
        </Space>
      </div>
      <Card>
        <Table rowKey="_id" columns={[]} dataSource={[]} pagination={false} />
      </Card>
    </div>
  );
};

export default StagesPage;
