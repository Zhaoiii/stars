import React, { useState, useEffect } from "react";
import { Tabs, Button, Space, message, Modal, Card } from "antd";
import {
  PlusOutlined,
  CalendarOutlined,
  TableOutlined,
} from "@ant-design/icons";
import { CalendarBoard } from "../../components/CalendarBoard";
import { CourseDetailModal } from "../../components/Course";
import CourseList from "./CourseList";
import CourseForm from "./CourseForm";
import {
  Course,
  CreateCourseRequest,
  UpdateCourseRequest,
  CalendarEvent,
} from "../../types/course";
import { courseService } from "../../services/courseService";
import "./CourseManagementPage.css";

const { TabPane } = Tabs;

const CourseManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("calendar");

  // 加载课程数据
  const loadCourses = async () => {
    try {
      setLoading(true);
      const resp = await courseService.getCourses({ page: 1, limit: 10 });
      setCourses(resp.data || []);
    } catch (error) {
      message.error("加载课程数据失败");
      console.error("加载课程数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 加载日历事件
  const loadCalendarEvents = async () => {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 2);

      const events = await courseService.getCalendarEvents({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      setCalendarEvents(events);
    } catch (error) {
      message.error("加载日历事件失败");
      console.error("加载日历事件失败:", error);
    }
  };

  // 初始化数据
  useEffect(() => {
    loadCourses();
    loadCalendarEvents();
  }, []);

  // 创建课程
  const handleCreateCourse = async (courseData: CreateCourseRequest) => {
    try {
      setLoading(true);

      // 检查是否需要创建重复课程
      if (courseData.repeatMode && courseData.repeatMode !== "none") {
        const newCourses = await courseService.createRecurringCourses(
          courseData
        );
        setCourses((prev) => [...newCourses, ...prev]);
        message.success(`成功创建 ${newCourses.length} 个重复课程`);
      } else {
        const newCourse = await courseService.createCourse(courseData);
        setCourses((prev) => [newCourse, ...prev]);
        message.success("课程创建成功");
      }

      await loadCalendarEvents();
      setIsFormVisible(false);
    } catch (error: any) {
      message.error(error.response?.data?.message || "创建课程失败");
      console.error("创建课程失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 更新课程
  const handleUpdateCourse = async (
    id: number,
    courseData: UpdateCourseRequest
  ) => {
    try {
      setLoading(true);
      const updatedCourse = await courseService.updateCourse(id, courseData);
      setCourses((prev) =>
        prev.map((course) => (course.id === id ? updatedCourse : course))
      );
      await loadCalendarEvents();
      message.success("课程更新成功");
      setIsFormVisible(false);
      setSelectedCourse(null);
    } catch (error: any) {
      message.error(error.response?.data?.message || "更新课程失败");
      console.error("更新课程失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 删除课程
  const handleDeleteCourse = async (id: number) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这个课程吗？此操作不可撤销。",
      onOk: async () => {
        try {
          setLoading(true);
          await courseService.deleteCourse(id);
          setCourses((prev) => prev.filter((course) => course.id !== id));
          await loadCalendarEvents();
          message.success("课程删除成功");
        } catch (error: any) {
          message.error(error.response?.data?.message || "删除课程失败");
          console.error("删除课程失败:", error);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 处理事件点击
  const handleEventClick = (event: CalendarEvent) => {
    const course = courses.find((c) => c.id === event.id);
    if (course) {
      setSelectedCourse(course);
      setIsDetailVisible(true);
    }
  };

  // 处理添加课程
  const handleAddCourse = () => {
    setSelectedCourse(null);
    setIsFormVisible(true);
  };

  // 处理编辑课程
  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsFormVisible(true);
  };

  // 处理表单关闭
  const handleFormClose = () => {
    setIsFormVisible(false);
    setSelectedCourse(null);
  };

  // 处理详情关闭
  const handleDetailClose = () => {
    setIsDetailVisible(false);
    setSelectedCourse(null);
  };

  return (
    <>
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="course-tabs"
        >
          <TabPane
            tab={
              <span>
                <CalendarOutlined />
                日历视图
              </span>
            }
            key="calendar"
          >
            <CalendarBoard
              events={calendarEvents}
              loading={loading}
              onEventClick={handleEventClick}
              onAddEvent={handleAddCourse}
              showAddButton={true}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <TableOutlined />
                列表视图
              </span>
            }
            key="list"
          >
            <CourseList
              onEdit={handleEditCourse}
              onDelete={handleDeleteCourse}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 课程表单弹窗 */}
      <CourseForm
        visible={isFormVisible}
        course={selectedCourse}
        onSave={
          selectedCourse
            ? (data) =>
                handleUpdateCourse(
                  selectedCourse.id,
                  data as UpdateCourseRequest
                )
            : (data) => handleCreateCourse(data as CreateCourseRequest)
        }
        onCancel={handleFormClose}
        loading={loading}
      />

      {/* 课程详情弹窗 */}
      {selectedCourse && (
        <CourseDetailModal
          visible={isDetailVisible}
          course={selectedCourse}
          onClose={handleDetailClose}
          onEdit={(c) => {
            setIsDetailVisible(false);
            handleEditCourse(c);
          }}
        />
      )}
    </>
  );
};

export default CourseManagementPage;
