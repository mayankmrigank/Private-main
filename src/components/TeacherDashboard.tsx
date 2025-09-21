import React, { useState, useRef, useEffect } from 'react';
// Enhanced analytics charts
const AnalyticsBarChart: React.FC<{ data: number[]; labels: string[] }> = ({ data, labels }) => {
  const max = 100;
  return (
    <div className="w-full">
      <div className="flex justify-between mb-2 text-xs text-muted-foreground">
        {labels.map((label, i) => (
          <span key={label} className="w-12 text-center">{label}</span>
        ))}
      </div>
      <div className="flex items-end h-32 space-x-2">
        {data.map((value, i) => (
          <div key={i} className="flex flex-col items-center w-12">
            <div
              className="bg-blue-500 rounded-t shadow"
              style={{ height: `${(value / max) * 100}%`, width: '100%' }}
              title={`${value}%`}
            ></div>
            <span className="text-xs mt-1">{value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AnalyticsLineChart: React.FC<{ data: number[]; labels: string[] }> = ({ data, labels }) => {
  // SVG line chart for attendance trend
  const width = 260;
  const height = 100;
  const max = 100;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (width - 40) + 20;
    const y = height - (v / max) * (height - 20) - 10;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} className="block mx-auto">
      <polyline
        fill="none"
        stroke="#3b82f6"
        strokeWidth="3"
        points={points}
      />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * (width - 40) + 20;
        const y = height - (v / max) * (height - 20) - 10;
        return <circle key={i} cx={x} cy={y} r={4} fill="#3b82f6" />;
      })}
      {/* Y axis labels */}
      <text x={0} y={height - 10} fontSize="10" fill="#888">0%</text>
      <text x={0} y={20} fontSize="10" fill="#888">100%</text>
      {/* X axis labels */}
      {labels.map((label, i) => {
        const x = (i / (data.length - 1)) * (width - 40) + 20;
        return <text key={label} x={x} y={height} fontSize="10" fill="#888" textAnchor="middle">{label}</text>;
      })}
    </svg>
  );
};

const AnalyticsPieChart: React.FC<{ present: number; absent: number }> = ({ present, absent }) => {
  // SVG pie chart for present/absent ratio
  const total = present + absent;
  const presentAngle = (present / total) * 360;
  const absentAngle = 360 - presentAngle;
  // Pie chart arc calculation
  const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const rad = (deg: number) => (Math.PI / 180) * deg;
    const x1 = cx + r * Math.cos(rad(startAngle));
    const y1 = cy + r * Math.sin(rad(startAngle));
    const x2 = cx + r * Math.cos(rad(endAngle));
    const y2 = cy + r * Math.sin(rad(endAngle));
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
    return [
      `M${cx},${cy}`,
      `L${x1},${y1}`,
      `A${r},${r} 0 ${largeArc} 1 ${x2},${y2}`,
      'Z',
    ].join(' ');
  };
  return (
    <svg width={90} height={90} viewBox="0 0 90 90">
      <path d={describeArc(45, 45, 40, 0, presentAngle)} fill="#22c55e" />
      <path d={describeArc(45, 45, 40, presentAngle, 360)} fill="#ef4444" />
      <circle cx={45} cy={45} r={25} fill="#fff" />
      <text x={45} y={50} textAnchor="middle" fontSize="16" fill="#222">{Math.round((present / total) * 100)}%</text>
    </svg>
  );
};
import { QrCode, Users, Calendar, BarChart3, Play, Square, Clock, MapPin, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Teacher, ClassSession } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import QRCode from 'qrcode';

