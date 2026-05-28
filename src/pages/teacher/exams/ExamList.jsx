import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Card, Spin, Button } from "antd";
import { getExamList } from "../../../api/api";
import { mockExam } from "../../../mock/examDetailMock";
import "./ExamList.css";

function ExamList() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [examList, setExamList] = useState([]);
  useEffect(() => { fetchExams(); }, [subjectId]);

  const fetchExams =
    async () => {
      try {
        const res = await getExamList(subjectId);
        setExamList(res.data);
      } catch (err) {
        console.log(
          "API lỗi -> dùng mock"
        );

        setExamList( mockExam[ Number( subjectId ) ] || [] );
      } finally {
        setLoading( false );
      }
    };

  const columns = [
    {
      title:
        "Tên đề thi",

      dataIndex:
        "title",

      key:
        "title"
    },

    {
      title:
        "Số câu",

      key:
        "total_questions",

      render:
        (_, record) => record.total_questions ||record.questions?.length
    },

    {
      title:
        "Ngày tạo",

      dataIndex:
        "created_at",

      key:
        "created_at"
    },

    {
      title:
        "Tác giả",

      dataIndex:
        "author",

      key:
        "author"
    },

    {
      title:
        "Chi tiết",

      render:
        (_, record) => (
          <Button
            type="link"
            onClick={() =>
              navigate(
                `/teacher/exam/${subjectId}/${record.exam_id}`
              )
            }
          >
            Xem
          </Button>
        )
    }
  ];

  if (loading) {
    return (
      <div className="exam-list-loading">
        <Spin
          size="large"
        />
      </div>
    );
  }

  return (
    <div className="exam-list-page">
      <Button
        className="bt-back"
        onClick={() =>
          navigate(-1)
        }
      >
        ← Quay lại
      </Button>

      <Card className="exam-list-card">
        <h1>
          Danh sách đề thi
        </h1>

        <Table
          rowKey="exam_id"
          columns={
            columns
          }
          dataSource={
            examList
          }
          pagination={{
            pageSize: 5
          }}
        />
      </Card>
    </div>
  );
}

export default ExamList;