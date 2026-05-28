// src/pages/student/ReviewPage.jsx

import "./Dashboard.css";

import {
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  XCircle,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import Sidebar from "../../components/student/Sidebar";
import UserProfile from "../../components/student/UserProfile";

export default function ReviewPage() {

  const navigate = useNavigate();

  const { id } = useParams();

  // ================= PROFILE =================

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  // ================= DATA =================

  const [exam, setExam] =
    useState(null);

  // ================= API =================

  useEffect(() => {

    // CALL API HERE

    const fakeReviewData = {

      id,

      title: "Kiểm Tra ReactJS",

      score: 8.5,

      totalQuestions: 2,

      correctAnswers: 1,

      questions: [

        {
          id: 1,

          question:
            "ReactJS là gì?",

          options: [
            "Framework",
            "Library",
            "Database",
            "IDE",
          ],

          correctAnswer:
            "Library",

          selectedAnswer:
            "Library",
        },

        {
          id: 2,

          question:
            "Hook dùng để quản lý state là?",

          options: [
            "useFetch",
            "useState",
            "useEffect",
            "useRouter",
          ],

          correctAnswer:
            "useState",

          selectedAnswer:
            "useEffect",
        },

      ],
    };

    setExam(fakeReviewData);

  }, [id]);

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

            {/* RESULT */}

            <div
              className="review-result"
            >

              <div>

                Điểm:
                {" "}

                <strong>
                  {exam.score}
                </strong>

              </div>

              <div>

                Đúng:
                {" "}

                <strong>

                  {
                    exam.correctAnswers
                  }

                  /
                  {
                    exam.totalQuestions
                  }

                </strong>

              </div>

            </div>

          </div>

          {/* BODY */}

          <div className="body">

            {/* TITLE */}

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

                      Câu {index + 1}:
                      {" "}
                      {question.question}

                    </h3>

                    <div className="answer-list">

                      {
                        question.options.map(
                          (option) => {

                            const isCorrect =
                              option ===
                              question.correctAnswer;

                            const isSelected =
                              option ===
                              question.selectedAnswer;

                            const isWrongSelected =
                              isSelected &&
                              !isCorrect;

                            return (

                              <div
                                key={option}
                                className={`
                                  review-answer
                                  ${
                                    isCorrect
                                      ? "correct-answer"
                                      : ""
                                  }
                                  ${
                                    isWrongSelected
                                      ? "wrong-answer"
                                      : ""
                                  }
                                `}
                              >

                                {/* ICON */}

                                <div
                                  className="review-icon"
                                >

                                  {
                                    isCorrect ? (

                                      <CheckCircle2
                                        size={20}
                                      />

                                    ) : isWrongSelected ? (

                                      <XCircle
                                        size={20}
                                      />

                                    ) : null
                                  }

                                </div>

                                {/* TEXT */}

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