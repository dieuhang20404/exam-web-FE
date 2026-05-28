import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from '../pages/Login.jsx';
import DashboardLayout from '../pages/DashboardLayout.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import Dashboard_tea from "../pages/teacher/Dashboard.jsx";
import Dashboard_stu from "../pages/student/Dashboard.jsx"
import ClassManagement from "../pages/teacher/classes/ClassManagement.jsx"
import ClassDetail from "../pages/teacher/classes/ClassDetail.jsx"
import QuestionBankSubject from "../pages/teacher/questions/QuestionBankSubject.jsx";
import QuestionList from "../pages/teacher/questions/QuestionList.jsx";
import ExamBankSubject from "../pages/teacher/exams/ExamBankSubject.jsx";
import QuestionForMe from "../pages/teacher/questions/QuestionForMe.jsx";
import ExamForMe from "../pages/teacher/exams/ExamForMe.jsx";
import SessionList from "../pages/teacher/sessions/SessionList.jsx";
import CreateSession from "../pages/teacher/sessions/CreateSession.jsx";
import SessionDetail from "../pages/teacher/sessions/SessionDetail.jsx";
import CreateQuestion from "../pages/teacher/questions/CreateQuestion.jsx";
import EditQuestion from "../pages/teacher/questions/EditQuestion.jsx"
import ExamDetail from "../pages/teacher/exams/ExamDetail.jsx";
import ExamList from "../pages/teacher/exams/ExamList.jsx";
import MyExamList from "../pages/teacher/exams/ExamList.jsx"
import CreateExam from "../pages/teacher/exams/CreateExam.jsx";


export default function AppRoutes(){
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />

                <Route
                    path="/teacher"
                    element={
                        <ProtectedRoute allowedRoles={['teacher']}>
                        <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<div>Dashboard Page</div>} />
                    <Route path="dashboard"  element={<Dashboard_tea />} />
                    <Route path="classManagement" element={<ClassManagement />} />
                    <Route path="class/:id" element={<ClassDetail />} />
                    <Route path="questionBankSubject" element={<QuestionBankSubject />} />
                    <Route path="question/:subjectId" element={<QuestionList />} />
                    <Route path="my-question/:subjectId" element={<QuestionList />} />
                    <Route path="questionForMe" element={<QuestionForMe />} />
                    <Route path="examBankSubject" element={<ExamBankSubject />} />
                    <Route path="examForMe" element={<ExamForMe />} />
                    <Route path="sessionList" element={<SessionList />} />
                    <Route path="createSession" element={<CreateSession />} />
                    <Route path="session/:id" element={<SessionDetail />} />
                    <Route path="createQuestion" element={<CreateQuestion />} />
                    <Route path="edit-question/:id" element={<EditQuestion />} />
                    <Route path="exam/:subjectId/:examId" element={<ExamDetail />} />
                    <Route path="my-exam/:subjectId/:examId" element={<ExamDetail />} />
                    <Route path="my-exam/:subjectId" element={<MyExamList />} />
                    <Route path="exam/:subjectId" element={<ExamList />} />
                    <Route path="createExam" element={<CreateExam />} />
                    

            


                    
                </Route>

                <Route
                    path="/student"
                    element={
                        <ProtectedRoute allowedRoles={['student']}>
                        <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    
                    <Route path="dashboard" element={<div>Dashboard Page</div>} />
                </Route>
                
            </Routes>
        </BrowserRouter>
    );
}