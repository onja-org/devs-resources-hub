import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';

// Get a single document
export const getDocument = async (
  collectionName: string,
  docId: string
): Promise<DocumentData | undefined> => {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return undefined;
};

// Get all documents from a collection
export const getDocuments = async (
  collectionName: string,
  ...queryConstraints: QueryConstraint[]
): Promise<DocumentData[]> => {
  const collectionRef = collection(db, collectionName);
  const q = queryConstraints.length > 0 ? query(collectionRef, ...queryConstraints) : collectionRef;
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Add a document
export const addDocument = async (
  collectionName: string,
  data: DocumentData
): Promise<string> => {
  const collectionRef = collection(db, collectionName);
  const docRef = await addDoc(collectionRef, data);
  return docRef.id;
};

// Update a document
export const updateDocument = async (
  collectionName: string,
  docId: string,
  data: Partial<DocumentData>
): Promise<void> => {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, data);
};

// Delete a document
export const deleteDocument = async (
  collectionName: string,
  docId: string
): Promise<void> => {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
};

// Export query utilities for custom queries
export { query, where };
