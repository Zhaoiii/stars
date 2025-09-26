import React from "react";
import dayjs, { Dayjs } from "dayjs";
import { Tag } from "antd";
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

const DayView: React.FC<Props> = ({
  selectedDate,
  events,
  getCourseTypeConfig,
  getCourseStatusConfig,
  onEventClick,
}) => {
  const dayEvents = events.filter((e) =>
    dayjs(e.start).isSame(selectedDate, "day")
  );

  return (
    <div className="calendar-day-view">
      <div className="day-header">
        <div className="day-title">
          {selectedDate.format("YYYY年MM月DD日 dddd")}
        </div>
      </div>
      <div className="day-events">
        {dayEvents.length > 0 ? (
          dayEvents.map((event) => {
            const typeConfig = getCourseTypeConfig(event.type);
            const statusConfig = getCourseStatusConfig(event.status);
            return (
              <div
                key={event.id}
                className="day-event-item"
                style={{ borderLeftColor: typeConfig.color }}
                onClick={() => onEventClick?.(event)}
              >
                <div className="event-time">
                  {dayjs(event.start).format("HH:mm")} -{" "}
                  {dayjs(event.end).format("HH:mm")}
                </div>
                <div className="event-content">
                  <div className="event-title">{event.studentName}</div>
                  <div className="event-details">
                    <span>教师: {event.teacherName}</span>
                    {event.location && <span>地点: {event.location}</span>}
                  </div>
                </div>
                <div className="event-type">
                  <Tag color={typeConfig.color}>{typeConfig.label}</Tag>
                  <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-events">今天没有课程安排</div>
        )}
      </div>
    </div>
  );
};

export default DayView;
