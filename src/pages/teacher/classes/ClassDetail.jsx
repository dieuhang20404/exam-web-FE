import { useEffect, useState } from "react";
import {Button, Spin, Empty, Tabs} from "antd";
import {ArrowLeftOutlined} from "@ant-design/icons";
import {useParams, useNavigate} from "react-router-dom";
import "./ClassDetail.css";
import StudentTable from "./StudentTable";
import ExamTable from "./ExamTable";
import {getSessionsService} from "../../../services/sessionService";
import {fetchClassDetailService, getClassMembersService} from "../../../services/classService";
function ClassDetail() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classDetail, setClassDetail] = useState(null);
  const [examSessions, setExamSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  useEffect(() => {fetchData();}, [classId]);

  const fetchData = async () => {
    setLoading(true);

    try {
      console.log
      console.log(">>> GIÁ TRỊ CỦA ID NHẬN ĐƯỢC TỪ URL:", classId);
      const classData = await fetchClassDetailService(classId);
      const memberData = await getClassMembersService({ classId: Number(classId) });
      const sessionData = await getSessionsService({classId: Number(classId)});
      setClassDetail(classData);
      setStudents(memberData?.data || []);
      setExamSessions(sessionData.data || []);
    } finally {
      setLoading(false);
    }
  };

  // loading
  if (loading) {

    return (
      <div className="loading">
        <Spin size="large" />
      </div>
    );
  }

  // empty
  if (!classDetail) {

    return (
      <Empty description="Không có dữ liệu lớp" />
    );
  }

  return (

    <div className="detail-container">

      {/* HEADER */}

      <div className="detail-top">

        <Button
          className="bt-back"
          type="text"
          icon={
            <ArrowLeftOutlined />
          }
          onClick={() =>
            navigate(
              "/teacher/classManagement"
            )
          }
        >
          Trở về
        </Button>

        <div className="title-row">

          <div className="class-info-row">

            <h1 className="class-title">
              {
                classDetail.className
              }
            </h1>

            <p className="student-total">

              Tổng sinh viên:

              <b>
                {" "}
                {
                  classDetail
                    .numberOfStudents || 0
                }
              </b>

            </p>

          </div>

        </div>

      </div>

      {/* CONTENT */}

      <Tabs
        defaultActiveKey="students"

        items={[

          {
            key: "students",

            label:
              "Danh sách sinh viên",

            children: (

              <StudentTable
                classId={classId}
                students={students}
                onReload={
                  fetchData
                }
              />
            )
          },

          {
            key: "exams",

            label:
              "Danh sách kỳ thi",

            children: (

              <ExamTable
                classId={classId}

                exams={
                  examSessions || []
                }
              />
            )
          }

        ]}
      />

    </div>
  );
}

export default ClassDetail;