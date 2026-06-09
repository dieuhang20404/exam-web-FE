// src/pages/student/HistoryPage.jsx
import "./Dashboard.css";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/student/Sidebar";
import Header from "../../components/student/Header";
// 🎯 ĐỒNG BỘ API: Dùng đúng các hàm api sẵn có
import { getAttempts, getSessions, createRetake, getRetakes } from "../../api/api"; 

export default function HistoryPage() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [sessions, setSessions] = useState([]); 
  const [myRetakes, setMyRetakes] = useState([]); // Lưu danh sách các request retake của user này
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null); 
  const [keyword, setKeyword] = useState("");
  const [hasUnreadNotification] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState(null);

  // ================= LOAD USER MÁY TRẠM =================
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);
  }, []);

  // ================= TẢI SONG SONG DỮ LIỆU LỊCH SỬ, PHÒNG THI VÀ RETAKES =================
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const [attemptsRes, sessionsRes, retakesRes] = await Promise.all([
          getAttempts(),
          getSessions(),
          getRetakes().catch(() => ({ data: { data: [] } }))
        ]);
        
        const attemptsData = attemptsRes?.data?.data ?? attemptsRes?.data ?? [];
        const sessionsData = sessionsRes?.data?.data ?? sessionsRes?.data ?? [];
        const retakesData = retakesRes?.data?.data ?? retakesRes?.data ?? [];

        setTests(Array.isArray(attemptsData) ? attemptsData : []);
        setSessions(Array.isArray(sessionsData) ? sessionsData : []);
        setMyRetakes(Array.isArray(retakesData) ? retakesData : []);
      } catch (error) {
        console.error("Lỗi lấy lịch sử bài thi:", error);
        alert("Không tải được lịch sử làm bài");
        setTests([]);
        setSessions([]);
        setMyRetakes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // ================= TỰ ĐỘNG KHỚP NỐI ID ĐỂ ĐẮP TÊN VÀ TÌM KIẾM =================
  const filteredTests = useMemo(() => {
    const sessionMap = new Map();
    sessions.forEach((s) => {
      const id = s.id || s.session_id || s.sessionId;
      if (id) sessionMap.set(id, s);
    });

    const enrichedTests = tests.map((test) => {
      const currentSessionId = test.session_id || test.sessionId;
      const matchedSession = sessionMap.get(currentSessionId);
      const name = matchedSession?.sessionName || matchedSession?.session_name || matchedSession?.name;
      
      const existingRetakeRequest = myRetakes.find(
        (r) => Number(r.session_id || r.sessionId) === Number(currentSessionId)
      );

      return {
        ...test,
        displayExamName: name || `Phòng thi #${currentSessionId}`,
        rawSession: matchedSession,
        pendingRetake: existingRetakeRequest 
      };
    });

    const value = keyword.toLowerCase().trim();
    if (!value) return enrichedTests;

    return enrichedTests.filter((test) => {
      return (
        test.displayExamName.toLowerCase().includes(value) ||
        String(test.session_id || test.sessionId).toLowerCase().includes(value)
      );
    });
  }, [tests, sessions, keyword, myRetakes]);

  // ================= HÀM XỬ LÝ GỬI ĐƠN XIN THI LẠI (TÁCH RIÊNG ĐỂ TÁI SỬ DỤNG) =================
  const triggerRetakeFlow = async (currentSessionId, existingRetake) => {
    if (existingRetake) {
      const status = existingRetake.request_status || existingRetake.RetakeStatus || existingRetake.status;
      if (status === "pending") {
        alert("Bạn đã gửi một yêu cầu thi lại cho phòng này rồi. Vui lòng chờ giáo viên duyệt!");
        return;
      }
      if (status === "rejected") {
        alert("Yêu cầu thi lại của bạn cho phòng thi này đã bị giáo viên từ chối.");
        return;
      }
    }

    const confirmRetake = window.confirm(
      "Phòng thi này đã kết thúc hoặc bạn đã hết lượt làm bài. Bạn có muốn gửi yêu cầu xin thi lại tới giáo viên không?"
    );
    
    if (confirmRetake) {
      const reason = window.prompt("Vui lòng nhập lý do xin thi lại (Không được bỏ trống):");
      if (reason === null) return;
      if (!reason.trim()) {
        alert("Bạn phải nhập lý do cụ thể để gửi yêu cầu!");
        return;
      }

      await createRetake({
        sessionId: Number(currentSessionId),
        reason: reason.trim()
      });
      
      alert("Gửi yêu cầu thi lại thành công! Vui lòng đợi giáo viên phê duyệt.");
      
      const updatedRetakes = await getRetakes().catch(() => ({ data: { data: [] } }));
      setMyRetakes(updatedRetakes?.data?.data ?? updatedRetakes?.data ?? []);
    }
  };

  // ================= XỬ LÝ LÀM LẠI HOẶC GỬI YÊU CẦU THI LẠI =================
  const handleRetakeOrReattempt = async (test) => {
    const currentSessionId = test.session_id || test.sessionId;
    const currentAttemptId = test.attempt_id || test.attemptId;
    const sessionConfig = test.rawSession;
    const existingRetake = test.pendingRetake;

    if (!currentSessionId) {
      alert("Không tìm thấy thông tin phòng thi.");
      return;
    }

    try {
      setActionLoadingId(currentAttemptId);

      // Kiểm tra xem phòng thi đóng hẳn chưa
      const isSessionFinished = sessionConfig?.session_status === "finished" || sessionConfig?.sessionStatus === "finished";

      if (isSessionFinished) {
        // Nếu phòng thi đã kết thúc trạng thái -> Chuyển thẳng sang luồng xin Retake
        await triggerRetakeFlow(currentSessionId, existingRetake);
      } else {
        // Nếu phòng thi còn mở -> Chuyển hướng học sinh đến URL thi bài gốc của bạn
        // Tại đây trang /student/exam/:id của bạn sẽ tự thực hiện check lượt và gọi API createAttempt
        navigate(`/student/exam/${Number(currentSessionId)}`);
      }
    } catch (error) {
      console.error("Lỗi xử lý làm lại bài:", error);
      
      // 🎯 HỨNG LỖI TỪ BACKEND: Nếu backend báo hết lượt hoặc cần retake
      const errorMsg = error?.response?.data?.message;
      if (errorMsg && (errorMsg.includes("lượt") || errorMsg.includes("limit") || errorMsg.includes("retake"))) {
        await triggerRetakeFlow(currentSessionId, existingRetake);
      } else {
        alert(errorMsg || "Hệ thống không thể xử lý yêu cầu lúc này.");
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // ================= CHUYỂN ĐỔI GIAO DIỆN TRẠNG THÁI TIẾNG VIỆT =================
  const renderStatusBadge = (status) => {
    switch (status) {
      case "graded":
      case "submitted":
        return <span style={{ color: "#2e7d32", fontWeight: "bold" }}>● Đã nộp / Đã chấm</span>;
      case "in_progress":
        return <span style={{ color: "#ed6c02", fontWeight: "bold" }}>● Đang làm dở</span>;
      case "timeout":
        return <span style={{ color: "#d32f2f", fontWeight: "bold" }}>● Hệ thống tự thu bài</span>;
      default:
        return <span style={{ color: "#555" }}>● {status}</span>;
    }
  };

  // ================= ĐỊNH DẠNG ĐIỂM SỐ NGUYÊN BẢN TỪ BACKEND =================
  const formatScore = (test) => {
    const rawScore = test.totalScore !== undefined ? test.totalScore : test.total_score;
    if (rawScore !== null && rawScore !== undefined && rawScore !== "") {
      const num = Number(rawScore);
      return !isNaN(num) ? `${num} điểm` : `${rawScore} điểm`;
    }
    return "--";
  };

  return (
    <div className="student-dashboard">
      <div className="app-container">
        <Sidebar />

        <div className="main-content">
          <Header
            navigate={navigate}
            keyword={keyword}
            setKeyword={setKeyword}
            hasUnreadNotification={hasUnreadNotification}
            showNotification={showNotification}
            setShowNotification={setShowNotification}
            showProfileMenu={showProfileMenu}
            setShowProfileMenu={setShowProfileMenu}
            user={user}
          />

          <div className="body">
            <h2>LỊCH SỬ LÀM BÀI</h2>

            {loading ? (
              <p>Đang tải danh sách bài làm của bạn...</p>
            ) : (
              <div className="test-list">
                {filteredTests.length === 0 && (
                  <p style={{ textAlign: "center", color: "#888", padding: "20px" }}>
                    Không tìm thấy dữ liệu lượt thi nào phù hợp.
                  </p>
                )}

                {filteredTests.map((test) => {
                  const currentAttemptId = test.attempt_id || test.attemptId;
                  const isActionLoading = actionLoadingId === currentAttemptId;

                  return (
                    <div className="test-card" key={currentAttemptId}>
                      <p>
                        <strong>Kỳ thi:</strong> <span style={{ color: "#1976d2", fontWeight: "600" }}>{test.displayExamName}</span>
                      </p>

                      <p>
                        <strong>Lần làm bài:</strong> Lượt thi thứ {test.attemptNo || test.attempt_no}
                      </p>

                      <p>
                        <strong>Trạng thái:</strong> {renderStatusBadge(test.attemptStatus || test.attempt_status)}
                      </p>

                      <p>
                        <strong>Thời gian bắt đầu:</strong>{" "}
                        {test.startTime || test.start_time 
                          ? new Date(test.startTime || test.start_time).toLocaleString("vi-VN") 
                          : "--:--"}
                      </p>

                      <p>
                        <strong>Thời gian nộp:</strong>{" "}
                        {test.submitTime || test.submit_time 
                          ? new Date(test.submitTime || test.submit_time).toLocaleString("vi-VN") 
                          : <i style={{ color: "#aaa" }}>Chưa ghi nhận nộp</i>}
                      </p>

                      <p>
                        <strong>Điểm số đạt được:</strong>{" "}
                        <span style={{ fontSize: "1.2rem", color: "#d32f2f", fontWeight: "bold" }}>
                          {formatScore(test)}
                        </span>
                      </p>

                      <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "repeat(2, 1fr)", 
                        gap: "10px", 
                        marginTop: "15px" 
                      }}>
                        {/* <button
                          disabled={(test.attemptStatus || test.attempt_status) === "in_progress"}
                          onClick={() => navigate(`/student/review/${currentAttemptId}`)}
                          style={{
                            padding: "8px 4px",
                            fontSize: "0.82rem",
                            fontFamily: "inherit",
                            fontWeight: "500",
                            borderRadius: "4px",
                            border: "none",
                            color: "white",
                            backgroundColor: (test.attemptStatus || test.attempt_status) === "in_progress" ? "#ccc" : "#1976d2",
                            cursor: (test.attemptStatus || test.attempt_status) === "in_progress" ? "not-allowed" : "pointer",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                        >
                          Xem lại bài
                        </button> */}

                        <button
                          disabled={isActionLoading}
                          onClick={() => handleRetakeOrReattempt(test)}
                          style={{
                            padding: "8px 4px",
                            fontSize: "0.82rem",
                            fontFamily: "inherit",
                            fontWeight: "500",
                            borderRadius: "4px",
                            border: "none",
                            color: "white",
                            backgroundColor: isActionLoading ? "#71a075" : "#2e7d32",
                            cursor: isActionLoading ? "not-allowed" : "pointer",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                        >
                          {isActionLoading ? "Đang xử lý..." : "Làm lại bài thi"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}