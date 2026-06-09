import { Select, Input, Button, Upload } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons"; 
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
        orderIndex: index + 1
      }));

    let updatedCorrectAnswer = [];
    if (Array.isArray(formData.correctAnswer)) {
      updatedCorrectAnswer = formData.correctAnswer
        .map((favIndex) => {
          if (favIndex === indexToRemove) return null; 
          if (favIndex > indexToRemove) return favIndex - 1; 
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
              className="student-select"
              popupClassName="student-select-dropdown"
              style={{ width: "100%", marginBottom: 16 }}
              value={formData.subjectId}
              onChange={(value) => setFormData({ ...formData, subjectId: value })}
              options={(Array.isArray(subjects) ? subjects : subjects?.data || []).map((s) => ({
                value: s.subjectId,
                label: s.subjectName
              }))}
            />
          </>
        )}

        {showUpload && (
          <div className="upload-file-section" style={{ marginBottom: 20 }}>
            <Upload
              accept=".docx, .pdf" // Chỉ chấp nhận File Word hoặc PDF
              beforeUpload={(file) => {
                // Lưu trực tiếp file thô vào State của file cha
                setFormData(prev => ({ ...prev, fileUpload: file }));
                return false; // Chặn Ant Design tự động kích hoạt API upload riêng của họ
              }}
              maxCount={1} // Giới hạn chỉ nhận 1 file duy nhất
              fileList={formData.fileUpload ? [formData.fileUpload] : []}
              onRemove={() => {
                // Xóa file khỏi state nếu bấm nút xóa trên giao diện
                setFormData(prev => ({ ...prev, fileUpload: null }));
              }}
            >
              <Button 
                icon={<UploadOutlined />} 
                className="btn-upload-question"
                style={{
                  height: "40px",
                  borderRadius: "8px",
                  borderColor: "#ff8827",
                  color: "#ff8827",
                  fontWeight: "500"
                }}
              >
                Tải lên file đề thi (Word / PDF)
              </Button>
            </Upload>
            <span style={{ fontSize: "12px", color: "#8c8c8c", display: "block", marginTop: "4px" }}>
              * Hệ thống tự nhận diện câu hỏi từ nội dung đề và bảng đáp án (1.A, 2.B...) ở đáy trang.
            </span>
          </div>
        )}

        {/* Nội dung câu hỏi */}
        <label className="question-form-label">Nội dung</label>
        <TextArea
          rows={4}
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        />

        {/* Loại câu hỏi */}
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
            // Reset lại đáp án đúng về mảng rỗng khi chuyển đổi loại câu hỏi
            setFormData({ ...formData, qType: value, answers, correctAnswer: [] });
          }}
          options={[
            { value: "SINGLE_CHOICE", label: "Trắc nghiệm" },
            { value: "TRUE_FALSE", label: "Đúng/Sai" },
            { value: "MULTIPLE_CHOICE", label: "Nhiều đáp án" }
          ]}
        />

        {/* Khu vực hiển thị lựa chọn đáp án */}
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
              disabled={formData.qType === "TRUE_FALSE"} 
              onChange={(e) => {
                const copy = [...formData.answers];
                copy[index].content = e.target.value;
                setFormData({ ...formData, answers: copy });
              }}
            />

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

        {/* Độ khó - ĐÃ ĐỔI VALUE THÀNH SỐ NGUYÊN (1, 2, 3) */}
        <label className="question-form-label">Độ khó</label>
        <Select
          className="question-select"
          popupClassName="custom-select-dropdown"
          style={{ width: "100%", marginBottom: 16 }}
          value={formData.difficulty}
          onChange={(value) => setFormData({ ...formData, difficulty: value })}
          options={[
            { value: 1, label: "Dễ" },
            { value: 2, label: "Trung bình" },
            { value: 3, label: "Khó" }
          ]}
        />

        {/* Đáp án đúng - ĐỒNG BỘ ĐỊNH DẠNG INDEX */}
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
            // Lấy phần tử đầu tiên nếu có, nếu không thì null
            value={formData.correctAnswer && formData.correctAnswer.length > 0 ? formData.correctAnswer[0] : null}
            // Đưa value về dạng vị trí index 0 (Đúng) hoặc 1 (Sai) để đồng nhất logic với Trắc nghiệm
            onChange={(value) => setFormData({ ...formData, correctAnswer: [value] })}
            options={[
              { value: 0, label: "Đúng" },
              { value: 1, label: "Sai" }
            ]}
          />
        ) : (
          <Select
            className="question-select"
            popupClassName="custom-select-dropdown"
            style={{ width: "100%" }}
            value={formData.correctAnswer && formData.correctAnswer.length > 0 ? formData.correctAnswer[0] : null}
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