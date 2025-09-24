export type RuleContext = {
  // 原始渲染前 HTML（可选）
  html?: string;
  // 规则 JSON（比如 { expr: string }）
  rule: any;
  // 目标单元格元素
  cell: HTMLElement;
  // 报告数据对象
  data: any;
};

export type RuleHandler = (ctx: RuleContext) => void;

export interface PreviewRenderOptions {
  // 规则处理器列表，按序执行
  ruleHandlers?: RuleHandler[];
  // 当规则表达式抛错时是否忽略
  silentOnError?: boolean;
}

// 默认占位符解析 a.b[0].c / a['b']
export function resolvePath(data: any, path: string) {
  try {
    const parts = path
      .replace(/\[(\d+)\]/g, ".$1")
      .replace(/\['([^']+)'\]/g, ".$1")
      .split(".")
      .filter(Boolean);
    let cur: any = data;
    for (const p of parts) {
      if (cur == null) return "";
      cur = cur[p];
    }
    if (cur == null) return "";
    if (typeof cur === "object") return JSON.stringify(cur);
    return String(cur);
  } catch {
    return "";
  }
}

// 默认规则处理器：expr 为真则设置背景色
export const backgroundColorRule: RuleHandler = ({ rule, cell, data }) => {
  const expr = rule?.expr as string;
  const bg = rule?.bgColor || "#90EE90";
  if (!expr) return;
  // eslint-disable-next-line no-new-func
  const fn = new Function("data", `with (data) { return (${expr}); }`);
  const ok = !!fn(data);
  if (ok) {
    cell.style.backgroundColor = bg;
  }
};

// 统一渲染：占位符替换 + 规则执行
export function renderPreviewHtml(
  rawHtml: string,
  reportData: any,
  opts?: PreviewRenderOptions
) {
  const { ruleHandlers = [backgroundColorRule], silentOnError = true } =
    opts || {};

  // 1) 占位符替换
  const replaced = rawHtml.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_m, p1) => {
    return resolvePath(reportData, String(p1).trim());
  });

  // 2) 规则处理
  const container = document.createElement("div");
  container.innerHTML = replaced;
  const cells = container.querySelectorAll("td, th");
  cells.forEach((cell) => {
    const ruleAttr = (cell as HTMLElement).getAttribute("data-rule");
    if (!ruleAttr) return;
    try {
      const json = JSON.parse(ruleAttr);
      for (const handler of ruleHandlers) {
        handler({ rule: json, cell: cell as HTMLElement, data: reportData });
      }
    } catch (e) {
      if (!silentOnError) throw e;
    }
  });

  return container.innerHTML;
}
