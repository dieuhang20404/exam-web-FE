// src/pages/student/ReviewPage.jsx
import "./Dashboard.css";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react"; // Dùng icon neutral để chỉ định vị trí đã chọn
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/student/Sidebar";
import UserProfile from "../../components/student/UserProfile";
import { getAttemptById, getSessionById, getTemplateQuestions } from "../../api/api";

export default function ReviewPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setLoading(true);

        // ==========================
        // 1. ATTEMPT
        // ==========================
        const attemptRes = await getAttemptById(id);
        const { attempt, selectedAnswers } = attemptRes.data;

        const sessionId = attempt?.sessionId || attempt?.session_id;
        const totalScore = attempt?.totalScore ?? attempt?.total_score ?? "--";

        if (!sessionId) {
          throw new Error("Không thể xác định phiên kiểm tra từ bài làm này.");
        }

        // ==========================
        // 2. SESSION
        // ==========================
        const sessionRes = await getSessionById(sessionId);
        const session = sessionRes.data;
        const templateId = session?.templateId || session?.template_id;

        // ==========================
        // 3. QUESTIONS
        // ==========================
        const questionRes = await getTemplateQuestions(templateId);
        const templateQuestions = questionRes.data?.data || questionRes.data || [];

        // ==========================
        // 4. MAP SELECTED ANSWERS
        // ==========================
        const selectedAnswerIds = new Set(
          (selectedAnswers || []).map((item) => item.answerId || item.answer_id)
        );

        // ==========================
        // 5. BUILD REVIEW DATA (Chỉ giữ lại lựa chọn của SV)
        // ==========================
        const reviewQuestions = templateQuestions.map((item) => {
          const question = item.question_banks || item.questionBanks;
          const answers = question?.answer_banks || question?.answerBanks || [];

          // Tìm xem sinh viên đã khoanh đáp án nào trong danh sách answers này
          const selectedAnswer = answers.find((ans) =>
            selectedAnswerIds.has(ans.answer_id || ans.answerId)
          );

          return {
            id: item.question_id || item.questionId,
            question: question?.m_content || "Câu hỏi không có nội dung.",
            options: answers,
            // HOÀN TOÀN BỎ BIẾN ĐÁP ÁN ĐÚNG (correctAnswerId) ĐỂ BẢO MẬT ĐỀ
            selectedAnswerId: selectedAnswer?.answer_id || selectedAnswer?.answerId,
          };
        });

        setExam({
          title: session?.session_name || session?.sessionName || "Bài kiểm tra",
          score: totalScore,
          totalQuestions: reviewQuestions.length,
          questions: reviewQuestions,
        });

      } catch (error) {
        console.error("Review Page Loading Error:", error);
        alert(
          error?.response?.data?.message ||
          error.message ||
          "Không tải được bài làm."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReview();
    }
  }, [id]);

  if (loading) {
    return <div style={{ padding: 30 }}>Đang tải dữ liệu...</div>;
  }

  if (!exam) {
    return <div style={{ padding: 30 }}>Không có dữ liệu bài làm.</div>;
  }

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

            <div className="review-result">
              <div>
                Điểm số: <strong>{exam.score}</strong>
              </div>
              <div>
                Tổng số câu: <strong>{exam.totalQuestions}</strong>
              </div>
            </div>
          </div>

          <div className="body">
            <h2 style={{ textAlign: "center", marginBottom: "40px" }}>
              {exam.title}
            </h2>

            {exam.questions.map((question, index) => (
              <div key={question.id} className="question-block">
                <h3>Câu {index + 1}</h3>
                <p>{question.question}</p>

                <div className="answer-list">
                  {question.options.map((option) => {
                    const currentOptionId = option.answer_id || option.answerId;
                    
                    // Kiểm tra xem đây có phải câu sinh viên chọn hay không
                    const isSelected = currentOptionId === question.selectedAnswerId;

                    return (
                      <div
                        key={currentOptionId}
                        // Nếu chọn thì add class 'user-selected-active', xóa hẳn các class correct/wrong cũ
                        className={`review-answer ${isSelected ? "user-selected-active" : ""}`}
                        style={{
                          // Thêm inline style an toàn để đảm bảo hiển thị rõ ràng
                          border: isSelected ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                          backgroundColor: isSelected ? "#eff6ff" : "transparent",
                          padding: "12px",
                          borderRadius: "6px",
                          marginBottom: "8px",
                          display: "flex",
                          alignItems: "center",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <div className="review-icon" style={{ marginRight: "10px", display: "flex", alignItems: "center" }}>
                          {isSelected ? (
                            // Hiện icon màu xanh dương đại diện cho lựa chọn của User, không phải màu xanh lá/đỏ của Hệ Thống
                            <CheckCircle2 size={20} color="#3b82f6" />
                          ) : (
                            // Ô tròn rỗng đối với đáp án không được chọn
                            <div style={{ width: 18, height: 18, borderRadius: "50%", border: "1px solid #d1d5db" }} />
                          )}
                        </div>
                        <span style={{ color: isSelected ? "#1e40af" : "#374151", fontWeight: isSelected ? "600" : "normal" }}>
                          {option.m_content}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}