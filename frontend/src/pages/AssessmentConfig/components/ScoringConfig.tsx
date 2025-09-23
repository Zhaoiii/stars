import React from "react";
import { Button, Form, Input, InputNumber, Space } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { EvaluationScoringType } from "@/types/evaluation";

interface ScoringConfigProps {
  scoringType: EvaluationScoringType;
  // isMultipleChoice: boolean;
  // nodeId: string;
  // onOptionsClick: () => void;
}

const ScoringConfig: React.FC<ScoringConfigProps> = ({
  scoringType,
  // isMultipleChoice,
  // nodeId,
  // onOptionsClick,
}) => {
  if (scoringType === EvaluationScoringType.NONE) {
    return null;
  }

  // if (isMultipleChoice) {
  //   return (
  //     <>
  //       <Form.Item label="多选选项">
  //         <Button type="dashed" onClick={onOptionsClick} block>
  //           配置选项
  //         </Button>
  //       </Form.Item>
  //       <Form.Item label="数量-得分规则（多选累计数量对应得分）">
  //         <span />
  //       </Form.Item>
  //       <Form.List name="scoringConfig">
  //         {(fields, { add, remove }) => (
  //           <>
  //             {fields.map(({ key, name, ...restField }) => (
  //               <Space
  //                 key={key}
  //                 style={{ display: "flex", marginBottom: 8 }}
  //                 align="baseline"
  //               >
  //                 <Form.Item
  //                   {...restField}
  //                   name={[name, "quantity"]}
  //                   rules={[{ required: true, message: "请输入数量" }]}
  //                   style={{ width: 120 }}
  //                 >
  //                   <InputNumber min={0} placeholder="数量" />
  //                 </Form.Item>
  //                 <Form.Item
  //                   {...restField}
  //                   name={[name, "score"]}
  //                   rules={[{ required: true, message: "请输入得分" }]}
  //                   style={{ width: 120 }}
  //                 >
  //                   <InputNumber placeholder="得分" />
  //                 </Form.Item>
  //                 <MinusCircleOutlined onClick={() => remove(name)} />
  //               </Space>
  //             ))}
  //             <Form.Item>
  //               <Button
  //                 type="dashed"
  //                 onClick={() => add({ quantity: 0, score: 0 })}
  //                 block
  //                 icon={<PlusOutlined />}
  //               >
  //                 添加规则
  //               </Button>
  //             </Form.Item>
  //           </>
  //         )}
  //       </Form.List>
  //     </>
  //   );
  // }

  return (
    <Form.List name="scoringConfig">
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }) => (
            <Space
              key={key}
              style={{ display: "flex", marginBottom: 8 }}
              align="baseline"
            >
              {[
                EvaluationScoringType.QUANTITY,
                EvaluationScoringType.MULTIPLE_CHOICE,
              ].includes(scoringType) && (
                <>
                  <Form.Item
                    {...restField}
                    name={[name, "quantity"]}
                    rules={[{ required: true, message: "请输入数量" }]}
                    style={{ width: 120 }}
                  >
                    <InputNumber min={0} placeholder="数量" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "score"]}
                    rules={[{ required: true, message: "请输入得分" }]}
                    style={{ width: 120 }}
                  >
                    <InputNumber placeholder="得分" />
                  </Form.Item>
                </>
              )}
              {scoringType === EvaluationScoringType.SINGLE_CHOICE && (
                <>
                  <Form.Item
                    {...restField}
                    name={[name, "label"]}
                    rules={[{ required: true, message: "请输入描述" }]}
                    style={{ width: 200 }}
                  >
                    <Input placeholder="描述" maxLength={255} />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "score"]}
                    rules={[{ required: true, message: "请输入得分" }]}
                    style={{ width: 120 }}
                  >
                    <InputNumber placeholder="得分" />
                  </Form.Item>
                </>
              )}
              <MinusCircleOutlined onClick={() => remove(name)} />
            </Space>
          ))}
          <Form.Item>
            <Button
              type="dashed"
              onClick={() =>
                add(
                  [
                    EvaluationScoringType.QUANTITY,
                    EvaluationScoringType.MULTIPLE_CHOICE,
                  ].includes(scoringType)
                    ? { quantity: 0, score: 0 }
                    : { label: "", score: 0 }
                )
              }
              block
              icon={<PlusOutlined />}
            >
              添加规则
            </Button>
          </Form.Item>
        </>
      )}
    </Form.List>
  );
};

export default ScoringConfig;
