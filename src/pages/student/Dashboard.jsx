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
  const [showNotification, setShowNotification] =
    useState(false);

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [sessionRes, profileRes] =
          await Promise.all([
            getSessions(),
            getMyProfile(),
          ]);

        const sessions =
          sessionRes?.data?.data ??
          sessionRes?.data ??
          [];

        const profile =
          profileRes?.data?.data ??
          profileRes?.data ??
          null;

        setTests(
          Array.isArray(sessions)
            ? sessions
            : []
        );

        setUser(profile);

      } catch (error) {
        console.error(
          "Lỗi tải dữ liệu:",
          error
        );

        setTests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTests = useMemo(() => {
    const value =
      (keyword || "").toLowerCase();

    return tests.filter((test) =>
      (test?.session_name || "")
        .toLowerCase()
        .includes(value)
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
              BÀI KIỂM TRA CHƯA LÀM
            </h2>

            {loading ? (
              <p>Đang tải dữ liệu...</p>
            ) : (
              <div className="test-list">
                {filteredTests.length >
                0 ? (
                  filteredTests.map(
                    (test) => (
                      <TestCard
                        key={
                          test.session_id
                        }
                        test={test}
                        handleStartTest={
                          handleStartTest
                        }
                      />
                    )
                  )
                ) : (
                  <p>
                    Không có bài kiểm
                    tra nào.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}