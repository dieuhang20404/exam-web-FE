

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api", 
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
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// ================= API FUNCTIONS =================

// login
export const login = (data) => {
  return api.post("/auth/login", data);
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

// classDetail
export const getClassDetail = (classId) => {
  return api.get(`/classes/${classId}`);
};

export const addStudentToClass = (classId, data) => {
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
  return api.get(`/question/${subjectId}`);
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

export const getMySubjects = () => {
  return api.get("/my/subjects" );
};

export const createSubject = (data) => {
  return api.post("/subjects", data);
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
export const getSubjects = () => {
  return api.get("/subjects");
};

//CreateQuestion 
export const createQuestion = (data) => {
  return api.post("/question-bank", data);
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

