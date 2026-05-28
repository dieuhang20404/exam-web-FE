import { Card, Table, Tag, Button, Input, DatePicker, Switch, message, Select, InputNumber } from "antd";

import { EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";

import { useState, useEffect } from "react";
import "./SessionDetail.css";
import dayjs from "dayjs";

function SessionDetail() {
  const [session, setSession] =
    useState({
      session_id: 1,
      session_name:
        "Java Midterm",

      template_name:
        "Java OOP Final",

      start_time:
        "2026-05-20 09:00",

      end_time:
        "2026-05-20 10:30",

      duration: 90,

      session_password:
        "abc123",

      shuffle_questions: true,

      shuffle_answers: false,

      allow_review: true,

      session_status:
        "UPCOMING"
    });

  const [editMode, setEditMode] =
    useState(false);

  const [editData, setEditData] =
    useState({
      ...session,
      start_time: dayjs(
        session.start_time
      ),
      end_time: dayjs(
        session.end_time
      )
    });

  const [templates, setTemplates] =
    useState([]);

  const handleSave = () => {
    setSession({
      ...editData,
      start_time:
        editData.start_time?.format(
          "YYYY-MM-DD HH:mm"
        ),
      end_time:
        editData.end_time?.format(
          "YYYY-MM-DD HH:mm"
        )
    });

    setEditMode(false);

    message.success(
      "Cập nhật thành công"
    );
  };
  const students = [
    {
      student_id: 1,
      name:
        "Nguyễn Văn A",
      score: 8.5,
      status:
        "Submitted",
      tab_switch: 2,
      fullscreen_exit: 1,
      focus_lost: 3,
      ai_warning: "Low"
    },
    {
      student_id: 2,
      name:
        "Trần Thị B",
      score: null,
      status:
        "Doing",
      tab_switch: 5,
      fullscreen_exit: 2,
      focus_lost: 7,
      ai_warning: "High"
    }
  ];

  const columns = [
    {
      title:
        "Sinh viên",
      dataIndex: "name"
    },
    {
      title: "Điểm",
      dataIndex:
        "score",
      render: (score) =>
        score ??
        "--"
    },
    {
      title:
        "Trạng thái",
      dataIndex:
        "status",
      render: (
        status
      ) => (
        <Tag
          color={
            status ===
            "Submitted"
              ? "green"
              : "blue"
          }
        >
          {status}
        </Tag>
      )
    },
    {
      title:
        "Tab switch",
      dataIndex:
        "tab_switch"
    },
    {
      title:
        "Thoát fullscreen",
      dataIndex:
        "fullscreen_exit"
    },
    {
      title:
        "Mất focus",
      dataIndex:
        "focus_lost"
    },
    {
      title:
        "AI cảnh báo",
      dataIndex:
        "ai_warning",
      render: (
        val
      ) => (
        <Tag
          color={
            val ===
            "High"
              ? "red"
              : "orange"
          }
        >
          {val}
        </Tag>
      )
    }
  ];

  return (
    <div className="session-detail-page">

      {/* HEADER */}
      <Card className="session-info-card">
        <div className="detail-header">
          <h1>
            {
              session.session_name
            }
          </h1>

          {session.session_status ===
            "UPCOMING" &&
            !editMode && (
              <Button
                type="primary"
                icon={
                  <EditOutlined />
                }
                onClick={() =>
                  setEditMode(
                    true
                  )
                }
              >
                Chỉnh sửa
              </Button>
            )}
        </div>

        {!editMode ? (
          <div className="info-grid">
            <p>
              <b>
                Đề:
              </b>{" "}
              {
                session.template_name
              }
            </p>

            <p>
              <b>
                Bắt đầu:
              </b>{" "}
              {
                session.start_time
              }
            </p>

            <p>
              <b>
                Kết thúc:
              </b>{" "}
              {
                session.end_time
              }
            </p>

            <p>
              <b>
                Thời lượng:
              </b>{" "}
              {
                session.duration
              }{" "}
              phút
            </p>

            <p>
              <b>
                Password:
              </b>{" "}
              {
                session.session_password
              }
            </p>
          </div>
        ) : (
          <div className="edit-form">

            <label>
                Tên kỳ thi
            </label>
            <Input
                value={
                editData.session_name
                }
                onChange={(e) =>
                setEditData({
                    ...editData,
                    session_name:
                    e.target.value
                })
                }
            />

            {/* ĐỀ THI */}
            <label>
                Đề thi
            </label>
            <Select
                value={
                editData.template_id
                }
                onChange={(value) =>
                setEditData({
                    ...editData,
                    template_id:
                    value
                })
                }
                options={templates.map(
                (t) => ({
                    value:
                    t.template_id,
                    label:
                    t.template_name
                })
                )}
            />

            {/* START */}
            <label>
                Thời gian bắt đầu
            </label>
            <DatePicker
                showTime
                style={{
                width: "100%"
                }}
                value={
                editData.start_time
                }
                onChange={(date) =>
                setEditData({
                    ...editData,
                    start_time:
                    date
                })
                }
            />

            {/* END */}
            <label>
                Thời gian kết thúc
            </label>
            <DatePicker
                showTime
                style={{
                width: "100%"
                }}
                value={
                editData.end_time
                }
                onChange={(date) =>
                setEditData({
                    ...editData,
                    end_time:
                    date
                })
                }
            />

            {/* DURATION */}
            <label>
                Thời lượng
                (phút)
            </label>
            <InputNumber
                min={1}
                style={{
                width: "100%"
                }}
                value={
                editData.duration
                }
                onChange={(
                value
                ) =>
                setEditData({
                    ...editData,
                    duration:
                    value
                })
                }
            />

            {/* PASSWORD */}
            <label>
                Password
            </label>
            <Input
                value={
                editData.session_password
                }
                onChange={(e) =>
                setEditData({
                    ...editData,
                    session_password:
                    e.target.value
                })
                }
            />

            {/* SWITCH */}
            <div className="switch-row">
                <span>
                Trộn câu hỏi
                </span>
                <Switch
                checked={
                    editData.shuffle_questions
                }
                onChange={(
                    checked
                ) =>
                    setEditData({
                    ...editData,
                    shuffle_questions:
                        checked
                    })
                }
                />
            </div>

            <div className="switch-row">
                <span>
                Cho xem đáp án
                </span>
                <Switch
                checked={
                    editData.allow_review
                }
                onChange={(
                    checked
                ) =>
                    setEditData({
                    ...editData,
                    allow_review:
                        checked
                    })
                }
                />
            </div>

            <div className="edit-actions">
                <Button
                onClick={() =>
                    setEditMode(
                    false
                    )
                }
                >
                Hủy
                </Button>

                <Button
                type="primary"
                onClick={
                    handleSave
                }
                >
                Lưu
                </Button>
            </div>

            </div>
        )}
      </Card>

      {/* STUDENT TABLE */}
      <Card
        title="Danh sách sinh viên"
        className="student-card"
      >
        <Table
          rowKey="student_id"
          columns={
            columns
          }
          dataSource={
            students
          }
        />
      </Card>
    </div>
  );
}

export default SessionDetail;