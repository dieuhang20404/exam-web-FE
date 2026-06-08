// src/pages/student/DoingExamPage.jsx

import "./Dashboard.css";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Menu } from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import Sidebar from "../../components/student/Sidebar";
import UserProfile from "../../components/student/UserProfile";

import {
  getSessionById,
  getTemplateQuestions,
  createAttempt,
  submitAttempt,
} from "../../api/api";

export default function DoingExamPage() {
  const navigate = useNavigate();

  const { id } = useParams();

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  const [timeLeft, setTimeLeft] =
    useState(0);

  const [showSummary, setShowSummary] =
    useState(false);

  const [exam, setExam] =
    useState(null);

  const [answers, setAnswers] =
    useState({});

  const [attemptId, setAttemptId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  // ================= LOAD EXAM =================

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);

        // Lấy session
        const sessionRes =
          await getSessionById(id);

        const session =
          sessionRes.data;

        // Lấy câu hỏi từ template
        const questionRes =
          await getTemplateQuestions(
            session.template_id
          );

        const questions =
          questionRes.data.data || [];

        setExam({
          ...session,
          title:
            session.session_name,
          questions,
        });

        setTimeLeft(
          Number(session.duration) * 60
        );

        // Tạo attempt
        const attemptRes =
          await createAttempt({
            sessionId:
              session.session_id,

            sessionPassword: "",

            ipAddress: "",

            deviceInfo:
              navigator.userAgent,
          });

        setAttemptId(
          attemptRes.data.attempt_id
        );
      } catch (error) {
        console.error(error);

        alert(
          error?.response?.data
            ?.message ||
            "Không tải được đề thi"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id]);

  // ================= TIMER =================

  useEffect(() => {
    if (timeLeft <= 0) {
      if (attemptId) {
        handleSubmit();
      }

      return;
    }

    const timer =
      setInterval(() => {
        setTimeLeft(
          (prev) => prev - 1
        );
      }, 1000);

    return () =>
      clearInterval(timer);
  }, [timeLeft, attemptId]);

  // ================= FORMAT TIME =================

  const formattedTime =
    useMemo(() => {
      const minute =
        Math.floor(timeLeft / 60);

      const second =
        timeLeft % 60;

      return `${minute
        .toString()
        .padStart(2, "0")}:${second
        .toString()
        .padStart(2, "0")}`;
    }, [timeLeft]);

  // ================= CHOOSE ANSWER =================

  const handleChooseAnswer = (
    questionId,
    answerId
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  // ================= SUBMIT =================

  const handleSubmit =
    async () => {
      try {
        if (!attemptId) return;

        const newAnswerIds =
          Object.values(
            answers
          );

        await submitAttempt(
          attemptId,
          {
            newAnswerIds,
            deleteAnswerIds: [],
            status:
              "SUBMITTED",
          }
        );

        alert(
          "Nộp bài thành công!"
        );

        navigate(
          "/student/history"
        );
      } catch (error) {
        console.error(error);

        alert(
          error?.response?.data
            ?.message ||
            "Nộp bài thất bại!"
        );
      }
    };

  // ================= LOADING =================

  if (loading) {
    return (
      <div
        style={{
          padding: "30px",
        }}
      >
        Đang tải đề thi...
      </div>
    );
  }

  if (!exam) return null;

  return (
    <div className="student-dashboard">
      <div className="app-container">
        <Sidebar />

        <div className="main-content">
          <div className="header">
            <UserProfile
              navigate={navigate}
              showProfileMenu={
                showProfileMenu
              }
              setShowProfileMenu={
                setShowProfileMenu
              }
            />

            <button
              className="submit-btn"
              onClick={
                handleSubmit
              }
            >
              NỘP BÀI
            </button>

            <div className="exam-right">
              <div className="exam-timer">
                <span>
                  Thời gian còn
                  lại:
                </span>

                <strong>
                  {formattedTime}
                </strong>
              </div>

              <div
                className="summary-btn"
                onMouseEnter={() =>
                  setShowSummary(
                    true
                  )
                }
                onMouseLeave={() =>
                  setShowSummary(
                    false
                  )
                }
              >
                <Menu size={24} />

                {showSummary && (
                  <div className="summary-popup">
                    <h4>
                      Tóm tắt bài
                      làm
                    </h4>

                    {exam.questions.map(
                      (
                        q,
                        index
                      ) => (
                        <div
                          key={
                            q.question_id
                          }
                          className="summary-item"
                        >
                          {index +
                            1}
                          .{" "}
                          {answers[
                            q.question_id
                          ]
                            ? "✓"
                            : "_"}
                        </div>
                      )
                    )}

                    <div className="summary-total">
                      Đã làm{" "}
                      {
                        Object.keys(
                          answers
                        ).length
                      }
                      /
                      {
                        exam
                          .questions
                          .length
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="body">
            <h2
              style={{
                textAlign:
                  "center",
                marginBottom:
                  "40px",
              }}
            >
              {exam.title}
            </h2>

            {exam.questions.map(
              (
                question,
                index
              ) => (
                <div
                  key={
                    question.question_id
                  }
                  className="question-block"
                >
                  <h3>
                    CÂU HỎI{" "}
                    {index + 1}
                  </h3>

                  <p
                    style={{
                      marginBottom:
                        "15px",
                    }}
                  >
                    {
                      question
                        .question_banks
                        ?.m_content
                    }
                  </p>

                  <div className="answer-list">
                    {question.question_banks?.answer_banks?.map(
                      (
                        answer
                      ) => {
                        const isSelected =
                          answers[
                            question.question_id
                          ] ===
                          answer.answer_id;

                        return (
                          <div
                            key={
                              answer.answer_id
                            }
                            className={`answer-item ${
                              isSelected
                                ? "selected-answer"
                                : ""
                            }`}
                            onClick={() =>
                              handleChooseAnswer(
                                question.question_id,
                                answer.answer_id
                              )
                            }
                          >
                            <div className="radio-circle">
                              {isSelected && (
                                <div className="radio-dot"></div>
                              )}
                            </div>

                            <span>
                              {
                                answer.m_content
                              }
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}