import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Card,
  Collapse,
  Space,
  Button,
  Typography,
  Tree,
  Spin,
} from "antd";
import type { DataNode } from "antd/es/tree";
import { FileTextOutlined } from "@ant-design/icons";
import type { FieldOption } from "../utils/fieldOptions";
import { EvaluationAPI } from "@/services/evaluationService";

const { Panel } = Collapse;

type Props = {
  editor: any;
  fieldOptions: FieldOption[];
  onInsertVariable: (field: string) => void;
  toolId?: string;
};

export const RightSidebar: React.FC<Props> = ({
  editor,
  fieldOptions,
  onInsertVariable,
  toolId,
}) => {
  const [toolTree, setToolTree] = useState<any | null>(null);
  const [loadingTree, setLoadingTree] = useState(false);

  useEffect(() => {
    const fetchTree = async () => {
      if (!toolId) return;
      setLoadingTree(true);
      try {
        const res = await EvaluationAPI.getToolTree(toolId);
        if (res.data?.success) setToolTree(res.data.data);
      } catch {
        // ignore
      } finally {
        setLoadingTree(false);
      }
    };
    fetchTree();
  }, [toolId]);

  const treeData = useMemo<DataNode[]>(() => {
    if (!toolTree) return [] as DataNode[];
    const build = (node: any, path: string): DataNode => {
      const idPath = `${path}`;
      const fieldNodes: DataNode[] = [
        { key: `${idPath}.title`, title: "title", isLeaf: true },
        { key: `${idPath}.score`, title: "score", isLeaf: true },
        { key: `${idPath}.answer`, title: "answer", isLeaf: true },
      ];
      const childEntries =
        node.children && typeof node.children === "object"
          ? Object.entries(node.children)
          : [];
      const childrenContainer: DataNode = {
        key: `${idPath}.children`,
        title: "children",
        children: childEntries.map(([childId, c]: [string, any]) =>
          build(c, `${idPath}.children['${childId}']`)
        ),
      };
      const nodeItem: DataNode = {
        key: idPath,
        title: (node?.title as string) || `节点(${node?.id})`,
        children: [
          {
            key: `${idPath}.__group_fields`,
            title: "fields",
            children: fieldNodes,
          },
          childrenContainer,
        ],
      };
      return nodeItem;
    };
    return [build(toolTree, "toolTree")];
  }, [toolTree]);

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      {/* 字段分类面板 */}
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>字段分类</span>
          </Space>
        }
        size="small"
        style={{ marginBottom: 16 }}
      >
        <Collapse size="small" ghost>
          {Array.from(new Set(fieldOptions.map((opt) => opt.category))).map(
            (category) => (
              <Panel
                header={
                  <Space>
                    {
                      fieldOptions.find((opt) => opt.category === category)
                        ?.icon
                    }
                    <span>{category}</span>
                    <Badge
                      count={
                        fieldOptions.filter((opt) => opt.category === category)
                          .length
                      }
                      size="small"
                    />
                  </Space>
                }
                key={category}
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  {fieldOptions
                    .filter((opt) => opt.category === category)
                    .map((option) => (
                      <Button
                        key={option.value}
                        type="text"
                        size="small"
                        icon={option.icon}
                        onClick={() => onInsertVariable(option.value)}
                        className="field-button"
                      >
                        {option.label}
                      </Button>
                    ))}
                </Space>
              </Panel>
            )
          )}
        </Collapse>
      </Card>

      {/* 目标信息（树） */}
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>目标信息（树）</span>
          </Space>
        }
        size="small"
        style={{ marginBottom: 16 }}
      >
        {loadingTree ? (
          <Spin />
        ) : toolTree ? (
          <Tree
            treeData={treeData}
            defaultExpandAll
            onSelect={(keys) => {
              const key = Array.isArray(keys)
                ? (keys[0] as string)
                : (keys as any);
              if (!key) return;
              if (
                key.endsWith(".title") ||
                key.endsWith(".score") ||
                key.endsWith(".answer")
              ) {
                onInsertVariable(key);
              }
            }}
          />
        ) : (
          <Typography.Text type="secondary">
            未选择工具，或正在加载
          </Typography.Text>
        )}
      </Card>
    </Space>
  );
};
