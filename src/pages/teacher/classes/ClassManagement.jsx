import { useEffect, useState } from "react";
import { Card, Col, Row, Spin, Empty, Button, Modal, Input, Upload, message, Dropdown } from "antd";
import { useNavigate } from "react-router-dom";
import { getMyClasses, deleteClass } from "../../../api/api";
import "./ClassManagement.css";
import { mockClasse } from "../../../mock/classMock";
import { UploadOutlined, MoreOutlined } from "@ant-design/icons";
import readXlsxFile from "read-excel-file/web-worker";
import { createClasses, getMyClassesService, searchClassesService } from "../../../services/classService";
import { SearchOutlined } from "@ant-design/icons";

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

  useEffect(() => { fetchClasses();}, [searchText, currentPage]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data =
        await searchClassesService(
          user.userId,
          user.role,
          currentPage,
          10,
          searchText
        );
      setClasses(data);
    } catch (err) {
      setClasses(mockClasse);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
      if (!newClassName.trim()) {
        message.warning("Nhập tên lớp");
        return;
      }
      try {
        const newClass = await createClasses( user.userId, newClassName);
        setClasses([...classes, newClass]);
        message.success("Tạo lớp thành công");
        setOpenCreateModal(false);
        setNewClassName("");
      } catch (err) {
        console.log(err);
        message.error(
          "Tạo lớp thất bại"
        );
      }
  };

  const handleUpdateClassName = async (classId, newClassName) => {
      try {
        await updateClass(classId, newClassName);
        const updatedClasses = classes.map((item) => {
              if (item.class_id === classId) {
                return {
                  ...item,
                  class_name: newClassName
                };
              }
              return item;
            }
          );
        setClasses(updatedClasses);
        message.success("Cập nhật tên lớp thành công");
      } catch (err) {
        console.log(err);
        message.error(
          "Cập nhật tên lớp thất bại"
        );
      }
  };

  return (
    <div className="class-container">
      <Button 
        className="bt-new-class"
        onClick={() => setOpenCreateModal(true)}
      > Thêm lớp học mới </Button>

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
          {classes.map((item) => (
              <Col span={8} key={item.class_id}>
                <Card
                  className="class-card"
                  onClick={() =>
                    navigate(
                      `/teacher/class/${item.class_id}`
                    )
                  }
                >
                  {/* top */}
                  <div className="card-header">
                    <div className="class-icon">
                      📘
                    </div>

                    <Dropdown
                      menu={{
                         className: "class-dropdown-menu",
                        items: [
                          {
                            key: "delete",
                            label: "Sửa tên lớp",
                            danger: true,
                            onClick: (e) => {
                              e.domEvent.stopPropagation();
                              setSelectedClassId(item.class_Id);
                              setOpenEditModal(true);
                            }
                          }
                        ]
                      }}
                      trigger={["click"]}
                    >
                      <MoreOutlined
                        className="more-icon"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      />
                    </Dropdown>
                  </div>

                  {/* class code */}
                  <p className="class-code">
                    MÃ LỚP: {item.class_id}
                  </p>

                  {/* class name */}
                  <h2 className="class-name">
                    {item.class_name}
                  </h2>

                  {/* student */}
                  <p className="student-count">
                    👨‍🎓 {item.total_students} học sinh
                  </p>

                </Card>
              </Col>
            ))}
        </Row>
      )}
      <Modal
        className="create-class-modal"
        title="Tạo lớp học mới"
        open={openCreateModal}
        onCancel={() =>
          setOpenCreateModal(
            false
          )
        }
        onOk={
          handleCreateClass
        }
        okText="Tạo"
        cancelText="Hủy"
      >
        <div className="create-form">
          <label>
            Tên lớp
          </label>

          <Input
            placeholder="Nhập tên lớp..."
            value={
              newClassName
            }
            onChange={(
              e
            ) =>
              setNewClassName(
                e.target.value
              )
            }
          />
        </div>
      </Modal>
      <Modal
        title="Cập nhật tên lớp"
        open={openEditModal}
        onCancel={() =>
          setOpenEditModal(false)
        }
        onOk={() => handleUpdateClassName(selectedClassId, editClassName)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Input
          value={editClassName}
          onChange={(e) => setEditClassName(e.target.value)}
          placeholder="Nhập tên lớp mới"
        />
      </Modal>
    </div>
  );
}

export default ClassManagement;