// src/pages/student/Dashboard.jsx

import "./Dashboard.css";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/student/Sidebar";
import Header from "../../components/student/Header";
import TestCard from "../../components/student/TestCard";

export default function DashboardStudent() {

  const navigate = useNavigate();

  // ===== DATA =====

  const [tests, setTests] = useState([]);

  // ===== SEARCH =====

  const [keyword, setKeyword] = useState("");

  // ===== NOTIFICATION =====

  const [hasUnreadNotification, setHasUnreadNotification] =
    useState(true);

  const [showNotification, setShowNotification] =
    useState(false);

  // ===== PROFILE =====

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  // ===== API =====

  useEffect(() => {

    const fakeData = [
      {
        id: 1,
        title: "Kiểm Tra ReactJS",
        teacher: "Nguyễn Thị A",
        subject: "Lập trình Web",
        duration: 45,
        questions: 20,
      },

      {
        id: 2,
        title: "Kiểm Tra Java",
        teacher: "Trần Văn B",
        subject: "Java Core",
        duration: 60,
        questions: 30,
      },

      {
        id: 3,
        title: "Kiểm Tra NodeJS",
        teacher: "Nguyễn Thị A",
        subject: "Backend",
        duration: 30,
        questions: 15,
      },
    ];

    setTests(fakeData);

  }, []);

  // ===== FILTER =====

  const filteredTests = useMemo(() => {

    return tests.filter((test) => {

      const value = keyword.toLowerCase();

      return (
        test.teacher
          .toLowerCase()
          .includes(value) ||

        test.title
          .toLowerCase()
          .includes(value)
      );

    });

  }, [tests, keyword]);

  // ===== START TEST =====

  const handleStartTest = (id) => {
    navigate(`/student/exam/${id}`);
  };

  return (

    <div className="student-dashboard">

      <div className="app-container">

        {/* SIDEBAR */}

        <Sidebar />

        {/* MAIN */}

        <div className="main-content">

          {/* HEADER */}

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

          {/* BODY */}

          <div className="body">

            <h2>
              BÀI KIỂM TRA CHƯA LÀM
            </h2>

            <div className="test-list">

              {
                filteredTests.map((test) => (

                  <TestCard
                    key={test.id}
                    test={test}
                    handleStartTest={
                      handleStartTest
                    }
                  />

                ))
              }

            </div>

          </div>

        </div>

      </div>

    </div>

  );
}