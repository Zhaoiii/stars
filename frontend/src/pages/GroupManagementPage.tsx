import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Select,
} from "antd";
import { groupAPI } from "../services/groupAPI";
import { userAPI } from "../services/userAPI";
import { StudentService } from "./StudentManagement/services/studentService";
import { Group } from "../types/group";
import { User, UserRole } from "../types/user";
import { Student } from "../types/student";

const GroupManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [form] = Form.useForm();

  // 选择弹窗状态
  const [selectOpen, setSelectOpen] = useState<
    null | "teachers" | "managers" | "students"
  >(null);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const { data } = await groupAPI.list();
      setGroups((data.groups as unknown as Group[]) || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const onCreate = async () => {
    const values = await form.validateFields();
    await groupAPI.create({
      name: values.name,
      description: values.description,
    });
    setCreateOpen(false);
    form.resetFields();
    fetchGroups();
  };

  const onDelete = async (record: Group) => {
    Modal.confirm({
      title: `确认删除分组「${record.name}」？`,
      onOk: async () => {
        await groupAPI.remove(record._id);
        fetchGroups();
      },
    });
  };

  const openSelector = async (
    type: "teachers" | "managers" | "students",
    group: Group
  ) => {
    setCurrentGroup(group);
    setSelectOpen(type);
    if (type === "students") {
      const s = await StudentService.getAllStudents();
      setAllStudents(s);
      const ids = Array.isArray(group.students)
        ? (group.students as any[]).map((x: any) =>
            typeof x === "string" ? x : x._id
          )
        : [];
      setSelectedIds(ids);
    } else {
      const users = await userAPI.list();
      setAllUsers(users);
      const ids = Array.isArray(group[type])
        ? (group[type] as any[]).map((x: any) =>
            typeof x === "string" ? x : x._id
          )
        : [];
      setSelectedIds(ids);
    }
  };

  const onSaveSelection = async () => {
    if (!currentGroup || !selectOpen) return;
    if (selectOpen === "teachers") {
      await groupAPI.addTeachers(currentGroup._id, selectedIds);
    } else if (selectOpen === "managers") {
      await groupAPI.setManagers(currentGroup._id, selectedIds);
    } else if (selectOpen === "students") {
      // 简化处理：先清空再添加（后端提供的接口为添加/移除二选一，这里采用先移除再添加保证一致）
      const existingIds = Array.isArray(currentGroup.students)
        ? (currentGroup.students as any[]).map((x: any) =>
            typeof x === "string" ? x : x._id
          )
        : [];
      const toRemove = existingIds.filter((id) => !selectedIds.includes(id));
      const toAdd = selectedIds.filter((id) => !existingIds.includes(id));
      if (toRemove.length)
        await groupAPI.removeStudents(currentGroup._id, toRemove);
      if (toAdd.length) await groupAPI.addStudents(currentGroup._id, toAdd);
    }
    setSelectOpen(null);
    setCurrentGroup(null);
    setSelectedIds([]);
    fetchGroups();
  };

  const userOptions = useMemo(
    () =>
      allUsers.map((u) => ({
        label: `${u.username}(${u.phone})`,
        value: u._id,
      })),
    [allUsers]
  );

  const studentOptions = useMemo(
    () => allStudents.map((s) => ({ label: `${s.name}`, value: s._id })),
    [allStudents]
  );

  return (
    <Card
      title="分组管理"
      extra={<Button onClick={() => setCreateOpen(true)}>新建分组</Button>}
    >
      <Table<Group>
        rowKey="_id"
        dataSource={groups}
        loading={loading}
        pagination={{ pageSize: 10 }}
        columns={[
          { title: "名称", dataIndex: "name" },
          { title: "描述", dataIndex: "description" },
          {
            title: "教师数",
            render: (_, r) =>
              Array.isArray(r.teachers) ? (r.teachers as any[]).length : 0,
          },
          {
            title: "管理者数",
            render: (_, r) =>
              Array.isArray(r.managers) ? (r.managers as any[]).length : 0,
          },
          {
            title: "学生数",
            render: (_, r) =>
              Array.isArray(r.students) ? (r.students as any[]).length : 0,
          },
          {
            title: "操作",
            render: (_, r) => (
              <Space>
                <Button onClick={() => openSelector("teachers", r)}>
                  设置教师
                </Button>
                <Button onClick={() => openSelector("managers", r)}>
                  设置管理者
                </Button>
                <Button onClick={() => openSelector("students", r)}>
                  设置学生
                </Button>
                <Button danger onClick={() => onDelete(r)}>
                  删除
                </Button>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title="新建分组"
        open={createOpen}
        onOk={onCreate}
        onCancel={() => setCreateOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: "请输入名称" }]}
          >
            <Input placeholder="请输入分组名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="可选描述" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          selectOpen === "teachers"
            ? "设置教师"
            : selectOpen === "managers"
            ? "设置管理者"
            : "设置学生"
        }
        open={!!selectOpen}
        onOk={onSaveSelection}
        onCancel={() => setSelectOpen(null)}
      >
        {selectOpen === "students" ? (
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            value={selectedIds}
            onChange={setSelectedIds}
            options={studentOptions}
            placeholder="选择学生"
          />
        ) : (
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            value={selectedIds}
            onChange={setSelectedIds}
            options={userOptions}
            placeholder={selectOpen === "teachers" ? "选择教师" : "选择管理者"}
          />
        )}
      </Modal>
    </Card>
  );
};

export default GroupManagementPage;
