import {
  Select,
  Input,
  Button,
  Upload
} from "antd";

import {
  UploadOutlined
} from "@ant-design/icons";

import {
  useNavigate
} from "react-router-dom";

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
  const navigate =
    useNavigate();

  return (
    <div className="question-form-page">
      <div className="form-top">
        <Button
          className="bt-back"
          onClick={() =>
            navigate(-1)
          }
        >
          ← Quay lại
        </Button>

        <Button
          className="bt-save"
          onClick={onSave}
        >
          Lưu
        </Button>
      </div>

      <div className="question-form-card">
        <h1>{title}</h1>

        {showSubject && (
          <>
            <div className="subject-row">
              <label className="question-form-label">
              Môn học
            </label>
             <Button
                className="bt-add-subject"

                onClick={() =>
                  setOpenSubjectModal(true)
                }
              >
                +
              </Button>
            </div>
            <Select
              className="question-select"
              popupClassName="custom-select-dropdown"
              style={{
                width:
                  "100%",
                marginBottom: 16
              }}
              value={
                formData.subject_id
              }
              onChange={(
                value
              ) =>
                setFormData({
                  ...formData,
                  subject_id:
                    value
                })
              }
              options={subjects.map(
                (s) => ({
                  value:
                    s.subject_id,
                  label:
                    s.subject_name
                })
              )}
            />

          </>
        )}

        {/* content */}
        <label className="question-form-label">
          Nội dung
        </label>

        <TextArea
          rows={4}
          value={
            formData.content
          }
          onChange={(e) =>
            setFormData({
              ...formData,
              content:
                e.target.value
            })
          }
        />

        {/* type */}
        <label className="question-form-label">
          Loại
        </label>

        <Select
          className="question-select"
          popupClassName="custom-select-dropdown"
          style={{
            width:
              "100%"
          }}
          value={
            formData.type
          }
          onChange={(
            value
          ) =>
            setFormData({
              ...formData,
              type:
                value
            })
          }
          options={[
            {
              value: 1,
              label: "Trắc nghiệm"
            },
            {
              value: 2,
              label: "Đúng/Sai"
            },
            {
              value: 3,
              label: "Nhiều đáp án"
            }
          ]}
        />

      {formData.type !== 2 && (
          <>
          <label className="question-form-label">
            Lựa chọn
          </label>
          {formData.answers.map(
            (ans, index) => (
              <div
                key={ans.id}
                className="answer-row"
              >
                <span className="answer-label">
                  {String.fromCharCode(
                    65 + index
                  )}.
                </span>

                <Input
                  className="answer-input"
                  value={ans.text}
                  onChange={(e) => {
                    const copy = [
                      ...formData.answers
                    ];

                    copy[index].text =
                      e.target.value;

                    setFormData({
                      ...formData,
                      answers: copy
                    });
                  }}
                />
              </div>
            )
          )}
          </>
        )}

        <label className="question-form-label">
          Độ khó
        </label>

        <Select
          className="question-select"
          popupClassName="custom-select-dropdown"
          style={{
            width: "100%"
          }}
          value={formData.difficulty_level}
          onChange={(value) =>
            setFormData({
              ...formData,
              difficulty_level: value
            })
          }
          options={[
            {
              value: "0",
              label: "Easy"
            },
            {
              value: "1",
              label: "Medium"
            },
            {
              value: "2",
              label: "Hard"
            }
          ]}
        />
        
        {/* correct */}
        <label className="question-form-label">
          Đáp án đúng
        </label>

        {formData.type === 3 ? (
          <Select
            className="question-select"
            popupClassName="custom-select-dropdown"
            mode="multiple"
            value={
              formData.correctAnswer
            }
            onChange={(
              value
            ) =>
              setFormData({
                ...formData,
                correctAnswer:
                  value
              })
            }
            options={formData.answers.map(
              (
                ans,
                index
              ) => ({
                value:
                  ans.id,
                label:
                  String.fromCharCode(
                    65 +
                      index
                  )
              })
            )}
          />
        ): formData.type === 2 ? (
          <Select
            className="question-select"
            popupClassName="custom-select-dropdown"
            value={formData.correctAnswer?.[0]}
            onChange={(value) =>
              setFormData({
                ...formData,
                correctAnswer: [value]
              })
            }
            options={[
              {
                value: 1,
                label: "Đúng"
              },
              {
                value: 2,
                label: "Sai"
              }
            ]}
          /> ) : (
          <Select
            className="question-select"
            popupClassName="custom-select-dropdown"
            value={
              formData
                .correctAnswer?.[0]
            }
            onChange={(
              value
            ) =>
              setFormData({
                ...formData,
                correctAnswer:
                  [
                    value
                  ]
              })
            }
            options={formData.answers.map(
              (
                ans,
                index
              ) => ({
                value:
                  ans.id,
                label:
                  String.fromCharCode(
                    65 +
                      index
                  )
              })
            )}
          />
        )}
      </div>
    </div>
  );
}

export default QuestionFormLayout;