import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Tag, Spin } from "antd";

import { getTemplateByIdService, getTemplateQuestionsService } from "../../../services/templateService";
import "./ExamDetail.css";

function ExamDetail() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]); 

  useEffect(() => {
    fetchExamData();
  }, [examId]);

  const fetchExamData = async () => {
    try {
      setLoading(true);
      
      // Gọi song song cả 2 API để tối ưu tốc độ tải trang
      const [examRes, questionsRes] = await Promise.all([
        getTemplateByIdService(examId),
        getTemplateQuestionsService(examId)
      ]);

      console.log("Thông tin đề thi tổng quan:", examRes);
      console.log("Danh sách câu hỏi chi tiết từ Service mới:", questionsRes.data);

      setExam(examRes);
      setQuestions(Array.isArray(questionsRes.data) ? questionsRes.data : []);

    } catch (err) {
      console.error("Lỗi khi tải dữ liệu chi tiết đề thi:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="exam-loading-container">
        <Spin size="large" tip="Đang tải cấu trúc đề thi..." />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="exam-not-found">
        <h3>Không tìm thấy thông tin đề thi!</h3>
        <Button type="primary" onClick={() => navigate(-1)}>Quay lại danh sách</Button>
      </div>
    );
  }

  return (
    <div className="exam-detail-page">
      {/* Nút quay lại */}
      <Button className="btn-back" onClick={() => navigate(-1)}>
        ← Quay lại
      </Button>

      {/* Thông tin tổng quan của đề thi */}
      <Card className="exam-info-card">
        <h1 className="exam-title">{exam.templateName}</h1>
        <div className="exam-meta-info">
          <p><strong>Mã môn học:</strong> {exam.subjectId}</p>
          <p><strong>Số câu hỏi trên hệ thống:</strong> {exam.numberOfQuestions || questions.length} câu</p>
        </div>
      </Card>

      {/* Danh sách các câu hỏi trong đề lấy từ Service bổ sung */}
      <h2 className="section-title">Danh sách câu hỏi chi tiết ({questions.length} câu)</h2>
      
      {questions.length > 0 ? (
        <div className="questions-list-wrapper">
          {questions
            .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)) // Sắp xếp theo thứ tự câu hỏi tăng dần
            .map((question, qIndex) => {
              
              const questionDetail = question.data || {}; 
              const content = questionDetail.content;
              const difficulty = questionDetail.difficulty;
              const answers = questionDetail.answers;

              return (
                <Card key={question.questionId || qIndex} className="question-card">
                  <div className="question-header">
                    <h3 className="question-number">Câu {question.orderIndex || qIndex + 1}</h3>
                    <div className="question-tags">
                      <Tag color="blue" className="tag-score">
                        {question.score ? `${question.score} điểm` : "1 điểm"}
                      </Tag>
                      {difficulty && (
                        <Tag 
                          className="tag-difficulty"
                          color={difficulty === 3 ? "red" : difficulty === 2 ? "orange" : "green"}
                        >
                          {difficulty === 3 ? "Khó" : difficulty === 2 ? "Trung bình" : "Dễ"}
                        </Tag>
                      )}
                    </div>
                  </div>

                  {/* Hiển thị nội dung câu hỏi lấy từ bọc data */}
                  <p className="question-content">
                    {content || "Nội dung câu hỏi chưa cập nhật"}
                  </p>

                  {/* Danh sách câu trả lời lấy từ bọc data */}
                  {Array.isArray(answers) && answers.length > 0 && (
                    <div className="answer-list">
                      {answers.map((ans, index) => (
                        <div
                          key={index}
                          className={`answer-item ${ans.isCorrect || ans.is_correct ? "correct-answer" : ""}`}
                        >
                          <strong className="answer-prefix">
                            {String.fromCharCode(65 + index)}.
                          </strong>{" "}
                          {ans.content}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
        </div>
      ) : (
        <p className="empty-questions-msg">Không có câu hỏi nào được gán vào mẫu đề này.</p>
      )}
      </div>
  );
}

export default ExamDetail;