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
  Input,
  message,
} from "antd";
import type { DataNode } from "antd/es/tree";
import {
  FileTextOutlined,
  CodeOutlined,
  CopyOutlined,
} from "@ant-design/icons";
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
  const [currentRule, setCurrentRule] = useState<string>("");

  // 复制到剪贴板
  const copyPath = async (path: string) => {
    try {
      await navigator.clipboard.writeText(path);
      message.success("已复制路径");
    } catch {
      message.error("复制失败，请重试");
    }
  };

  // 渲染叶子节点标题（带复制图标）
  const renderLeafTitle = (label: string, path: string) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span>{label}</span>
      <Button
        type="text"
        size="small"
        icon={<CopyOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          copyPath(path);
        }}
      />
    </span>
  );

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

  // 监听编辑器选择变化，更新当前规则显示
  useEffect(() => {
    if (!editor) return;

    const updateCurrentRule = () => {
      try {
        const { state } = editor.view;
        const { selection } = state;

        // 检查是否在表格单元格中
        const cell = editor.view.domAtPos(selection.from).node;
        const tableCell = cell.closest("td, th");

        if (tableCell) {
          // 获取单元格的规则属性
          const ruleAttr = (tableCell as HTMLElement).getAttribute("data-rule");
          if (ruleAttr) {
            try {
              const parsed = JSON.parse(ruleAttr);
              setCurrentRule(parsed.expr || "");
            } catch {
              setCurrentRule("");
            }
          } else {
            setCurrentRule("");
          }
        } else {
          setCurrentRule("");
        }
      } catch (error) {
        setCurrentRule("");
      }
    };

    // 初始更新
    updateCurrentRule();

    // 监听选择变化
    editor.on("selectionUpdate", updateCurrentRule);
    editor.on("transaction", updateCurrentRule);

    return () => {
      editor.off("selectionUpdate", updateCurrentRule);
      editor.off("transaction", updateCurrentRule);
    };
  }, [editor]);

  const treeData = useMemo<DataNode[]>(() => {
    if (!toolTree) return [] as DataNode[];
    const build = (node: any, path: string): DataNode => {
      const idPath = `${path}`;
      const fieldNodes: DataNode[] = [
        {
          key: `${idPath}.title`,
          title: renderLeafTitle("title", `${idPath}.title`),
          isLeaf: true,
        },
        {
          key: `${idPath}.score`,
          title: renderLeafTitle("score", `${idPath}.score`),
          isLeaf: true,
        },
        {
          key: `${idPath}.answer`,
          title: renderLeafTitle("answer", `${idPath}.answer`),
          isLeaf: true,
        },
      ];
      // const childEntries =
      //   node.children && typeof node.children === "object"
      //     ? Object.entries(node.children)
      //     : [];
      const childrenContainer: DataNode = {
        key: `${idPath}.children`,
        title: "children",
        children: node.children?.map((child: any) =>
          build(child, `${idPath}.children['${child.id}']`)
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

  // 保存单元格规则
  const handleSaveRule = (rule: string) => {
    if (!editor) return;

    const { state } = editor.view;
    const { selection } = state;

    // 检查是否在表格单元格中
    const cell = editor.view.domAtPos(selection.from).node;
    const tableCell = cell.closest("td, th");

    if (!tableCell) {
      message.warning("请先点击表格单元格");
      return;
    }

    if (!rule.trim()) {
      // 如果规则为空，清除规则
      editor.chain().focus().setCellAttribute("dataRule", "").run();
      editor.chain().focus().setCellAttribute("dataBg", "").run();
      message.success("规则已清除");
      return;
    }

    // 验证规则语法
    try {
      // eslint-disable-next-line no-new-func
      new Function("data", `with (data) { return (${rule}); }`);
    } catch (error) {
      message.error("规则表达式语法错误");
      return;
    }

    // 构建规则对象
    const ruleData = {
      expr: rule.trim(),
    };

    // 设置单元格属性
    editor
      .chain()
      .focus()
      .setCellAttribute("dataRule", JSON.stringify(ruleData))
      .run();

    message.success("规则保存成功");
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      {/* 单元格规则设置面板 */}
      <Card
        title={
          <Space>
            <CodeOutlined />
            <span>单元格规则</span>
          </Space>
        }
        size="small"
        style={{ marginBottom: 16 }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input.TextArea
            placeholder="输入JavaScript表达式，如：score > 80"
            value={currentRule}
            onChange={(e) => setCurrentRule(e.target.value)}
            rows={3}
            style={{ fontSize: 12 }}
          />
          <Button
            type="primary"
            size="small"
            block
            onClick={() => handleSaveRule(currentRule)}
          >
            保存规则
          </Button>
          <Typography.Text
            type="secondary"
            style={{ fontSize: 11, display: "block" }}
          >
            点击表格单元格后设置条件规则，满足条件时背景色变为绿色
          </Typography.Text>
        </Space>
      </Card>

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
