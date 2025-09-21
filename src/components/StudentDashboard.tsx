  // Helper to render status badge
  function getStatusBadge(status) {
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
  }
// Attendance line graph component (must be at top level, plain JS)
function AttendanceLineGraph(props) {
  var attendanceReport = props.attendanceReport;
  var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  var dayDates = {
    'Monday': '2025-09-15',
    'Tuesday': '2025-09-16',
    'Wednesday': '2025-09-17',
    'Thursday': '2025-09-18',
    'Friday': '2025-09-19'
  };
  var percentages = days.map(function(day) {
    var date = dayDates[day];
    var dayEntries = attendanceReport.filter(function(r) { return r.date === date; });
    var present = dayEntries.filter(function(r) { return r.status === 'Present'; }).length;
    return dayEntries.length > 0 ? Math.round((present / dayEntries.length) * 100) : 0;
  });
  var width = 320;
  var height = 140;
  var max = 100;
  var points = percentages.map(function(v, i) {
    var x = (i / (percentages.length - 1)) * (width - 40) + 20;
    var y = height - (v / max) * (height - 40) - 20;
    return x + ',' + y;
  }).join(' ');
  return (
    <div className="w-full flex flex-col items-center">
      <svg width={width} height={height} className="mb-2">
        {/* Axes */}
        <line x1={20} y1={height-20} x2={width-20} y2={height-20} stroke="#ccc" />
        <line x1={20} y1={20} x2={20} y2={height-20} stroke="#ccc" />
        {/* Line */}
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          points={points}
        />
        {/* Dots */}
        {percentages.map(function(v, i) {
          var x = (i / (percentages.length - 1)) * (width - 40) + 20;
          var y = height - (v / max) * (height - 40) - 20;
          return <circle key={i} cx={x} cy={y} r={5} fill="#3b82f6" />;
        })}
        {/* Y axis labels */}
        <text x={0} y={height-20} fontSize="10" fill="#888">0%</text>
        <text x={0} y={30} fontSize="10" fill="#888">100%</text>
        {/* X axis labels */}
        {days.map(function(day, i) {
          var x = (i / (percentages.length - 1)) * (width - 40) + 20;
          return <text key={day} x={x} y={height-5} fontSize="12" fill="#222" textAnchor="middle">{day}</text>;
        })}
      </svg>
      <div className="flex gap-4 mt-2">
        {percentages.map(function(v, i) {
          return (
            <div key={i} className="flex flex-col items-center">
              <span className="font-semibold text-blue-600">{v}%</span>
              <span className="text-xs text-muted-foreground">{days[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Calendar, QrCode, BarChart3, CheckCircle, Clock, MapPin, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Student, ClassSession } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import QrScanner from 'react-qr-scanner';

export const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const student = user as Student;
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [markedAttendance, setMarkedAttendance] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  // Mock weekly schedule data
  // Timetable grid data: time slots as rows, days as columns
  const timetableSlots = [
    { time: '09:00 - 10:00',
      Monday: { subject: 'Data Structures', code: 'CS301', room: '101' },
      Tuesday: { subject: 'Operating Systems', code: 'CS304', room: '102' },
      Wednesday: { subject: 'Data Structures', code: 'CS301', room: '101' },
      Thursday: { subject: 'Operating Systems', code: 'CS304', room: '102' },
      Friday: { subject: 'Data Structures', code: 'CS301', room: '101' },
    },
    { time: '10:15 - 11:15',
      Monday: { subject: 'Database Systems', code: 'CS302', room: '205' },
      Tuesday: { subject: 'Algorithms', code: 'CS305', room: '103' },
      Wednesday: { subject: 'Database Systems', code: 'CS302', room: '205' },
      Thursday: { subject: 'Algorithms', code: 'CS305', room: '103' },
      Friday: { subject: 'Database Systems', code: 'CS302', room: '205' },
    },
    { time: '11:30 - 12:30',
      Monday: { subject: 'Computer Networks', code: 'CS303', room: '301' },
      Tuesday: { subject: 'Software Engg.', code: 'CS306', room: '104' },
      Wednesday: { subject: 'Computer Networks', code: 'CS303', room: '301' },
      Thursday: { subject: 'Software Engg.', code: 'CS306', room: '104' },
      Friday: { subject: 'Computer Networks', code: 'CS303', room: '301' },
    },
  ];
                  <Button variant="ghost" size="sm" onClick={function(){setShowSettings(true);}}>
                    <Settings className="w-4 h-4" />
                  </Button>
  const attendanceReport = [
    { subject: 'Data Structures', code: 'CS301', date: '2025-09-15', status: 'Present' },
    { subject: 'Database Systems', code: 'CS302', date: '2025-09-15', status: 'Present' },
    { subject: 'Computer Networks', code: 'CS303', date: '2025-09-15', status: 'Absent' },
    // Tuesday (2025-09-16)
    { subject: 'Operating Systems', code: 'CS304', date: '2025-09-16', status: 'Present' },
    { subject: 'Algorithms', code: 'CS305', date: '2025-09-16', status: 'Present' },
    { subject: 'Software Engg.', code: 'CS306', date: '2025-09-16', status: 'Present' },
    // Wednesday (2025-09-17)
    { subject: 'Data Structures', code: 'CS301', date: '2025-09-17', status: 'Present' },
    { subject: 'Database Systems', code: 'CS302', date: '2025-09-17', status: 'Absent' },
    { subject: 'Computer Networks', code: 'CS303', date: '2025-09-17', status: 'Present' },
    // Thursday (2025-09-18)
    { subject: 'Operating Systems', code: 'CS304', date: '2025-09-18', status: 'Present' },
    { subject: 'Algorithms', code: 'CS305', date: '2025-09-18', status: 'Present' },
    { subject: 'Software Engg.', code: 'CS306', date: '2025-09-18', status: 'Absent' },
    // Friday (2025-09-19)
    { subject: 'Data Structures', code: 'CS301', date: '2025-09-19', status: 'Present' },
    { subject: 'Database Systems', code: 'CS302', date: '2025-09-19', status: 'Present' },
    { subject: 'Computer Networks', code: 'CS303', date: '2025-09-19', status: 'Present' }
  ];


  // Mock data for today's classes
  const todaysClasses = [
    {
      id: '1',
      courseCode: 'CS301',
      courseName: 'Data Structures',
      teacherId: '1',
      teacherName: 'Dr. Santwana Sagnika',
      startTime: '09:00',
      endTime: '10:30',
      room: 'Room 101',
      status: 'completed'
    },
    {
      id: '2',
      courseCode: 'CS302',
      courseName: 'Database Systems',
      teacherId: '2',
      teacherName: 'Dr. HK Tripathy',
      startTime: '11:00',
      endTime: '12:30',
      room: 'Room 205',
      status: 'active'
    },
    {
      id: '3',
      courseCode: 'CS303',
      courseName: 'Computer Networks',
      teacherId: '3',
      teacherName: 'Dr. Ajit Pasayat',
      startTime: '14:00',
      endTime: '15:30',
      room: 'Room 301',
      status: 'scheduled'
    }
  ];

  const handleScan = function(data) {
    if (data && data.text) {
      setScanResult(data.text);
      setScannerOpen(false);
      // Add logic to mark attendance with data.text if needed
    }
  };

  const handleError = function(err) {
    console.error(err);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-student rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  Hi, {student?.firstName}!
                </h1>
                <p className="text-sm text-muted-foreground">
                  {student?.admissionNumber} • {student?.department}
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
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Today's Classes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                      <p className="text-2xl font-bold text-student-primary">92%</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-student-primary" />
                  </div>
                  <Progress value={92} className="mt-3" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Classes Today</p>
                      <p className="text-2xl font-bold text-student-primary">{todaysClasses.length}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-student-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                      <p className="text-2xl font-bold text-student-primary">15 days</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-student-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Today's Classes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {todaysClasses.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-student-secondary/20 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-foreground">
                          {classItem.courseName}
                        </h3>
                        {getStatusBadge(classItem.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {classItem.courseCode} • {classItem.teacherName}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{classItem.startTime} - {classItem.endTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{classItem.room}</span>
                        </div>
                      </div>
                    </div>
                    {classItem.status === 'active' && (
                      markedAttendance[classItem.id] ? (
                        <Button className="bg-green-500 hover:bg-green-600 text-white btn-student" disabled>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Attendance Marked
                        </Button>
                      ) : (
                        <Button
                          className="btn-student"
                          onClick={() => setMarkedAttendance(prev => ({ ...prev, [classItem.id]: true }))}
                        >
                          <QrCode className="w-4 h-4 mr-2" />
                          Mark Attendance
                        </Button>
                      )
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions & Profile */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-student rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground">
                    {student?.firstName} {student?.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {student?.admissionNumber}
                  </p>
                  <div className="text-left space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Department:</span>
                      <span className="font-medium">{student?.department}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Year:</span>
                      <span className="font-medium">3rd Year</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Section:</span>
                      <span className="font-medium">A</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full btn-student justify-start"
                  onClick={() => setScannerOpen(true)}
                >
                  <QrCode className="w-4 h-4 mr-3" />
                  Scan QR Code
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setShowReport(true)}>
                  <BarChart3 className="w-4 h-4 mr-3" />
                  View Attendance Report
                </Button>
            {/* Attendance Report Modal */}
            {showReport && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowReport(false)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                  <h2 className="text-lg font-semibold mb-4">Attendance Report (Line Graph)</h2>
                  {/* Attendance Line Graph */}
                  <AttendanceLineGraph attendanceReport={attendanceReport} />
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" onClick={() => setShowReport(false)}>Close</Button>
                  </div>
                </div>
              </div>
            )}
                <Button variant="outline" className="w-full justify-start" onClick={() => setShowSchedule(true)}>
                  <Calendar className="w-4 h-4 mr-3" />
                  View Full Schedule
                </Button>
            {/* Full Schedule Modal */}
            {showSchedule && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative">
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowSchedule(false)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                  <h2 className="text-lg font-semibold mb-4">Weekly Class Timetable</h2>
                  <table className="w-full text-sm border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-3 text-left">Time</th>
                        <th className="py-2 px-3 text-center">Monday</th>
                        <th className="py-2 px-3 text-center">Tuesday</th>
                        <th className="py-2 px-3 text-center">Wednesday</th>
                        <th className="py-2 px-3 text-center">Thursday</th>
                        <th className="py-2 px-3 text-center">Friday</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timetableSlots.map((slot, i) => (
                        <tr key={i}>
                          <td className="py-2 px-3 border-b font-medium">{slot.time}</td>
                          {['Monday','Tuesday','Wednesday','Thursday','Friday'].map(day => (
                            <td key={day} className="py-2 px-3 border-b text-center">
                              <div className="font-semibold">{slot[day]?.subject}</div>
                              <div className="text-xs text-muted-foreground">{slot[day]?.code}</div>
                              <div className="text-xs">Room {slot[day]?.room}</div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" onClick={() => setShowSchedule(false)}>Close</Button>
                  </div>
                </div>
              </div>
            )}
              </CardContent>
            </Card>

            {/* QR Scanner Modal */}
            {scannerOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg p-6 shadow-lg flex flex-col items-center">
                  <h2 className="mb-4 font-semibold">Scan QR Code</h2>
                  <div style={{ width: 300 }}>
                    <QrScanner
                      delay={300}
                      onError={handleError}
                      onScan={handleScan}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <Button className="mt-4" onClick={() => setScannerOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}

            {/* Show scan result (optional) */}
            {scanResult && (
              <div className="p-4 bg-green-100 text-green-800 rounded mt-2 text-center">
                Scanned: {scanResult}
              </div>
            )}

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
                      <p className="text-foreground">Attended CS301 - Data Structures</p>
                      <p className="text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-foreground">Assignment submitted</p>
                      <p className="text-muted-foreground">Yesterday</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-foreground">Upcoming: CS303 exam</p>
                      <p className="text-muted-foreground">In 3 days</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};