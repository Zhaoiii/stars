import dayjs from "dayjs";

export const TIME_FORMAT = "HH:mm";
export const DATE_FORMAT = "YYYY-MM-DD";
export const DATE_TIME_FORMAT = "MM-DD HH:mm";

export function formatTime(value: string | number | Date): string {
  return dayjs(value).format(TIME_FORMAT);
}

export function formatDate(value: string | number | Date): string {
  return dayjs(value).format(DATE_FORMAT);
}

export function formatDateTime(value: string | number | Date): string {
  return dayjs(value).format(DATE_TIME_FORMAT);
}
