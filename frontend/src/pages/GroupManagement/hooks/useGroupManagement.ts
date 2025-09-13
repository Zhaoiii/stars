import { useState, useEffect, useMemo } from "react";
import { Form } from "antd";
import { groupAPI } from "../../../services/groupAPI";
import { userAPI } from "../../../services/userAPI";
import { StudentService } from "../../StudentManagement/services/studentService";
import { Group } from "../../../types/group";
import { User } from "../../../types/user";
import { Student } from "../../../types/student";
import { GroupManagementState, MemberType } from "../types";

export const useGroupManagement = () => {
  const [form] = Form.useForm();
  
  const [state, setState] = useState<GroupManagementState>({
    loading: false,
    groups: [],
    createOpen: false,
    selectOpen: null,
    currentGroup: null,
    allUsers: [],
    allStudents: [],
    selectedIds: [],
  });

  const fetchGroups = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const { data } = await groupAPI.list();
      setState(prev => ({ 
        ...prev, 
        groups: (data.groups as unknown as Group[]) || [] 
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
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
    setState(prev => ({ ...prev, createOpen: false }));
    form.resetFields();
    fetchGroups();
  };

  const onDelete = async (record: Group) => {
    const { Modal } = await import("antd");
    Modal.confirm({
      title: `确认删除分组「${record.name}」？`,
      onOk: async () => {
        await groupAPI.remove(record._id);
        fetchGroups();
      },
    });
  };

  const openSelector = async (type: MemberType, group: Group) => {
    setState(prev => ({ 
      ...prev, 
      currentGroup: group, 
      selectOpen: type 
    }));
    
    if (type === "students") {
      const students = await StudentService.getAllStudents();
      const ids = Array.isArray(group.students)
        ? (group.students as any[]).map((x: any) =>
            typeof x === "string" ? x : x._id
          )
        : [];
      setState(prev => ({ 
        ...prev, 
        allStudents: students, 
        selectedIds: ids 
      }));
    } else {
      const users = await userAPI.list();
      const ids = Array.isArray(group[type])
        ? (group[type] as any[]).map((x: any) =>
            typeof x === "string" ? x : x._id
          )
        : [];
      setState(prev => ({ 
        ...prev, 
        allUsers: users, 
        selectedIds: ids 
      }));
    }
  };

  const onSaveSelection = async () => {
    if (!state.currentGroup || !state.selectOpen) return;
    
    if (state.selectOpen === "teachers") {
      await groupAPI.addTeachers(state.currentGroup._id, state.selectedIds);
    } else if (state.selectOpen === "managers") {
      await groupAPI.setManagers(state.currentGroup._id, state.selectedIds);
    } else if (state.selectOpen === "students") {
      // 简化处理：先清空再添加
      const existingIds = Array.isArray(state.currentGroup.students)
        ? (state.currentGroup.students as any[]).map((x: any) =>
            typeof x === "string" ? x : x._id
          )
        : [];
      const toRemove = existingIds.filter((id) => !state.selectedIds.includes(id));
      const toAdd = state.selectedIds.filter((id) => !existingIds.includes(id));
      if (toRemove.length)
        await groupAPI.removeStudents(state.currentGroup._id, toRemove);
      if (toAdd.length) 
        await groupAPI.addStudents(state.currentGroup._id, toAdd);
    }
    
    setState(prev => ({ 
      ...prev, 
      selectOpen: null, 
      currentGroup: null, 
      selectedIds: [] 
    }));
    fetchGroups();
  };

  const userOptions = useMemo(
    () =>
      state.allUsers.map((u) => ({
        label: `${u.username}(${u.phone})`,
        value: u._id,
      })),
    [state.allUsers]
  );

  const studentOptions = useMemo(
    () => state.allStudents.map((s) => ({ label: `${s.name}`, value: s._id })),
    [state.allStudents]
  );

  const updateState = (updates: Partial<GroupManagementState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  return {
    state,
    form,
    userOptions,
    studentOptions,
    onCreate,
    onDelete,
    openSelector,
    onSaveSelection,
    updateState,
  };
};
