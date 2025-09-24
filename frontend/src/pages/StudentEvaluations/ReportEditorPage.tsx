import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Layout,
  Space,
  Typography,
  message,
  Dropdown,
} from "antd";
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { EditorContent } from "@tiptap/react";
import { useTemplateTiptap } from "@/pages/ReportTemplates/hooks/useTemplateTiptap";
import { EvaluationRecordAPI } from "@/services/evaluationRecordService";
import { ReportTemplateAPI } from "@/services/reportTemplateService";
import { renderPreviewHtml } from "@/utils/reportPreview";
import "@/pages/ReportTemplates/TemplateEditor.css";
import { exportReportAsPDF, exportReportAsWord } from "@/utils/reportExport";

const { Header, Content } = Layout;
const { Title } = Typography;

const ReportEditorPage: React.FC = () => {
  const { id, recordId } = useParams<{ id: string; recordId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [record, setRecord] = useState<any>(null);
  const [template, setTemplate] = useState<any>(null);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const previewRef = useRef<HTMLDivElement | null>(null);

  const editor = useTemplateTiptap(null);

  useEffect(() => {
    const bootstrap = async () => {
      if (!recordId) return;
      setLoading(true);
      try {
        // 1. 获取评估记录（包含 toolId 与 reportContent）
        const recRes = await EvaluationRecordAPI.getById(recordId);
        const rec = recRes.data.data;
        setRecord(rec);

        // 2. 加载到编辑器：已有 reportContent 用其内容，否则用模板内容
        if (rec?.reportContent) {
          editor?.commands.setContent(rec.reportContent);
        } else if (rec?.toolId) {
          const tplRes = await ReportTemplateAPI.getByToolId(rec.toolId);
          const tpl = tplRes.data.data;
          setTemplate(tpl);
          if (tpl?.content) {
            editor?.commands.setContent(tpl.content);
          }
        }

        // 默认渲染一次预览（占位符 + 规则）
        try {
          const html = editor?.getHTML() || "";
          const dataRes = await (
            await import("@/services/api")
          ).default.get(`/evaluation-records/records/${recordId}/report`);
          const reportData = dataRes.data?.data || {};
          const out = renderPreviewHtml(html, reportData);
          setPreviewHtml(out);
        } catch {}

        // 3. 默认渲染一次预览（占位符+规则）
        const html = editor?.getHTML() || "";
        const dataRes = await (
          await import("@/services/api")
        ).default.get(`/evaluation-records/records/${recordId}/report`);
        const reportData = dataRes.data?.data || {};
        const out = renderPreviewHtml(html, reportData);
        setPreviewHtml(out);
      } catch (e: any) {
        message.error(e.response?.data?.message || "加载失败");
      } finally {
        setLoading(false);
      }
    };
    if (editor) bootstrap();
  }, [recordId, editor]);

  const onSave = async () => {
    if (!recordId) return;
    try {
      setSaving(true);
      // 1) 收集预览区 textarea 的值（按出现顺序）
      const inputValues: string[] = [];
      if (previewRef.current) {
        const textareas = previewRef.current.querySelectorAll("textarea");
        textareas.forEach((ta) =>
          inputValues.push((ta as HTMLTextAreaElement).value ?? "")
        );
      }

      // 2) 获取编辑器 JSON，依次写回到 formInput.initialValue
      const json = editor?.getJSON();
      const updated = json ? JSON.parse(JSON.stringify(json)) : null;
      const writeBack = (node: any, cursor: { i: number }) => {
        if (!node) return;
        if (Array.isArray(node)) {
          node.forEach((n) => writeBack(n, cursor));
          return;
        }
        if (node.type === "formInput") {
          const val = inputValues[cursor.i] ?? node.attrs?.initialValue ?? "";
          node.attrs = { ...(node.attrs || {}), initialValue: val };
          cursor.i += 1;
        }
        if (node.content && Array.isArray(node.content)) {
          node.content.forEach((n: any) => writeBack(n, cursor));
        }
      };
      if (updated) writeBack(updated, { i: 0 });

      // 3) 回写到编辑器（保证内存一致），并保存 JSON
      if (updated) editor?.commands.setContent(updated);
      await EvaluationRecordAPI.saveReportContent(recordId, updated ?? json);
      message.success("保存成功");
    } catch (e: any) {
      message.error(e.response?.data?.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const exportAsPDF = async () => {
    try {
      await exportReportAsPDF(editor, recordId, previewRef);
    } catch {
      message.error("导出 PDF 失败");
    }
  };

  const exportAsWord = async () => {
    try {
      await exportReportAsWord(editor, recordId, previewRef, "报告");
    } catch {
      message.error("导出 Word 失败");
    }
  };

  // 简单路径解析（a.b[0].c / a['b']）
  //   const resolvePath = (data: any, path: string) => {
  //     try {
  //       const parts = path
  //         .replace(/\[(\d+)\]/g, ".$1")
  //         .replace(/\['([^']+)'\]/g, ".$1")
  //         .split(".")
  //         .filter(Boolean);
  //       let cur: any = data;
  //       for (const p of parts) {
  //         if (cur == null) return "";
  //         cur = cur[p];
  //       }
  //       if (cur == null) return "";
  //       if (typeof cur === "object") return JSON.stringify(cur);
  //       return String(cur);
  //     } catch {
  //       return "";
  //     }
  //   };

  const onInitializeFromTemplate = async () => {
    if (!recordId) return;
    try {
      setLoading(true);
      // 读取最新记录，确保拿到 toolId
      const recRes = await EvaluationRecordAPI.getById(recordId);
      const rec = recRes.data.data;
      if (!rec?.toolId) return message.warning("无法获取评估工具");

      // 获取模板与报告数据
      const [tplRes, reportDataRes] = await Promise.all([
        ReportTemplateAPI.getByToolId(rec.toolId),
        // 后端已有报告数据接口
        (
          await import("@/services/api")
        ).default.get(`/evaluation-records/records/${recordId}/report`),
      ]);
      const tpl = tplRes.data.data;
      const reportData = reportDataRes.data?.data || {};
      if (!tpl?.content) return message.warning("该工具暂无模板");

      // 写入模板 JSON，并重新渲染预览
      editor?.commands.setContent(tpl.content);
      const rawHtml = editor?.getHTML() || "";
      const rendered = renderPreviewHtml(rawHtml, reportData);
      setPreviewHtml(rendered);
      message.success("已按模板与数据重新初始化");
    } catch (e: any) {
      message.error(e?.response?.data?.message || "初始化失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ height: "calc(100vh - 200px)", overflow: "auto" }}>
      <Header
        style={{
          background: "#fff",
          padding: "0 24px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/students/${id}/evaluations`)}
            type="text"
          >
            返回评估记录
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            评估报告 {record ? `#${record.id}` : ""}
          </Title>
        </div>
        <Space>
          <Dropdown
            menu={{
              items: [
                { key: "pdf", label: "导出为 PDF", onClick: exportAsPDF },
                { key: "word", label: "导出为 Word", onClick: exportAsWord },
              ],
            }}
          >
            <Button>导出</Button>
          </Dropdown>
          <Button onClick={onInitializeFromTemplate}>重新初始化</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={onSave}
          >
            保存
          </Button>
        </Space>
      </Header>
      <Layout>
        <Content style={{ padding: 0, background: "#f5f5f5" }}>
          <Card
            style={{
              overflow: "auto",
              height: "calc(100vh - 260px)",
              margin: 16,
              display: "flex",
              flexDirection: "column",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            bodyStyle={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: 0,
            }}
          >
            <div
              style={{
                flex: 1,
                padding: 24,
                overflow: "auto",
                background: "#fff",
              }}
            >
              <div className="editor-page">
                {previewHtml ? (
                  <div className="editor-page">
                    <style>
                      {`
                      .editor-page p { margin: 0 0 1em 0; }
                      .editor-page table { width: 100%; border-collapse: collapse; table-layout: fixed; }
                      .editor-page th, .editor-page td { border: 1px solid #e1e5e9; vertical-align: top; word-wrap: break-word; overflow-wrap: anywhere; white-space: pre-wrap; }
                      /* 强制表格内段落保留间距，覆盖编辑器内置样式 */
                      .editor-page .ProseMirror table p { margin: 0 0 1em 0 !important; }
                      /* 让空段落也占位一行，用于表现“空行” */
                      .editor-page .ProseMirror p:empty::before { content: "\\00a0"; }
                      `}
                    </style>
                    <div
                      className="ProseMirror"
                      ref={previewRef}
                      style={{
                        minHeight: "calc(100vh - 300px)",
                        padding: 24,
                        whiteSpace: "pre-wrap",
                      }}
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                  </div>
                ) : (
                  <EditorContent
                    editor={editor}
                    style={{
                      minHeight: "calc(100vh - 300px)",
                      fontSize: 16,
                      lineHeight: 1.6,
                    }}
                  />
                )}
              </div>
            </div>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ReportEditorPage;
