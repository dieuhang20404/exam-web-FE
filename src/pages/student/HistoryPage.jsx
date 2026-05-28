// src/pages/student/HistoryPage.jsx

import "./Dashboard.css";

import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/student/Sidebar.jsx";
import Header from "../../components/student/Header.jsx";

export default function HistoryPage() {

  const navigate = useNavigate();

  const [tests, setTests] = useState([]);

  const [keyword, setKeyword] = useState("");

  const [hasUnreadNotification] =
    useState(true);

  const [showNotification, setShowNotification] =
    useState(false);

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  useEffect(() => {

    const fakeData = [
      {
        id: 1,
        title: "Kiểm Tra ReactJS",
        teacher: "Nguyễn Thị A",
        subject: "Lập trình Web",
        duration: 45,
        questions: 20,
        score: 8.5,
        canRedo: true,
      },

      {
        id: 2,
        title: "Kiểm Tra Java",
        teacher: "Trần Văn B",
        subject: "Java Core",
        duration: 60,
        questions: 30,
        score: 9,
        canRedo: false,
      },
    ];

    setTests(fakeData);

  }, []);

  const handleReview = (id) => {

    navigate(`/student/review/${id}`);

  };

  const handleRedo = (test) => {

    if (!test.canRedo) return;

    navigate(`/student/exam/${test.id}`);

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
          />

          <div className="body">

            <h2>
              LỊCH SỬ LÀM BÀI
            </h2>

            <div className="test-list">

              {
                tests.map((test) => (

                  <div
                    className="test-card"
                    key={test.id}
                  >

                    <h3>{test.title}</h3>

                    <p>
                      <strong>Giáo viên:</strong>
                      {" "}
                      {test.teacher}
                    </p>

                    <p>
                      <strong>Môn:</strong>
                      {" "}
                      {test.subject}
                    </p>

                    <p>
                      <strong>Thời gian:</strong>
                      {" "}
                      {test.duration} phút
                    </p>

                    <p>
                      <strong>Số câu:</strong>
                      {" "}
                      {test.questions} câu
                    </p>

                    <p>
                      <strong>Điểm:</strong>
                      {" "}
                      {test.score}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "15px",
                      }}
                    >

                      <button
                        onClick={() =>
                          handleReview(test.id)
                        }
                      >
                        Xem lại
                      </button>

                      <button
                        disabled={!test.canRedo}
                        onClick={() =>
                          handleRedo(test)
                        }
                        className={
                          !test.canRedo
                            ? "disabled-btn"
                            : ""
                        }
                      >
                        Làm lại
                      </button>

                    </div>

                  </div>

                ))
              }

            </div>

          </div>

        </div>

      </div>

    </div>

  );
}