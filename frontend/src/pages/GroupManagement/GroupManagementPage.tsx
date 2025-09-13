import React from "react";
import { Button, Card } from "antd";
import { useGroupManagement } from "./hooks/useGroupManagement";
import { GroupTable, GroupCreateModal, MemberSelectorModal } from "./components";

const GroupManagementPage: React.FC = () => {
    const {
        state,
        form,
        userOptions,
        studentOptions,
        onCreate,
        onDelete,
        openSelector,
        onSaveSelection,
        updateState,
    } = useGroupManagement();

    const handleCreateClick = () => {
        updateState({ createOpen: true });
    };

    const handleCreateCancel = () => {
        updateState({ createOpen: false });
    };

    const handleSelectorCancel = () => {
        updateState({ selectOpen: null });
    };

    const handleSelectionChange = (selectedIds: string[]) => {
        updateState({ selectedIds });
    };

    return (
        <Card
            title="分组管理"
            extra={<Button onClick={handleCreateClick}>新建分组</Button>}
        >
            <GroupTable
                groups={state.groups}
                loading={state.loading}
                onDelete={onDelete}
                onSelectMembers={openSelector}
            />

            <GroupCreateModal
                open={state.createOpen}
                onCancel={handleCreateCancel}
                onOk={onCreate}
                form={form}
            />

            <MemberSelectorModal
                type={state.selectOpen || "teachers"}
                open={!!state.selectOpen}
                onCancel={handleSelectorCancel}
                onOk={onSaveSelection}
                selectedIds={state.selectedIds}
                onSelectionChange={handleSelectionChange}
                userOptions={userOptions}
                studentOptions={studentOptions}
            />
        </Card>
    );
};

export default GroupManagementPage;
