import React from "react";
import { Modal, Select } from "antd";
import { MemberSelectorProps } from "../types";

const MemberSelectorModal: React.FC<MemberSelectorProps> = ({
    type,
    open,
    onCancel,
    onOk,
    selectedIds,
    onSelectionChange,
    userOptions,
    studentOptions,
}) => {
    const getTitle = () => {
        switch (type) {
            case "teachers":
                return "设置教师";
            case "managers":
                return "设置管理者";
            case "students":
                return "设置学生";
            default:
                return "设置成员";
        }
    };

    const getPlaceholder = () => {
        switch (type) {
            case "teachers":
                return "选择教师";
            case "managers":
                return "选择管理者";
            case "students":
                return "选择学生";
            default:
                return "选择成员";
        }
    };

    const isStudentType = type === "students";
    const options = isStudentType ? studentOptions : userOptions;

    return (
        <Modal
            title={getTitle()}
            open={open}
            onOk={onOk}
            onCancel={onCancel}
        >
            <Select
                mode="multiple"
                style={{ width: "100%" }}
                value={selectedIds}
                onChange={onSelectionChange}
                options={options}
                placeholder={getPlaceholder()}
            />
        </Modal>
    );
};

export default MemberSelectorModal;
