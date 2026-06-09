import "./Dashboard.css";
import { useEffect, useMemo, useState, useRef } from "react";
import { Menu } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Sidebar from "../../components/student/Sidebar";
import UserProfile from "../../components/student/UserProfile";
import {
  getSessionById,
  getTemplateQuestions,
  updateAttemptAnswers,
  submitAttempt,
} from "../../api/api";

export default function DoingExamPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // Session ID
  const location = useLocation();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [exam, setExam] = useState(null);
  
  // Trạng thái lưu đáp án hiện tại trên giao diện (UI State): { [questionId]: [answerId1, ...] }
  const [answers, setAnswers] = useState({});
  
  // Khối bộ nhớ snapshot đại diện cho Database (Dữ liệu gốc đã đồng bộ thành công với Server)
  const [dbAnswersSnapshot, setDbAnswersSnapshot] = useState({});
  
  const [attemptId, setAttemptId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Popup thông báo trạng thái
  const [submitStatus, setSubmitStatus] = useState({ show: false, type: "", message: "" });
  const [isTimeWarning, setIsTimeWarning] = useState(false);
  
  // Cờ chặn việc gửi trùng lặp (Double Click / Auto Submit trùng)
  const isSubmittingRef = useRef(false); 
  const handleSubmitRef = useRef();

  // Refs giữ giá trị mới nhất của State để tránh lỗi Stale Closure khi gọi API/đếm ngược
  const answersRef = useRef({});
  const dbSnapshotRef = useRef({});

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    dbSnapshotRef.current = dbAnswersSnapshot;
  }, [dbAnswersSnapshot]);


  // ================= 🛠️ KHỞI TẠO ĐỀ THI & KHÔI PHỤC DỮ LIỆU CHỐNG OUT =================
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
        if (!session) throw new Error("Không lấy được dữ liệu phòng thi.");

        const durationMinutes = Number(session.duration ?? 60);

        // 2. Lấy danh sách câu hỏi
        const templateId = session.templateId ?? session.template_id ?? session.examTemplateId;
        let finalQuestions = [];
        if (templateId && String(templateId) !== "undefined") {
          const questionRes = await getTemplateQuestions(templateId);
          let questionData = questionRes;
          while (questionData && Object.prototype.hasOwnProperty.call(questionData, 'data') && !questionData.pagination) {
            questionData = questionData.data;
          }
          if (questionData && Array.isArray(questionData.data)) {
            finalQuestions = questionData.data;
          } else if (Array.isArray(questionData)) {
            finalQuestions = questionData;
          }
        }

        // Thiết lập cấu trúc bài thi trước
        setExam({
          ...session,
          title: session.sessionName ?? session.session_name ?? "Bài thi trực tuyến",
          questions: finalQuestions,
        });

        // 3. XỬ LÝ LẤY ATTEMPT ID
        const stateAttemptId = location.state?.attemptId;
        const savedAttemptId = localStorage.getItem(`attempt_session_${id}`);
        let currentAttemptId = stateAttemptId ? Number(stateAttemptId) : (savedAttemptId ? Number(savedAttemptId) : null);

        if (currentAttemptId) {
          setAttemptId(currentAttemptId);
          localStorage.setItem(`attempt_session_${id}`, currentAttemptId);
        } else {
          setSubmitStatus({ 
            show: true, 
            type: "error", 
            message: "Không tìm thấy mã lượt thi (Attempt ID) hợp lệ. Vui lòng vào lại từ danh sách phòng thi." 
          });
          setTimeout(() => navigate("/student/dashboard"), 2500);
          return;
        }

        // 4. BẢO VỆ ĐỒNG HỒ ĐẾM NGƯỢC
        const storageTargetKey = `exam_target_time_session_${id}`;
        const savedTargetTime = localStorage.getItem(storageTargetKey);
        let targetTime = 0;

        if (savedTargetTime) {
          targetTime = Number(savedTargetTime);
        } else {
          targetTime = new Date().getTime() + (durationMinutes * 60 * 1000);
          localStorage.setItem(storageTargetKey, targetTime.toString());
        }

        const remainingSeconds = Math.max(0, Math.floor((targetTime - new Date().getTime()) / 1000));
        setTimeLeft(remainingSeconds);

        // 5. PHỤC HỒI ĐÁP ÁN ĐÃ LƯU CỤC BỘ (Đặt ở cuối cùng sau khi mọi dữ liệu cấu trúc đã tải xong)
        const savedAnswers = localStorage.getItem(`answers_session_${id}`);
        if (savedAnswers) {
          try {
            const parsed = JSON.parse(savedAnswers);
            
            // Chuẩn hóa Key của Object từ LocalStorage về String thống nhất để tránh lỗi mismatch key
            const normalizedAnswers = {};
            Object.keys(parsed).forEach(key => {
              normalizedAnswers[String(key)] = Array.isArray(parsed[key]) ? parsed[key].map(Number) : [];
            });

            setAnswers(normalizedAnswers);
            setDbAnswersSnapshot(JSON.parse(JSON.stringify(normalizedAnswers))); 
          } catch (e) {
            console.error("Lỗi cấu trúc đáp án cục bộ:", e);
          }
        }

      } catch (error) {
        console.error("Lỗi khởi tạo phòng thi:", error);
        setSubmitStatus({ show: true, type: "error", message: "Gặp sự cố khi đồng bộ cấu trúc đề thi từ máy chủ." });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchExamAndAttempt();
  }, [id, location.state, navigate]);


  // ================= 🏁 HÀM NỘP BÀI CHÍNH THỨC =================
  const handleSubmit = async (isAutoSubmit = false) => {
    if (isSubmittingRef.current) return;

    const totalQuestions = exam?.questions?.length || 0;

    if (!isAutoSubmit) {
      const confirmMsg = answeredCount < totalQuestions
        ? `⚠️ Bạn mới chỉ hoàn thành ${answeredCount}/${totalQuestions} câu hỏi.\nBạn có chắc chắn muốn nộp bài sớm không?`
        : "Bạn có chắc chắn muốn nộp bài thi và kết thúc lượt thi này không?";
      
      if (!window.confirm(confirmMsg)) return;
    }

    isSubmittingRef.current = true;

    setSubmitStatus({
      show: true,
      type: "loading",
      message: isAutoSubmit 
        ? "⏰ Hết giờ làm bài! Hệ thống đang tự động khóa dữ liệu và tính điểm..." 
        : "Hệ thống đang nộp bài và tính toán điểm số, vui lòng đợi trong giây lát..."
    });

    try {
      if (!attemptId) {
        throw new Error("Không tìm thấy mã lượt thi (Attempt ID) hợp lệ trên trình duyệt!");
      }

      // 🎯 ĐÃ SỬA: Chuyển "TIMEOUT" / "SUBMITTED" thành dữ liệu chữ thường "timeout" / "submitted" khớp hoàn toàn với MySQL Enum
      const payload = {
        status: isAutoSubmit ? "timeout" : "submitted" 
      };

      console.log(`📡 Gửi lệnh đóng bài lên API submit /attempts/${attemptId}/submit`, payload);
      await submitAttempt(attemptId, payload);

      localStorage.removeItem(`attempt_session_${id}`);
      localStorage.removeItem(`answers_session_${id}`);
      localStorage.removeItem(`exam_target_time_session_${id}`);

      setSubmitStatus({
        show: true,
        type: "success",
        message: "🎉 Nộp bài thành công! Hệ thống đã chấm điểm tự động cho bài làm của bạn."
      });

      setTimeout(() => {
        isSubmittingRef.current = false;
        navigate("/student/history");
      }, 2000);

    } catch (error) {
      console.error("❌ LỖI TRONG QUÁ TRÌNH NỘP BÀI:", error);
      
      const status = error?.response?.status;
      let friendlyMessage = "";

      if (status === 404) {
        localStorage.removeItem(`attempt_session_${id}`);
        localStorage.removeItem(`answers_session_${id}`);
        localStorage.removeItem(`exam_target_time_session_${id}`);

        setSubmitStatus({
          show: true,
          type: "error",
          message: "⚠️ Lượt thi này không tồn tại trên máy chủ (Mã lỗi: 404). Phiên thi có thể đã bị thay đổi hoặc hủy bỏ."
        });

        setTimeout(() => {
          isSubmittingRef.current = false;
          navigate("/student/dashboard");
        }, 3500);
        return;
      }

      if (status === 403 || status === 400) {
        friendlyMessage = `🔒 [Lỗi ${status}] Bạn không có quyền nộp bài hoặc lượt thi này đã được hoàn thành trước đó.`;
        
        localStorage.removeItem(`attempt_session_${id}`);
        localStorage.removeItem(`answers_session_${id}`);
        localStorage.removeItem(`exam_target_time_session_${id}`);
        
        setTimeout(() => { navigate("/student/history"); }, 2500);
      } else {
        const serverMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || "Lỗi kết nối mạng.";
        friendlyMessage = `Nộp bài thất bại: ${Array.isArray(serverMessage) ? serverMessage.join(" | ") : String(serverMessage)}.`;
        isSubmittingRef.current = false;
      }
      
      setSubmitStatus({
        show: true,
        type: "error",
        message: friendlyMessage
      });
    }
  };

  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [answers, dbAnswersSnapshot, exam]);


  // ================= ⏱️ BỘ ĐẾM NGƯỢC THỜI GIAN CHUẨN XÁC =================
  useEffect(() => {
    if (timeLeft <= 0 && !loading) {
      if (attemptId && handleSubmitRef.current && !isSubmittingRef.current) {
        handleSubmitRef.current(true);
      }
      return;
    }

    if (timeLeft <= 300 && timeLeft > 0 && !isTimeWarning) {
      setIsTimeWarning(true);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, attemptId, loading, isTimeWarning]);

  const formattedTime = useMemo(() => {
    const minute = Math.floor(timeLeft / 60);
    const second = timeLeft % 60;
    return `${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")}`;
  }, [timeLeft]);

  const answeredCount = useMemo(() => {
    return Object.values(answers).filter(arr => arr && arr.length > 0).length;
  }, [answers]);


  // ================= 📡 ĐỒNG BỘ ĐÁP ÁN REALTIME XUỐNG DB =================
  const handleChooseAnswer = async (questionId, answerId, qType) => {
    if (timeLeft <= 0 || isSubmittingRef.current) return;

    // Ép Key về chuỗi String cố định để đồng bộ tuyệt đối với cơ chế Object Key của JavaScript
    const qKey = String(questionId);
    const ansId = Number(answerId);
    
    const currentUiAnswers = answersRef.current[qKey] || [];
    const currentDbAnswers = dbSnapshotRef.current[qKey] || [];
    
    let newUiAnswersForQuestion = [];

    if (qType === "multiple" || qType === "MULTIPLE") {
      if (currentUiAnswers.includes(ansId)) {
        newUiAnswersForQuestion = currentUiAnswers.filter(id => id !== ansId);
      } else {
        newUiAnswersForQuestion = [...currentUiAnswers, ansId];
      }
    } else {
      if (currentUiAnswers.includes(ansId)) return; 
      newUiAnswersForQuestion = [ansId];
    }

    // Ghi đè State với Key đã chuẩn hóa dạng String
    const nextFullAnswersState = { ...answersRef.current, [qKey]: newUiAnswersForQuestion };
    setAnswers(nextFullAnswersState);
    localStorage.setItem(`answers_session_${id}`, JSON.stringify(nextFullAnswersState));

    const newAnswerIds = newUiAnswersForQuestion.filter(id => !currentDbAnswers.includes(id));
    const deleteAnswerIds = currentDbAnswers.filter(id => !newUiAnswersForQuestion.includes(id));

    if (newAnswerIds.length === 0 && deleteAnswerIds.length === 0) return;

    try {
      await updateAttemptAnswers(attemptId, {
        newAnswerIds: newAnswerIds.map(Number),
        deleteAnswerIds: deleteAnswerIds.map(Number)
      });
      
      setDbAnswersSnapshot((prevDb) => ({
        ...prevDb,
        [qKey]: newUiAnswersForQuestion
      }));

    } catch (err) {
      const status = err?.response?.status;
      
      if (status === 403) {
        console.error("⛔ [403 Forbidden] Bài làm đã đóng trên Server.");
        isSubmittingRef.current = true; 

        setSubmitStatus({
          show: true,
          type: "error",
          message: "⏰ Thời gian làm bài của bạn đã kết thúc trên hệ thống máy chủ! Hệ thống chuyển hướng về trang lịch sử kết quả."
        });

        localStorage.removeItem(`attempt_session_${id}`);
        localStorage.removeItem(`answers_session_${id}`);
        localStorage.removeItem(`exam_target_time_session_${id}`);

        setTimeout(() => { navigate("/student/history"); }, 3000);
        return;
      }
      console.warn("⚠️ Tự động lưu cục bộ thành công (Đang đợi mạng đồng bộ kết nối lại).", err);
    }
  };

  if (loading) {
    return <div style={{ padding: "30px", fontWeight: "600", fontFamily: "sans-serif" }}>🔄 Đang thiết lập phòng thi và khôi phục tiến trình làm bài...</div>;
  }

  if (!exam) return null;
  const listQuestions = Array.isArray(exam.questions) ? exam.questions : [];

  return (
    <div className="student-dashboard doing-exam-fix-layout">
      
      {/* POPUP TRẠNG THÁI */}
      {submitStatus.show && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 9999, backdropFilter: "blur(4px)"
        }}>
          <div style={{
            backgroundColor: "#fff", padding: "30px", borderRadius: "12px", width: "450px",
            textAlign: "center", boxShadow: "0px 10px 30px rgba(0,0,0,0.3)",
            fontFamily: "sans-serif",
            borderTop: submitStatus.type === "success" ? "6px solid #28a745" : submitStatus.type === "error" ? "6px solid #dc3545" : "6px solid #007bff"
          }}>
            <div style={{ fontSize: "45px", marginBottom: "15px" }}>
              {submitStatus.type === "success" ? "✅" : submitStatus.type === "error" ? "❌" : "⏳"}
            </div>
            <h3 style={{ margin: "0 0 10px 0", color: "#333", fontSize: "18px", fontWeight: "700" }}>
              {submitStatus.type === "success" ? "Nộp Bài Thành Công" : submitStatus.type === "error" ? "Thông Báo Hệ Thống" : "Đang Xử Lý Kết Quả"}
            </h3>
            <p style={{ color: "#555", fontSize: "14px", lineHeight: "1.5", margin: "0 0 20px 0", wordBreak: "break-word", textAlign: "justify" }}>
              {submitStatus.message}
            </p>
            
            {submitStatus.type === "error" && !isSubmittingRef.current && (
              <button 
                onClick={() => setSubmitStatus({ show: false, type: "", message: "" })}
                style={{
                  padding: "10px 24px", backgroundColor: "#dc3545", color: "#fff",
                  border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600",
                  boxShadow: "0 4px 12px rgba(220, 53, 69, 0.2)"
                }}
              >
                Đóng & Thử Nộp Lại
              </button>
            )}
          </div>
        </div>
      )}

      <div className="app-container content-container-fix">
        <Sidebar />

        <div className="main-content main-content-fix">
          <div className="header">
            <UserProfile navigate={navigate} showProfileMenu={showProfileMenu} setShowProfileMenu={setShowProfileMenu} />

            <button 
              className="submit-btn start-exam-btn" 
              onClick={() => handleSubmit(false)}
              disabled={timeLeft <= 0 || isSubmittingRef.current}
              style={{ opacity: (timeLeft <= 0 || isSubmittingRef.current) ? 0.5 : 1, cursor: (timeLeft <= 0 || isSubmittingRef.current) ? "not-allowed" : "pointer" }}
            >
              NỘP BÀI
            </button>

            <div className="exam-right">
              <div className="exam-timer" style={{ 
                backgroundColor: isTimeWarning ? "#fff0f0" : "#f8f9fa",
                border: isTimeWarning ? "1px solid #ffcccc" : "1px solid #e9ecef",
                padding: "6px 14px", borderRadius: "20px"
              }}>
                <span style={{ color: "#333" }}>Thời gian còn lại: </span>
                <strong style={{ color: isTimeWarning ? "#dc3545" : "#007bff", animation: isTimeWarning ? "blink 1s linear infinite" : "none" }}>
                  {formattedTime}
                </strong>
              </div>

              {isTimeWarning && timeLeft > 0 && (
                <div style={{
                  color: "#dc3545", fontSize: "12px", fontWeight: "700", marginLeft: "10px",
                  backgroundColor: "#ffebeb", padding: "6px 12px", borderRadius: "6px", border: "1px dashed #dc3545"
                }}>
                  ⚠️ Chú ý: Thời gian làm bài còn dưới 5 phút!
                </div>
              )}

              {/* TÓM TẮT BÀI LÀM */}
              <div
                className="summary-btn"
                style={{ position: "relative", cursor: "pointer", marginLeft: "15px" }}
                onMouseEnter={() => setShowSummary(true)}
                onMouseLeave={() => setShowSummary(false)}
              >
                <Menu size={24} />

                {showSummary && (
                  <div className="summary-popup" style={{
                    position: "absolute", top: "100%", right: 0, backgroundColor: "#ffffff",
                    border: "1px solid #e0e0e0", borderRadius: "8px", boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.15)",
                    padding: "16px", width: "280px", zIndex: 999, marginTop: "8px"
                  }}>
                    <h4 style={{ margin: "0 0 12px 0", fontSize: "15px", fontWeight: "600", color: "#333", borderBottom: "1px solid #f0f0f0", paddingBottom: "8px" }}>
                      Tóm tắt bài làm
                    </h4>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", maxHeight: "240px", overflowY: "auto", paddingBottom: "6px" }}>
                      {listQuestions.map((item, index) => {
                        const qIdStr = String(item?.questionId ?? index);
                        const questionCore = item?.data; 
                        const listAnswers = Array.isArray(questionCore?.answers) ? questionCore.answers : [];
                        
                        const selectedIds = answers[qIdStr] || [];
                        const hasAnswered = selectedIds.length > 0;

                        const chosenLabels = listAnswers
                          .map((ans, idx) => {
                            const ansId = Number(ans?.answerId ?? ans?.answer_id ?? idx);
                            return selectedIds.includes(ansId) ? String.fromCharCode(65 + idx) : null;
                          })
                          .filter(Boolean)
                          .join(", ");

                        return (
                          <div 
                            key={qIdStr} 
                            style={{
                              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                              padding: "8px 4px", borderRadius: "6px", fontSize: "12px",
                              backgroundColor: hasAnswered ? "#e6f0ff" : "#f5f5f5", color: hasAnswered ? "#007bff" : "#666",
                              border: "hasAnswered" ? "1px solid #b4d4ff" : "1px solid #e0e0e0"
                            }}
                          >
                            <span style={{ fontSize: "11px", fontWeight: "500", color: "#888" }}>Câu {index + 1}</span>
                            <span style={{ marginTop: "4px", fontWeight: "bold", fontSize: "13px" }}>
                              {hasAnswered ? chosenLabels : "—"}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ marginTop: "12px", paddingTop: "8px", borderTop: "1px solid #f0f0f0", fontSize: "13px", fontWeight: "600", color: "#28a745", textAlign: "center" }}>
                      Đã làm {answeredCount}/{listQuestions.length} câu
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BODY CÂU HỎI */}
          <div className="body exam-body-fix">
            <h2 style={{ textAlign: "center", marginBottom: "40px" }}>
              {exam.title}
            </h2>

            {listQuestions.length > 0 ? (
              listQuestions.map((item, index) => {
                const qId = item?.questionId ?? index;
                const qIdStr = String(qId);
                const questionCore = item?.data; 
                const qType = questionCore?.qType ?? questionCore?.questionType ?? "single";
                const listAnswers = Array.isArray(questionCore?.answers) ? questionCore.answers : [];

                return (
                  <div key={qIdStr} className="question-block" style={{ 
                    marginBottom: "25px", padding: "20px", background: "#fff", borderRadius: "8px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3>CÂU HỎI {index + 1}</h3>
                      <span style={{ color: "#888", fontSize: "14px", fontWeight: "500" }}>
                        ({item?.score ?? "0"} điểm)
                      </span>
                    </div>

                    <p style={{ marginBottom: "15px", fontWeight: "500", marginTop: "10px" }}>
                      {questionCore?.content ?? "Nội dung câu hỏi không khả dụng"}
                    </p>

                    <div className="answer-list">
                      {listAnswers.map((answer, aIdx) => {
                        const ansId = Number(answer?.answerId ?? answer?.answer_id ?? aIdx);
                        const currentQuestionAnswers = answers[qIdStr] || [];
                        const isSelected = currentQuestionAnswers.includes(ansId);
                        const label = String.fromCharCode(65 + aIdx);

                        return (
                          <div
                            key={ansId}
                            className={`answer-item ${isSelected ? "selected-answer" : ""}`}
                            style={{ 
                              cursor: "pointer", 
                              display: "flex", alignItems: "center", padding: "10px", marginBottom: "8px" 
                            }}
                            onClick={() => handleChooseAnswer(qId, ansId, qType)}
                          >
                            {(qType === "multiple" || qType === "MULTIPLE") ? (
                              <div className="checkbox-square" style={{
                                width: "18px", height: "18px", border: "2px solid #ccc", borderRadius: "4px",
                                marginRight: "12px", display: "flex", alignItems: "center", justifyContent: "center",
                                backgroundColor: isSelected ? "#007bff" : "transparent", borderColor: isSelected ? "#007bff" : "#ccc"
                              }}>
                                {isSelected && <span style={{ color: "#fff", fontSize: "11px", fontWeight: "bold" }}>✓</span>}
                              </div>
                            ) : (
                              <div className="radio-circle">
                                {isSelected && <div className="radio-dot"></div>}
                              </div>
                            )}

                            <strong style={{ marginRight: "8px", color: isSelected ? "#007bff" : "#555" }}>{label}.</strong>
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
                ⚠️ Không tìm thấy danh sách câu hỏi nào thuộc đề thi này.
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .doing-exam-fix-layout {
          display: flex !important;
          width: 100vw !important;
          height: 100vh !important;
          min-height: 100vh !important;
          max-height: 100vh !important;
          overflow: hidden !important;
        }

        .content-container-fix {
          display: flex !important;
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important;
        }

        .main-content-fix {
          flex: 1 !important;
          display: flex !important;
          flex-direction: column !important;
          height: 100% !important;
          overflow: hidden !important;
        }

        .exam-body-fix {
          flex: 1 !important;
          padding: 30px !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          height: calc(100vh - 70px) !important;
        }

        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}