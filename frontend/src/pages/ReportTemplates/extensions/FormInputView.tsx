import React, { useEffect, useRef } from "react";
import { NodeViewWrapper } from "@tiptap/react";

type Props = {
  node: { attrs: { initialValue?: string; placeholder?: string } };
  updateAttributes: (attrs: any) => void;
  selected: boolean;
};

export const FormInputView: React.FC<Props> = ({
  node,
  updateAttributes,
  selected,
}) => {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const value = node.attrs.initialValue || "";
  const placeholder = node.attrs.placeholder || "请输入…";

  useEffect(() => {
    if (!ref.current) return;
    autoResize();
  }, []);

  const autoResize = () => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = `${ref.current.scrollHeight}px`;
  };

  return (
    <NodeViewWrapper as="div" style={{ width: "100%" }}>
      <textarea
        ref={ref}
        defaultValue={value}
        placeholder={placeholder}
        onInput={(e) => {
          const v = (e.target as HTMLTextAreaElement).value;
          updateAttributes({ initialValue: v });
          autoResize();
        }}
        style={{
          width: "100%",
          display: "block",
          boxSizing: "border-box",
          padding: "8px 10px",
          border: "1px solid #d9d9d9",
          borderRadius: 6,
          resize: "none",
          overflow: "hidden",
          minHeight: 38,
          lineHeight: 1.6,
          outline: selected ? "2px solid #1890ff" : "none",
        }}
      />
    </NodeViewWrapper>
  );
};
