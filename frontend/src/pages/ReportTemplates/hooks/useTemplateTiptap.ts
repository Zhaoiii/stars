import { useEditor } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Underline } from "@tiptap/extension-underline";
import { TextAlign } from "@tiptap/extension-text-align";
import { FontFamily } from "@tiptap/extension-font-family";
import { FormInput } from "../extensions/FormInput";

// 带规则的单元格扩展
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
    };
  },
});

// 允许通过 textStyle 使用 fontSize 样式
const FontSize = Extension.create({
  name: "fontSizeHelper",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
});

export function useTemplateTiptap(initialContent: any) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph", "blockquote"] }),
      FontFamily,
      FontSize,
      Placeholder.configure({
        placeholder: "在此编写模板内容，可插入表格与变量占位符…",
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      RulefulCell,
      FormInput,
    ],
    content: initialContent || "",
    autofocus: true,
    editable: true,
  });

  return editor;
}
