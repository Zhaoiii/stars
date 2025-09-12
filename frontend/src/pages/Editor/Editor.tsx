import React, { useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCellWithVAlign from "./extensions/TableCellWithVAlign";
import TextAlign from "@tiptap/extension-text-align";
import { Card } from "antd";
import Toolbar from "./components/Toolbar";
import TableContextMenu from "./components/TableContextMenu";
import TableWithLayout from "./extensions/TableWithLayout";

const Editor: React.FC = () => {
  const extensions = useMemo(
    () => [
      StarterKit.configure({ history: { depth: 100 } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TableWithLayout.configure({
        resizable: true,
        HTMLAttributes: { class: "tiptap-table" },
      }),
      TableRow,
      TableHeader,
      TableCellWithVAlign,
    ],
    []
  );

  const editor = useEditor({
    extensions,
    content: `
      <h2>富文本编辑器 - 表格示例</h2>
      <p>可以插入表格，并支持合并/拆分单元格、增删行列、表头切换等。</p>
      <p>选中多个单元格后点击“合并单元格”。在已合并的单元格中点击“拆分单元格”。</p>
    `,
    autofocus: true,
    editorProps: { attributes: { class: "tiptap ProseMirror" } },
  });

  return (
    <div style={{ padding: 16 }}>
      <Card
        size="small"
        bodyStyle={{ padding: 8, paddingBottom: 4 }}
        className="editor-toolbar-card"
      >
        <Toolbar editor={editor} />
      </Card>
      <Card style={{ marginTop: 12 }} bodyStyle={{ padding: 12 }}>
        <TableContextMenu editor={editor}>
          <EditorContent editor={editor} />
        </TableContextMenu>
      </Card>
    </div>
  );
};

export default Editor;
