// src/pages/student/DoingExamPage.jsx

import "./Dashboard.css";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Menu,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import Sidebar from "../../components/student/Sidebar";
import UserProfile from "../../components/student/UserProfile";

export default function DoingExamPage() {

  const navigate = useNavigate();

  const { id } = useParams();

  // ================= USER =================

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  // ================= TIMER =================

  const [timeLeft, setTimeLeft] =
    useState(0);

  // ================= SUMMARY =================

  const [showSummary, setShowSummary] =
    useState(false);

  // ================= EXAM DATA =================

  const [exam, setExam] =
    useState(null);

  // ================= ANSWERS =================

  const [answers, setAnswers] =
    useState({});

  // ================= API =================

  useEffect(() => {

    // CALL API HERE

    const fakeExam = {

      id,

      title: "TÊN BÀI KIỂM TRA",

      duration: 12,

      questions: [

        {
          id: 1,
          question: "CÂU HỎI 1:",
          options: [
            "Đáp án A",
            "Đáp án B",
            "Đáp án C",
            "Đáp án D",
          ],
        },

        {
          id: 2,
          question: "ReactJS là gì?",
          options: [
            "Framework",
            "Library",
            "Database",
            "IDE",
          ],
        },

      ],
    };

    setExam(fakeExam);

    setTimeLeft(
      fakeExam.duration * 60
    );

  }, [id]);

  // ================= TIMER =================

  useEffect(() => {

    if (timeLeft <= 0) return;

    const timer = setInterval(() => {

      setTimeLeft((prev) => prev - 1);

    }, 1000);

    return () =>
      clearInterval(timer);

  }, [timeLeft]);

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
    option
  ) => {

    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));

  };

  // ================= SUBMIT =================

  const handleSubmit = () => {

    alert("Nộp bài thành công!");

    // CALL API SUBMIT HERE

    navigate("/student/history");

  };

  // ================= LOADING =================

  if (!exam) return null;

  return (

    <div className="student-dashboard">

      <div className="app-container">

        {/* SIDEBAR */}

        <Sidebar />

        {/* MAIN */}

        <div className="main-content">

          {/* HEADER */}

          <div className="header">

            {/* USER */}

            <UserProfile
              navigate={navigate}
              showProfileMenu={
                showProfileMenu
              }
              setShowProfileMenu={
                setShowProfileMenu
              }
            />

            {/* SUBMIT */}

            <button
              className="submit-btn"
              onClick={handleSubmit}
            >
              NỘP BÀI
            </button>

            {/* TIMER + SUMMARY */}

            <div
              className="exam-right"
            >

              <div className="exam-timer">

                <span>
                  Thời gian còn lại:
                </span>

                <strong>
                  {formattedTime}
                </strong>

              </div>

              {/* MENU */}

              <div
                className="summary-btn"
                onMouseEnter={() =>
                  setShowSummary(true)
                }
                onMouseLeave={() =>
                  setShowSummary(false)
                }
              >

                <Menu size={24} />

                {
                  showSummary && (

                    <div className="summary-popup">

                      <h4>
                        Tóm tắt bài làm
                      </h4>

                      {
                        exam.questions.map(
                          (
                            q,
                            index
                          ) => (

                            <div
                              key={q.id}
                              className="summary-item"
                            >

                              {index + 1}.
                              {" "}

                              {
                                answers[q.id]
                                  ? answers[
                                      q.id
                                    ][6]
                                  : "_"
                              }

                            </div>

                          )
                        )
                      }

                      <div className="summary-total">

                        Đã làm:
                        {" "}

                        {
                          Object.keys(
                            answers
                          ).length
                        }

                        /
                        {
                          exam.questions
                            .length
                        }

                      </div>

                    </div>

                  )
                }

              </div>

            </div>

          </div>

          {/* BODY */}

          <div className="body">

            <h2
              style={{
                textAlign: "center",
                marginBottom: "40px",
              }}
            >

              {exam.title}

            </h2>

            {/* QUESTIONS */}

            {
              exam.questions.map(
                (
                  question,
                  index
                ) => (

                  <div
                    key={question.id}
                    className="question-block"
                  >

                    <h3>

                      CÂU HỎI {index + 1}:

                    </h3>

                    <div className="answer-list">

                      {
                        question.options.map(
                          (option) => {

                            const isSelected =
                              answers[
                                question.id
                              ] === option;

                            return (

                              <div
                                key={option}
                                className={`answer-item ${
                                  isSelected
                                    ? "selected-answer"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleChooseAnswer(
                                    question.id,
                                    option
                                  )
                                }
                              >

                                <div className="radio-circle">

                                  {
                                    isSelected && (
                                      <div className="radio-dot"></div>
                                    )
                                  }

                                </div>

                                <span>
                                  {option}
                                </span>

                              </div>

                            );

                          }
                        )
                      }

                    </div>

                  </div>

                )
              )
            }

          </div>

        </div>

      </div>

    </div>

  );

}