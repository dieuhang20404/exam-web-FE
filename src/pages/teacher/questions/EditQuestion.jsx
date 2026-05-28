import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { message } from "antd";
import QuestionFormLayout from "../../../components/QuestionFormLayout";
import { updateQuestion } from "../../../api/api"

function EditQuestion() {
  const location =
    useLocation();

  const navigate =
    useNavigate();

  const question =
    location.state?.question;

  const [formData,
    setFormData] =
    useState({
      question_id:
        question.question_id,

      subject_id:
        question.subject_id,

      content:
        question.content,

      type:
        question.type,

      difficulty_level:
        question.difficulty ===
        "Easy"
          ? "0"
          : question.difficulty ===
            "Medium"
          ? "1"
          : "2",

      answers:
        question.answers.map(
          (
            ans,
            index
          ) => ({
            id:
              index + 1,
            text:
              ans.text
          })
        ),

      correctAnswer:
        question.answers
          .map(
            (
              ans,
              index
            ) =>
              ans.correct
                ? index + 1
                : null
          )
          .filter(
            Boolean
          )
    });

  const handleSave =
    async () => {
        try {
        const payload = {
            question_id:
            formData.question_id,

            sub_id:
            formData.subject_id,

            q_type:
            formData.type,

            m_content:
            formData.content,

            difficulty_level:
            Number(
                formData.difficulty_level
            ),

            answers:
            formData.answers.map(
                (ans) => ({
                content:
                    ans.text,
                is_correct:
                    formData.correctAnswer.includes(
                    ans.id
                    )
                })
            )
        };

        await updateQuestion(
            payload
        );

        message.success(
            "Cập nhật thành công"
        );

        navigate(-1);

        } catch (err) {
        console.log(
            "API lỗi -> fallback local"
        );

        // fallback localStorage
        const allQuestions =
            JSON.parse(
            localStorage.getItem(
                "my_questions"
            )
            ) || [];

        const updated =
            allQuestions.map(
            (q) =>
                q.question_id ===
                formData.question_id
                ? {
                    ...q,
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
                        (
                            ans
                        ) => ({
                            id:
                            ans.id,
                            content:
                            ans.text,
                            is_correct:
                            formData.correctAnswer.includes(
                                ans.id
                            )
                        })
                        )
                    }
                : q
            );

        localStorage.setItem(
            "my_questions",
            JSON.stringify(
            updated
            )
        );

        message.success(
            "API lỗi → đã lưu local"
        );

        navigate(-1);
        }
    };

  return (
    <QuestionFormLayout
      title="Chỉnh sửa câu hỏi"
      formData={
        formData
      }
      setFormData={
        setFormData
      }
      onSave={
        handleSave
      }
      showUpload={
        false
      }
    />
  );
}

export default EditQuestion;