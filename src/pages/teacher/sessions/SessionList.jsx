import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Empty,
  message
} from "antd";
import { useNavigate } from "react-router-dom";
import "./SessionList.css";
import CreateExamSession from "../../../components/CreateExamSession";

function SessionList() {
  const navigate = useNavigate();

  const [sessions, setSessions] =
    useState([]);

  const [openModal, setOpenModal] =
    useState(false);

  // mock đề thi
  const templates = [
    {
      template_id: 1,
      template_name:
        "Java Midterm"
    },
    {
      template_id: 2,
      template_name:
        "React Quiz"
    }
  ];

  const [formData, setFormData] =
    useState({
      template_id: null,
      session_name: "",

      duration: null,

      shuffle_questions: false,
      shuffle_answers: false,
      auto_submit: true,
      allow_review: false,
      show_result: false,

      start_time: null,
      end_time: null,

      attempt_limit: 1,
      session_password: ""
    });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    const data =
      JSON.parse(
        localStorage.getItem(
          "my_exam_sessions"
        )
      ) || [];

    setSessions(data);
  };

  const handleCreateExam = () => {
    if (
      !formData.session_name.trim()
    ) {
      message.warning(
        "Nhập tên kỳ thi"
      );
      return;
    }

    if (!formData.template_id) {
      message.warning(
        "Chọn đề thi"
      );
      return;
    }

    const payload = {
      session_id: Date.now(),

      ...formData,

      session_status:
        "Draft"
    };

    const old =
      JSON.parse(
        localStorage.getItem(
          "my_exam_sessions"
        )
      ) || [];

    localStorage.setItem(
      "my_exam_sessions",
      JSON.stringify([
        ...old,
        payload
      ])
    );

    message.success(
      "Tạo kỳ thi thành công"
    );

    setOpenModal(false);

    loadSessions();

    setFormData({
      template_id: null,
      session_name: "",
      duration: 60,

      shuffle_questions: false,
      shuffle_answers: false,
      auto_submit: true,
      allow_review: false,
      show_result: false,

      start_time: null,
      end_time: null,

      attempt_limit: 1,
      session_password: ""
    });
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "session_id"
    },

    {
      title: "Tên kỳ thi",
      dataIndex: "session_name"
    },

    {
      title: "Thời lượng",
      dataIndex: "duration",
      render: (value) =>
        `${value} phút`
    },

    {
      title: "Số lần thi",
      dataIndex:
        "attempt_limit"
    },

    {
      title: "Trạng thái",
      dataIndex:
        "session_status",
      render: (status) => (
        <Tag color="blue">
          {status}
        </Tag>
      )
    }
  ];

  if (
    !sessions ||
    sessions.length === 0
  ) {
    return (
      <>
        <Button
          type="primary"
          onClick={() =>
            navigate("/teacher/createSession")
          }
        >
          + Tạo kỳ thi
        </Button>

        <Empty
          description="Chưa có kỳ thi"
          style={{
            marginTop: 50
          }}
        />

        <CreateExamSession
          open={openModal}
          onCancel={() =>
            setOpenModal(false)
          }
          onOk={handleCreateExam}
          formData={formData}
          setFormData={
            setFormData
          }
          templates={templates}
        />
      </>
    );
  }

  return (
    <div>
      <div
        style={{
          marginBottom: 20
        }}
      >
        <Button
          className="bt-new-session"
          type="primary"
          onClick={() =>
            navigate("/teacher/createSession")
          }
        >
          + Tạo kỳ thi
        </Button>
      </div>

      <Card>
        <Table
          rowKey="session_id"
          columns={columns}
          dataSource={sessions}
          onRow={(record) => ({
            onClick: () =>
              navigate(
                `/teacher/session/${record.session_id}`
              )
          })}
        />
      </Card>

      <CreateExamSession
        open={openModal}
        onCancel={() =>
          setOpenModal(false)
        }
        onOk={handleCreateExam}
        formData={formData}
        setFormData={
          setFormData
        }
        templates={templates}
      />
    </div>
  );
}

export default SessionList;