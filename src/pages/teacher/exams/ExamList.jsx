import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Card, Spin, Button, Tag} from "antd";
import { getTemplatesService } from "../../../services/templateService";
import "./ExamList.css";

function ExamList() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [examList, setExamList] = useState([]);
  useEffect(() => { fetchExams(); }, [subjectId]);
  const user = JSON.parse(localStorage.getItem("user"));
  const fetchExams = async () => {
      try {
        const res = await getTemplatesService({
          subjectId: Number(subjectId),
          createdBy: user.userId
        });
        setExamList(res.data || []);
      } catch (err) {
        console.log(
          "API lỗi -> dùng mock"
        );
      } finally {
        setLoading( false );
      }
    };

  const columns = [
    {
      title: "ID",
      dataIndex: "templateId",
      key: "templateId"
    },
    {
      title: "Tên đề mẫu",
      dataIndex: "templateName",
      key: "templateName"
    },
    {
      title: "Số câu hỏi",
      dataIndex: "numberOfQuestions",
      key: "numberOfQuestions"
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (value) =>
        value ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Ẩn</Tag>
        )
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
                `/teacher/exam/${subjectId}/${record.templateId}`
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
          rowKey="templateId"
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