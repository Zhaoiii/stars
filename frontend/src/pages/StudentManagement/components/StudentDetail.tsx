import React from "react";
import { Tag } from "antd";
import dayjs from "dayjs";
import { Student, Gender } from "../../../types/student";

interface StudentDetailProps {
  student: Student;
}

const StudentDetail: React.FC<StudentDetailProps> = ({ student }) => {
  const getGenderText = (gender: Gender): string => {
    return gender === Gender.MALE ? "男" : "女";
  };

  const getGenderColor = (gender: Gender): string => {
    return gender === Gender.MALE ? "blue" : "pink";
  };

  const calculateAge = (birthDate: string): number => {
    const birth = dayjs(birthDate);
    const now = dayjs();
    return now.diff(birth, "year");
  };

  return (
    <div>
      <p>
        <strong>姓名:</strong> {student.name}
      </p>
      <p>
        <strong>性别:</strong>
        <Tag color={getGenderColor(student.gender)} style={{ marginLeft: 8 }}>
          {getGenderText(student.gender)}
        </Tag>
      </p>
      <p>
        <strong>出生日期:</strong>{" "}
        {dayjs(student.birthDate).format("YYYY-MM-DD")}
      </p>
      <p>
        <strong>年龄:</strong> {calculateAge(student.birthDate)} 岁
      </p>
      <p>
        <strong>创建时间:</strong>{" "}
        {dayjs(student.createdAt).format("YYYY-MM-DD HH:mm")}
      </p>
      <p>
        <strong>最后更新:</strong>{" "}
        {dayjs(student.updatedAt).format("YYYY-MM-DD HH:mm")}
      </p>
    </div>
  );
};

export default StudentDetail;
