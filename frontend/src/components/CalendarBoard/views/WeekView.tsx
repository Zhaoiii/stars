import React from "react";
import dayjs, { Dayjs } from "dayjs";
import { Tooltip, Tag } from "antd";
import { CalendarEvent, CourseStatus, CourseType } from "../../../types/course";

interface Props {
  selectedDate: Dayjs;
  events: CalendarEvent[];
  getCourseTypeConfig: (type: CourseType) => {
    color: string;
    label: string;
    icon: string;
  };
  getCourseStatusConfig: (status: CourseStatus) => {
    color: string;
    label: string;
    icon: string;
  };
  onEventClick?: (event: CalendarEvent) => void;
}

const WeekView: React.FC<Props> = ({
  selectedDate,
  events,
  getCourseTypeConfig,
  getCourseStatusConfig,
  onEventClick,
}) => {
  const startOfWeek = selectedDate.startOf("week");
  const weekDays: Dayjs[] = Array.from({ length: 7 }, (_, i) =>
    startOfWeek.add(i, "day")
  );

  const getDayEvents = (date: Dayjs) =>
    events.filter((event) => dayjs(event.start).isSame(date, "day"));

  return (
    <div className="calendar-week-view">
      <div className="calendar-header">
        {weekDays.map((date) => (
          <div key={date.format("YYYY-MM-DD")} className="calendar-weekday">
            <div className="weekday-name">
              {["日", "一", "二", "三", "四", "五", "六"][date.day()]}
            </div>
            <div className="weekday-date">{date.date()}</div>
          </div>
        ))}
      </div>
      <div className="calendar-body">
        <div className="calendar-week">
          {weekDays.map((date) => {
            const dayEvents = getDayEvents(date);
            const isToday = date.isSame(dayjs(), "day");
            return (
              <div key={date.format("YYYY-MM-DD")} className="calendar-day">
                <div className={`calendar-date-cell ${isToday ? "today" : ""}`}>
                  <div className="date-number">{date.date()}</div>
                  {/* 周视图：不限制条数，提供滚动容器，提升空间利用率 */}
                  <div className="date-events week-scroll">
                    {dayEvents.map((event) => {
                      const typeConfig = getCourseTypeConfig(event.type);
                      const statusConfig = getCourseStatusConfig(event.status);
                      return (
                        <Tooltip
                          key={event.id}
                          title={
                            <div>
                              <div>学生: {event.studentName}</div>
                              <div>教师: {event.teacherName}</div>
                              <div>
                                时间: {dayjs(event.start).format("HH:mm")} -{" "}
                                {dayjs(event.end).format("HH:mm")}
                              </div>
                              {event.location && (
                                <div>地点: {event.location}</div>
                              )}
                            </div>
                          }
                        >
                          <div
                            className="calendar-event-item compact"
                            style={{
                              backgroundColor: typeConfig.color,
                              borderLeftColor: statusConfig.color,
                            }}
                            onClick={() => onEventClick?.(event)}
                          >
                            <span className="event-icon">
                              {typeConfig.icon}
                            </span>
                            <span className="event-title">
                              {event.studentName}
                            </span>
                            <span className="event-time-inline">
                              {dayjs(event.start).format("HH:mm")}
                            </span>
                          </div>
                        </Tooltip>
                      );
                    })}
                    {dayEvents.length === 0 && (
                      <div className="no-events">无课程</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeekView;
