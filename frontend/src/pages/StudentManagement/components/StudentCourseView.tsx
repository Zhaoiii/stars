import React, { useState, useEffect } from "react";
import { Modal, Spin, message, Empty } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import { CalendarBoard } from "../../../components/CalendarBoard";
import { CalendarEvent } from "../../../types/course";
import { courseService } from "../../../services/courseService";
import { Student } from "../../../types/student";

interface StudentCourseViewProps {
  visible: boolean;
  student: Student | null;
  onCancel: () => void;
}

const StudentCourseView: React.FC<StudentCourseViewProps> = ({
  visible,
  student,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // 加载学生课程数据
  const loadStudentCourses = async () => {
    if (!student) return;

    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 2);

      const calendarEvents = await courseService.getCalendarEvents({
        studentId: student.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      setEvents(calendarEvents);
    } catch (error) {
      message.error("加载学生课程失败");
      console.error("加载学生课程失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && student) {
      loadStudentCourses();
    }
  }, [visible, student]);

  const handleEventClick = (event: CalendarEvent) => {
    // 可以在这里添加课程详情查看逻辑
    message.info(`点击了课程: ${event.title}`);
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CalendarOutlined />
          <span>{student?.name} 的课程安排</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1200}
      style={{ top: 20 }}
      destroyOnClose
    >
      <div style={{ height: "70vh", overflow: "hidden" }}>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Spin size="large" />
          </div>
        ) : events.length > 0 ? (
          <CalendarBoard
            events={events}
            onEventClick={handleEventClick}
            showAddButton={false}
          />
        ) : (
          <Empty
            description="该学生暂无课程安排"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          />
        )}
      </div>
    </Modal>
  );
};

export default StudentCourseView;
