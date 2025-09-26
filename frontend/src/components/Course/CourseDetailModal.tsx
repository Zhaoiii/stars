import React from "react";
import { Modal, Button } from "antd";
import { Course } from "../../types/course";

interface Props {
  visible: boolean;
  course: Course | null;
  onClose: () => void;
  onEdit?: (course: Course) => void;
}

const CourseDetailModal: React.FC<Props> = ({
  visible,
  course,
  onClose,
  onEdit,
}) => {
  if (!course) return null;

  return (
    <Modal
      title="课程详情"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button
          key="edit"
          onClick={() => {
            onClose();
            onEdit?.(course);
          }}
        >
          编辑
        </Button>,
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
      ]}
      className="course-detail-modal"
    >
      <div className="course-detail-content">
        <div className="detail-item">
          <span className="detail-label">课程类型:</span>
          <span className="detail-value">
            {course.type === "evaluation" ? "评估" : "个训"}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">课程状态:</span>
          <span className="detail-value">
            {course.status === "scheduled" && "已安排"}
            {course.status === "in_progress" && "进行中"}
            {course.status === "completed" && "已完成"}
            {course.status === "cancelled" && "已取消"}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">开始时间:</span>
          <span className="detail-value">
            {new Date(course.startTime).toLocaleString()}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">结束时间:</span>
          <span className="detail-value">
            {new Date(course.endTime).toLocaleString()}
          </span>
        </div>
        {course.location && (
          <div className="detail-item">
            <span className="detail-label">上课地点:</span>
            <span className="detail-value">{course.location}</span>
          </div>
        )}
        {course.student && (
          <div className="detail-item">
            <span className="detail-label">学生:</span>
            <span className="detail-value">{course.student.name}</span>
          </div>
        )}
        {course.teacher && (
          <div className="detail-item">
            <span className="detail-label">教师:</span>
            <span className="detail-value">
              {course.teacher.name || course.teacher.username}
            </span>
          </div>
        )}
        {course.notes && (
          <div className="detail-item">
            <span className="detail-label">备注:</span>
            <span className="detail-value">{course.notes}</span>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CourseDetailModal;
