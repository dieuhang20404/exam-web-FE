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

import {
  getAttemptById,
  getSessionById,
  getTemplateQuestions,
} from "../../api/api";

export default function ReviewPage() {

  const navigate = useNavigate();

  const { id } = useParams();

  const [
    showProfileMenu,
    setShowProfileMenu,
  ] = useState(false);

  const [exam, setExam] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const fetchReview =
      async () => {

        try {

          setLoading(true);

          // ==========================
          // 1. ATTEMPT
          // ==========================

          const attemptRes =
            await getAttemptById(id);

          const {
            attempt,
            selectedAnswers,
          } = attemptRes.data;

          // ==========================
          // 2. SESSION
          // ==========================

          const sessionRes =
            await getSessionById(
              attempt.session_id
            );

          const session =
            sessionRes.data;

          // ==========================
          // 3. QUESTIONS
          // ==========================

          const questionRes =
            await getTemplateQuestions(
              session.template_id
            );

          const templateQuestions =
            questionRes.data.data ||
            questionRes.data ||
            [];

          // ==========================
          // 4. MAP ANSWER
          // ==========================

          const selectedMap = {};

          selectedAnswers.forEach(
            (item) => {

              selectedMap[
                item.question_id
              ] =
                item.answer_id;

            }
          );

          // ==========================
          // 5. BUILD REVIEW DATA
          // ==========================

          const reviewQuestions =
            templateQuestions.map(
              (item) => {

                const question =
                  item.question_banks;

                const answers =
                  question.answer_banks ||
                  [];

                const correctAnswer =
                  answers.find(
                    (
                      answer
                    ) =>
                      answer.is_correct
                  );

                const selectedAnswer =
                  answers.find(
                    (
                      answer
                    ) =>
                      answer.answer_id ===
                      selectedMap[
                        item.question_id
                      ]
                  );

                return {

                  id:
                    item.question_id,

                  question:
                    question.m_content,

                  options:
                    answers,

                  correctAnswerId:
                    correctAnswer?.answer_id,

                  selectedAnswerId:
                    selectedAnswer?.answer_id,

                };

              }
            );

          const correctCount =
            reviewQuestions.filter(
              (question) =>
                question.correctAnswerId ===
                question.selectedAnswerId
            ).length;

          setExam({

            title:
              session.session_name,

            score:
              attempt.total_score ??
              "--",

            totalQuestions:
              reviewQuestions.length,

            correctAnswers:
              correctCount,

            questions:
              reviewQuestions,

          });

        } catch (error) {

          console.error(error);

          alert(
            error?.response?.data
              ?.message ||
              "Không tải được bài làm"
          );

        } finally {

          setLoading(false);

        }

      };

    fetchReview();

  }, [id]);

  if (loading) {

    return (
      <div style={{ padding: 30 }}>
        Đang tải dữ liệu...
      </div>
    );

  }

  if (!exam) {

    return (
      <div style={{ padding: 30 }}>
        Không có dữ liệu
      </div>
    );

  }

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
                  key={question.id}
                  className="question-block"
                >

                  <h3>

                    Câu {index + 1}

                  </h3>

                  <p>

                    {
                      question.question
                    }

                  </p>

                  <div className="answer-list">

                    {question.options.map(
                      (
                        option
                      ) => {

                        const isCorrect =
                          option.answer_id ===
                          question.correctAnswerId;

                        const isSelected =
                          option.answer_id ===
                          question.selectedAnswerId;

                        const isWrongSelected =
                          isSelected &&
                          !isCorrect;

                        return (

                          <div
                            key={
                              option.answer_id
                            }
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

                            <div className="review-icon">

                              {isCorrect ? (

                                <CheckCircle2
                                  size={
                                    20
                                  }
                                />

                              ) : isWrongSelected ? (

                                <XCircle
                                  size={
                                    20
                                  }
                                />

                              ) : null}

                            </div>

                            <span>

                              {
                                option.m_content
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