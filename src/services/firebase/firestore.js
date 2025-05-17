import { db } from './config';
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  Timestamp,
  getDoc
} from 'firebase/firestore';

// Collection names
export const COLLECTIONS = {
  TASKS: 'tasks',
  NOTES: 'notes',
  USERS: 'users',
};

// Data validation schemas
export const taskSchema = {
  title: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
  },
  description: {
    type: 'string',
    required: false,
    maxLength: 1000,
  },
  userId: {
    type: 'string',
    required: true,
  },
  completed: {
    type: 'boolean',
    required: true,
    default: false,
  },
  deadline: {
    type: 'string',
    required: false,
    validate: (value) => {
      if (value && !isValidDate(value)) {
        return 'Invalid deadline date';
      }
      return null;
    },
    nullable: true,
  },
  isDaily: {
    type: 'boolean',
    required: true,
    default: false,
  },
  dailyTime: {
    type: 'string',
    required: false,
    validate: (value) => {
      if (value && !isValidTime(value)) {
        return 'Invalid daily time format';
      }
      return null;
    },
    nullable: true,
  },
  tags: {
    type: 'object',
    required: false,
    validate: (value) => {
      if (value && !Array.isArray(value)) return 'Tags must be an array';
      if (value && value.some((tag) => typeof tag !== 'string')) return 'Each tag must be a string';
      return null;
    },
    nullable: true,
  },
  createdAt: {
    type: 'timestamp',
    required: true,
  },
  updatedAt: {
    type: 'timestamp',
    required: true,
  },
};

export const noteSchema = {
  title: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
  },
  content: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 5000,
  },
  userId: {
    type: 'string',
    required: true,
  },
  tags: {
    type: 'object',
    required: false,
    nullable: true,
  },
  createdAt: {
    type: 'timestamp',
    required: true,
    default: Timestamp.now(),
  },
  updatedAt: {
    type: 'timestamp',
    required: true,
    default: Timestamp.now(),
  },
};

// Helper functions
export const validateData = (data, schema) => {
  const errors = [];
  const validatedData = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    // Check required fields
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    // Skip validation for undefined optional fields
    if (!rules.required && (value === undefined || value === null)) {
      continue;
    }

    // Type checking
    if (rules.type && typeof value !== rules.type) {
      errors.push(`${field} must be of type ${rules.type}`);
      continue;
    }

    // String length validation
    if (rules.type === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters long`);
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} must be at most ${rules.maxLength} characters long`);
      }
    }

    // Custom validation
    if (rules.validate) {
      const validationError = rules.validate(value);
      if (validationError) {
        errors.push(validationError);
      }
    }

    // Set default value if not provided
    if (value === undefined && rules.default !== undefined) {
      validatedData[field] = rules.default;
    } else {
      validatedData[field] = value;
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }

  return validatedData;
};

export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
};

export const getDocumentsByUser = async (collectionName, userId) => {
  try {
    const q = query(
      collection(db, collectionName),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
};

// Timestamp helpers
export const serverTimestamp = () => {
  return Timestamp.now();
};

const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

const isValidTime = (timeString) => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
};

// Error handling
export const handleFirestoreError = (error) => {
  console.error('Firestore error:', error);
  throw new Error(error.message || 'An error occurred while interacting with the database');
}; 