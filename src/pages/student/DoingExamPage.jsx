// src/pages/student/DoingExamPage.jsx

import "./Dashboard.css";
import { useEffect, useMemo, useState } from "react";
import { Menu } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Sidebar from "../../components/student/Sidebar";
import UserProfile from "../../components/student/UserProfile";
import {
  getSessionById,
  getTemplateQuestions,
  submitAttempt,
} from "../../api/api";

export default function DoingExamPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation(); 

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [attemptId, setAttemptId] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= LOAD EXAM & ATTEMPT MANAGEMENT =================
  useEffect(() => {
    const fetchExamAndAttempt = async () => {
      try {
        setLoading(true);

        // 1. Lấy thông tin phòng thi (Session)
        const sessionRes = await getSessionById(id);
        let session = sessionRes;
        while (session && Object.prototype.hasOwnProperty.call(session, 'data')) {
          session = session.data;
        }

        if (!session) {
          throw new Error("Không lấy được dữ liệu phòng thi từ API.");
        }

        const templateId = session.templateId ?? session.template_id ?? session.examTemplateId;
        let finalQuestions = [];

        // 2. Lấy danh sách câu hỏi dựa trên Template ID
        if (templateId && String(templateId) !== "undefined") {
          const questionRes = await getTemplateQuestions(templateId);
          let questionData = questionRes;
          
          while (questionData && Object.prototype.hasOwnProperty.call(questionData, 'data') && !questionData.pagination) {
            questionData = questionData.data;
          }

          console.log("Dữ liệu Questions thô nhận từ Backend:", questionData);

          if (questionData && Array.isArray(questionData.data)) {
            finalQuestions = questionData.data;
          } else if (Array.isArray(questionData)) {
            finalQuestions = questionData;
          }
        }

        setExam({
          ...session,
          title: session.sessionName ?? session.session_name ?? "Bài thi trực tuyến",
          questions: finalQuestions,
        });

        setTimeLeft(Number(session.duration ?? 60) * 60);

        // 3. ĐỒNG BỘ LƯỢT THI QUA LOCALSTORAGE
        const stateAttemptId = location.state?.attemptId;
        const savedAttemptId = localStorage.getItem(`attempt_session_${id}`);

        if (stateAttemptId) {
          setAttemptId(Number(stateAttemptId));
          localStorage.setItem(`attempt_session_${id}`, stateAttemptId);
        } else if (savedAttemptId) {
          setAttemptId(Number(savedAttemptId));
        } else {
          alert("Không tìm thấy lượt thi hợp lệ (Mã lỗi hệ thống: Lượt thi trống).");
          navigate("/student/dashboard");
        }
      } catch (error) {
        console.error("Lỗi khi khởi tạo phòng thi:", error);
        alert("Không thể tải cấu trúc đề thi từ máy chủ.");
        navigate("/student/dashboard"); 
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchExamAndAttempt();
    }
  }, [id, location.state, navigate]);

  // ================= TIMER =================
  useEffect(() => {
    if (timeLeft <= 0) {
      if (attemptId) {
        handleSubmit();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, attemptId]);

  // ================= FORMAT TIME =================
  const formattedTime = useMemo(() => {
    const minute = Math.floor(timeLeft / 60);
    const second = timeLeft % 60;

    return `${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")}`;
  }, [timeLeft]);

  // ================= CHOOSE ANSWER =================
  const handleChooseAnswer = (questionId, answerId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    try {
      if (!attemptId) {
        alert("Không tìm thấy mã lượt thi hợp lệ để nộp bài!");
        return;
      }

      const newAnswerIds = Object.values(answers);

      await submitAttempt(attemptId, {
        newAnswerIds,
        deleteAnswerIds: [],
        status: "SUBMITTED",
      });

      localStorage.removeItem(`attempt_session_${id}`);
      alert("Nộp bài thành công!");
      navigate("/student/history");
    } catch (error) {
      console.error("Lỗi khi nộp bài thi:", error);
      const serverMessage = error?.response?.data?.message;
      alert(serverMessage || "Nộp bài thất bại! Vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "30px", fontWeight: "600", fontSize: "16px" }}>
        Đang tải cấu trúc đề thi và đồng bộ lượt thi...
      </div>
    );
  }

  if (!exam) return null;
  const listQuestions = Array.isArray(exam.questions) ? exam.questions : [];

  return (
    <div className="student-dashboard">
      <div className="app-container">
        <Sidebar />

        <div className="main-content">
          <div className="header">
            <UserProfile
              navigate={navigate}
              showProfileMenu={showProfileMenu}
              setShowProfileMenu={setShowProfileMenu}
            />

            {/* ĐÃ CẬP NHẬT: Thêm class start-exam-btn để đồng bộ với ExamIntroPage */}
            <button className="submit-btn start-exam-btn" onClick={handleSubmit}>
              NỘP BÀI
            </button>

            <div className="exam-right">
              <div className="exam-timer">
                <span>Thời gian còn lại: </span>
                <strong>{formattedTime}</strong>
              </div>

              <div
                className="summary-btn"
                onMouseEnter={() => setShowSummary(true)}
                onMouseLeave={() => setShowSummary(false)}
              >
                <Menu size={24} />

                {showSummary && (
                  <div className="summary-popup">
                    <h4>Tóm tắt bài làm</h4>

                    {listQuestions.map((q, index) => {
                      const qId = q?.questionId ?? q?.question_id ?? index;
                      return (
                        <div key={qId} className="summary-item">
                          {index + 1}. {answers[qId] ? "✓" : "_"}
                        </div>
                      );
                    })}

                    <div className="summary-total">
                      Đã làm {Object.keys(answers).length}/{listQuestions.length}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="body">
            <h2 style={{ textAlign: "center", marginBottom: "40px" }}>
              {exam.title}
            </h2>

            {listQuestions.length > 0 ? (
              listQuestions.map((question, index) => {
                const qId = question?.questionId ?? question?.question_id ?? index;
                const listAnswers = Array.isArray(question?.answers) ? question.answers : [];

                return (
                  <div key={qId} className="question-block">
                    <h3>CÂU HỎI {index + 1}</h3>

                    <p style={{ marginBottom: "15px", fontWeight: "500" }}>
                      {question?.content ?? "Nội dung câu hỏi không khả dụng"}
                    </p>

                    <div className="answer-list">
                      {listAnswers.map((answer, aIdx) => {
                        const ansId = answer?.answerId ?? answer?.answer_id ?? aIdx;
                        const isSelected = answers[qId] === ansId;

                        return (
                          <div
                            key={ansId}
                            className={`answer-item ${isSelected ? "selected-answer" : ""}`}
                            onClick={() => handleChooseAnswer(qId, ansId)}
                          >
                            <div className="radio-circle">
                              {isSelected && <div className="radio-dot"></div>}
                            </div>

                            <span>{answer?.content ?? ""}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: "#666", fontWeight: "500" }}>
                ⚠️ Đề thi hiện tại trống dữ liệu (API trả về mảng 0 phần tử).
                <br />
                <small style={{ color: "#999", fontSize: "13px" }}>Vui lòng gán thêm câu hỏi vào đề thi này ở trang Admin.</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}