import React, { useEffect, useMemo } from "react";
import { Form, Input, Select, DatePicker, Modal } from "antd";
import { Gender } from "@/types/student";
import useAllTeams from "@/hooks/useAllTeams";
import { StudentService } from "@/services/studentService";
import { DefaultDateFormat } from "@/utils/constant";
import dayjs from "dayjs";
import { ApiResponse } from "@/services/api";
import { User } from "@/types/user";

const { Option } = Select;

interface StudentFormProps {
  initialValues?: any;
  open?: boolean;
  handleCloseModal: (needRefresh?: boolean) => void;
}

const StudentFormModal: React.FC<StudentFormProps> = ({
  initialValues,
  handleCloseModal,
  open,
}) => {
  const [form] = Form.useForm();
  const teams = useAllTeams();
  const teamId = Form.useWatch("teamId", form);
  const teachers = useMemo(() => {
    return teams.find((team) => team.id === teamId)?.users || [];
  }, [teams, teamId]);

  const onFinish = async (values: any) => {
    const { birthDate, ...rest } = values;
    const payload = {
      ...rest,
      birthDate: birthDate.format(DefaultDateFormat),
    };
    let res: ApiResponse;
    if (initialValues) {
      res = await StudentService.updateStudent(payload);
    } else {
      res = await StudentService.createStudent(payload);
    }

    if (res.success) {
      handleCloseModal(true);
    }
  };

  useEffect(() => {
    if (open && initialValues) {
      const { birthDate, teachers, ...rest } = initialValues;
      form.setFieldsValue({
        birthDate: dayjs(birthDate),
        teacherIds: teachers.map((t: User) => t.id),
        ...rest,
      });
    }
  }, [open, initialValues]);

  return (
    <Modal
      title={initialValues ? "编辑学生" : "创建学生"}
      open={open}
      onOk={form.submit}
      onCancel={() => handleCloseModal(false)}
      afterClose={() => form.resetFields()}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item hidden name="id">
          <Input />
        </Form.Item>
        <Form.Item
          name="name"
          label="姓名"
          rules={[
            { required: true, message: "请输入姓名" },
            { min: 2, max: 50, message: "姓名长度必须在2-50个字符之间" },
          ]}
        >
          <Input placeholder="请输入姓名" />
        </Form.Item>

        <Form.Item
          name="gender"
          label="性别"
          rules={[{ required: true, message: "请选择性别" }]}
        >
          <Select placeholder="请选择性别">
            <Option value={Gender.MALE}>男</Option>
            <Option value={Gender.FEMALE}>女</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="birthDate"
          label="出生日期"
          rules={[{ required: true, message: "请选择出生日期" }]}
        >
          <DatePicker style={{ width: "100%" }} placeholder="请选择出生日期" />
        </Form.Item>

        <Form.Item
          name="teamId"
          label="所属团队"
          rules={[{ required: true, message: "请选择所属团队" }]}
        >
          <Select
            placeholder="请选择所属团队"
            onChange={() => form.resetFields(["teacherIds"])}
          >
            {teams.map((team) => (
              <Option key={team.id} value={team.id}>
                {team.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item dependencies={["teamId"]}>
          {() => (
            <Form.Item
              name="teacherIds"
              label="分配教师"
              rules={[{ required: true, message: "请选择分配教师" }]}
            >
              <Select placeholder="请选择分配教师" mode="multiple">
                {teachers.map((teacher) => (
                  <Option key={teacher.id} value={teacher.id}>
                    {teacher.name || teacher.username}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Form.Item>

        <Form.Item name="remarks" label="备注">
          <Input.TextArea placeholder="请输入备注" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StudentFormModal;
