import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  emailLogin: (email: string, pass: string, rememberMe?: boolean) => Promise<void>;
  googleLogin: () => Promise<void>;
  emailSignUp: (email: string, pass: string, name: string, rememberMe?: boolean) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'zydj5399@gmail.com';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAdmin(firebaseUser?.email === ADMIN_EMAIL);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const emailLogin = async (email: string, pass: string, rememberMe: boolean = true) => {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const emailSignUp = async (email: string, pass: string, name: string, rememberMe: boolean = true) => {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCredential.user, { displayName: name });
  };

  const forgotPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser(auth.currentUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, emailLogin, googleLogin, emailSignUp, forgotPassword, signOutUser, refreshUser, isAdmin }}>
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

