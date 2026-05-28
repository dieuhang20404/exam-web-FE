// services/classService.js

import readXlsxFile from "read-excel-file/web-worker";

import { addStudentToClass, bulkAddStudents, inviteStudentToClass, getClassDetail, getClassExams,
  removeStudentFromClass } from "../api/api";

export const fetchClassDetailService =
  async (
    classId,
    mockData
  ) => {

    try {

      const res =
        await getClassDetail(classId);

      return res.data;

    } catch (err) {

      console.log(
        "API class lỗi -> mock"
      );

      return (
        mockData[
          Number(classId)
        ] || null
      );
    }
};

export const fetchClassExamService =
  async (
    classId,
    mockExam
  ) => {

    try {

      const res =
        await getClassExams(classId);

      return (
        res.data || []
      );

    } catch (err) {

      console.log(
        "API exam lỗi -> mock"
      );

      return (
        mockExam[
          Number(classId)
        ] || []
      );
    }
};

//Sinh viên đã có tài khoản
export const handleAddStudent = async ({
  classId,
  email
}) => {

  if (!email.trim()) {
    throw new Error(
      "Vui lòng nhập email sinh viên"
    );
  }

  const payload = {
    email
  };

  const res =
    await addStudentToClass(
      classId,
      payload
    );

  return res.data;
};

//thêm nhiều sinh viên
export const handleBulkImport = async ({
  classId,
  file
}) => {

  if (!file) {
    throw new Error(
      "Vui lòng chọn file Excel"
    );
  }

  const rows =
    await readXlsxFile(file);

  const students =
    rows
      .slice(1)
      .map((row) => ({
        full_name: row[0],
        email: row[1]
      }))
      .filter(
        (student) =>
          student.email
      );

  if (
    students.length === 0
  ) {
    throw new Error(
      "File không có dữ liệu sinh viên"
    );
  }

  const payload = {
    students
  };

  const res =
    await bulkAddStudents(
      classId,
      payload
    );

  return res.data;
};

//gửi lời mời sinh viên chưa có tài khoản
export const handleInviteStudent = async ({
  classId,
  email
}) => {

  if (!email.trim()) {
    throw new Error(
      "Vui lòng nhập email"
    );
  }

  const payload = {
    email
  };

  const res =
    await inviteStudentToClass(
      classId,
      payload
    );

  return res.data;
};

export const removeStudentService =
  async (classId, studentId) => {

    return await removeStudentFromClass(
      classId,
      studentId
    );
  };