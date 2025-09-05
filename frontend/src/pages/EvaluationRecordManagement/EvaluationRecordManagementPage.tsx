import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Typography,
  Form,
  Select,
  Input,
  Card,
  Tag,
  Tooltip,
  message,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { evaluationRecordAPI } from "../../services/evaluationRecordAPI";
import { studentAPI } from "../../services/studentAPI";
import { treeNodeAPI } from "../../services/treeNodeAPI";
import EvaluationRecordDetail from "./components/EvaluationRecordDetail";
import EvaluationRecordFilter from "./components/EvaluationRecordFilter";
import { getTableColumns } from "./components/tableColumns";
import {
  EvaluationRecord,
  Student,
  TreeNode,
} from "../../types/evaluationRecord";

const { Title } = Typography;
const { Option } = Select;

const EvaluationRecordManagementPage: React.FC = () => {
  const [evaluationRecords, setEvaluationRecords] = useState<
    EvaluationRecord[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    studentId: undefined as string | undefined,
    toolId: undefined as string | undefined,
    status: undefined as string | undefined,
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [tools, setTools] = useState<TreeNode[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<EvaluationRecord | null>(
    null
  );

  const [searchForm] = Form.useForm();

  // 加载评估记录列表
  const loadEvaluationRecords = async (params?: any) => {
    try {
      setLoading(true);
      const response = await evaluationRecordAPI.getEvaluationRecords({
        ...filters,
        page: pagination.current,
        limit: pagination.pageSize,
        ...params,
      });

      if (response.data.success) {
        setEvaluationRecords(response.data.data);
        setPagination((prev) => ({
          ...prev,
          total: response.data.pagination.total,
        }));
      }
    } catch (error) {
      message.error("加载评估记录失败");
      console.error("加载评估记录失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 加载学生列表
  const loadStudents = async () => {
    try {
      const response = await studentAPI.getStudents();
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error("加载学生列表失败:", error);
    }
  };

  // 加载评估工具列表
  const loadTools = async () => {
    try {
      const response = await treeNodeAPI.getRootNodes();
      if (response.data.success) {
        setTools(response.data.data);
      }
    } catch (error) {
      console.error("加载评估工具列表失败:", error);
    }
  };

  // 初始化数据
  useEffect(() => {
    loadStudents();
    loadTools();
  }, []);

  // 加载评估记录
  useEffect(() => {
    loadEvaluationRecords();
  }, [filters, pagination.current, pagination.pageSize]);

  // 处理筛选
  const handleFilter = (values: any) => {
    setFilters(values);
    setPagination((prev) => ({ ...prev, current: 1 }));
    setFilterModalVisible(false);
  };

  // 重置筛选
  const handleResetFilter = () => {
    setFilters({
      studentId: undefined,
      toolId: undefined,
      status: undefined,
    });
    searchForm.resetFields();
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // 查看详情
  const handleViewDetail = async (record: EvaluationRecord) => {
    try {
      const response = await evaluationRecordAPI.getEvaluationRecord(
        record._id
      );
      if (response.data.success) {
        setSelectedRecord(response.data.data);
        setDetailModalVisible(true);
      }
    } catch (error) {
      message.error("加载评估记录详情失败");
    }
  };

  // 表格列配置
  const columns = useMemo(
    () =>
      getTableColumns({
        onView: handleViewDetail,
        students,
        tools,
      }),
    [students, tools]
  );

  // 处理表格变化
  const handleTableChange = (pagination: any) => {
    setPagination((prev) => ({
      ...prev,
      current: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Title level={3}>评估记录管理</Title>
        <Space>
          <Button
            icon={<FilterOutlined />}
            onClick={() => setFilterModalVisible(true)}
          >
            筛选
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => loadEvaluationRecords()}
          >
            刷新
          </Button>
        </Space>
      </div>

      {/* 筛选条件显示 */}
      {(filters.studentId || filters.toolId || filters.status) && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space wrap>
            <span>筛选条件：</span>
            {filters.studentId && (
              <Tag
                closable
                onClose={() =>
                  setFilters((prev) => ({ ...prev, studentId: undefined }))
                }
              >
                学生: {students.find((s) => s._id === filters.studentId)?.name}
              </Tag>
            )}
            {filters.toolId && (
              <Tag
                closable
                onClose={() =>
                  setFilters((prev) => ({ ...prev, toolId: undefined }))
                }
              >
                工具: {tools.find((t) => t._id === filters.toolId)?.name}
              </Tag>
            )}
            {filters.status && (
              <Tag
                closable
                onClose={() =>
                  setFilters((prev) => ({ ...prev, status: undefined }))
                }
              >
                状态:{" "}
                {filters.status === "in_progress"
                  ? "进行中"
                  : filters.status === "completed"
                  ? "已完成"
                  : "已归档"}
              </Tag>
            )}
            <Button type="link" onClick={handleResetFilter}>
              清除所有筛选
            </Button>
          </Space>
        </Card>
      )}

      <Table
        columns={columns}
        dataSource={evaluationRecords}
        rowKey="_id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
        onChange={handleTableChange}
      />

      {/* 筛选模态框 */}
      <Modal
        title="筛选评估记录"
        open={filterModalVisible}
        onCancel={() => setFilterModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <EvaluationRecordFilter
          form={searchForm}
          students={students}
          tools={tools}
          onFinish={handleFilter}
          onReset={handleResetFilter}
          onCancel={() => setFilterModalVisible(false)}
        />
      </Modal>

      {/* 详情查看模态框 */}
      <Modal
        title="评估记录详情"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedRecord(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
        destroyOnClose
      >
        {selectedRecord && <EvaluationRecordDetail record={selectedRecord} />}
      </Modal>
    </div>
  );
};

export default EvaluationRecordManagementPage;
