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
import { COLLECTIONS, handleFirestoreError, serverTimestamp} from './firestore';

export const createTask = async (taskData) => {
  try {
    const taskWithTimestamps = {
      ...taskData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, COLLECTIONS.TASKS), taskWithTimestamps);
    return { id: docRef.id, ...taskWithTimestamps };
  } catch (error) {
    handleFirestoreError(error);
  }
};

export const updateTask = async (taskId, taskData) => {
  try {
    const taskWithTimestamp = {
      ...taskData,
      updatedAt: serverTimestamp(),
    };
    
    const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
    await updateDoc(taskRef, taskWithTimestamp);
    return { id: taskId, ...taskWithTimestamp };
  } catch (error) {
    handleFirestoreError(error);
  }
};

export const deleteTask = async (taskId) => {
  try {
    const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    handleFirestoreError(error);
  }
};

export const getTasks = async (userId) => {
  try {
    const tasksQuery = query(
      collection(db, COLLECTIONS.TASKS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(tasksQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    handleFirestoreError(error);
  }
};

export const toggleTaskComplete = async (taskId, completed) => {
  try {
    const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
    await updateDoc(taskRef, {
      completed,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error);
  }
}; 