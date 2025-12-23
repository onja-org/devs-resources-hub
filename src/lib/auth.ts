import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Sign up with email and password
export const signUp = async (
  email: string,
  password: string,
  name: string
): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update user profile with display name
  await updateProfile(userCredential.user, {
    displayName: name,
  });
  
  // Store user profile in Firestore
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    name,
    email,
    createdAt: new Date(),
  });
  
  return userCredential;
};

// Sign in with email and password
export const signIn = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Sign out
export const signOut = async (): Promise<void> => {
  return firebaseSignOut(auth);
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
