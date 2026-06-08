// src/pages/student/ExamIntroPage.jsx

import "./Dashboard.css";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import Sidebar from "../../components/student/Sidebar";

import {
  getSessionById,
  createAttempt,
} from "../../api/api";

export default function ExamIntroPage() {
  const navigate = useNavigate();

  const { id } = useParams();

  const [exam, setExam] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [starting, setStarting] =
    useState(false);

  const [password, setPassword] =
    useState("");

  // ================= LOAD EXAM =================

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);

        const response =
          await getSessionById(id);

        const data =
          response?.data?.data ??
          response?.data;

        setExam(data);
      } catch (error) {
        console.error(error);

        alert(
          "Không tải được thông tin bài thi"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id]);

  // ================= START EXAM =================

  const handleStartExam =
    async () => {
      try {
        setStarting(true);

        const response =
          await createAttempt({
            sessionId: Number(id),
            sessionPassword:
              password,
            ipAddress: "",
            deviceInfo:
              navigator.userAgent,
          });

        const attempt =
          response?.data?.data ??
          response?.data;

        navigate(
          `/student/exam/${id}/doing`,
          {
            state: {
              attemptId:
                attempt.attempt_id,
            },
          }
        );
      } catch (error) {
        console.error(error);

        alert(
          error?.response?.data
            ?.message ||
            "Không thể bắt đầu bài thi"
        );
      } finally {
        setStarting(false);
      }
    };

  // ================= LOADING =================

  if (loading) {
    return (
      <div
        style={{
          padding: "30px",
        }}
      >
        Đang tải...
      </div>
    );
  }

  if (!exam) {
    return (
      <div
        style={{
          padding: "30px",
        }}
      >
        Không tìm thấy bài thi
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
              justifyContent:
                "center",
              alignItems:
                "center",
              height:
                "calc(100vh - 120px)",
            }}
          >
            <div
              style={{
                textAlign: "center",
                width: "500px",
              }}
            >
              <h1
                style={{
                  marginBottom: "30px",
                }}
              >
                {exam.sessionName}
              </h1>

              <div
                style={{
                  marginBottom: "25px",
                  lineHeight: "32px",
                  fontWeight: "600",
                }}
              >
                <div>
                  Mã kỳ thi:
                  {" "}
                  {exam.sessionId}
                </div>

                <div>
                  Trạng thái:
                  {" "}
                  {exam.sessionStatus}
                </div>

                <div>
                  Số lần làm tối đa:
                  {" "}
                  {exam.attemptLimit}
                </div>

                <div>
                  Thời gian:
                  {" "}
                  {exam.duration}
                  {" "}
                  phút
                </div>

                <div>
                  Bắt đầu:
                  {" "}
                  {exam.startTime}
                </div>

                <div>
                  Kết thúc:
                  {" "}
                  {exam.endTime}
                </div>
              </div>

              <input
                type="password"
                placeholder="Nhập mật khẩu kỳ thi"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  height: "50px",
                  padding:
                    "0 15px",
                  border:
                    "1px solid #ddd",
                  borderRadius:
                    "12px",
                  marginBottom:
                    "20px",
                  fontSize: "16px",
                }}
              />

              <button
                onClick={
                  handleStartExam
                }
                disabled={
                  starting
                }
                style={{
                  width: "220px",
                  height: "55px",
                  border: "none",
                  borderRadius:
                    "15px",
                  background:
                    "#efc45d",
                  fontSize:
                    "18px",
                  fontWeight:
                    "bold",
                  cursor:
                    "pointer",
                }}
              >
                {starting
                  ? "Đang vào thi..."
                  : "Bắt đầu bài làm"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}