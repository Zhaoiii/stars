import React, { useCallback, useMemo } from "react";
import type { Editor } from "@tiptap/react";
import { Dropdown, type MenuProps } from "antd";
import { CellSelection } from "@tiptap/pm/tables";
import {
  ColumnHeightOutlined,
  ColumnWidthOutlined,
  DeleteOutlined,
  BorderOuterOutlined,
  MergeCellsOutlined,
  SplitCellsOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignMiddleOutlined,
  VerticalAlignBottomOutlined,
  TableOutlined,
} from "@ant-design/icons";

interface Props {
  editor: Editor | null;
  children: React.ReactNode;
}

const TableContextMenu: React.FC<Props> = ({ editor, children }) => {
  const handleContextMenu = useCallback(
    (ev: React.MouseEvent<HTMLDivElement>) => {
      if (!editor) return;
      const target = ev.target as HTMLElement;
      const cell = target?.closest?.("td, th");
      if (!cell) {
        // 非单元格区域屏蔽右键菜单
        ev.preventDefault();
        return;
      }
      // 保持多单元格选择，不要在右键时打断
      const selection: any = editor.state.selection;
      const isCellSelection = selection instanceof CellSelection;
      if (!isCellSelection) {
        const pos = editor.view.posAtCoords({
          left: ev.clientX,
          top: ev.clientY,
        });
        if (pos?.pos != null) {
          editor.chain().focus().setTextSelection(pos.pos).run();
        }
      }
      // 不阻止默认，以便 Dropdown 触发 contextMenu 打开
    },
    [editor]
  );

  const items: MenuProps["items"] = useMemo(
    () => [
      {
        type: "group",
        label: "插入/删除行",
        children: [
          {
            key: "row:add:before",
            label: "上方插入一行",
            icon: <ColumnHeightOutlined />,
          },
          {
            key: "row:add:after",
            label: "下方插入一行",
            icon: <ColumnHeightOutlined rotate={180} />,
          },
          {
            key: "row:delete",
            label: "删除本行",
            danger: true,
            icon: <DeleteOutlined />,
          },
        ],
      },
      {
        type: "group",
        label: "插入/删除列",
        children: [
          {
            key: "col:add:before",
            label: "左侧插入一列",
            icon: <ColumnWidthOutlined />,
          },
          {
            key: "col:add:after",
            label: "右侧插入一列",
            icon: <ColumnWidthOutlined rotate={180} />,
          },
          {
            key: "col:delete",
            label: "删除本列",
            danger: true,
            icon: <DeleteOutlined />,
          },
        ],
      },
      {
        type: "group",
        label: "表格",
        children: [
          {
            key: "table:insert",
            label: "插入 3×3 表格",
            icon: <TableOutlined />,
          },
          { type: "divider" },
          {
            key: "table:align:left",
            label: "表格居左",
            icon: <ColumnWidthOutlined />,
          },
          {
            key: "table:align:center",
            label: "表格居中",
            icon: <ColumnWidthOutlined />,
          },
          {
            key: "table:align:right",
            label: "表格居右",
            icon: <ColumnWidthOutlined />,
          },
          { type: "divider" },
          {
            key: "table:width:full",
            label: "宽度 100%",
            icon: <ColumnWidthOutlined />,
          },
          {
            key: "table:width:narrow",
            label: "宽度 800px",
            icon: <ColumnWidthOutlined />,
          },
          {
            key: "table:delete",
            label: "删除表格",
            danger: true,
            icon: <BorderOuterOutlined />,
          },
        ],
      },
      {
        type: "group",
        label: "单元格",
        children: [
          {
            key: "cell:merge",
            label: "合并单元格",
            icon: <MergeCellsOutlined />,
          },
          {
            key: "cell:split",
            label: "拆分单元格",
            icon: <SplitCellsOutlined />,
          },
          { type: "divider" },
          {
            key: "cell:valign:top",
            label: "上对齐",
            icon: <VerticalAlignTopOutlined />,
          },
          {
            key: "cell:valign:middle",
            label: "垂直居中",
            icon: <VerticalAlignMiddleOutlined />,
          },
          {
            key: "cell:valign:bottom",
            label: "下对齐",
            icon: <VerticalAlignBottomOutlined />,
          },
        ],
      },
    ],
    []
  );

  const onClick: MenuProps["onClick"] = ({ key }) => {
    if (!editor) return;
    const chain = editor.chain().focus();
    switch (key) {
      case "row:add:before":
        chain.addRowBefore().run();
        break;
      case "row:add:after":
        chain.addRowAfter().run();
        break;
      case "row:delete":
        chain.deleteRow().run();
        break;
      case "col:add:before":
        chain.addColumnBefore().run();
        break;
      case "col:add:after":
        chain.addColumnAfter().run();
        break;
      case "col:delete":
        chain.deleteColumn().run();
        break;
      case "table:insert":
        chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        break;
      case "table:delete":
        chain.deleteTable().run();
        break;
      case "table:align:left":
        chain.updateAttributes("table", { align: "left" }).run();
        break;
      case "table:align:center":
        chain.updateAttributes("table", { align: "center" }).run();
        break;
      case "table:align:right":
        chain.updateAttributes("table", { align: "right" }).run();
        break;
      case "table:width:full":
        chain.updateAttributes("table", { width: "100%" }).run();
        break;
      case "table:width:narrow":
        chain.updateAttributes("table", { width: "800px" }).run();
        break;
      case "cell:merge":
        chain.mergeCells().run();
        break;
      case "cell:split":
        chain.splitCell().run();
        break;
      case "cell:valign:top":
        chain.setCellAttribute("verticalAlign", "top").run();
        break;
      case "cell:valign:middle":
        chain.setCellAttribute("verticalAlign", "middle").run();
        break;
      case "cell:valign:bottom":
        chain.setCellAttribute("verticalAlign", "bottom").run();
        break;
      default:
        break;
    }
  };

  return (
    <Dropdown trigger={["contextMenu"]} menu={{ items, onClick }}>
      <div
        style={{ width: "100%", height: "100%" }}
        onMouseDown={(ev) => {
          // 右键按下时阻止 ProseMirror 改变选区，避免多单元格选择被打断
          if (ev.button === 2) {
            const target = ev.target as HTMLElement;
            const cell = target?.closest?.("td, th");
            if (cell) {
              ev.preventDefault();
            }
          }
        }}
        onContextMenu={handleContextMenu}
      >
        {children}
      </div>
    </Dropdown>
  );
};

export default TableContextMenu;
