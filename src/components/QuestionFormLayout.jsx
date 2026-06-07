import { Select, Input, Button, Upload } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons"; // Thêm DeleteOutlined
import { useNavigate } from "react-router-dom";
import "./QuestionFormLayout.css";

const { TextArea } = Input;

function QuestionFormLayout({
  title,
  formData,
  setFormData,
  onSave,
  subjects = [],
  showUpload = true,
  showSubject = true
}) {
  const navigate = useNavigate();

  const handleRemoveAnswer = (indexToRemove) => {
    if (formData.answers.length <= 1) return;
    const updatedAnswers = formData.answers
      .filter((_, index) => index !== indexToRemove)
      .map((ans, index) => ({
        ...ans,
        orderIndex: index + 1 // Đánh số lại thứ tự 1, 2, 3...
      }));

    let updatedCorrectAnswer = [];
    if (Array.isArray(formData.correctAnswer)) {
      updatedCorrectAnswer = formData.correctAnswer
        .map((favIndex) => {
          if (favIndex === indexToRemove) return null; // Đáp án đúng vừa bị xóa
          if (favIndex > indexToRemove) return favIndex - 1; // Dịch chỉ số lùi lại 1 đơn vị
          return favIndex;
        })
        .filter((val) => val !== null);
    }

    setFormData({
      ...formData,
      answers: updatedAnswers,
      correctAnswer: updatedCorrectAnswer
    });
  };

  return (
    <div className="question-form-page">
      <div className="form-top">
        <Button className="bt-back" onClick={() => navigate(-1)}>
          ← Quay lại
        </Button>

        <Button className="bt-save" onClick={onSave}>
          Lưu
        </Button>
      </div>

      <div className="question-form-card">
        <h1>{title}</h1>

        {showSubject && (
          <>
            <div className="subject-row">
              <label className="question-form-label">Môn học</label>
            </div>
            <Select
              className="question-select"
              popupClassName="custom-select-dropdown"
              style={{ width: "100%", marginBottom: 16 }}
              value={formData.subjectId}
              onChange={(value) => setFormData({ ...formData, subjectId: value })}
              options={subjects.map((s) => ({
                value: s.subjectId,
                label: s.subjectName
              }))}
            />
          </>
        )}

        {/* content */}
        <label className="question-form-label">Nội dung</label>
        <TextArea
          rows={4}
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        />

        {/* type */}
        <label className="question-form-label">Loại</label>
        <Select
          className="question-select"
          popupClassName="custom-select-dropdown"
          style={{ width: "100%" }}
          value={formData.qType}
          onChange={(value) => {
            let answers = [];
            if (value === "TRUE_FALSE") {
              answers = [
                { isCorrect: false, content: "Đúng", orderIndex: 1 },
                { isCorrect: false, content: "Sai", orderIndex: 2 }
              ];
            } else {
              answers = [
                { isCorrect: false, content: "", orderIndex: 1 }
              ];
            }
            setFormData({ ...formData, qType: value, answers, correctAnswer: [] });
          }}
          options={[
            { value: "SINGLE_CHOICE", label: "Trắc nghiệm" },
            { value: "TRUE_FALSE", label: "Đúng/Sai" },
            { value: "MULTIPLE_CHOICE", label: "Nhiều đáp án" }
          ]}
        />

        {/* Khu vực hiển thị Lựa chọn câu trả lời */}
        {/* Khu vực hiển thị Lựa chọn câu trả lời */}
        <label className="question-form-label" style={{ marginTop: 16, display: 'block' }}>
          Lựa chọn đáp án
        </label>

        {formData.answers.map((ans, index) => (
          <div key={index} className="answer-row" style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <span className="answer-label" style={{ marginRight: 8, fontWeight: 'bold' }}>
              {String.fromCharCode(65 + index)}.
            </span>

            <Input
              className="answer-input"
              style={{ flex: 1 }}
              value={ans.content}
              // Khóa không cho sửa chữ "Đúng"/"Sai" nếu bạn muốn cố định, hoặc bỏ "disabled" nếu muốn cho sửa text
              disabled={formData.qType === "TRUE_FALSE"} 
              onChange={(e) => {
                const copy = [...formData.answers];
                copy[index].content = e.target.value;
                setFormData({ ...formData, answers: copy });
              }}
            />

            {/* CHỈ HIỂN THỊ NÚT XÓA KHI KHÔNG PHẢI LÀ ĐÚNG/SAI VÀ CÒN TRÊN 1 ĐÁP ÁN */}
            {formData.qType !== "TRUE_FALSE" && formData.answers.length > 1 && (
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                style={{ marginLeft: 8 }}
                onClick={() => handleRemoveAnswer(index)}
              />
            )}
          </div>
        ))}

        {/* CHỈ HIỂN THỊ NÚT THÊM ĐÁP ÁN KHI KHÔNG PHẢI LÀ ĐÚNG/SAI */}
        {formData.qType !== "TRUE_FALSE" && (
          <Button
            type="dashed"
            block
            style={{ marginTop: 8, marginBottom: 16 }}
            onClick={() => {
              setFormData({
                ...formData,
                answers: [
                  ...formData.answers,
                  {
                    isCorrect: false,
                    content: "",
                    orderIndex: formData.answers.length + 1
                  }
                ]
              });
            }}
          >
            + Thêm đáp án
          </Button>
        )}

        {/* Độ khó */}
        <label className="question-form-label">Độ khó</label>
        <Select
          className="question-select"
          popupClassName="custom-select-dropdown"
          style={{ width: "100%", marginBottom: 16 }}
          value={formData.difficulty}
          onChange={(value) => setFormData({ ...formData, difficulty: value })}
          options={[
            { value: "EASY", label: "Easy" },
            { value: "MEDIUM", label: "Medium" },
            { value: "HARD", label: "Hard" }
          ]}
        />

        {/* Đáp án đúng */}
        <label className="question-form-label">Đáp án đúng</label>

        {formData.qType === "MULTIPLE_CHOICE" ? (
          <Select
            className="question-select"
            popupClassName="custom-select-dropdown"
            mode="multiple"
            style={{ width: "100%" }}
            value={formData.correctAnswer}
            onChange={(value) => setFormData({ ...formData, correctAnswer: value })}
            options={formData.answers.map((ans, index) => ({
              value: index,
              label: String.fromCharCode(65 + index)
            }))}
          />
        ) : formData.qType === "TRUE_FALSE" ? (
          <Select
            className="question-select"
            popupClassName="custom-select-dropdown"
            style={{ width: "100%" }}
            value={formData.correctAnswer?.[0]}
            onChange={(value) => setFormData({ ...formData, correctAnswer: [value] })}
            options={[
              { value: "TRUE", label: "Đúng" },
              { value: "FALSE", label: "Sai" }
            ]}
          />
        ) : (
          <Select
            className="question-select"
            popupClassName="custom-select-dropdown"
            style={{ width: "100%" }}
            value={formData.correctAnswer?.[0]}
            onChange={(value) => setFormData({ ...formData, correctAnswer: [value] })}
            options={formData.answers.map((ans, index) => ({
              value: index,
              label: String.fromCharCode(65 + index)
            }))}
          />
        )}
      </div>
    </div>
  );
}

export default QuestionFormLayout;