import { useEffect, useState } from "react";
import ExamLayout from "../../../components/ExamLayout";
import { examSubjectsMock } from "../../../mock/examSubjectMock";

function ExamBankSubject() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSubjects(examSubjectsMock);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ExamLayout
      subjects={subjects}
      loading={loading}
      currentTab="bank"
    />
  );
}

export default ExamBankSubject;