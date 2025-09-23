import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

// 带规则与背景色的单元格扩展
export const RulefulCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      dataRule: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-rule"),
        renderHTML: (attributes) => {
          if (!attributes.dataRule) return {};
          return { "data-rule": attributes.dataRule };
        },
      },
      dataBg: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-bg"),
        renderHTML: (attributes) => {
          if (!attributes.dataBg) return {};
          return {
            "data-bg": attributes.dataBg,
            style: `background-color: ${attributes.dataBg}`,
          };
        },
      },
    };
  },
});

export function useTemplateTiptap(initialContent: any) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "在此编写模板内容，可插入表格与变量占位符…",
      }),
      Table.configure({ resizable: false }),
      TableRow,
      RulefulCell,
      TableHeader,
    ],
    content: initialContent || "",
    autofocus: true,
    editable: true,
  });

  return editor;
}
