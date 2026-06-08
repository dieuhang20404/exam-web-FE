// src/pages/student/HistoryPage.jsx

import "./Dashboard.css";

import {
  useEffect,
  useState,
  useMemo,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import Sidebar from "../../components/student/Sidebar";
import Header from "../../components/student/Header";

import {
  getAttempts,
} from "../../api/api";

export default function HistoryPage() {
  const navigate =
    useNavigate();

  const [tests, setTests] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [keyword, setKeyword] =
    useState("");

  const [
    hasUnreadNotification,
  ] = useState(true);

  const [
    showNotification,
    setShowNotification,
  ] = useState(false);

  const [
    showProfileMenu,
    setShowProfileMenu,
  ] = useState(false);

  const [user, setUser] =
    useState(null);

  // ================= LOAD USER =================

  useEffect(() => {
    const userData =
      JSON.parse(
        localStorage.getItem(
          "user"
        )
      );

    setUser(userData);
  }, []);

  // ================= LOAD HISTORY =================

  useEffect(() => {
    const fetchHistory =
      async () => {
        try {
          setLoading(true);

          const response =
            await getAttempts();

          const data =
            response?.data?.data ??
            response?.data ??
            [];

          setTests(
            Array.isArray(data)
              ? data
              : []
          );
        } catch (error) {
          console.error(error);

          alert(
            "Không tải được lịch sử làm bài"
          );

          setTests([]);
        } finally {
          setLoading(false);
        }
      };

    fetchHistory();
  }, []);

  // ================= FILTER =================

  const filteredTests =
    useMemo(() => {
      const value =
        keyword.toLowerCase();

      return tests.filter(
        (test) =>
          String(
            test.session_id
          )
            .toLowerCase()
            .includes(value)
      );
    }, [tests, keyword]);

  // ================= REVIEW =================

  const handleReview = (
    attemptId
  ) => {
    navigate(
      `/student/review/${attemptId}`
    );
  };

  // ================= REDO =================

  const handleRedo = (
    sessionId
  ) => {
    navigate(
      `/student/exam/${sessionId}`
    );
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
            hasUnreadNotification={
              hasUnreadNotification
            }
            showNotification={
              showNotification
            }
            setShowNotification={
              setShowNotification
            }
            showProfileMenu={
              showProfileMenu
            }
            setShowProfileMenu={
              setShowProfileMenu
            }
            user={user}
          />

          <div className="body">
            <h2>
              LỊCH SỬ LÀM BÀI
            </h2>

            {loading ? (
              <p>
                Đang tải dữ liệu...
              </p>
            ) : (
              <div className="test-list">
                {filteredTests.length ===
                  0 && (
                  <p>
                    Chưa có bài làm
                    nào
                  </p>
                )}

                {filteredTests.map(
                  (test) => (
                    <div
                      className="test-card"
                      key={
                        test.attempt_id
                      }
                    >
                      <h3>
                        Bài làm #
                        {
                          test.attempt_id
                        }
                      </h3>

                      <p>
                        <strong>
                          Kỳ thi:
                        </strong>{" "}
                        {
                          test.session_id
                        }
                      </p>

                      <p>
                        <strong>
                          Lần làm:
                        </strong>{" "}
                        {
                          test.attempt_no
                        }
                      </p>

                      <p>
                        <strong>
                          Trạng thái:
                        </strong>{" "}
                        {
                          test.attempt_status
                        }
                      </p>

                      <p>
                        <strong>
                          Bắt đầu:
                        </strong>{" "}
                        {new Date(
                          test.start_time
                        ).toLocaleString()}
                      </p>

                      <p>
                        <strong>
                          Nộp bài:
                        </strong>{" "}
                        {test.submit_time
                          ? new Date(
                              test.submit_time
                            ).toLocaleString()
                          : "Chưa nộp"}
                      </p>

                      <p>
                        <strong>
                          Điểm:
                        </strong>{" "}
                        {test.total_score ??
                          "--"}
                      </p>

                      <div
                        style={{
                          display:
                            "flex",
                          gap: "10px",
                          marginTop:
                            "15px",
                        }}
                      >
                        <button
                          onClick={() =>
                            handleReview(
                              test.attempt_id
                            )
                          }
                        >
                          Xem lại
                        </button>

                        <button
                          onClick={() =>
                            handleRedo(
                              test.session_id
                            )
                          }
                        >
                          Làm lại
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}