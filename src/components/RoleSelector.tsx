import React from 'react';
import { UserCheck, GraduationCap, Shield } from 'lucide-react';
import { UserRole } from '@/types';

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  const roles = [
    {
      id: 'student' as UserRole,
      title: 'Student',
      description: 'Mark attendance, view schedules, manage tasks',
      icon: GraduationCap,
      gradient: 'bg-gradient-student',
      textColor: 'text-student-primary'
    },
    {
      id: 'teacher' as UserRole,
      title: 'Teacher',
      description: 'Generate QR codes, manage sessions, track attendance',
      icon: UserCheck,
      gradient: 'bg-gradient-teacher',
      textColor: 'text-teacher-primary'
    },
    {
      id: 'admin' as UserRole,
      title: 'Admin',
      description: 'System management, analytics, user administration',
      icon: Shield,
      gradient: 'bg-gradient-admin',
      textColor: 'text-admin-primary'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Smart Attendance System
          </h1>
          <p className="text-lg text-muted-foreground">
            Select your role to continue
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-6 animate-slide-up">
          {roles.map((role, index) => (
            <div
              key={role.id}
              className="group cursor-pointer"
              onClick={() => onSelectRole(role.id)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="card-medium p-8 text-center hover:shadow-[var(--shadow-large)] transition-all duration-300 transform hover:-translate-y-2">
                {/* Icon with gradient background */}
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl ${role.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <role.icon className="w-8 h-8 text-white" />
                </div>
                
                {/* Content */}
                <h3 className={`text-2xl font-bold mb-3 ${role.textColor}`}>
                  {role.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {role.description}
                </p>
                
                {/* Hover indicator */}
                <div className={`mt-6 py-2 px-4 rounded-lg ${role.gradient} text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                  Continue as {role.title}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 animate-fade-in">
          <p className="text-sm text-muted-foreground">
            Secure • Reliable • Efficient
          </p>
        </div>
      </div>
    </div>
  );
};