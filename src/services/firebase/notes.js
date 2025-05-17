import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
} from 'firebase/firestore';
import { db } from './config';
import { COLLECTIONS, handleFirestoreError, serverTimestamp } from './firestore';

export const createNote = async (noteData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.NOTES), {
      ...noteData,
      tags: noteData.tags || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw handleFirestoreError(error);
  }
};

export const updateNote = async (noteId, noteData) => {
  try {
    const noteRef = doc(db, COLLECTIONS.NOTES, noteId);
    await updateDoc(noteRef, {
      ...noteData,
      tags: noteData.tags || [],
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw handleFirestoreError(error);
  }
};

export const deleteNote = async (noteId) => {
  try {
    const noteRef = doc(db, COLLECTIONS.NOTES, noteId);
    await deleteDoc(noteRef);
  } catch (error) {
    throw handleFirestoreError(error);
  }
};

export const getNotes = async (userId) => {
  try {
    const notesQuery = query(
      collection(db, COLLECTIONS.NOTES),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(notesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw handleFirestoreError(error);
  }
}; 