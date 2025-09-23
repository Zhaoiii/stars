import React, { useMemo, useState, useEffect } from "react";
import {
  Button,
  Card,
  Divider,
  Space,
  Typography,
  message,
  Layout,
  Row,
  Col,
  Modal,
  Form,
  Input,
} from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { EditorContent } from "@tiptap/react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ReportTemplateAPI } from "@/services/reportTemplateService";
import api from "@/services/api";
import "./TemplateEditor.css";
// 右侧组件内会导入数据格式，仅此文件不直接使用
import { buildFieldOptions } from "./utils/fieldOptions";
import { useTemplateTiptap } from "./hooks/useTemplateTiptap";
import { EditorToolbar } from "./components/EditorToolbar";
import { RightSidebar } from "./components/RightSidebar";

const { Title } = Typography;
const { Header, Content } = Layout;

// 插入变量函数
function insertVariable(editor: any, variable: string) {
  if (!editor) return;
  editor.chain().focus().insertContent(`{{${variable}}}`).run();
}

const TemplateEditor: React.FC = () => {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewForm] = Form.useForm();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const templateId = searchParams.get("templateId");

  // 生成字段选项
  const fieldOptions = useMemo(() => buildFieldOptions(), []);

  const editor = useTemplateTiptap(template?.content || "");

  // 加载模板数据
  useEffect(() => {
    const loadTemplate = async () => {
      if (!templateId) return;

      setLoading(true);
      try {
        const res = await ReportTemplateAPI.getById(templateId);
        if (res.data.success && res.data.data) {
          setTemplate(res.data.data);
          if (editor && res.data.data.content) {
            editor.commands.setContent(res.data.data.content);
          }
        }
      } catch (error) {
        message.error("加载模板失败");
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [templateId, editor]);

  // 工具栏内部处理 editor.can()

  const onSave = async () => {
    if (!templateId) {
      message.error("模板ID不存在");
      return;
    }

    try {
      setSaving(true);
      const json = editor?.getJSON();
      await ReportTemplateAPI.update(templateId, { content: json });
      message.success("保存成功");
    } catch (error: any) {
      message.error(error.response?.data?.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  // 解析路径：支持 a.b[0].c 和 goals['目标1'].score
  const resolvePath = (data: any, path: string) => {
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
  };

  // 应用单元格规则并替换变量
  const renderPreviewHtml = (rawHtml: string, reportData: any) => {
    const replaced = rawHtml.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_m, p1) => {
      return resolvePath(reportData, String(p1).trim());
    });
    const container = document.createElement("div");
    container.innerHTML = replaced;
    const cells = container.querySelectorAll("td, th");
    cells.forEach((cell) => {
      const rule = (cell as HTMLElement).getAttribute("data-rule");
      const bg = (cell as HTMLElement).getAttribute("data-bg");
      if (!rule) return;
      try {
        const parsed = JSON.parse(rule);
        const expr = parsed?.expr as string;
        if (!expr) return;
        // eslint-disable-next-line no-new-func
        const fn = new Function("data", `with (data) { return (${expr}); }`);
        const ok = !!fn(reportData);
        if (ok && bg) {
          (cell as HTMLElement).style.backgroundColor = bg;
        }
      } catch {}
    });
    return container.innerHTML;
  };

  const openPreview = () => setPreviewOpen(true);

  const handlePreview = async () => {
    try {
      const { recordId } = await previewForm.validateFields();
      if (!editor) return;
      setPreviewLoading(true);
      const html = editor.getHTML();
      const res = await api.get(
        `/evaluation-records/records/${recordId}/report`
      );
      if (res.data?.success) {
        const reportData = res.data.data;
        const out = renderPreviewHtml(html, reportData);
        setPreviewHtml(out);
      } else {
        message.error(res.data?.message || "获取报告数据失败");
      }
    } catch (e: any) {
      if (e?.errorFields) return; // 表单校验错误
      message.error("预览失败");
    } finally {
      setPreviewLoading(false);
    }
  };

  // 规则设置已迁移到 RightSidebar 组件内部

  if (loading) {
    return (
      <Layout
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 16 }}>加载中...</div>
        </div>
      </Layout>
    );
  }

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
            onClick={() => navigate("/report-templates")}
            type="text"
          >
            返回列表
          </Button>
          <Divider type="vertical" />
          <Title level={4} style={{ margin: 0 }}>
            {template ? `编辑模板：${template.title}` : "报告模板编辑器"}
          </Title>
        </div>
        <Space>
          <Button icon={<EyeOutlined />} type="text" onClick={openPreview}>
            预览
          </Button>
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
          <Row style={{ height: "100%" }}>
            <Col span={18} style={{ height: "100%" }}>
              <Card
                style={{
                  overflow: "auto",
                  height: "calc(100vh - 280px)",
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
                <EditorToolbar editor={editor} />

                {/* 编辑器区域 */}
                <div
                  style={{
                    flex: 1,
                    padding: 24,
                    overflow: "auto",
                    background: "#fff",
                  }}
                >
                  <EditorContent
                    editor={editor}
                    style={{
                      minHeight: "calc(100vh - 200px)",
                      fontSize: 16,
                      lineHeight: 1.6,
                    }}
                  />
                </div>
              </Card>
            </Col>

            <Col span={6} style={{ height: "100%" }}>
              <div
                style={{
                  height: "100%",
                  padding: "16px 16px 16px 0",
                  overflow: "auto",
                }}
              >
                <RightSidebar
                  editor={editor}
                  fieldOptions={fieldOptions}
                  onInsertVariable={(field) => insertVariable(editor, field)}
                  toolId={template?.toolId}
                />
              </div>
            </Col>
          </Row>
        </Content>
      </Layout>
      <Modal
        title="报告预览"
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        onOk={handlePreview}
        okText="渲染预览"
        confirmLoading={previewLoading}
        width={1000}
      >
        <Form layout="inline" form={previewForm} style={{ marginBottom: 12 }}>
          <Form.Item
            name="recordId"
            label="评估记录ID"
            rules={[{ required: true, message: "请输入评估记录ID" }]}
          >
            <Input placeholder="请输入评估记录ID" style={{ width: 260 }} />
          </Form.Item>
        </Form>
        <Card size="small" bodyStyle={{ maxHeight: 520, overflow: "auto" }}>
          <div
            dangerouslySetInnerHTML={{
              __html:
                previewHtml ||
                '<div style="color:#999">请先点击“渲染预览”</div>',
            }}
          />
        </Card>
      </Modal>
    </Layout>
  );
};

export default TemplateEditor;

// 预览对话框挂在同文件底部（简化实现）
// 注意：在 JSX 返回处上方插入 Modal 更合适，这里为了最小侵入直接放在末尾不渲染。
