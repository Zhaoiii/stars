import React, { useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  Button,
  Divider,
  Popover,
  Space,
  Switch,
  Tooltip,
  InputNumber,
} from "antd";
import {
  UndoOutlined,
  RedoOutlined,
  BoldOutlined,
  ItalicOutlined,
  StrikethroughOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  FontSizeOutlined,
  TableOutlined,
  ColumnWidthOutlined,
  ColumnHeightOutlined,
  DeleteOutlined,
  SplitCellsOutlined,
  MergeCellsOutlined,
  BorderOuterOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignMiddleOutlined,
  VerticalAlignBottomOutlined,
} from "@ant-design/icons";

interface ToolbarProps {
  editor: Editor | null;
}

const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
  if (!editor) return null;

  const [tableConfigOpen, setTableConfigOpen] = useState(false);
  const [tableRows, setTableRows] = useState<number>(3);
  const [tableCols, setTableCols] = useState<number>(3);
  const [withHeader, setWithHeader] = useState<boolean>(true);

  const handleInsertTable = () => {
    const rows = Math.max(1, Math.min(50, Number(tableRows) || 1));
    const cols = Math.max(1, Math.min(20, Number(tableCols) || 1));
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: withHeader })
      .run();
    setTableConfigOpen(false);
  };

  const TableInsertPanel = (
    <div style={{ width: 220 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span>行数</span>
        <InputNumber
          size="small"
          min={1}
          max={50}
          value={tableRows}
          onChange={(v) => setTableRows(Number(v) || 1)}
        />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span>列数</span>
        <InputNumber
          size="small"
          min={1}
          max={20}
          value={tableCols}
          onChange={(v) => setTableCols(Number(v) || 1)}
        />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span>表头行</span>
        <Switch size="small" checked={withHeader} onChange={setWithHeader} />
      </div>
      <Space
        style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}
      >
        <Button size="small" onClick={() => setTableConfigOpen(false)}>
          取消
        </Button>
        <Button size="small" type="primary" onClick={handleInsertTable}>
          插入
        </Button>
      </Space>
    </div>
  );

  return (
    <div className="editor-toolbar">
      <Space wrap size={[8, 8]}>
        <Tooltip title="撤销">
          <Button
            size="small"
            icon={<UndoOutlined />}
            onClick={() => editor.chain().focus().undo().run()}
          />
        </Tooltip>
        <Tooltip title="重做">
          <Button
            size="small"
            icon={<RedoOutlined />}
            onClick={() => editor.chain().focus().redo().run()}
          />
        </Tooltip>

        <Divider type="vertical" />

        <Tooltip title="上对齐(单元格)">
          <Button
            size="small"
            icon={<VerticalAlignTopOutlined />}
            onClick={() =>
              editor
                .chain()
                .focus()
                .setCellAttribute("verticalAlign", "top")
                .run()
            }
          />
        </Tooltip>
        <Tooltip title="居中对齐(单元格)">
          <Button
            size="small"
            icon={<VerticalAlignMiddleOutlined />}
            onClick={() =>
              editor
                .chain()
                .focus()
                .setCellAttribute("verticalAlign", "middle")
                .run()
            }
          />
        </Tooltip>
        <Tooltip title="下对齐(单元格)">
          <Button
            size="small"
            icon={<VerticalAlignBottomOutlined />}
            onClick={() =>
              editor
                .chain()
                .focus()
                .setCellAttribute("verticalAlign", "bottom")
                .run()
            }
          />
        </Tooltip>

        <Tooltip title="加粗">
          <Button
            size="small"
            type={editor.isActive("bold") ? "primary" : "default"}
            icon={<BoldOutlined />}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
        </Tooltip>
        <Tooltip title="斜体">
          <Button
            size="small"
            type={editor.isActive("italic") ? "primary" : "default"}
            icon={<ItalicOutlined />}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
        </Tooltip>
        <Tooltip title="删除线">
          <Button
            size="small"
            type={editor.isActive("strike") ? "primary" : "default"}
            icon={<StrikethroughOutlined />}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          />
        </Tooltip>

        <Divider type="vertical" />

        <Tooltip title="左对齐">
          <Button
            size="small"
            type={
              editor.isActive({ textAlign: "left" }) ? "primary" : "default"
            }
            icon={<AlignLeftOutlined />}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          />
        </Tooltip>
        <Tooltip title="居中">
          <Button
            size="small"
            type={
              editor.isActive({ textAlign: "center" }) ? "primary" : "default"
            }
            icon={<AlignCenterOutlined />}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          />
        </Tooltip>
        <Tooltip title="右对齐">
          <Button
            size="small"
            type={
              editor.isActive({ textAlign: "right" }) ? "primary" : "default"
            }
            icon={<AlignRightOutlined />}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          />
        </Tooltip>

        <Divider type="vertical" />

        <Tooltip title="无序列表">
          <Button
            size="small"
            type={editor.isActive("bulletList") ? "primary" : "default"}
            icon={<UnorderedListOutlined />}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
        </Tooltip>
        <Tooltip title="有序列表">
          <Button
            size="small"
            type={editor.isActive("orderedList") ? "primary" : "default"}
            icon={<OrderedListOutlined />}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
        </Tooltip>

        <Divider type="vertical" />

        <Tooltip title="正文">
          <Button
            size="small"
            icon={<FontSizeOutlined />}
            onClick={() => editor.chain().focus().setParagraph().run()}
          />
        </Tooltip>
        <Tooltip title="标题2">
          <Button
            size="small"
            type={
              editor.isActive("heading", { level: 2 }) ? "primary" : "default"
            }
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            H2
          </Button>
        </Tooltip>
        <Tooltip title="标题3">
          <Button
            size="small"
            type={
              editor.isActive("heading", { level: 3 }) ? "primary" : "default"
            }
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            H3
          </Button>
        </Tooltip>

        <Divider type="vertical" />

        <Popover
          open={tableConfigOpen}
          onOpenChange={setTableConfigOpen}
          trigger="click"
          placement="bottomLeft"
          content={TableInsertPanel}
        >
          <Tooltip title="插入表格">
            <Button
              size="small"
              icon={<TableOutlined />}
              onClick={() => setTableConfigOpen(true)}
            />
          </Tooltip>
        </Popover>

        <Tooltip title="上方插入一行">
          <Button
            size="small"
            icon={<ColumnHeightOutlined />}
            onClick={() => editor.chain().focus().addRowBefore().run()}
          />
        </Tooltip>
        <Tooltip title="下方插入一行">
          <Button
            size="small"
            icon={<ColumnHeightOutlined rotate={180} />}
            onClick={() => editor.chain().focus().addRowAfter().run()}
          />
        </Tooltip>
        <Tooltip title="删除当前行">
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => editor.chain().focus().deleteRow().run()}
          />
        </Tooltip>

        <Tooltip title="左侧插入一列">
          <Button
            size="small"
            icon={<ColumnWidthOutlined />}
            onClick={() => editor.chain().focus().addColumnBefore().run()}
          />
        </Tooltip>
        <Tooltip title="右侧插入一列">
          <Button
            size="small"
            icon={<ColumnWidthOutlined rotate={180} />}
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          />
        </Tooltip>
        <Tooltip title="删除当前列">
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => editor.chain().focus().deleteColumn().run()}
          />
        </Tooltip>

        <Tooltip title="删除表格">
          <Button
            size="small"
            danger
            icon={<BorderOuterOutlined />}
            onClick={() => editor.chain().focus().deleteTable().run()}
          />
        </Tooltip>

        <Divider type="vertical" />

        <Tooltip title="合并单元格">
          <Button
            size="small"
            icon={<MergeCellsOutlined />}
            onClick={() => editor.chain().focus().mergeCells().run()}
          />
        </Tooltip>
        <Tooltip title="拆分单元格">
          <Button
            size="small"
            icon={<SplitCellsOutlined />}
            onClick={() => editor.chain().focus().splitCell().run()}
          />
        </Tooltip>
        <Tooltip title="合并或拆分">
          <Button
            size="small"
            onClick={() => editor.chain().focus().mergeOrSplit().run()}
          >
            合并/拆分
          </Button>
        </Tooltip>
      </Space>
    </div>
  );
};

export default Toolbar;
