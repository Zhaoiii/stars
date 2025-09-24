import React, { useState, useEffect } from "react";
import { Button, Divider, Space, Tooltip, Select } from "antd";
import {
  BoldOutlined,
  ItalicOutlined,
  StrikethroughOutlined,
  UnderlineOutlined,
  TableOutlined,
  ColumnWidthOutlined,
  ColumnHeightOutlined,
  MergeCellsOutlined,
  SplitCellsOutlined,
  DeleteOutlined,
  MinusOutlined,
} from "@ant-design/icons";

type Props = {
  editor: any;
};

export const EditorToolbar: React.FC<Props> = ({ editor }) => {
  const can = editor?.can();
  const [fontFamily, setFontFamily] = useState<string>("");
  const [fontSize, setFontSize] = useState<string>("");
  const [textAlign, setTextAlign] = useState<string>("");

  // 监听编辑器状态变化，更新工具栏状态
  useEffect(() => {
    if (!editor) return;

    const updateToolbar = () => {
      try {
        // 获取当前字体
        const fontFamilyAttr = editor.getAttributes("textStyle");
        const currentFontFamily = fontFamilyAttr?.fontFamily || "";
        setFontFamily(currentFontFamily);

        // 获取当前字体大小
        const currentFontSize = fontFamilyAttr?.fontSize || "";
        setFontSize(currentFontSize);

        // 获取当前对齐方式
        const textAlignAttr = editor.getAttributes("textAlign");
        const currentTextAlign = textAlignAttr?.textAlign || "";
        setTextAlign(currentTextAlign);
      } catch (error) {
        // 如果获取属性失败，重置为默认值
        setFontFamily("");
        setFontSize("");
        setTextAlign("");
      }
    };

    // 初始更新
    updateToolbar();

    // 监听选择变化和内容变化
    editor.on("selectionUpdate", updateToolbar);
    editor.on("transaction", updateToolbar);
    editor.on("update", updateToolbar);

    return () => {
      editor.off("selectionUpdate", updateToolbar);
      editor.off("transaction", updateToolbar);
      editor.off("update", updateToolbar);
    };
  }, [editor]);

  const insertTable = () => {
    editor
      ?.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (
    <div
      style={{
        padding: "12px 16px",
        borderBottom: "1px solid #f0f0f0",
        background: "#fafafa",
        borderRadius: "8px 8px 0 0",
        position: "absolute",
        left: "50%",
        top: 0,
        width: "100%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Space wrap>
        <Space.Compact>
          <Select
            size="small"
            style={{ width: 140 }}
            placeholder="字体"
            value={fontFamily}
            onChange={(v) => editor?.chain().focus().setFontFamily(v).run()}
            options={[
              { label: "默认", value: "" },
              { label: "Songti SC", value: "'Songti SC', serif" },
              { label: "PingFang SC", value: "'PingFang SC', sans-serif" },
              { label: "Monospace", value: "monospace" },
            ]}
          />
          <Select
            size="small"
            style={{ width: 120 }}
            placeholder="字号"
            value={fontSize}
            onChange={(v) =>
              editor
                ?.chain()
                .focus()
                .setMark("textStyle", { fontSize: v })
                .run()
            }
            options={[
              { label: "12px", value: "12px" },
              { label: "14px", value: "14px" },
              { label: "16px", value: "16px" },
              { label: "18px", value: "18px" },
              { label: "24px", value: "24px" },
            ]}
          />
          <Select
            size="small"
            style={{ width: 120 }}
            placeholder="对齐"
            value={textAlign}
            onChange={(v) => editor?.chain().focus().setTextAlign(v).run()}
            options={[
              { label: "左对齐", value: "left" },
              { label: "居中", value: "center" },
              { label: "右对齐", value: "right" },
              { label: "两端对齐", value: "justify" },
            ]}
          />
        </Space.Compact>

        <Space.Compact>
          <Tooltip title="加粗">
            <Button
              icon={<BoldOutlined />}
              type={editor?.isActive("bold") ? "primary" : "default"}
              onClick={() => editor?.chain().focus().toggleBold().run()}
              disabled={!can?.toggleBold?.()}
            />
          </Tooltip>
          <Tooltip title="斜体">
            <Button
              icon={<ItalicOutlined />}
              type={editor?.isActive("italic") ? "primary" : "default"}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              disabled={!can?.toggleItalic?.()}
            />
          </Tooltip>
          <Tooltip title="删除线">
            <Button
              icon={<StrikethroughOutlined />}
              type={editor?.isActive("strike") ? "primary" : "default"}
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              disabled={!can?.toggleStrike?.()}
            />
          </Tooltip>
          <Tooltip title="下划线">
            <Button
              icon={<UnderlineOutlined />}
              type={editor?.isActive("underline") ? "primary" : "default"}
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
            />
          </Tooltip>
        </Space.Compact>

        <Divider type="vertical" />

        <Space.Compact>
          <Tooltip title="文本颜色">
            <input
              type="color"
              style={{
                width: 32,
                height: 32,
                border: 0,
                padding: 0,
                background: "transparent",
                cursor: "pointer",
              }}
              onChange={(e) =>
                editor?.chain().focus().setColor(e.target.value).run()
              }
            />
          </Tooltip>
          <Tooltip title="插入表格">
            <Button icon={<TableOutlined />} onClick={insertTable} />
          </Tooltip>
          <Tooltip title="插入列">
            <Button
              icon={<ColumnWidthOutlined />}
              onClick={() => editor?.chain().focus().addColumnAfter().run()}
              disabled={!can?.addColumnAfter?.()}
            />
          </Tooltip>
          <Tooltip title="插入行">
            <Button
              icon={<ColumnHeightOutlined />}
              onClick={() => editor?.chain().focus().addRowAfter().run()}
              disabled={!can?.addRowAfter?.()}
            />
          </Tooltip>
          <Tooltip title="删除列">
            <Button
              icon={<MinusOutlined />}
              onClick={() => editor?.chain().focus().deleteColumn().run()}
              disabled={!can?.deleteColumn?.()}
            />
          </Tooltip>
          <Tooltip title="删除行">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => editor?.chain().focus().deleteRow().run()}
              disabled={!can?.deleteRow?.()}
            />
          </Tooltip>
          <Tooltip title="合并单元格">
            <Button
              icon={<MergeCellsOutlined />}
              onClick={() => editor?.chain().focus().mergeCells().run()}
              disabled={!can?.mergeCells?.()}
            />
          </Tooltip>
          <Tooltip title="拆分单元格">
            <Button
              icon={<SplitCellsOutlined />}
              onClick={() => editor?.chain().focus().splitCell().run()}
              disabled={!can?.splitCell?.()}
            />
          </Tooltip>
        </Space.Compact>
      </Space>
    </div>
  );
};
