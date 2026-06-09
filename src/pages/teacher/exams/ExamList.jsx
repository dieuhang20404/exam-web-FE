import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Card, Spin, Button, Tag, Space, Popconfirm, Tooltip, message} from "antd";
import { getTemplatesService } from "../../../services/templateService";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { deleteTemplateService } from "../../../services/templateService";
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

    const handleDeleteTemplate = async (templateId) => {
      try {
        await deleteTemplateService(templateId);
        message.success("Xóa mẫu đề thi thành công!");
        setExamList((prevExamList) => prevExamList.filter((item) => item.templateId !== templateId));
      } catch (err) {
        console.error("Lỗi khi xóa đề thi:", err);
        message.error("Xóa mẫu đề thi thất bại. Vui lòng thử lại!");
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
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          {/* 1. Nút Sửa - Chuyển hướng sang trang edit hoặc mở Modal */}
          <Tooltip title="Sửa đề thi">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: "#b58900" }} />} 
              onClick={() => {
                console.log("Dữ liệu đề cần sửa:", record);
                navigate(`/teacher/edit-exam/${record.templateId}`);
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa đề thi">
            <Popconfirm
              title="Xóa mẫu đề thi"
              description="Bạn có chắc chắn muốn xóa mẫu đề thi này không?"
              onConfirm={() => {
                console.log("ID đề cần xóa:", record.templateId);
                handleDeleteTemplate(record.templateId);
              }}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    },
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