// examDetailMock.js
export const mockExam = {
  1: [
    {
      exam_id: 1,
      title: "Đề Java OOP",
      subject_name: "Lập trình Java",
      duration: 45,
      total_questions: 2,
      questions: [
        {
          question_id: 1,
          content: "Java là gì?",
          difficulty: "Easy",
          answers: [
            {
              content: "Ngôn ngữ lập trình",
              is_correct: true
            },
            {
              content: "Hệ điều hành",
              is_correct: false
            }
          ]
        }
      ]
    },

    {
      exam_id: 2,
      title: "Đề Java Spring",
      subject_name: "Lập trình Java",
      duration: 60,
      total_questions: 3,
      questions: []
    }
  ],

  2: [
    {
      exam_id: 1,
      title: "Đề ReactJS",
      subject_name: "Frontend",
      duration: 30,
      total_questions: 5,
      questions: []
    }
  ]
};