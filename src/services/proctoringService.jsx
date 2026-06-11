import { getProctorings } from "../api/proctoringApi";

//Lấy danh sách sự kiện giám sát
export const getProctoringsService = async (
  query = {}
) => {
  const res = await getProctorings(query);
  return res.data;
};

//Lấy sự kiện giám sát theo kỳ thi
export const getProctoringsBySessionService = async (
  sessionId,
  page = 1,
  limit = 20
) => {
  const res = await getProctorings({
    sessionId,
    page,
    limit
  });

  return res.data;
};

//Lấy sự kiện theo bài làm
export const getProctoringsByAttemptService = async (
  attemptId,
  page = 1,
  limit = 20
) => {
  const res = await getProctorings({
    attemptId,
    page,
    limit
  });

  return res.data;
};

//Lấy sự kiện theo sinh viên
export const getProctoringsByStudentService = async (
  studentId,
  page = 1,
  limit = 20
) => {
  const res = await getProctorings({
    studentId,
    page,
    limit
  });

  return res.data;
};

//Lấy sự kiện theo lớp
export const getProctoringsByClassService = async (
  classId,
  page = 1,
  limit = 20
) => {
  const res = await getProctorings({
    classId,
    page,
    limit
  });

  return res.data;
};

//Lọc theo loại vi phạm
export const getProctoringsByTypeService = async (
  eventType,
  page = 1,
  limit = 20
) => {
  const res = await getProctorings({
    eventType,
    page,
    limit
  });

  return res.data;
};