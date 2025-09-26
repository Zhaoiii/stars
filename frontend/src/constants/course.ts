import { CourseStatus, CourseType } from "../types/course";

export const courseTypeConfigs: Array<{
  type: CourseType;
  label: string;
  color: string;
  icon: string;
}> = [
  { type: CourseType.EVALUATION, label: "评估", color: "#1890ff", icon: "📊" },
  {
    type: CourseType.INDIVIDUAL_TRAINING,
    label: "个训",
    color: "#52c41a",
    icon: "🎯",
  },
];

export const courseStatusConfigs: Array<{
  status: CourseStatus;
  label: string;
  color: string;
  icon: string;
}> = [
  {
    status: CourseStatus.SCHEDULED,
    label: "已安排",
    color: "#1890ff",
    icon: "⏰",
  },
  {
    status: CourseStatus.IN_PROGRESS,
    label: "进行中",
    color: "#faad14",
    icon: "🔄",
  },
  {
    status: CourseStatus.COMPLETED,
    label: "已完成",
    color: "#52c41a",
    icon: "✅",
  },
  {
    status: CourseStatus.CANCELLED,
    label: "已取消",
    color: "#ff4d4f",
    icon: "❌",
  },
];

export const courseTypeConfigMap: Record<
  CourseType,
  (typeof courseTypeConfigs)[number]
> = courseTypeConfigs.reduce((acc, cur) => {
  acc[cur.type] = cur;
  return acc;
}, {} as any);

export const courseStatusConfigMap: Record<
  CourseStatus,
  (typeof courseStatusConfigs)[number]
> = courseStatusConfigs.reduce((acc, cur) => {
  acc[cur.status] = cur;
  return acc;
}, {} as any);

export const getCourseTypeConfig = (type: CourseType) =>
  courseTypeConfigMap[type] || courseTypeConfigs[0];

export const getCourseStatusConfig = (status: CourseStatus) =>
  courseStatusConfigMap[status] || courseStatusConfigs[0];