export const TeacherDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const teacher = user as Teacher;
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [qrValue, setQrValue] = useState<string>('');
  const [qrImage, setQrImage] = useState<string>('');
  const [showReport, setShowReport] = useState<boolean>(false);
  const [reportSession, setReportSession] = useState<ClassSession | null>(null);
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [qrSession, setQRSession] = useState<ClassSession | null>(null);
  const [qrCountdown, setQRCountdown] = useState<number>(0);
  const [qrImageModal, setQRImageModal] = useState<string>('');
  const [qrValueModal, setQRValueModal] = useState<string>('');
  const qrTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Handle View QR modal open
  const handleViewQR = async (session: ClassSession) => {
    setQRSession(session);
    // Use session.qrCode or generate a new one if not present
    const value = session.qrCode || `Session-${session.id}-${Date.now()}`;
    setQRValueModal(value);
    const url = await QRCode.toDataURL(value);
    setQRImageModal(url);
    // Calculate expiry countdown if available
    if (session.qrExpiry) {
      const expiry = new Date(session.qrExpiry).getTime();
      const now = Date.now();
      setQRCountdown(Math.max(0, Math.floor((expiry - now) / 1000)));
      if (qrTimerRef.current) clearInterval(qrTimerRef.current);
      qrTimerRef.current = setInterval(() => {
        const left = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
        setQRCountdown(left);
        if (left <= 0 && qrTimerRef.current) {
          clearInterval(qrTimerRef.current);
        }
      }, 1000);
    } else {
      setQRCountdown(0);
    }
    setShowQRModal(true);
  };

  // Cleanup QR timer on modal close
  const handleCloseQRModal = () => {
    setShowQRModal(false);
    setQRSession(null);
    setQRImageModal('');
    setQRValueModal('');
    setQRCountdown(0);
    if (qrTimerRef.current) clearInterval(qrTimerRef.current);
  };

  // Download QR image
  const handleDownloadQR = () => {
    if (!qrImageModal) return;
    const a = document.createElement('a');
    a.href = qrImageModal;
    a.download = `qr-session-${qrSession?.id || 'session'}.png`;
    a.click();
  };

  // Copy QR value
  const handleCopyQRValue = async () => {
    if (qrValueModal) {
      await navigator.clipboard.writeText(qrValueModal);
      alert('QR value copied to clipboard!');
    }
  };
  // Example analytics data
  const analyticsData = [87, 92, 78, 85, 90, 80];
  const analyticsLabels = ['CS301', 'CS302', 'CS303', 'CS304', 'CS305', 'CS306'];
  // Example present/absent for pie chart
  const presentCount = 28 + 30 + 25 + 27 + 29 + 24;
  const absentCount = 2 + 0 + 5 + 3 + 1 + 6;
  const handleViewAnalytics = () => {
    setShowAnalytics(true);
  };

  const handleCloseAnalytics = () => {
    setShowAnalytics(false);
  };

  // Mock data for today's sessions
  const todaySessions: ClassSession[] = [
    {
      id: '1',
      courseCode: 'CS301',
      courseName: 'Data Structures',
      teacherId: teacher?.id || '1',
      teacherName: `${teacher?.firstName} ${teacher?.lastName}`,
      startTime: '09:00',
      endTime: '10:30',
      room: 'Room 101',
      status: 'completed',
      attendees: ['std1', 'std2', 'std3','std4', 'std5', 'std6']
    },
    {
      id: '2',
      courseCode: 'CS302',
      courseName: 'Database Systems',
      teacherId: teacher?.id || '1',
      teacherName: `${teacher?.firstName} ${teacher?.lastName}`,
      startTime: '11:00',
      endTime: '12:30',
      room: 'Room 205',
      status: 'active',
      qrCode: 'QR123456',
      qrExpiry: new Date(Date.now() + 300000).toISOString() // 5 minutes from now
    },
    {
      id: '3',
      courseCode: 'CS303',
      courseName: 'Computer Networks',
      teacherId: teacher?.id || '1',
      teacherName: `${teacher?.firstName} ${teacher?.lastName}`,
      startTime: '14:00',
      endTime: '15:30',
      room: 'Room 301',
      status: 'scheduled'
    }
  ];

  const handleStartSession = (sessionId: string) => {
    setActiveSession(sessionId);
    // In real app, this would generate QR code and update session status
  };

  const handleEndSession = (sessionId: string) => {
    setActiveSession(null);
    // In real app, this would end session and finalize attendance
  };

  const handleGenerateQR = async () => {
    const value = `Session-${Date.now()}`; // Example QR value
    setQrValue(value);
    const url = await QRCode.toDataURL(value);
    setQrImage(url);
  };

  const getStatusBadge = (status: ClassSession['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Active</Badge>;
      case 'scheduled':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Scheduled</Badge>;
      default:
        return null;
    }
  };

  // Mock report data for 6 students
  const reportStudents = [
    { id: '23052809', name: 'Kshitij Jaiswal', status: 'Present' },
    { id: '23052810', name: 'Manika Pathak', status: 'Present' },
    { id: '23052811', name: 'Mayank Singh', status: 'Absent' },
    { id: '23052812', name: 'Medhansh Vibhu', status: 'Present' },
    { id: '23052786', name: 'Anushkaa Dwary', status: 'Present' },
    { id: '2305145', name: 'Paranjay Senapati', status: 'Absent' },
  ];

  const handleViewReport = (session: ClassSession) => {
    setReportSession(session);
    setShowReport(true);
  };

  const handleCloseReport = () => {
    setShowReport(false);
    setReportSession(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-teacher rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  {teacher?.firstName} {teacher?.lastName}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {teacher?.employeeId} • {teacher?.department}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Column - Sessions & Analytics */}
          <div className="lg:col-span-3 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Today's Classes</p>
                      <p className="text-2xl font-bold text-teacher-primary">{todaySessions.length}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-teacher-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                      <p className="text-2xl font-bold text-teacher-primary">
                        {todaySessions.filter(s => s.status === 'active').length}
                      </p>
                    </div>
                    <Play className="w-8 h-8 text-teacher-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                      <p className="text-2xl font-bold text-teacher-primary">156</p>
                    </div>
                    <Users className="w-8 h-8 text-teacher-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg. Attendance</p>
                      <p className="text-2xl font-bold text-teacher-primary">87%</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-teacher-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Today's Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Today's Sessions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {todaySessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-teacher-secondary/20 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-foreground">
                          {session.courseName}
                        </h3>
                        {getStatusBadge(session.status)}
                        {session.status === 'active' && (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                            QR Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {session.courseCode}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{session.startTime} - {session.endTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{session.room}</span>
                        </div>
                        {session.attendees && (
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{session.attendees.length} students</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {session.status === 'scheduled' && (
                        <Button 
                          className="btn-teacher"
                          onClick={() => handleStartSession(session.id)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Session
                        </Button>
                      )}
                      
                      {session.status === 'active' && (
                        <>
                          <Button 
                            className="btn-teacher"
                            onClick={() => handleEndSession(session.id)}
                          >
                            <Square className="w-4 h-4 mr-2" />
                            End Session
                          </Button>
                          <Button variant="outline" onClick={() => handleViewQR(session)}>
                            <QrCode className="w-4 h-4 mr-2" />
                            View QR
                          </Button>
                        </>
                      )}
      {/* QR Modal */}
      {showQRModal && qrSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={handleCloseQRModal}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-500" /> Session QR Code
            </h2>
            <p className="text-sm text-muted-foreground mb-2">
              {qrSession.courseName} ({qrSession.courseCode})<br />
              {qrSession.startTime} - {qrSession.endTime} | {qrSession.room}
            </p>
            <div className="flex flex-col items-center mb-4">
              {qrImageModal && (
                <img src={qrImageModal} alt="QR Code" className="w-40 h-40 border border-gray-200 rounded mb-2" />
              )}
              {qrCountdown > 0 && (
                <span className="text-xs text-orange-600 mb-1">Expires in {qrCountdown}s</span>
              )}
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={handleDownloadQR} variant="outline">Download</Button>
                <Button size="sm" onClick={handleCopyQRValue} variant="outline">Copy Value</Button>
              </div>
            </div>
            <div className="bg-gray-50 rounded p-2 text-xs text-center text-gray-700 select-all mb-2">
              {qrValueModal}
            </div>
            <div className="mt-2 flex justify-end">
              <Button variant="outline" onClick={handleCloseQRModal}>Close</Button>
            </div>
          </div>
        </div>
      )}
                      
                      {session.status === 'completed' && (
                        <Button variant="outline" onClick={() => handleViewReport(session)}>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          View Report
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            {/* QR Generator Card */}
            <Card>
              <CardHeader>
                <CardTitle>QR Generator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mx-auto mb-4">
                    {qrImage ? (
                      <img src={qrImage} alt="QR Code" className="w-28 h-28" />
                    ) : (
                      <QrCode className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {qrImage ? qrValue : 'No active QR code'}
                  </p>
                  <Button className="w-full btn-teacher" onClick={handleGenerateQR}>
                    Generate QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full btn-teacher justify-start">
                  <Play className="w-4 h-4 mr-3" />
                  Start New Session
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-3" />
                  Mark Manual Attendance
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleViewAnalytics}>
                  <BarChart3 className="w-4 h-4 mr-3" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-3" />
                  Manage Schedule
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-foreground">CS301 session completed</p>
                      <p className="text-muted-foreground">28/30 students attended</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-foreground">QR code generated</p>
                      <p className="text-muted-foreground">CS302 - Active now</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-foreground">Upcoming: CS303</p>
                      <p className="text-muted-foreground">In 2 hours</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-8 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={handleCloseAnalytics}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-lg font-semibold mb-4">Attendance Analytics</h2>
            <div className="flex flex-col items-center">
              <h3 className="font-medium mb-2">Attendance Trend (Line)</h3>
              <AnalyticsLineChart data={analyticsData} labels={analyticsLabels} />
            </div>
            <div className="mt-8 flex flex-col items-center">
              <h3 className="font-medium mb-2">Present vs Absent</h3>
              <AnalyticsPieChart present={presentCount} absent={absentCount} />
              <div className="flex justify-center gap-4 mt-2 text-xs">
                <span className="flex items-center"><span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>Present</span>
                <span className="flex items-center"><span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>Absent</span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={handleCloseAnalytics}>Close</Button>
            </div>
          </div>
        </div>
      )}
      {/* Report Modal/Card */}
      {showReport && reportSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={handleCloseReport}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-lg font-semibold mb-2">Attendance Report</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {reportSession.courseName} ({reportSession.courseCode})<br />
              {reportSession.startTime} - {reportSession.endTime} | {reportSession.room}
            </p>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-3 text-left">ID</th>
                  <th className="py-2 px-3 text-left">Student Name</th>
                  <th className="py-2 px-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {reportStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="py-2 px-3 border-b">{student.id}</td>
                    <td className="py-2 px-3 border-b">{student.name}</td>
                    <td className={`py-2 px-3 border-b font-medium ${student.status === 'Present' ? 'text-green-600' : 'text-red-600'}`}>{student.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={handleCloseReport}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};