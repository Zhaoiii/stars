import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { FormInputView } from "./FormInputView";

export interface FormInputAttrs {
  initialValue: string | null;
  placeholder: string | null;
}

export const FormInput = Node.create({
  name: "formInput",

  group: "block",
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      initialValue: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-initial") || "",
        renderHTML: (attributes) => {
          if (!attributes.initialValue) return {};
          return { "data-initial": attributes.initialValue };
        },
      },
      placeholder: {
        default: "请输入…",
        parseHTML: (element) => element.getAttribute("placeholder") || null,
        renderHTML: (attributes) => {
          if (!attributes.placeholder) return {};
          return { placeholder: attributes.placeholder };
        },
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'div[data-type="form-input"]' },
      { tag: 'textarea[data-type="form-input"]' },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const attrs = mergeAttributes(
      { "data-type": "form-input" },
      HTMLAttributes,
      {
        style:
          "width:100%;display:block;box-sizing:border-box;padding:8px 10px;border:1px solid #d9d9d9;border-radius:6px;resize:none;overflow:hidden;min-height:38px;line-height:1.6;",
        oninput:
          "this.style.height='auto';this.style.height=this.scrollHeight+'px'",
      }
    );

    // 直接输出 textarea，预览可编辑
    return ["textarea", attrs, (node.attrs.initialValue as string) || ""];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FormInputView as any);
  },

  addCommands() {
    return {
      insertFormInput:
        (options?: Partial<FormInputAttrs>) =>
        ({ commands }: any) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              initialValue: options?.initialValue ?? "",
              placeholder: options?.placeholder ?? "请输入…",
            },
          }),
      setFormInputInitialValue:
        (value: string) =>
        ({ commands }: any) =>
          commands.updateAttributes(this.name, { initialValue: value }),
    } as any;
  },
});
