import { useEffect, useState } from "react";
import {Button, Spin, Empty, Tabs} from "antd";
import {ArrowLeftOutlined} from "@ant-design/icons";
import {useParams, useNavigate} from "react-router-dom";
import "./ClassDetail.css";
import StudentTable from "./StudentTable";
import ExamTable from "./ExamTable";
import { mockClassDetail } from "../../../mock/mockClassDetail"; 
import { mockExamSession } from "../../../mock/mockExamSession";
import {fetchClassDetailService} from "../../../services/classService";
import {getSessionsService} from "../../../services/sessionService";

function ClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classDetail, setClassDetail] = useState(null);
  const [examSessions, setExamSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {fetchData();}, [id]);

  const fetchData = async () => {
    setLoading(true);

    try {
      const classData = await getClassByIdService(id);
      const memberData = await getClassMembersService(id);
      const sessionData = await getSessionsService({classId: Number(id)});
      setClassDetail(classData);
      setStudents(memberData.data || []);
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
                classDetail.class_name
              }
            </h1>

            <p className="student-total">

              Tổng sinh viên:

              <b>
                {" "}
                {
                  classDetail
                    .students
                    ?.length || 0
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
                classId={id}

                students={
                  classDetail.students || []
                }

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
                classId={id}

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