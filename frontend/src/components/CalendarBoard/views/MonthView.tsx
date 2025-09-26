import React from "react";
import dayjs, { Dayjs } from "dayjs";
import { Tooltip } from "antd";
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

const MonthView: React.FC<Props> = ({
  selectedDate,
  events,
  getCourseTypeConfig,
  getCourseStatusConfig,
  onEventClick,
}) => {
  const startOfMonth = selectedDate.startOf("month");
  const endOfMonth = selectedDate.endOf("month");
  const startOfWeek = startOfMonth.startOf("week");
  const endOfWeek = endOfMonth.endOf("week");

  const days: Dayjs[] = [];
  let current = startOfWeek;
  while (
    current.isBefore(endOfWeek, "day") ||
    current.isSame(endOfWeek, "day")
  ) {
    days.push(current);
    current = current.add(1, "day");
  }

  const getDayEvents = (date: Dayjs) =>
    events.filter((e) => dayjs(e.start).isSame(date, "day"));

  return (
    <div className="calendar-month-view">
      <div className="calendar-header">
        {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
          <div key={d} className="calendar-weekday">
            {d}
          </div>
        ))}
      </div>
      <div className="calendar-body">
        {Array.from({ length: Math.ceil(days.length / 7) }, (_, wi) => (
          <div key={wi} className="calendar-week">
            {days.slice(wi * 7, wi * 7 + 7).map((date) => {
              const isToday = date.isSame(dayjs(), "day");
              const isCurrentMonth = date.isSame(selectedDate, "month");
              const dayEvents = getDayEvents(date);
              return (
                <div key={date.format("YYYY-MM-DD")} className="calendar-day">
                  <div
                    className={`calendar-date-cell ${isToday ? "today" : ""} ${
                      !isCurrentMonth ? "other-month" : ""
                    }`}
                  >
                    <div className="date-number">{date.date()}</div>
                    <div className="date-events">
                      {dayEvents.slice(0, 4).map((event) => {
                        const typeConfig = getCourseTypeConfig(event.type);
                        const statusConfig = getCourseStatusConfig(
                          event.status
                        );
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
                              className="calendar-event-item"
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
                            </div>
                          </Tooltip>
                        );
                      })}
                      {dayEvents.length > 4 && (
                        <div className="calendar-event-more">
                          +{dayEvents.length - 4} 更多
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthView;
