import { useEffect, useState } from "react";
import SubjectBankLayout from "../../../components/SubjectLayout";
import { fetchQuestionSubjectsService } from "../../../services/questionService";

function SubjectQuestionBank() {
  const [subjects, setSubjects] =useState([]);
  const [loading, setLoading] =useState(false);
  useEffect(() => {fetchSubjects();}, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const data = await fetchQuestionSubjectsService();
      setSubjects(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SubjectBankLayout
      subjects={subjects}
      loading={loading}
      currentTab="bank"
    />
  );
}

export default SubjectQuestionBank;