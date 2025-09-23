import React from "react";
import { Button, Divider, Space, Tooltip } from "antd";
import {
  BoldOutlined,
  ItalicOutlined,
  StrikethroughOutlined,
  TableOutlined,
  ColumnWidthOutlined,
  ColumnHeightOutlined,
  MergeCellsOutlined,
  SplitCellsOutlined,
} from "@ant-design/icons";

type Props = {
  editor: any;
};

export const EditorToolbar: React.FC<Props> = ({ editor }) => {
  const can = editor?.can();

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
      }}
    >
      <Space wrap>
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
        </Space.Compact>

        <Divider type="vertical" />

        <Space.Compact>
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
