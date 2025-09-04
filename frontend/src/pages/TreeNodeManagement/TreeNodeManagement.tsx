import { useState } from "react";
import { Button, Card, Space, Table, message, Popconfirm } from "antd";
import { getTreeRoots, deleteTreeNode } from "./apis";
import { useRequest } from "ahooks";
import EditModal from "./components/EditModal";
import { Link } from "react-router-dom";

const TreeNodeManagement = () => {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const { data, loading, refresh } = useRequest(getTreeRoots);

  const handleEdit = (record: any) => {
    setEditData(record);
    setOpen(true);
  };

  const handleAdd = () => {
    setEditData(null);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTreeNode(id);
      message.success("删除成功");
      refresh();
    } catch (error) {
      message.error("删除失败");
    }
  };

  const handleSuccess = () => {
    message.success(editData ? "更新成功" : "创建成功");
    refresh();
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "_id",
      key: "_id",
      width: 200,
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
      title: "是否叶子节点",
      dataIndex: "isLeaf",
      key: "isLeaf",
      render: (isLeaf: boolean) => (isLeaf ? "是" : "否"),
    },
    {
      title: "总数",
      dataIndex: "totalCount",
      key: "totalCount",
      render: (totalCount: number) => totalCount || "-",
    },
    {
      title: "操作",
      dataIndex: "action",
      key: "action",
      width: 200,
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Link to={`/tree-node-management/config/${record._id}`}>
            <Button type="link">配置</Button>
          </Link>
          <Popconfirm
            title="确定要删除这个节点吗？"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleAdd}>
          新增
        </Button>
      </Space>
      <Table
        loading={loading}
        columns={columns}
        dataSource={data?.data?.data || []}
        rowKey="_id"
      />

      <EditModal
        open={open}
        onCancel={() => setOpen(false)}
        onSuccess={handleSuccess}
        editData={editData}
      />
    </Card>
  );
};

export default TreeNodeManagement;
