import { getQuestions, getQuestionById, createQuestion, createManyQuestions, updateQuestion, deleteQuestion} from "../api/questionApi";
import { mockQuestion } from "../mock/questionMock";
import { mockSubject } from "../mock/mockSubject";
import { message } from "antd";

//lấy danh sách câu hỏi
export const getQuestionsService = async (query = {}) => {
    const res =await getQuestions(query);
    return res.data;
};

//lấy danh sách câu hỏi trong môn học
export const getQuestionsBySubjectService =async (subjectId, userId) => {
    const res = await getQuestions({subjectId, createdBy: userId});
    return res.data.data;
  };

//lấy chi tiết câu hỏi
export const getQuestionByIdService = async (questionId) => {
    const res = await getQuestionById(questionId);
    return res.data;
  };

//tạo câu hỏi mới
export const createQuestionService = async (formData, navigate) => {
  if (!formData.content.trim()) {
    message.warning("Nhập nội dung câu hỏi");
    return;
  }
  if (!formData.subjectId) {
    message.warning("Chọn môn học");
    return;
  }
  const user = JSON.parse(localStorage.getItem("user"));
  const payload = {
    subjectId: formData.subjectId,
    qType: formData.qType === "SINGLE_CHOICE" ? "single" : formData.qType.toLowerCase(),
    content: formData.content,
    difficulty: formData.difficulty ? Number(formData.difficulty) : 0, 
    answers: formData.answers.map((answer, index) => ({
      content: answer.content,
      orderIndex: String.fromCharCode(65 + index),
      isCorrect: formData.correctAnswer.includes(index)
    }))
  };
  try {
    await createQuestion(payload);
    message.success("Tạo câu hỏi thành công");
    navigate("/teacher/questionForMe");
  } catch (err) {
    console.log(err);
    message.error("Tạo câu hỏi thất bại");
  }
};

//tạo nhiều câu hỏi
export const createManyQuestionsService = async (questions) => {
  const res = await createManyQuestions(questions);
  return res.data;
};

//chỉnh sửa câu hỏi
export const updateQuestionService = async (questionId, formData) => {
  const payload = {
    createdBy: formData.createdBy,
    subjectId: formData.subjectId,
    qType: formData.qType,
    content: formData.content,
    difficulty: formData.difficulty,
    answers: formData.answers
  };
  const res = await updateQuestion(questionId, payload);
  return res.data;
};

//xóa câu hỏi
export const deleteQuestionService = async (questionId) => {
  await deleteQuestion(questionId);
  return true;
};

