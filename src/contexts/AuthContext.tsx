import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Student, Teacher } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  admissionNumber?: string;
  employeeId?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock data for demo
const mockUsers: User[] = [
  {
    id: '1',
    email: 'student@kiit.edu',
    firstName: 'Kshitij',
    lastName: 'Jaiswal',
    role: 'student',
    admissionNumber: 'CS2021001',
    department: 'Computer Science',
    institution: 'Tech University',
    createdAt: '2021-08-15T00:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b277?w=150&h=150&fit=crop&crop=face'
  } as Student,
  {
    id: '2', 
    email: 'teacher@kiit.edu',
    firstName: 'Dr. Ajit',
    lastName: 'Pasayat',
    role: 'teacher',
    employeeId: 'EMP001',
    department: 'Computer Science',
    institution: 'Tech University',
    createdAt: '2020-01-15T00:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  } as Teacher,
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundUser = mockUsers.find(u => u.email === email && u.role === role);
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        department: userData.department,
        institution: 'Tech University',
        createdAt: new Date().toISOString(),
        ...(userData.role === 'student' ? { admissionNumber: userData.admissionNumber } : {}),
        ...(userData.role === 'teacher' ? { employeeId: userData.employeeId } : {}),
      };
      
      setUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};