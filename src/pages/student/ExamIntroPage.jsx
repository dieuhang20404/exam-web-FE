// src/pages/student/ExamIntroPage.jsx

import "./Dashboard.css";

import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "../../components/student/Sidebar";

export default function ExamIntroPage() {

  const navigate = useNavigate();

  const { id } = useParams();

  // fake data
  const exam = {
    id,
    title: "TÊN BÀI KIỂM TRA",
    teacher: "Nguyễn Thị A",
    subject: "CNTT",
    questions: 20,
    duration: 45,
    section: 4,
  };

  // ===== START EXAM =====

  const handleStartExam = () => {

    navigate(`/student/exam/${id}/doing`);

  };

  return (

    <div className="student-dashboard">

      <div className="app-container">

        {/* SIDEBAR */}

        <Sidebar />

        {/* MAIN */}

        <div className="main-content">

          {/* HEADER */}

          <div className="header">

            <div className="user-info">

              <div className="avatar"></div>

              <div>

                <h4>Nguyễn Văn A</h4>

                <p>nva@gmail.com</p>

              </div>

            </div>

          </div>

          {/* BODY */}

          <div
            className="body"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "calc(100vh - 120px)",
            }}
          >

            <div
              style={{
                textAlign: "center",
              }}
            >

              <h1
                style={{
                  marginBottom: "30px",
                }}
              >
                {exam.title}
              </h1>

              <div
                style={{
                  marginBottom: "20px",
                  lineHeight: "30px",
                  fontWeight: "600",
                }}
              >

                <div>
                  Giáo viên: {exam.teacher}
                </div>

                <div>
                  Môn học: {exam.subject}
                </div>

                <div>
                  Số câu hỏi: {exam.questions}
                </div>

                <div>
                  Thời gian: {exam.duration} phút
                </div>

              </div>

              {/* START BUTTON */}

              <button
                onClick={handleStartExam}
                style={{
                  width: "220px",
                  height: "55px",
                  border: "none",
                  borderRadius: "15px",
                  background: "#efc45d",
                  fontSize: "18px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >

                Bắt đầu bài làm

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>

  );
}