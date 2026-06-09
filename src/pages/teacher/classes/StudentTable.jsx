import { useState } from "react";
import { Card, Table, Input, Button, Modal, message } from "antd";
import { SearchOutlined, DeleteOutlined } from "@ant-design/icons";
import AddStudentModal from "./AddStudentModal";
import { removeStudentService } from "../../../services/classService";

function StudentTable({ students = [], classId, onReload }) {
  const [searchText, setSearchText] = useState("");
  const [openModal, setOpenModal] = useState(false);

  // Bộ lọc tìm kiếm sinh viên an toàn (phòng tránh lỗi null/undefined chuỗi)
  const filteredStudents = students.filter((student) => {
    const name = student.fullName || student.full_name || "";
    const email = student.email || "";
    return (
      name.toLowerCase().includes(searchText.toLowerCase()) ||
      email.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const handleDeleteStudent = (studentId) => {
    // 🛡️ Ép kiểu số an toàn phòng hờ Backend từ chối String
    const numericClassId = Number(classId);
    const numericStudentId = Number(studentId);

    if (isNaN(numericClassId) || isNaN(numericStudentId)) {
      return message.error("Mã lớp hoặc mã sinh viên không hợp lệ để xóa!");
    }

    Modal.confirm({
      title: "Xóa sinh viên khỏi lớp?",
      content: "Sinh viên sẽ bị xóa khỏi lớp học này.",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await removeStudentService(numericClassId, numericStudentId);
          
          message.success("Đã xóa sinh viên khỏi lớp học thành công");
          onReload?.(); 
        } catch (err) {
          console.error("Lỗi xóa sinh viên:", err);
          message.error("Xóa sinh viên thất bại! Vui lòng thử lại.");
        }
      }
    });
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "userId", 
      key: "userId",
      render: (text, record) => record.userId || record.user_id || record.student_id || text
    },
    {
      title: "Tên",
      dataIndex: "fullName",
      key: "fullName",
      render: (text, record) => record.fullName || record.full_name || text
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email"
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      render: (_, record) => {
        const currentStudentId = record.userId || record.user_id || record.student_id;
        
        return (
          <Button
            danger
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteStudent(currentStudentId)}
          >
            Xóa
          </Button>
        );
      }
    }
  ];

  return (
    <>
      <Card className="student-table-card">
        <div className="table-toolbar" style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
          <Input
            className="student-search"
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên hoặc email..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button
            type="primary"
            className="bt-add-student"
            onClick={() => setOpenModal(true)}
          >
            + Thêm sinh viên
          </Button>
        </div>

        <Table
          dataSource={filteredStudents}
          columns={columns}
          rowKey={(record) => String(record.userId || record.user_id || record.student_id)}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <AddStudentModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        classId={classId}
        onSuccess={onReload}
      />
    </>
  );
}

export default StudentTable;