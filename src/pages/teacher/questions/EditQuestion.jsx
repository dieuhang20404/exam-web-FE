import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { message } from "antd";

import QuestionFormLayout from "../../../components/QuestionFormLayout";

import {updateQuestionService} from "../../../services/questionService";

function EditQuestion() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const [subjects, setSubjects] =
    useState([]);

  const [formData, setFormData] =
    useState({
      createdBy: user.userId,
      subjectId: null,
      qType: "single",
      content: "",
      difficulty: 1,
      answers: [],
      correctAnswer: []
    });

  useEffect(() => {
    if (location.state?.question) {
      loadQuestion(
        location.state.question
      );
    }
  }, []);

  const loadQuestion = (
    question
  ) => {
    const correctAnswer =
      question.answers
        ?.map((ans, index) =>
          ans.isCorrect
            ? index
            : null
        )
        .filter(
          (item) =>
            item !== null
        ) || [];

    setFormData({
      createdBy:
        question.createdBy ??
        user.userId,

      subjectId:
        question.subjectId,

      qType:
        question.qType,

      content:
        question.content,

      difficulty:
        question.difficulty,

      answers:
        question.answers ||
        [],

      correctAnswer
    });
  };

  const handleUpdate =
    async () => {
      try {
        const payload = {
          ...formData,

          answers:
            formData.answers.map(
              (
                answer,
                index
              ) => ({
                content:
                  answer.content,

                orderIndex:
                  String.fromCharCode(
                    65 +
                      index
                  ),

                isCorrect:
                  formData.correctAnswer.includes(
                    index
                  )
              })
            )
        };

        await updateQuestionService(Number(id), payload);
        message.success(
          "Cập nhật câu hỏi thành công"
        );

        navigate(-1);
      } catch (err) {
        console.log(err);

        message.error(
          "Cập nhật thất bại"
        );
      }
    };

  return (
    <QuestionFormLayout
      title="Chỉnh sửa câu hỏi"
      formData={formData}
      setFormData={setFormData}
      subjects={subjects}
      onSave={handleUpdate}
    />
  );
}

export default EditQuestion;