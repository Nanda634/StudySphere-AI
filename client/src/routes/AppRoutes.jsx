import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";

import StudentLayout from "../components/layout/StudentLayout";
// import FacultyLayout from "../layouts/FacultyLayout"; // Optional

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
import Profile from "../pages/student/Profile";
import Progress from "../pages/student/Progress";
import Settings from "../pages/student/Settings";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<Landing />} />

      {/* Auth */}
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/student/register" element={<StudentRegister />} />
      <Route path="/faculty/login" element={<FacultyLogin />} />
      <Route path="/faculty/register" element={<FacultyRegister />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Student Area */}
      <Route
        path="/student"
        element={
          <ProtectedRoute>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="assistant" element={<AIAssistant />} />
        <Route path="planner" element={<Planner />} />
        <Route path="pomodoro" element={<Pomodoro />} />
        <Route path="cgpa" element={<Cgpa />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="courses" element={<Courses />} />
        <Route path="exam-paper" element={<ExamPaperGenerator />} />
        <Route path="coins" element={<Coins />} />
        <Route path="mock-exams" element={<MockExams />} />
        <Route path="assigned-quizzes" element={<AssignedQuizzes />} />
        <Route path="scores" element={<Scores />} />
        <Route path="profile" element={<Profile />} />
        <Route path="progress" element={<Progress />} />
        <Route path="settings" element={<Settings />} />
        
      </Route>

      {/* Faculty Area */}
      <Route
        path="/faculty"
        element={
          <ProtectedRoute>
            {/* Replace with <FacultyLayout /> if you have one */}
            <React.Fragment />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<FacultyDashboard />} />
        <Route path="materials" element={<Materials />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>

      {/* Shared */}
      <Route
        path="/live-classes"
        element={
          <ProtectedRoute>
            <LiveClasses />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}