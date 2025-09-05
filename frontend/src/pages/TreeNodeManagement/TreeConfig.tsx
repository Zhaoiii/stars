import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Tree, Button, Space, message, Popconfirm, Spin } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  getTreeStructure,
  getTreeNodeById,
  deleteTreeNode,
  reorderNodes,
  ITreeNode,
} from "./apis";
import TreeNodeEditModal from "./components/TreeNodeEditModal";

const TreeConfig: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [treeData, setTreeData] = useState<ITreeNode[]>([]);
  const [rootNode, setRootNode] = useState<ITreeNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState<ITreeNode | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);

  // 获取指定根节点的树形数据
  const fetchTreeData = async () => {
    if (!id) {
      message.error("缺少根节点ID");
      navigate("/tree-node-management");
      return;
    }

    setLoading(true);
    try {
      // 获取根节点信息
      const rootResponse = await getTreeNodeById(id);
      const root = rootResponse.data.data;
      setRootNode(root);

      // 获取完整树结构，然后过滤出指定根节点的子树
      const response = await getTreeStructure();
      const allTrees = response.data.data || [];

      // 找到指定的根节点
      const targetRoot = allTrees.find((tree: ITreeNode) => tree._id === id);
      if (targetRoot) {
        setTreeData([targetRoot]);
      } else {
        message.error("未找到指定的根节点");
        navigate("/tree-node-management");
      }
    } catch (error) {
      message.error("获取树形数据失败");
      navigate("/tree-node-management");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreeData();
  }, []);

  // 查找节点的父节点ID
  const findParentId = (nodeId: string, nodes: ITreeNode[]): string | null => {
    for (const node of nodes) {
      if (node.children) {
        for (const child of node.children) {
          if (child._id === nodeId) {
            return node._id;
          }
        }
        // 递归查找子节点
        const found = findParentId(nodeId, node.children);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  // 将树形数据转换为Antd Tree组件需要的格式
  const convertToTreeData = (nodes: ITreeNode[]): any[] => {
    return nodes.map((node) => ({
      key: node._id,
      title: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>
            {node.name}
            {node.isLeaf && (
              <span style={{ marginLeft: 8, color: "#666", fontSize: "12px" }}>
                (总数: {node.totalCount || 0})
              </span>
            )}
          </span>
          <Space size="small">
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleAddChild(node._id);
              }}
            />
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(node);
              }}
            />
            <Popconfirm
              title="确定要删除这个节点吗？"
              onConfirm={(e) => {
                e?.stopPropagation();
                handleDelete(node._id);
              }}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => e.stopPropagation()}
              />
            </Popconfirm>
          </Space>
        </div>
      ),
      children: node.children ? convertToTreeData(node.children) : undefined,
      isLeaf: node.isLeaf,
      nodeData: node,
    }));
  };

  // 处理拖拽排序 - 只允许兄弟节点间排序
  const handleDrop = async (info: any) => {
    const { dragNode, node, dropPosition, dropToGap } = info;

    try {
      // 只允许拖拽到节点之间（兄弟节点排序），不允许拖拽到节点内部
      if (!dropToGap) {
        message.warning("只能在同一父节点下的兄弟节点间进行排序");
        return;
      }

      // 找到拖拽节点和目标节点的父节点
      const dragParentId = findParentId(dragNode.key, treeData);
      const targetParentId = findParentId(node.key, treeData);

      // 检查是否为同一父节点下的兄弟节点
      if (dragParentId !== targetParentId) {
        message.warning("只能在同一父节点下的兄弟节点间进行排序");
        return;
      }

      // 获取兄弟节点列表
      const siblings = dragParentId
        ? treeData.find((n) => n._id === dragParentId)?.children || []
        : treeData;

      const dragIndex = siblings.findIndex((n) => n._id === dragNode.key);
      const dropIndex = siblings.findIndex((n) => n._id === node.key);

      if (dragIndex === -1 || dropIndex === -1) {
        message.error("拖拽排序失败：找不到节点");
        return;
      }

      // 如果拖拽到相同位置，不需要处理
      if (dragIndex === dropIndex) {
        return;
      }

      // 计算新的索引位置
      let newIndex = dropIndex;
      if (dropPosition === -1) {
        newIndex = dropIndex;
      } else {
        newIndex = dropIndex + 1;
      }

      // 如果拖拽的节点在目标位置之前，需要调整索引
      if (dragIndex < newIndex) {
        newIndex -= 1;
      }

      // 重新排序：将拖拽的节点移动到新位置，其他节点依次后移
      const newSiblings = [...siblings];
      const draggedNode = newSiblings.splice(dragIndex, 1)[0];
      newSiblings.splice(newIndex, 0, draggedNode);

      // 更新所有节点的索引
      const nodeIds = newSiblings.map((n) => n._id);
      await reorderNodes({ parentId: dragParentId || undefined, nodeIds });

      // 重新获取数据
      await fetchTreeData();
      message.success("排序更新成功");
    } catch (error) {
      console.error("拖拽排序失败:", error);
      message.error("拖拽排序失败");
    }
  };

  // 添加子节点
  const handleAddChild = (parentId: string) => {
    setEditData(null);
    setParentId(parentId);
    setEditModalVisible(true);
  };

  // 编辑节点
  const handleEdit = (node: ITreeNode) => {
    setEditData(node);
    setParentId(null);
    setEditModalVisible(true);
  };

  // 删除节点
  const handleDelete = async (nodeId: string) => {
    try {
      await deleteTreeNode(nodeId);
      message.success("删除成功");
      fetchTreeData();
    } catch (error) {
      message.error("删除失败");
    }
  };

  // 处理弹窗成功回调
  const handleModalSuccess = () => {
    setEditModalVisible(false);
    fetchTreeData();
  };

  return (
    <div>
      <Card
        title={`树形配置 - ${rootNode?.name || "加载中..."}`}
        extra={
          <Space>
            <Button onClick={() => navigate("/tree-node-management")}>
              返回列表
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditData(null);
                setParentId(id || null);
                setEditModalVisible(true);
              }}
            >
              添加子节点
            </Button>
          </Space>
        }
      >
        <Spin spinning={loading}>
          <Tree
            treeData={convertToTreeData(treeData)}
            draggable
            onDrop={handleDrop}
            showLine
            defaultExpandAll
            style={{ minHeight: 400 }}
          />
        </Spin>
      </Card>

      <TreeNodeEditModal
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={handleModalSuccess}
        editData={editData}
        parentId={parentId}
      />
    </div>
  );
};

export default TreeConfig;
