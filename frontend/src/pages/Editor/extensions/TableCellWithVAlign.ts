import TableCell from "@tiptap/extension-table-cell";

const TableCellWithVAlign = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      verticalAlign: {
        default: null as null | "top" | "middle" | "bottom",
        parseHTML: (element) => element.getAttribute("data-vertical-align"),
        renderHTML: (attributes) => {
          if (!attributes.verticalAlign) return {};
          return { "data-vertical-align": attributes.verticalAlign };
        },
      },
    };
  },
});

export default TableCellWithVAlign;
