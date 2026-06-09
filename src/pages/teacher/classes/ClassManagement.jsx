
import { useEffect, useState } from "react";
import { Card, Col, Row, Spin, Empty, Button, Modal, Input, message, Dropdown } from "antd";
import { useNavigate } from "react-router-dom";
import "./ClassManagement.css";
import { mockClasse } from "../../../mock/classMock";
import { MoreOutlined, SearchOutlined } from "@ant-design/icons";
import { createClasses, searchClassesService, newClassNames } from "../../../services/classService";

function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [editClassName, setEditClassName] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);
  
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => { 
    fetchClasses();
  }, [searchText, currentPage]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await searchClassesService(
        user.userId,
        user.role,
        currentPage,
        10,
        searchText
      );
      setClasses(data || []);
    } catch (err) {
      setClasses(mockClasse);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    if (!newClassName.trim()) {
      message.warning("Vui lòng nhập tên lớp");
      return;
    }
    try {
      const newClass = await createClasses(user.userId, newClassName);
      setClasses([...classes, newClass]);
      message.success("Tạo lớp thành công");
      setOpenCreateModal(false);
      setNewClassName("");
    } catch (err) {
      console.log(err);
      message.error("Tạo lớp thất bại");
    }
  };

  // 🔥 Đã sửa: Chuẩn hóa lại toàn bộ biến để khớp hoàn toàn với cấu trúc data hiển thị
  const handleUpdateClassName = async () => {
    if (!editClassName.trim()) {
      message.warning("Tên lớp không được để trống!");
      return;
    }
    try {
      await newClassNames(selectedClassId, editClassName.trim());
      
      // Đồng bộ hóa tên mới dựa vào cả 2 trường hợp (đề phòng BE trả về camelCase hoặc snake_case)
      const updatedClasses = classes.map((item) => {
        const currentId = item.classId || item.class_id;
        if (Number(currentId) === Number(selectedClassId)) {
          return {
            ...item,
            className: editClassName.trim(),   // Cập nhật cho giao diện camelCase
            class_name: editClassName.trim()   // Cập nhật cho giao diện đề phòng snake_case
          };
        }
        return item;
      });

      setClasses(updatedClasses);
      message.success("Cập nhật tên lớp thành công");
      setOpenEditModal(false); // 🔥 Thêm: Tự động đóng modal sau khi lưu thành công
      setEditClassName("");
      setSelectedClassId(null);
    } catch (err) {
      console.log(err);
      message.error("Cập nhật tên lớp thất bại");
    }
  };

  return (
    <div className="class-container">
      <Button 
        className="bt-new-class"
        onClick={() => setOpenCreateModal(true)}
      > 
        Thêm lớp học mới 
      </Button>

      <Input
        className="student-search"
        prefix={<SearchOutlined />}
        placeholder="Tìm theo tên lớp"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      
      {loading ? (
        <div className="loading">
          <Spin size="large" />
        </div>
      ) : classes.length === 0 ? (
        <Empty description="Chưa có lớp nào" />
      ) : (
        <Row gutter={[16, 16]}>
          {classes.map((item) => {
            // Phòng hờ linh hoạt giữa hai cách trả dữ liệu classId của Backend
            const currentClassId = item.classId || item.class_id;
            const currentClassName = item.className || item.class_name;

            return (
              <Col span={8} key={currentClassId}>
                <Card
                  className="class-card"
                  onClick={() => navigate(`/teacher/class/${currentClassId}`)}
                >
                  {/* top */}
                  <div className="card-header">
                    {/* class name */}
                    <h2 className="class-name">
                      {currentClassName}
                    </h2>
                    <Dropdown
                      menu={{
                        className: "class-dropdown-menu",
                        items: [
                          {
                            key: "edit-name",
                            label: "Sửa tên lớp",
                            onClick: (e) => {
                              e.domEvent.stopPropagation(); // Ngăn chặn sự kiện click thẻ Card bay vào trang chi tiết
                              setSelectedClassId(currentClassId);
                              setEditClassName(currentClassName); // 🔥 Thêm: Đưa sẵn tên lớp cũ vào ô Input sửa
                              setOpenEditModal(true);
                            }
                          }
                        ]
                      }}
                      trigger={["click"]}
                    >
                      <MoreOutlined
                        className="more-icon"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Dropdown>
                    
                  </div>

                  {/* class code */}
                  <p className="class-code">
                    MÃ LỚP: {currentClassId}
                  </p>

                  

                  {/* student */}
                  <p className="student-count">
                    👨‍🎓 {item.numberOfStudents || 0} học sinh
                  </p>

                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* MODAL TẠO LỚP MỚI */}
      <Modal
        className="create-class-modal"
        title="Tạo lớp học mới"
        open={openCreateModal}
        onCancel={() => setOpenCreateModal(false)}
        onOk={handleCreateClass}
        okText="Tạo"
        cancelText="Hủy"
      >
        <div className="create-form">
          <label>Tên lớp</label>
          <Input
            placeholder="Nhập tên lớp..."
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
          />
        </div>
      </Modal>

      {/* MODAL CẬP NHẬT TÊN LỚP */}
      <Modal
        title="Cập nhật tên lớp"
        open={openEditModal}
        onCancel={() => {
          setOpenEditModal(false);
          setEditClassName("");
          setSelectedClassId(null);
        }}
        onOk={handleUpdateClassName} // 🔥 Không cần truyền tham số thủ công nữa vì đã dùng State dùng chung
        okText="Lưu"
        cancelText="Hủy"
      >
        <div style={{ paddingTop: "10px" }}>
          <label style={{ display: "block", marginBottom: "6px" }}>Tên lớp mới:</label>
          <Input
            value={editClassName}
            onChange={(e) => setEditClassName(e.target.value)}
            placeholder="Nhập tên lớp mới"
          />
        </div>
      </Modal>
    </div>
  );
}

export default ClassManagement;
