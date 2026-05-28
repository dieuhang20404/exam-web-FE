import { Card, Table, Tag, Button } from "antd";

import { useNavigate } from "react-router-dom";

function ExamTable({ exams, classId }) {

  const navigate =
    useNavigate();

  const columns = [

    {
      title: "Tên kỳ thi",

      dataIndex: "title",

      key: "title"
    },

    {
      title: "Số câu",

      dataIndex: "total_questions",

      key: "total_questions",

      width: 120
    },

    {
      title: "Thời gian",

      dataIndex: "duration",

      key: "duration",

      width: 120,

      render: (duration) =>
        `${duration} phút`
    },

    {
      title: "Ngày tạo",

      dataIndex: "created_at",

      key: "created_at",

      width: 150
    },

    {
      title: "Trạng thái",

      dataIndex: "status",

      key: "status",

      width: 140,

      render: (status) => {

        return status === 1 ? (

          <Tag color="green">
            Đang mở
          </Tag>

        ) : (

          <Tag color="red">
            Đã kết thúc
          </Tag>
        );
      }
    },

    {
      title: "Chi tiết",

      key: "action",

      width: 140,

      render: (_, record) => (

        <Button
          type="link"

          onClick={() =>
            navigate(
              `/teacher/exam-session/${record.session_id}`
            )
          }
        >
          Xem chi tiết
        </Button>
      )
    }
  ];

  return (

    <Card className="exam-table-card">

      <Table
        dataSource={exams}

        columns={columns}

        rowKey="session_id"

        pagination={{
          pageSize: 5
        }}
      />

    </Card>
  );
}

export default ExamTable;