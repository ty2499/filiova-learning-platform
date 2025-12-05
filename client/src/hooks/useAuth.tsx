import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Profile } from '@shared/schema';

interface TeacherApplicationStatus {
  id: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
}

interface FreelancerApplicationStatus {
  id: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  createdAt: Date;
  approvedAt?: Date;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  teacherApplicationStatus: TeacherApplicationStatus | null;
  freelancerApplicationStatus: FreelancerApplicationStatus | null;
  signIn: (email: string, password: string) => Promise<{ error?: any; success?: boolean }>;
  signUp: (email: string, password: string, profileData: { name: string; age: number; grade: number; country: string }) => Promise<{ error?: any; success?: boolean }>;
  forgotPassword: (email: string) => Promise<{ error?: any; message?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ error?: any; message?: string }>;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize session data - check if we have a valid sessionId
const initializeSession = () => {
  try {
    const sessionId = localStorage.getItem('sessionId');
    return { hasSession: !!sessionId };
  } catch (error) {
    console.error('Session initialization error:', error);
    return { hasSession: false };
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const { hasSession } = initializeSession();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [teacherApplicationStatus, setTeacherApplicationStatus] = useState<TeacherApplicationStatus | null>(null);
  const [freelancerApplicationStatus, setFreelancerApplicationStatus] = useState<FreelancerApplicationStatus | null>(null);
  const [loading, setLoading] = useState(hasSession); // Loading if we have a session to validate

  useEffect(() => {
    // Auto-load user data from server if we have a session
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      console.log('🔄 Loading user data from database on app startup');
      refreshAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 signIn called with email:', email);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ loginId: email, password }),
      });
      
      console.log('🔐 Response status:', response.status);
      const result = await response.json();
      console.log('🔐 Response data:', result);
      
      if (!response.ok) {
        console.log('🔐 Response not ok:', result.error);
        return { error: result.error || 'Login failed' };
      }
      
      const { user, profile, sessionId, teacherApplicationStatus, freelancerApplicationStatus } = result;
      console.log('🔐 Extracted user:', user);
      console.log('🔐 Extracted profile:', profile);
      console.log('🔐 Extracted sessionId:', sessionId);
      console.log('🔐 Extracted teacherApplicationStatus:', teacherApplicationStatus);
      console.log('🔐 Extracted freelancerApplicationStatus:', freelancerApplicationStatus);
      
      setUser(user);
      setProfile(profile);
      setTeacherApplicationStatus(teacherApplicationStatus || null);
      setFreelancerApplicationStatus(freelancerApplicationStatus || null);
      // User and profile data now stored in database, not localStorage
      
      if (sessionId) {
        localStorage.setItem('sessionId', sessionId);
      }
      
      console.log('🔐 signIn success, returning success');
      return { error: null, success: true };
    } catch (error) {
      console.error('🔐 Login error:', error);
      return { error: 'Network error occurred' };
    }
  };

  const signUp = async (email: string, password: string, profileData: { name: string; age: number; grade: number; country: string }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          ...profileData 
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return { error: result.error || 'Registration failed' };
      }
      
      const { user, profile, sessionId } = result;
      setUser(user);
      setProfile(profile);
      // User and profile data now stored in database, not localStorage
      
      if (sessionId) {
        localStorage.setItem('sessionId', sessionId);
      }
      
      return { error: null, success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { error: 'Network error occurred' };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return { error: result.error || 'Failed to send reset email' };
      }
      
      return { message: result.message };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { error: 'Network error occurred' };
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return { error: result.error || 'Failed to reset password' };
      }
      
      return { message: result.message };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: 'Network error occurred' };
    }
  };

  const refreshAuth = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        console.log('🔐 No sessionId found, skipping refresh');
        setLoading(false);
        return;
      }

      console.log('🔐 Refreshing auth with sessionId:', sessionId.substring(0, 10) + '...');
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${sessionId}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.user && result.profile) {
          console.log('🔐 Auth refresh successful, updating state');
          setUser(result.user);
          setProfile(result.profile);
          setTeacherApplicationStatus(result.teacherApplicationStatus || null);
          setFreelancerApplicationStatus(result.freelancerApplicationStatus || null);
        }
      } else {
        console.log('🔐 Auth refresh failed with status:', response.status);
        if (response.status === 401) {
          console.log('🔐 Session expired, clearing session');
          localStorage.removeItem('sessionId');
          setUser(null);
          setProfile(null);
        }
      }
    } catch (error) {
      console.error('🔐 Refresh auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logout initiated');
      
      // Clear local state and storage immediately for instant logout
      const sessionId = localStorage.getItem('sessionId');
      localStorage.removeItem('sessionId');
      setUser(null);
      setProfile(null);
      setTeacherApplicationStatus(null);
      setFreelancerApplicationStatus(null);
      
      // Call server logout endpoint in background (don't await)
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      }).catch(error => {
        console.error('Server logout error (non-blocking):', error);
      });
      
      console.log('🚪 Logout complete (instant)');
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if error, clear local state
      setUser(null);
      setProfile(null);
      setTeacherApplicationStatus(null);
      setFreelancerApplicationStatus(null);
      localStorage.removeItem('sessionId');
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, teacherApplicationStatus, freelancerApplicationStatus, signIn, signUp, forgotPassword, resetPassword, refreshAuth, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
