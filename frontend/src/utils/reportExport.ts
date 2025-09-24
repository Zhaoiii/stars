import { renderPreviewHtml } from "@/utils/reportPreview";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function getLatestRenderedHtml(
  editor: any,
  recordId: string | undefined,
  previewRef?: React.RefObject<HTMLDivElement>
): Promise<string> {
  if (previewRef?.current) {
    return previewRef.current.innerHTML;
  }
  const html = editor?.getHTML() || "";
  const api = (await import("@/services/api")).default;
  if (!recordId) return html;
  const res = await api.get(`/evaluation-records/records/${recordId}/report`);
  const data = res.data?.data || {};
  return renderPreviewHtml(html, data);
}

export async function exportReportAsPDF(
  editor: any,
  recordId: string | undefined,
  previewRef?: React.RefObject<HTMLDivElement>,
  filename = "报告"
) {
  // 目标节点：优先使用预览区，但为了替换 textarea，需要克隆并转换
  const html = await getLatestRenderedHtml(editor, recordId, previewRef);

  let targetEl: HTMLDivElement | null = null;
  let createdContainer = false;

  const buildClonedContainer = (
    sourceEl?: HTMLElement,
    fallbackHtml?: string
  ) => {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-99999px";
    container.style.top = "0";
    container.style.width = "674px"; // 794 - 2*60
    container.style.padding = "60px";
    container.style.background = "#ffffff";
    container.style.boxSizing = "content-box";
    container.className = "editor-page";
    const inner = document.createElement("div");
    inner.className = "ProseMirror";
    if (sourceEl) {
      const cloned = sourceEl.cloneNode(true) as HTMLElement;
      replaceTextareasWithDivs(cloned);
      inner.innerHTML = cloned.innerHTML;
    } else if (fallbackHtml) {
      inner.innerHTML = fallbackHtml;
      replaceTextareasWithDivs(inner);
    }
    container.appendChild(inner);
    document.body.appendChild(container);
    return container;
  };

  if (previewRef?.current) {
    createdContainer = true;
    targetEl = buildClonedContainer(previewRef.current);
  } else {
    createdContainer = true;
    targetEl = buildClonedContainer(undefined, html);
  }

  if (!targetEl) throw new Error("未找到可导出的内容节点");

  // 使用 html2canvas 生成画布
  const canvas = await html2canvas(targetEl, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#ffffff",
    logging: false,
  });

  // 计算尺寸并分页到 A4
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const canvasWidthPx = canvas.width;
  const canvasHeightPx = canvas.height;

  // 以等比缩放至 A4 纸宽度
  const imgWidthMm = pageWidth;
  const imgHeightMm = (canvasHeightPx * imgWidthMm) / canvasWidthPx;

  let positionMm = 0;

  // 第一页
  pdf.addImage(imgData, "PNG", 0, positionMm, imgWidthMm, imgHeightMm);
  let remainingHeightMm = imgHeightMm - pageHeight;
  positionMm = -pageHeight;

  // 追加后续页（通过负 Y 偏移“上推”图像实现裁切分页）
  while (remainingHeightMm > -1) {
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, positionMm, imgWidthMm, imgHeightMm);
    remainingHeightMm -= pageHeight;
    positionMm -= pageHeight;
  }

  // 清理
  if (createdContainer && targetEl && targetEl.parentNode) {
    targetEl.parentNode.removeChild(targetEl);
  }

  pdf.save(`${filename}-${recordId || "report"}.pdf`);
}

export async function exportReportAsWord(
  editor: any,
  recordId: string | undefined,
  previewRef?: React.RefObject<HTMLDivElement>,
  filename = "报告"
) {
  const html = await getLatestRenderedHtml(editor, recordId, previewRef);

  // 将 textarea 替换为 div（保留换行）
  const wrapper = document.createElement("div");
  if (previewRef?.current) {
    const cloned = previewRef.current.cloneNode(true) as HTMLElement;
    replaceTextareasWithDivs(cloned);
    wrapper.innerHTML = cloned.innerHTML;
  } else {
    wrapper.innerHTML = html;
    replaceTextareasWithDivs(wrapper);
  }

  const processedHtml = wrapper.innerHTML;

  const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8" />
    <title>${filename}</title>
    <style>
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #e1e5e9; padding: 8px; }
      .editor-page, .editor-page td, .editor-page th { white-space: pre-wrap; }
    </style>
  </head><body><div class="editor-page"><div class="ProseMirror">${processedHtml}</div></div></body></html>`;
  const blob = new Blob([fullHtml], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${recordId || "report"}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * 将容器内所有 textarea 替换为 div，用其 value 作为文本内容。
 * 同时应用 white-space: pre-wrap 以保留换行与空格。
 */
function replaceTextareasWithDivs(root: HTMLElement) {
  const textareas = Array.from(root.querySelectorAll("textarea"));
  textareas.forEach((ta) => {
    const value = (ta as HTMLTextAreaElement).value ?? "";
    const div = document.createElement("div");
    div.style.whiteSpace = "pre-wrap";
    div.style.wordBreak = "break-word";
    // 尽量继承尺寸
    const computed = window.getComputedStyle(ta);
    div.style.minHeight = computed.minHeight || computed.height || "auto";
    div.style.padding = computed.padding || "0";
    div.style.border = computed.border || "none";
    div.style.boxSizing = computed.boxSizing || "border-box";
    div.style.border = "1px solid #e1e5e9";
    div.style.borderRadius = "6px";
    div.style.minHeight = "150px";
    // 设置文本
    div.textContent = value;
    ta.parentElement?.replaceChild(div, ta);
  });
}
