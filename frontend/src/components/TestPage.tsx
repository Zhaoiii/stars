import React from "react";
import { Card, Button, Typography, Space } from "antd";

const { Title, Paragraph } = Typography;

const TestPage: React.FC = () => {
  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <Title level={2}>🧪 测试页面</Title>
        <Paragraph>如果您能看到这个页面，说明前端组件正在正常工作！</Paragraph>
        <Space>
          <Button type="primary">测试按钮</Button>
          <Button>普通按钮</Button>
        </Space>
        <Paragraph style={{ marginTop: "16px" }}>
          <strong>当前状态:</strong>
        </Paragraph>
        <ul>
          <li>✅ React 组件正常渲染</li>
          <li>✅ Ant Design 组件库正常工作</li>
          <li>✅ TypeScript 类型检查正常</li>
          <li>✅ 路由系统正常工作</li>
        </ul>
      </Card>
    </div>
  );
};

export default TestPage;
