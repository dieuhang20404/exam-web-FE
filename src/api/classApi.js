
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", 
  timeout: 5000,
});

// Tạo lớp
export const createClass = (data) =>
  api.post("/classes", data);

// Lấy danh sách lớp
export const getClasses = (params) =>
  api.get("/classes", { params });

// Lấy chi tiết lớp
export const getClassDetail = (classId) =>
  api.get(`/classes/${classId}`);

// Đổi tên lớp
export const updateClass = (classId, data) =>
  api.patch( `/classes/${classId}`, data );

// Thêm 1 học sinh
export const addStudentToClass = (classId, data) =>
  api.post( `/classes/${classId}`, data);

// Thêm nhiều học sinh
export const bulkAddStudents = (classId, data) =>
  api.post(`/classes/${classId}/bulk`, data);

// Lấy danh sách thành viên
export const getClassMembers = (classId, params) =>
  api.get( `/classes/${classId}/members`,
    {
      params
    }
  );

//xóa sinh viên khỏi lớp
export const removeStudentFromClass = (classId, studentId) =>
  api.delete(`/classes/${classId}/members/${studentId}`);