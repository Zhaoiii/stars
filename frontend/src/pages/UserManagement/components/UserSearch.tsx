import React from "react";
import {
  Card,
  Input,
  Select,
  Button,
  Space,
  Row,
  Col,
  Form,
  FormInstance,
} from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { UserRole, UserStatus } from "../../../types/user";

const { Option } = Select;

interface UserSearchProps {
  form: FormInstance<SearchFilters>;
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
  loading?: boolean;
}

export interface SearchFilters {
  keyword?: string;
  role?: UserRole;
  status?: UserStatus;
}

const UserSearch: React.FC<UserSearchProps> = ({
  form,
  onSearch,
  onReset,
  loading = false,
}) => {
  const handleSearch = (values: SearchFilters) => {
    onSearch(values);
  };

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSearch}
        initialValues={{}}
      >
        <Row gutter={16} align="bottom">
          <Col span={6}>
            <Form.Item name="keyword" label="关键词">
              <Input
                placeholder="搜索用户名、邮箱或姓名"
                prefix={<SearchOutlined />}
                allowClear
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item name="role" label="角色">
              <Select placeholder="选择角色" allowClear>
                <Option value={UserRole.ADMIN}>管理员</Option>
                <Option value={UserRole.TEACHER}>教师</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item name="status" label="状态">
              <Select placeholder="选择状态" allowClear>
                <Option value={UserStatus.ACTIVE}>活跃</Option>
                <Option value={UserStatus.INACTIVE}>非活跃</Option>
                <Option value={UserStatus.SUSPENDED}>已暂停</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SearchOutlined />}
                loading={loading}
              >
                搜索
              </Button>
              <Button onClick={handleReset} icon={<ReloadOutlined />}>
                重置
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default UserSearch;
