import Table from "@tiptap/extension-table";

type TableAlign = "left" | "center" | "right";

const TableWithLayout = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: null as TableAlign | null,
        parseHTML: (element) => element.getAttribute("data-align"),
        renderHTML: (attributes) => {
          if (!attributes.align) return {};
          return { "data-align": attributes.align };
        },
      },
      width: {
        // 支持百分比或像素，例如 "100%" | "800px"
        default: null as string | null,
        parseHTML: (element) =>
          element.getAttribute("data-width") || element.getAttribute("width"),
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return {
            "data-width": attributes.width,
            style: `width: ${attributes.width};`,
          };
        },
      },
    };
  },
});

export default TableWithLayout;

