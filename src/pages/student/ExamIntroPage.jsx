// src/pages/student/ExamIntroPage.jsx

import "./Dashboard.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/student/Sidebar";
import { getSessionById, createAttempt, submitAttempt } from "../../api/api"; 
import axios from "axios"; 

export default function ExamIntroPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [password, setPassword] = useState("");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingActiveAttemptId, setPendingActiveAttemptId] = useState(null);

  // Hàm gọi API quét lượt thi hiện tại (Được tách riêng để có thể tái sử dụng)
  const checkActiveAttemptSubdued = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      // Hãy đảm bảo url này trùng với Route GET dẫn tới hàm getCurrent() trong AttemptController của bạn
      const currentAttemptRes = await axios.get("http://localhost:3000/attempts/current", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let currentData = currentAttemptRes.data;
      while (currentData && Object.prototype.hasOwnProperty.call(currentData, 'data')) {
        currentData = currentData.data;
      }

      if (currentData && currentData.attempt && currentData.attempt.attempt_id) {
        return currentData.attempt.attempt_id;
      }
      return null;
    } catch (err) {
      console.warn("⚠️ Không thể check bài thi hiện tại tự động:", err?.response?.data || err.message);
      return null;
    }
  };

  // ================= LOAD EXAM & CHECK ACTIVE ATTEMPT =================
  useEffect(() => {
    const fetchExamAndActiveAttempt = async () => {
      try {
        setLoading(true);
        const cleanId = String(id).trim();
        
        // 1. Tải thông tin phòng thi
        const response = await getSessionById(cleanId);
        let finalData = response;
        while (finalData && Object.prototype.hasOwnProperty.call(finalData, 'data')) {
          finalData = finalData.data;
        }

        if (finalData && (finalData.sessionId || finalData.session_id || finalData.sessionName || finalData.session_name)) {
          setExam(finalData);
        } else {
          console.error("Dữ liệu không chuẩn cấu trúc phòng thi:", finalData);
          setExam(null);
        }

        // 2. Kiểm tra chủ động xem sinh viên có bị kẹt lượt thi nào không
        const activeId = await checkActiveAttemptSubdued();
        if (activeId) {
          console.log("⚠️ Phát hiện chủ động: Lượt thi dở dang mang ID:", activeId);
          setPendingActiveAttemptId(activeId);
          setShowConfirmModal(true);
        }

      } catch (error) {
        console.error("Lỗi khi tải chi tiết phòng thi:", error);
        alert("Không tải được thông tin bài thi từ hệ thống.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchExamAndActiveAttempt();
    }
  }, [id]);

  // ================= FORCE TERMINATE OLD ATTEMPT & CREATE NEW ONE =================
  const handleForceCancelOldAttempt = async () => {
    let targetAttemptId = pendingActiveAttemptId;

    // Nếu ID đang bị kẹt ở trạng thái giả lập ("999999"), tiến hành quét khẩn cấp lại một lần nữa
    if (!targetAttemptId || targetAttemptId === "999999") {
      setStarting(true);
      const reCheckId = await checkActiveAttemptSubdued();
      setStarting(false);
      
      if (reCheckId) {
        targetAttemptId = reCheckId;
        setPendingActiveAttemptId(reCheckId);
      } else {
        alert("Hệ thống không tìm thấy ID của bài thi cũ trên server để tiến hành nộp hộ. Vui lòng F5 (Tải lại trang) hoặc liên hệ Giám thị.");
        return;
      }
    }
    
    try {
      setStarting(true);

      console.log(`📡 Đang gửi yêu cầu đóng lượt thi cũ kẹt ID: ${targetAttemptId}`);
      
      // Gọi hàm submit từ api.js (Đóng bài thi cũ dưới dạng TIMEOUT để chấm điểm phần đã làm)
      await submitAttempt(Number(targetAttemptId), {
        status: "TIMEOUT" 
      });
      
      console.log("✅ Đã giải phóng lượt thi cũ thành công.");
      
      // Clear các vết tích local storage cũ liên quan đến session thi này (nếu có)
      localStorage.removeItem(`attempt_session_${id}`);
      setPendingActiveAttemptId(null);
      setShowConfirmModal(false);
      
      alert("Đã giải phóng lượt thi cũ thành công! Hệ thống tự động bắt đầu lượt thi mới của bạn.");
      
      // Khởi tạo bài mới lập tức
      await executeCreateAttempt();

    } catch (err) {
      console.error("Lỗi khi ép nộp bài cũ:", err);
      const serverMessage = err?.response?.data?.message;
      const displayMessage = Array.isArray(serverMessage) ? serverMessage.join("\n• ") : (serverMessage || err.message);
      alert("Có lỗi xảy ra khi nộp bài cũ:\n• " + displayMessage);
    } finally {
      setStarting(false);
    }
  };

  // ================= CORE LOGIC: CREATE ATTEMPT =================
  const executeCreateAttempt = async () => {
    const deviceInfoObj = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language
    };

    const payload = {
      sessionId: Number(id),
      ipAddress: "127.0.0.1", 
      deviceInfo: deviceInfoObj, 
    };

    if (password && password.trim() !== "") {
      payload.sessionPassword = password.trim();
    }

    const response = await createAttempt(payload);
    let attemptData = response;
    while (attemptData && Object.prototype.hasOwnProperty.call(attemptData, 'data')) {
      attemptData = attemptData.data;
    }
    
    const attemptId = attemptData?.attempt_id ?? attemptData?.attemptId;

    if (!attemptId) {
      throw new Error("Backend không trả về thuộc tính ID lượt thi hợp lệ.");
    }

    console.log("🚀 Khởi tạo lượt thi thành công! ID Lượt thi:", attemptId);
    localStorage.setItem(`attempt_session_${id}`, attemptId);

    navigate(`/student/exam/${id}/doing`, {
      state: { attemptId: attemptId },
    });
  };

  // ================= TRIGGER TRÊN GIAO DIỆN =================
  const handleStartExam = async () => {
    try {
      setStarting(true);
      await executeCreateAttempt();
    } catch (error) {
      console.error("❌ Lỗi khi bắt đầu làm bài:", error);
      
      const serverData = error?.response?.data;
      const serverMessage = serverData?.message;
      const displayMessage = Array.isArray(serverMessage) ? serverMessage.join("\n• ") : serverMessage;

      // Bẫy lỗi trùng bài thi thông qua mã nhận diện lỗi từ hàm [vnaa] của NestJS
      if (displayMessage && (String(displayMessage).includes("Không được phép tham gia nhiều bài thi cùng lúc") || String(displayMessage).includes("[vnaa]"))) {
        
        // Cố gắng tìm lại ID thực tế lưu trong LocalStorage từ trước
        let activeAttemptId = localStorage.getItem(`attempt_session_${id}`);

        if (!activeAttemptId) {
          // Thử quét lại một lần nữa bằng API trước khi đầu hàng gán số giả
          const fallbackId = await checkActiveAttemptSubdued();
          activeAttemptId = fallbackId || "999999";
        }

        setPendingActiveAttemptId(activeAttemptId);
        setShowConfirmModal(true);
        return;
      }

      alert(displayMessage || "Không thể bắt đầu làm bài. Vui lòng kiểm tra lại mật khẩu hoặc phòng thi!");
    } finally {
      setStarting(false);
    }
  };

  // ================= LOADING STATES =================
  if (loading) {
    return (
      <div style={{ padding: "30px", fontWeight: "600", fontSize: "16px" }}>
        Đang tải thông tin bài thi...
      </div>
    );
  }

  if (!exam) {
    return (
      <div style={{ padding: "30px", color: "red", fontWeight: "600", fontSize: "16px" }}>
        Không tìm thấy bài thi hoặc bạn không có quyền truy cập vào kỳ thi này.
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <div className="app-container">
        <Sidebar />

        <div className="main-content">
          <div className="header">
            <div className="user-info">
              <div className="avatar"></div>
              <div>
                <h4>Sinh viên</h4>
                <p>Student</p>
              </div>
            </div>
          </div>

          <div
            className="body"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "calc(100vh - 120px)",
            }}
          >
            <div style={{ textAlign: "center", width: "500px" }}>
              <h1 style={{ marginBottom: "30px", color: "#333" }}>
                {exam.sessionName ?? exam.session_name}
              </h1>

              <div
                style={{
                  marginBottom: "25px",
                  lineHeight: "35px",
                  fontWeight: "600",
                  textAlign: "left",
                  background: "#f9f9f9",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #eee"
                }}
              >
                <div>Mã kỳ thi: {exam.sessionId ?? exam.session_id}</div>
                <div>Trạng thái: <span style={{ color: "#2ebd59" }}>{exam.sessionStatus ?? exam.session_status}</span></div>
                <div>Số lần làm tối đa: {exam.attemptLimit ?? exam.attempt_limit ?? 1} lần</div>
                <div>Thời gian: {exam.duration} phút</div>
                <div>
                  Bắt đầu:{" "}
                  {exam.startTime ? new Date(exam.startTime).toLocaleString("vi-VN") : "Chưa cấu hình"}
                </div>
                <div>
                  Kết thúc:{" "}
                  {exam.endTime ? new Date(exam.endTime).toLocaleString("vi-VN") : "Chưa cấu hình"}
                </div>
              </div>

              <input
                type="password"
                placeholder="Nhập mật khẩu kỳ thi (Nếu có)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  height: "50px",
                  padding: "0 15px",
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  marginBottom: "20px",
                  fontSize: "16px",
                  boxSizing: "border-box"
                }}
              />

              <button
                onClick={handleStartExam}
                disabled={starting}
                style={{
                  width: "100%",
                  height: "55px",
                  border: "none",
                  borderRadius: "15px",
                  background: starting ? "#ccc" : "#efc45d",
                  color: "#000",
                  fontSize: "18px",
                  fontWeight: "bold",
                  cursor: starting ? "not-allowed" : "pointer",
                  transition: "background 0.3s ease"
                }}
              >
                {starting ? "Đang xử lý phòng thi..." : "Bắt đầu bài làm"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL CỨU HỘ ================= */}
      {showConfirmModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "16px", width: "450px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
            <h3 style={{ margin: "0 0 15px 0", color: "#d93838" }}>Phát Hiện Lượt Thi Chưa Đóng!</h3>
            <p style={{ color: "#555", fontSize: "14px", lineHeight: "22px", marginBottom: "25px" }}>
              Hệ thống ghi nhận bạn đang có một lượt thi chưa nộp ở trạng thái dở dang (`IN_PROGRESS`). Bạn muốn xử lý như thế nào?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              
              {/* HÀNH ĐỘNG 1: QUAY LẠI LÀM TIẾP */}
              <button 
                onClick={() => {
                  const finalId = (pendingActiveAttemptId === "999999") 
                    ? localStorage.getItem(`attempt_session_${id}`) 
                    : pendingActiveAttemptId;

                  if (!finalId || finalId === "999999") {
                    alert("Không truy vết được mã phòng thi cũ từ trình duyệt. Hãy bấm nút 'Nộp bài cũ' bên dưới để hệ thống tự động quét và giải phóng phòng thi.");
                    return;
                  }

                  localStorage.setItem(`attempt_session_${id}`, finalId);
                  navigate(`/student/exam/${id}/doing`, { state: { attemptId: Number(finalId) } });
                }}
                disabled={starting}
                style={{ padding: "12px", border: "none", borderRadius: "8px", background: "#efc45d", color: "#000", fontWeight: "bold", cursor: starting ? "not-allowed" : "pointer", fontSize: "14px" }}
              >
                ➡️ Vào làm TIẾP bài thi dở dang
              </button>

              {/* HÀNH ĐỘNG 2: NỘP HẲN BÀI CŨ ĐỂ KHỞI TẠO BÀI MỚI */}
              <button 
                onClick={handleForceCancelOldAttempt}
                disabled={starting} 
                style={{ 
                  padding: "12px", 
                  border: "none", 
                  borderRadius: "8px", 
                  background: "#d93838", 
                  color: "#fff", 
                  fontWeight: "bold", 
                  cursor: starting ? "not-allowed" : "pointer",
                  fontSize: "14px"
                }}
              >
                💥 Nộp hẳn bài cũ để khởi tạo lượt thi mới
              </button>

              <button 
                onClick={() => { setShowConfirmModal(false); }}
                disabled={starting}
                style={{ padding: "10px", border: "none", background: "none", color: "#888", cursor: "pointer", fontSize: "13px" }}
              >
                Bỏ qua thông báo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}