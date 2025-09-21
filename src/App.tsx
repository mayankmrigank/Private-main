import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { RoleSelector } from '@/components/RoleSelector';
import { LoginForm } from '@/components/LoginForm';
import { RegisterForm } from '@/components/RegisterForm';
import { StudentDashboard } from '@/components/StudentDashboard';
import { TeacherDashboard } from '@/components/TeacherDashboard';
import { QRScanner } from '@/components/QRScanner';
import { UserRole } from '@/types';

const queryClient = new QueryClient();

const AppContent = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'roleSelect' | 'login' | 'register'>('roleSelect');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);

  // If user is logged in, show appropriate dashboard
  if (user) {
    if (user.role === 'student') {
      return (
        <>
          <StudentDashboard />
          {showQRScanner && (
            <QRScanner
              onScanSuccess={(data) => {
                console.log('QR Scanned:', data);
                setShowQRScanner(false);
              }}
              onClose={() => setShowQRScanner(false)}
            />
          )}
        </>
      );
    }
    
    if (user.role === 'teacher') {
      return <TeacherDashboard />;
    }
  }

  // Authentication flow
  if (currentView === 'roleSelect') {
    return (
      <RoleSelector 
        onSelectRole={(role) => {
          setSelectedRole(role);
          setCurrentView('login');
        }} 
      />
    );
  }

  if (currentView === 'login' && selectedRole) {
    return (
      <LoginForm
        role={selectedRole}
        onBack={() => setCurrentView('roleSelect')}
        onSwitchToRegister={() => setCurrentView('register')}
      />
    );
  }

  if (currentView === 'register' && selectedRole) {
    return (
      <RegisterForm
        role={selectedRole}
        onBack={() => setCurrentView('login')}
        onSwitchToLogin={() => setCurrentView('login')}
      />
    );
  }

  return <RoleSelector onSelectRole={(role) => setSelectedRole(role)} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AppContent />
        <Toaster />
        <Sonner />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
