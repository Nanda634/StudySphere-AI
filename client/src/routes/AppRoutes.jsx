import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";

import Landing from "../pages/Landing";
import StudentLogin from "../pages/auth/StudentLogin";
import StudentRegister from "../pages/auth/StudentRegister";
import FacultyLogin from "../pages/auth/FacultyLogin";
import FacultyRegister from "../pages/auth/FacultyRegister";
import ForgotPassword from "../pages/auth/ForgotPassword";

import Dashboard from "../pages/student/Dashboard";
import AIAssistant from "../pages/student/AIAssistant";
import Planner from "../pages/student/Planner";
import Pomodoro from "../pages/student/Pomodoro";
import Cgpa from "../pages/student/Cgpa";
import Attendance from "../pages/student/Attendance";
import Courses from "../pages/student/Courses";
import ExamPaperGenerator from "../pages/student/ExamPaperGenerator";
import Coins from "../pages/student/Coins";
import MockExams from "../pages/student/MockExams";
import AssignedQuizzes from "../pages/student/AssignedQuizzes";
import Scores from "../pages/student/Scores";

import FacultyDashboard from "../pages/faculty/FacultyDashboard";
import Materials from "../pages/faculty/Materials";
import Assignments from "../pages/faculty/Assignments";
import LiveClasses from "../pages/faculty/LiveClasses";
import Analytics from "../pages/faculty/Analytics";

import NotFound from "../pages/errors/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* Auth */}
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/student/register" element={<StudentRegister />} />
      <Route path="/faculty/login" element={<FacultyLogin />} />
      <Route path="/faculty/register" element={<FacultyRegister />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Student area */}
      <Route path="/student/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/student/assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
      <Route path="/student/planner" element={<ProtectedRoute><Planner /></ProtectedRoute>} />
      <Route path="/student/pomodoro" element={<ProtectedRoute><Pomodoro /></ProtectedRoute>} />
      <Route path="/student/cgpa" element={<ProtectedRoute><Cgpa /></ProtectedRoute>} />
      <Route path="/student/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
      <Route path="/student/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
      <Route path="/student/exam-paper" element={<ProtectedRoute><ExamPaperGenerator /></ProtectedRoute>} />
      <Route path="/student/coins" element={<ProtectedRoute><Coins /></ProtectedRoute>} />
      <Route path="/student/mock-exams" element={<ProtectedRoute><MockExams /></ProtectedRoute>} />
      <Route path="/student/assigned-quizzes" element={<ProtectedRoute><AssignedQuizzes /></ProtectedRoute>} />
      <Route path="/student/scores" element={<ProtectedRoute><Scores /></ProtectedRoute>} />

      {/* Faculty area */}
      <Route path="/faculty/dashboard" element={<ProtectedRoute><FacultyDashboard /></ProtectedRoute>} />
      <Route path="/faculty/materials" element={<ProtectedRoute><Materials /></ProtectedRoute>} />
      <Route path="/faculty/assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
      <Route path="/faculty/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />

      {/* Shared (both roles) */}
      <Route path="/live-classes" element={<ProtectedRoute><LiveClasses /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
