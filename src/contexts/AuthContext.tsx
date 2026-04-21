import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

interface EmployeeData {
  employee_id: string;
  name: string;
  email: string;
  company: string;
  department: string;
  position: string;
  join_date: string;
  profile_photo_url: string;
  total_annual_leave_entitlement: number;
  total_mc_entitlement: number;
  status: 'active' | 'inactive';
  role: 'Super Admin' | 'HR' | 'Manager' | 'Employee';
}

interface AuthContextType {
  user: User | null;
  employeeData: EmployeeData | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, 'employees', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as EmployeeData;
            // Force Super Admin role for specific email if not already set
            if (currentUser.email === 'kazuya.takumi17@gmail.com' && data.role !== 'Super Admin') {
              data.role = 'Super Admin';
              await updateDoc(docRef, { role: 'Super Admin' });
            }
            setEmployeeData(data);
          } else {
            // Create default employee record if it doesn't exist
            const newEmployee: EmployeeData = {
              employee_id: currentUser.uid,
              name: currentUser.displayName || 'Unknown',
              email: currentUser.email || '',
              company: 'HALAGEL (M) SDN BHD',
              department: 'Unassigned',
              position: 'Employee',
              join_date: new Date().toISOString().split('T')[0],
              profile_photo_url: currentUser.photoURL || '',
              total_annual_leave_entitlement: 14,
              total_mc_entitlement: 14,
              status: 'active',
              role: currentUser.email === 'kazuya.takumi17@gmail.com' ? 'Super Admin' : 'Employee'
            };
            await setDoc(docRef, newEmployee);
            setEmployeeData(newEmployee);
          }
        } catch (error: any) {
          console.error("Error fetching employee data:", error);
          if (error.code && error.code.includes('permission')) {
             console.error("WARNING: Firestore Security Rules are blocking access! Please ensure your new Firebase project Database is in Test Mode or rules are deployed.");
             // Throw the error so it can be handled if needed, or set employee data to a mock error state
          }
        }
      } else {
        setEmployeeData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, employeeData, loading, signInWithGoogle, logout }}>
      {!loading && children}
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
