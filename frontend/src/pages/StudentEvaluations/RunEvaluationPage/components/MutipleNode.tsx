import { Space, Checkbox, message } from "antd";
import SelectSearchCreate from "./SelectSearchCreate";
import { MultipleChoiceAnswerAPI } from "@/services/multipleChoiceAnswerService";
import React from "react";
import {
  EvaluationScoringType,
  EvaluationToolNodeDTO,
} from "@/types/evaluation";

const MutipleNode = ({
  node,
  disabled,
  readOnly,
  toolId,
  values,
  onChange,
  setSaving,
}: {
  node: EvaluationToolNodeDTO;
  disabled: boolean;
  readOnly: boolean;
  toolId?: string;
  values: string[];
  onChange: (vals: string[]) => void;
  setSaving: (saving: boolean) => void;
}) => {
  const [options, setOptions] = React.useState<
    { label: string; value: string }[]
  >([]);

  const loadOptions = async () => {
    if (!toolId || node.scoringType !== EvaluationScoringType.MULTIPLE_CHOICE)
      return;
    const res = await MultipleChoiceAnswerAPI.getAnswersByQuery({
      toolId,
      longTermGoalId: node.id,
    });
    setOptions(
      res.data.data?.map((o: any) => ({ label: o.label, value: o.id })) || []
    );
  };

  React.useEffect(() => {
    loadOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolId, node.id]);

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <SelectSearchCreate
        disabled={readOnly}
        placeholder="搜索或创建选项"
        options={options}
        onSelect={(id) => {
          const next = Array.from(new Set([...(values || []), id]));
          onChange(next);
        }}
        onCreate={async (label) => {
          if (!toolId) return;
          try {
            setSaving(true);
            const res = await MultipleChoiceAnswerAPI.createAnswer({
              label,
              toolId,
              longTermGoalId: node.id,
            });
            await loadOptions();
            const newId = res.data.data?.id as string | undefined;
            if (newId) {
              const next = Array.from(new Set([...(values || []), newId]));
              onChange(next);
            }
            message.success("成功");
          } catch (e: any) {
            message.error(e.response?.data?.message || "创建失败");
          } finally {
            setSaving(false);
          }
        }}
      />
      <Checkbox.Group
        disabled={readOnly}
        value={values}
        onChange={(vals) => onChange(vals as string[])}
      >
        {(options || []).map((op: { label: string; value: string }) => (
          <Checkbox key={op.value} value={op.value}>
            {op.label}
          </Checkbox>
        ))}
      </Checkbox.Group>
    </Space>
  );
};

export default MutipleNode;
