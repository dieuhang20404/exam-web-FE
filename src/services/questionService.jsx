import { getMySubjects, getQuestionList, getQuestionBankSubject, getQuestionAnswer,
  createQuestion } from "../api/api";
import { mockQuestion } from "../mock/questionMock";
import { mockSubject } from "../mock/mockSubject";
import { message } from "antd";

export const fetchMySubjectsService = async () => {
  try {
    const res = await getMySubjects();
    const dbSubjects = res.data || [];
    const localSubjects =
      JSON.parse(
        localStorage.getItem(
          "my_subjects"
        )
      ) || [];

    return [
      ...dbSubjects,
      ...localSubjects
    ];

  } catch (err) {
    const localSubjects =
      JSON.parse(
        localStorage.getItem(
          "my_subjects"
        )
      ) || [];

    return localSubjects;
  }
};

export const fetchQuestionSubjectsService = async () => {
    try {
      const res = await getQuestionBankSubject();
      const data = res.data || [];
      if (data.length === 0) {
        return mockSubject;
      }
      return data;
    } catch (err) {
      return mockSubject;
    }
};

export const fetchQuestionsService = async (subjectId, isMine) => {
    try {
      const res = await getQuestionList( subjectId);
      return res.data || [];
    } catch (err) {
      const mockData = mockQuestion[Number(subjectId) ] || [];
      const localQuestions =
        JSON.parse(
          localStorage.getItem(
            "my_questions"
          )
        ) || [];

      const normalizedLocal =
        localQuestions
          .filter(
            (q) =>
              q.subject_id ===
              Number(subjectId)
          )
          .map((q) => ({

            question_id:
              q.question_id,

            content:
              q.content,

            difficulty:
              q.difficulty_level === 0
                ? "Easy"
                : q.difficulty_level === 1
                ? "Medium"
                : "Hard",

            author:
              "Bạn",

            type:
              q.type,

            answers:
              q.answers.map(
                (ans) => ({
                  text:
                    ans.content,

                  correct:
                    ans.is_correct
                })
              )
          }));

      if (isMine) {
        return normalizedLocal;
      }

      return [
        ...mockData,
        ...normalizedLocal
      ];
    }
  };

// ================= FILTER =================

export const filterDifficultyService =
  (
    questions,
    value
  ) => {

    if (value === "all") {
      return questions;
    }

    return questions.filter(
      (q) =>
        q.difficulty === value
    );
  };

// ================= SEARCH =================

export const searchQuestionService =
  (
    questions,
    keyword
  ) => {

    return questions.filter(
      (q) =>
        q.content
          .toLowerCase()
          .includes(
            keyword.toLowerCase()
          )
    );
  };

// ================= DELETE =================

export const deleteQuestionService =
  (
    questions,
    id
  ) => {

    const allQuestions =
      JSON.parse(
        localStorage.getItem(
          "my_questions"
        )
      ) || [];

    const updated =
      allQuestions.filter(
        (q) =>
          q.question_id !== id
      );

    localStorage.setItem(
      "my_questions",
      JSON.stringify(updated)
    );

    return questions.filter(
      (q) =>
        q.question_id !== id
    );
  };

// ================= UPDATE =================

export const updateQuestionService =
  async (
    editData
  ) => {

    const allQuestions =
      JSON.parse(
        localStorage.getItem(
          "my_questions"
        )
      ) || [];

    const updated =
      allQuestions.map((q) => {

        if (
          q.question_id !==
          editData.question_id
        ) {
          return q;
        }

        return {

          ...q,

          content:
            editData.content,

          type:
            editData.type,

          difficulty_level:
            Number(
              editData.difficulty_level
            ),

          answers:
            editData.answers.map(
              (ans) => ({
                id: ans.id,

                content:
                  ans.text,

                is_correct:
                  editData.correctAnswer.includes(
                    ans.id
                  )
              })
            )
        };
      });

    localStorage.setItem(
      "my_questions",
      JSON.stringify(updated)
    );

    return updated;
  };

export const fetchQuestionAnswerService = async (questionId) => {
    try {
      const res = await getQuestionAnswer(questionId);
      return res.data.correct_answers;
    } catch (err) {
      console.log("Lấy đáp án thất bại");
      return [];
    }
};

export const createQuestionService = async (formData, navigate) => {
    if (!formData.content.trim()) {
      message.warning(
        "Nhập nội dung câu hỏi"
      );
      return;
    }
    if (!formData.subject_id) {
      message.warning("Chọn môn học");
      return;
    }
    const payload = {
      subject_id:
        formData.subject_id,

      content:
        formData.content,

      type:
        formData.type,

      difficulty_level:
        Number(
          formData.difficulty_level
        ),

      answers:
        formData.answers.map(
          (ans) => ({
            content:ans.text,
            is_correct:formData.correctAnswer.includes(ans.id)
          })
        )
    };
    try {
      await createQuestion(payload);
      message.success("Tạo câu hỏi thành công");
      navigate("/teacher/questionForMe");
    } catch (err) {
      console.log("API lỗi -> lưu local");
      const old =JSON.parse(
          localStorage.getItem("my_questions")) || [];
      localStorage.setItem(
        "my_questions",

        JSON.stringify([
          ...old,
          {
            question_id:
              Date.now(),

            ...payload
          }
        ])
      );
      message.success("Đã lưu local");
      navigate("/teacher/questionForMe");
    }
  };