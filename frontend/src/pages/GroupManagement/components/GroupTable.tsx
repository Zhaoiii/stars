import React from "react";
import { Table, Button, Space } from "antd";
import { Group } from "../../../types/group";
import { GroupTableProps } from "../types";

const GroupTable: React.FC<GroupTableProps> = ({
    groups,
    loading,
    onDelete,
    onSelectMembers,
}) => {
    const columns = [
        { title: "名称", dataIndex: "name" },
        { title: "描述", dataIndex: "description" },
        {
            title: "教师数",
            render: (_, r: Group) =>
                Array.isArray(r.teachers) ? (r.teachers as any[]).length : 0,
        },
        {
            title: "管理者数",
            render: (_, r: Group) =>
                Array.isArray(r.managers) ? (r.managers as any[]).length : 0,
        },
        {
            title: "学生数",
            render: (_, r: Group) =>
                Array.isArray(r.students) ? (r.students as any[]).length : 0,
        },
        {
            title: "操作",
            render: (_, r: Group) => (
                <Space>
                    <Button onClick={() => onSelectMembers("teachers", r)}>
                        设置教师
                    </Button>
                    <Button onClick={() => onSelectMembers("managers", r)}>
                        设置管理者
                    </Button>
                    <Button onClick={() => onSelectMembers("students", r)}>
                        设置学生
                    </Button>
                    <Button danger onClick={() => onDelete(r)}>
                        删除
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <Table<Group>
            rowKey="_id"
            dataSource={groups}
            loading={loading}
            pagination={{ pageSize: 10 }}
            columns={columns}
        />
    );
};

export default GroupTable;
