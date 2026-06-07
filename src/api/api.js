

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", 
  timeout: 5000,
});

// ================= REQUEST =================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================= RESPONSE =================
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    if (error.response?.status === 401) {
      // localStorage.removeItem("token");
      // window.location.href = "/login";
      console.log("Phát hiện lỗi 401 nhưng đã chặn không cho đá ra ngoài!");
    }

    return Promise.reject(error);
  }
);

// ================= API FUNCTIONS =================

// login
export const login = (data) => {
  return api.post("/auth/login", data);
};

export const register = (data) => {
  return api.post("/auth/register", data);
};

// dashboard
export const getDashboard = () => {
  return api.get("/dashboard");
};

// classManagement
export const getMyClasses = () => {
  return api.get("/classManagement");
};

export const createClass = (data) => {
  return api.post("/classes", data);
};

export const updateClass = (classId, data) => {
  return api.patch(`/classes/${classId}`, data)
};

export const getClasses = ( data ) => { //userId, role
  return api.get("/classes", data);
};

export const searchClasses = ( data ) => { // data chứa { page, limit, keyword }
  return api.get("/classes", {
    params: data // <-- Ép Axios gửi data dưới dạng query parameters (?page=1&limit=10...)
  });
};

// classDetail
export const getClassById = ( classId, data) => { // userId, role 
  return api.get(`/classes/${classId}`, data);
};

export const getClassDetail = (classId) => {
  return api.get(`/classes/${classId}`);
};

export const addStudentsToClass = (classId, data) => { //teacherId, studentIds
  return api.post(`/classes/${classId}/students`, data)
};

export const inviteStudentToClass = (classId, data) => {
  return api.post(`/classes/${classId}/invite`, data);
};

export const bulkAddStudents = (classId, data) => {
  return api.post(`/classes/${classId}/students/bulk`, data);
}; 

export const searchStudent = (classId, data) => {
  return api.get(`/classes/${classId}/students?keyword`, data);
}; 

export const getClassExams = (classId) => {
  return api.get(`/classes/${classId}/sessions`);
}

export const removeStudentFromClass = (classId,studentId) => {
  return api.delete(`/classes/${classId}/students/${studentId}`);
};


// questionBankSubject
export const getQuestionBankSubject = () => {
  return api.get("/subjects/question-bank");
};

// questionList
export const getQuestionList = (subjectId) => {
  return api.get(`/question-banks/${subjectId}`);
};

export const getQuestionAnswer = (questionId) => {
    return api.get(`/questions/${questionId}/answer`);
};
//GET /questions/import-preview

// questionForMe
export const getQuestionForMe = (userId) => {
  return api.get("/questionForMe");
};
export const deleteClass = (classId) => {
  return api.delete(`/classes/${classId}`);
};

export const createSubject = (data) => {
  return api.post("/subjects", data);
};

export const getSubjects = (data) => { // data chứa { teacherId }
  return api.get("/subjects", {ưparams: data});
};




// examBankSubject
export const getExamBankSubject = () => {
  return api.get("/question-bank/subjects");
};

// examForMe
export const getExamForMe = () => {
  return api.get("/my/exam");
};

//CreateSession

//CreateQuestion 
export const createQuestion = (data) => { //techerId, subjectId, qType, content, difficulty, answers [isCorrect, content, orderIndex]
  return api.post("/question-banks", data);
}

//EditQuestion
export const updateQuestion = (data) => {
  return api.post("/question-bank/edit", data);
}

//ExamDetail
export const getExamDetail = (examId) => {
  return api.get("`/subject/exam/${examId}`");
}

//ExamList
export const getExamList = (subjectId) => {
  return api.get(`/subject/${subjectId}/exam`);
};

//CreateExam
export const createExam = (data) => {
  return api.post("/exam/create", data)
}

export default api;

