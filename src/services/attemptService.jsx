import { getAttempts } from "../api/attemptApi";

// Lấy danh sách bài làm
export const getAttemptsService = async (query = {}) => {
  const res = await getAttempts(query);
  return res.data;
};

//Lấy danh sách bài làm theo phiên thi
export const getAttemptsBySessionService = async (
  sessionId,
  page = 1,
  limit = 10
) => {
  const res = await getAttempts({
    sessionId,
    page,
    limit,
  });

  return res.data;
};

// Bài làm đã nộp
export const getSubmittedAttemptsBySessionService = async (
  sessionId,
  page = 1,
  limit = 10
) => {
  const res = await getAttempts({
    sessionId,
    status: "submitted",
    page,
    limit,
  });

  return res.data;
};

// Bài làm đã chấm
export const getGradedAttemptsBySessionService = async (
  sessionId,
  page = 1,
  limit = 10
) => {
  const res = await getAttempts({
    sessionId,
    status: "graded",
    page,
    limit,
  });

  return res.data;
};

//Lấy danh sách bài làm theo lớp
export const getAttemptsByClassService = async (
  classId,
  page = 1,
  limit = 10
) => {
  const res = await getAttempts({
    classId,
    page,
    limit,
  });

  return res.data;
};

//Lấy danh sách bài làm của một sinh viên
export const getStudentAttemptsService = async (
  studentId,
  page = 1,
  limit = 10
) => {
  const res = await getAttempts({
    studentId,
    page,
    limit,
  });

  return res.data;
};