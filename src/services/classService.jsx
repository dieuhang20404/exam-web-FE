
import readXlsxFile from "read-excel-file/web-worker";

import { createClass, updateClass, getClasses, removeStudentFromClass,
  getClassDetail, addStudentToClass, bulkAddStudents, getClassMembers } from "../api/classApi";
import {searchClasses} from "../api/api";
// tạo lớp mới
export const createClasses = async (useId, className) => {
  const res = await createClass({useId, className});
  return res.data;
};

// sửa tên lớp
export const newClassNames = async (classId, newClassName) => {
  const res = await updateClass(classId, { newClassName });
  return res.data;
};

// lấy danh sách các lớp
export const getMyClassesService = async (query = {}) => {
  const res = await getClasses(query);
  return res.data;
};

//tìm lớp
export const searchClassesService = async ( userId, role, page, limit, keyword )  => {
  const payload = { userId, role, page, limit, keyword };
  const res = await searchClasses(payload);
  return res.data;
};

//chi tiết lớp
export const fetchClassDetailService = async (classId) => {
    const res = await getClassDetail(classId);
    return res.data;
};
//thêm 1 sinh viên
export const addStudentToClassService = async ( classId, studentId ) => {
    const res = await addStudentToClass( 
      classId,
        {
          studentId
        }
      );
    return res.data;
};

//thêm nhiều sinh viên
export const addStudentsToClassService = async ( classId, students ) => {
    const res = await bulkAddStudents(
        classId,
        students
      );
    return res.data;
};

//lấy thành viên lớp
export const getClassMembersService = async ({ classId, ...query } = {}) => {
  const res = await getClassMembers(classId, query);
  return res.data;
};

//xóa sinh viên khỏi lớp
export const removeStudentService = async ( classId, studentId ) => {
    const res = await removeStudentFromClass( classId,  studentId );
    return res.data;
};

// export const fetchClassExamService =
//   async (
//     classId,
//     mockExam
//   ) => {

//     try {

//       const res =
//         await getClassExams(classId);

//       return (
//         res.data || []
//       );

//     } catch (err) {

//       console.log(
//         "API exam lỗi -> mock"
//       );

//       return (
//         mockExam[
//           Number(classId)
//         ] || []
//       );
//     }
// };
