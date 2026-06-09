import "./Dashboard.css";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/student/Sidebar";
import Header from "../../components/student/Header";
import TestCard from "../../components/student/TestCard";

import { getSessions, getMyProfile } from "../../api/api";

export default function DashboardStudent() {
  const navigate = useNavigate();

  const [tests, setTests] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  const [hasUnreadNotification] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [sessionResult, profileResult] = await Promise.allSettled([
          getSessions(),
          getMyProfile(),
        ]);

        // 1. Xử lý dữ liệu danh sách bài kiểm tra (Sessions)
        if (sessionResult.status === "fulfilled") {
          const res = sessionResult.value;
          const rawSessions = res?.data?.data ?? res?.data ?? [];
          
          if (Array.isArray(rawSessions)) {
            const formattedSessions = rawSessions.map((item) => ({
              session_id: item.sessionId,
              session_name: item.sessionName,
              duration: item.duration,
              start_time: item.startTime,
              end_time: item.endTime,
              attempt_limit: item.attemptLimit,
              session_status: item.sessionStatus,
              class_name: item.classesInfo?.[0]?.class_name || "Chưa cập nhật",
              subject_name: item.subjectName || "Hệ quản trị Cơ sở dữ liệu", 
              teacher_name: item.teacherName || "Trần Thanh Hải",            
              number_of_questions: item.numberOfQuestions ?? 3                    
            }));
            
            setTests(formattedSessions);
          } else {
            setTests([]);
          }
        } else {
          console.error("Lỗi API lấy danh sách bài thi:", sessionResult.reason);
          setTests([]);
        }

        // 2. XỬ LÝ DỮ LIỆU PROFILE (Đã sửa chuẩn theo log F12)
        if (profileResult.status === "fulfilled") {
          const res = profileResult.value;
          
          // Log chỉ ra data nằm trực tiếp ở tầng bọc ngoài hoặc qua .data
          const rawProfile = res?.data?.userId ? res.data : (res?.userId ? res : null);
          
          if (rawProfile) {
            setUser({
              user_id: rawProfile.userId,
              email: rawProfile.email,
              full_name: rawProfile.fullName, // Map chính xác 'nguyen ngoc que chi'
              role: rawProfile.role
            });
          } else {
            setUser(null);
          }
        } else {
          console.error("Lỗi API lấy thông tin Profile:", profileResult.reason);
          if (profileResult.reason?.response?.status === 403) {
            localStorage.removeItem("token"); 
            navigate("/");
          }
        }

      } catch (error) {
        console.error("Lỗi hệ thống không xác định:", error);
        setTests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Bộ lọc tìm kiếm bài thi theo từ khóa
  const filteredTests = useMemo(() => {
    const value = (keyword || "").toLowerCase();

    return tests.filter((test) =>
      (test?.session_name || "").toLowerCase().includes(value)
    );
  }, [tests, keyword]);

  const handleStartTest = (sessionId) => {
    navigate(`/student/exam/${sessionId}`);
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
            <h2>BÀI KIỂM TRA CHƯA LÀM</h2>

            {loading ? (
              <p>Đang tải dữ liệu...</p>
            ) : (
              <div className="test-list">
                {filteredTests.length > 0 ? (
                  filteredTests.map((test, index) => {
                    const secureKey = test.session_id || test.id || `test-card-fallback-${index}`;
                    
                    return (
                      <TestCard
                        key={secureKey} 
                        test={test}
                        handleStartTest={handleStartTest}
                      />
                    );
                  })
                ) : (
                  <p>Không có bài kiểm tra nào.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}