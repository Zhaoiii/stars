import React, { useState, useMemo } from "react";
import { Card, Button, Select, Space, Tag, Typography } from "antd";
import {
  PlusOutlined,
  CalendarOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import WeekView from "./views/WeekView";
import MonthView from "./views/MonthView";
import DayView from "./views/DayView";
import { CalendarEvent, CourseType, CourseStatus } from "../../types/course";
import {
  courseTypeConfigs,
  courseStatusConfigs,
  getCourseTypeConfig as getTypeCfg,
  getCourseStatusConfig as getStatusCfg,
} from "../../constants/course";
import { useStudentSearch, useTeacherSearch } from "../../hooks/useUserSearch";
import "./CalendarBoard.css";

const { Title } = Typography;

interface CalendarBoardProps {
  events: CalendarEvent[];
  loading?: boolean;
  onEventClick?: (event: CalendarEvent) => void;
  onAddEvent?: () => void;
  onDateChange?: (date: Dayjs) => void;
  onViewChange?: (view: string) => void;
  showAddButton?: boolean;
  className?: string;
}

// 使用公共常量

const CalendarBoard: React.FC<CalendarBoardProps> = ({
  events,
  loading = false,
  onEventClick,
  onAddEvent,
  onDateChange,
  onViewChange,
  showAddButton = true,
  className = "",
}) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [filterType, setFilterType] = useState<CourseType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<CourseStatus | "all">("all");
  const [filterStudents, setFilterStudents] = useState<number[]>([]);
  const [filterTeachers, setFilterTeachers] = useState<number[]>([]);
  const {
    options: studentOptions,
    loading: studentLoading,
    onSearch: onSearchStudent,
  } = useStudentSearch();
  const {
    options: teacherOptions,
    loading: teacherLoading,
    onSearch: onSearchTeacher,
  } = useTeacherSearch();

  // 过滤事件
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (filterType !== "all" && event.type !== filterType) return false;
      if (filterStatus !== "all" && event.status !== filterStatus) return false;
      if (
        filterStudents.length > 0 &&
        !filterStudents.includes(event.studentId)
      )
        return false;
      if (
        filterTeachers.length > 0 &&
        !filterTeachers.includes(event.teacherId)
      )
        return false;
      return true;
    });
  }, [events, filterType, filterStatus, filterStudents, filterTeachers]);

  // 获取课程类型配置
  const getCourseTypeConfig = (type: CourseType) => getTypeCfg(type);

  // 获取课程状态配置
  const getCourseStatusConfig = (status: CourseStatus) => getStatusCfg(status);

  // 处理视图变化
  const handleViewChange = (newView: "month" | "week" | "day") => {
    setView(newView);
    onViewChange?.(newView);
  };

  // 处理今天按钮
  const handleToday = () => {
    const today = dayjs();
    setSelectedDate(today);
    onDateChange?.(today);
  };

  // 处理上一天/周/月
  const handlePrevious = () => {
    let newDate: Dayjs;
    switch (view) {
      case "day":
        newDate = selectedDate.subtract(1, "day");
        break;
      case "week":
        newDate = selectedDate.subtract(1, "week");
        break;
      case "month":
      default:
        newDate = selectedDate.subtract(1, "month");
        break;
    }
    setSelectedDate(newDate);
    onDateChange?.(newDate);
  };

  // 处理下一天/周/月
  const handleNext = () => {
    let newDate: Dayjs;
    switch (view) {
      case "day":
        newDate = selectedDate.add(1, "day");
        break;
      case "week":
        newDate = selectedDate.add(1, "week");
        break;
      case "month":
      default:
        newDate = selectedDate.add(1, "month");
        break;
    }
    setSelectedDate(newDate);
    onDateChange?.(newDate);
  };

  // 渲染月视图（外部组件）
  const renderMonthView = () => (
    <MonthView
      selectedDate={selectedDate}
      events={filteredEvents}
      getCourseTypeConfig={getCourseTypeConfig}
      getCourseStatusConfig={getCourseStatusConfig}
      onEventClick={onEventClick}
    />
  );

  // 渲染周视图（外部组件）
  const renderWeekView = () => (
    <WeekView
      selectedDate={selectedDate}
      events={filteredEvents}
      getCourseTypeConfig={getCourseTypeConfig}
      getCourseStatusConfig={getCourseStatusConfig}
      onEventClick={onEventClick}
    />
  );

  // 渲染日视图（外部组件）
  const renderDayView = () => (
    <DayView
      selectedDate={selectedDate}
      events={filteredEvents}
      getCourseTypeConfig={getCourseTypeConfig}
      getCourseStatusConfig={getCourseStatusConfig}
      onEventClick={onEventClick}
    />
  );

  // 渲染当前视图
  const renderCurrentView = () => {
    switch (view) {
      case "day":
        return renderDayView();
      case "week":
        return renderWeekView();
      case "month":
      default:
        return renderMonthView();
    }
  };

  return (
    <div className={`calendar-board ${className}`}>
      {/* 工具栏 */}
      <Card className="calendar-toolbar" size="small">
        <div className="toolbar-content">
          <div className="toolbar-left">
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={onAddEvent}
                disabled={!showAddButton}
              >
                新建课程
              </Button>
              <Button icon={<CalendarOutlined />} onClick={handleToday}>
                今天
              </Button>
            </Space>
          </div>

          <div className="toolbar-center">
            <Space>
              <Button icon={<LeftOutlined />} onClick={handlePrevious} />
              <Title
                level={4}
                style={{ margin: 0, minWidth: 200, textAlign: "center" }}
              >
                {view === "month" && selectedDate.format("YYYY年MM月")}
                {view === "week" &&
                  `${selectedDate
                    .startOf("week")
                    .format("MM月DD日")} - ${selectedDate
                    .endOf("week")
                    .format("MM月DD日")}`}
                {view === "day" && selectedDate.format("YYYY年MM月DD日")}
              </Title>
              <Button icon={<RightOutlined />} onClick={handleNext} />
              <Select
                value={view}
                onChange={handleViewChange}
                style={{ width: 100 }}
              >
                <Select.Option value="month">月视图</Select.Option>
                <Select.Option value="week">周视图</Select.Option>
                <Select.Option value="day">日视图</Select.Option>
              </Select>
            </Space>
          </div>

          <div className="toolbar-right">
            <Space>
              <Select
                value={filterType}
                onChange={setFilterType}
                style={{ width: 120 }}
                placeholder="课程类型"
              >
                <Select.Option value="all">全部类型</Select.Option>
                {courseTypeConfigs.map((config) => (
                  <Select.Option key={config.type} value={config.type}>
                    <span style={{ color: config.color }}>
                      {config.icon} {config.label}
                    </span>
                  </Select.Option>
                ))}
              </Select>

              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 120 }}
                placeholder="课程状态"
              >
                <Select.Option value="all">全部状态</Select.Option>
                {courseStatusConfigs.map((config) => (
                  <Select.Option key={config.status} value={config.status}>
                    <span style={{ color: config.color }}>
                      {config.icon} {config.label}
                    </span>
                  </Select.Option>
                ))}
              </Select>

              <Select
                mode="multiple"
                allowClear
                placeholder="筛选学生"
                style={{ width: 200 }}
                value={filterStudents}
                onChange={setFilterStudents}
                onSearch={onSearchStudent}
                filterOption={false}
                loading={studentLoading}
                options={studentOptions}
              />

              <Select
                mode="multiple"
                allowClear
                placeholder="筛选教师"
                style={{ width: 200 }}
                value={filterTeachers}
                onChange={setFilterTeachers}
                onSearch={onSearchTeacher}
                filterOption={false}
                loading={teacherLoading}
                options={teacherOptions}
              />
            </Space>
          </div>
        </div>
      </Card>

      {/* 日历内容 */}
      <Card className="calendar-content">
        {loading ? (
          <div className="calendar-loading">
            <div>加载中...</div>
          </div>
        ) : (
          renderCurrentView()
        )}
      </Card>

      {/* 图例 */}
      <Card className="calendar-legend" size="small">
        <div className="legend-content">
          <div className="legend-section">
            <span className="legend-title">课程类型:</span>
            <Space>
              {courseTypeConfigs.map((config) => (
                <Tag key={config.type} color={config.color}>
                  {config.icon} {config.label}
                </Tag>
              ))}
            </Space>
          </div>
          <div className="legend-section">
            <span className="legend-title">课程状态:</span>
            <Space>
              {courseStatusConfigs.map((config) => (
                <Tag key={config.status} color={config.color}>
                  {config.icon} {config.label}
                </Tag>
              ))}
            </Space>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CalendarBoard;
