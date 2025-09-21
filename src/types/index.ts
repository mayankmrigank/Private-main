// Core types for Smart Attendance Management System

export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  admissionNumber?: string; // for students
  employeeId?: string; // for teachers
  department: string;
  institution: string;
  createdAt: string;
}

export interface Student extends User {
  role: 'student';
  admissionNumber: string;
  batch: string;
  section: string;
  interests?: string[];
  strengths?: string[];
  careerGoals?: string[];
  attendancePercentage: number;
}

export interface Teacher extends User {
  role: 'teacher';
  employeeId: string;
  subjects: string[];
  classes: string[];
}

export interface ClassSession {
  id: string;
  courseCode: string;
  courseName: string;
  teacherId: string;
  teacherName: string;
  startTime: string;
  endTime: string;
  room: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  qrCode?: string;
  qrExpiry?: string;
  attendees?: string[];
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  timestamp: string;
  method: 'qr' | 'manual';
  status: 'present' | 'absent' | 'late';
}

export interface DailyRoutine {
  id: string;
  studentId: string;
  date: string;
  tasks: Task[];
  classes: ClassSession[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: 'assignment' | 'study' | 'career' | 'personal';
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  dueDate?: string;
  suggestedBy?: 'ai' | 'teacher' | 'student';
}

export interface QRSession {
  id: string;
  sessionId: string;
  qrCode: string;
  expiryTime: string;
  isActive: boolean;
}

export interface AttendanceStats {
  totalSessions: number;
  attendedSessions: number;
  percentage: number;
  streak: number;
  monthlyData: { month: string; percentage: number }[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
}