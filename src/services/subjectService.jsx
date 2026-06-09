import {getSubjects, getSubjectById, createSubject, updateSubject} from "../api/subjectApi";

// Lấy danh sách môn học
export const getSubjectsService = async (query = {}) => {
  const res = await getSubjects(query);
  return res.data;
};

// Lấy chi tiết môn học
export const getSubjectByIdService = async (id) => {
  const res = await getSubjectById(id);
  return res.data;
};

// Tạo môn học
export const createSubjectService = async (subjectName) => {
  const res = await createSubject({
    subjectName
  });
  return res.data;
};

// Cập nhật môn học
export const updateSubjectService = async (id, subjectName) => {
  const res = await updateSubject(id, {
    subjectName
  });
  return res.data;
};