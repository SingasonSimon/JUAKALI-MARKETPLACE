import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Web app Firebase configuration
// Get these values from Firebase Console > Project Settings > Your apps > Web app config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate that all required environment variables are present
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingVars.length > 0) {
  console.error('[ERROR] Missing Firebase environment variables:', missingVars.join(', '));
  console.error('Please create a .env file in the frontend directory with your Firebase config.');
  console.error('See .env.example for the required variables.');
  console.error('Current env values:', {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '[OK]' : '[MISSING]',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '[OK]' : '[MISSING]',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '[OK]' : '[MISSING]',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? '[OK]' : '[MISSING]',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? '[OK]' : '[MISSING]',
    appId: import.meta.env.VITE_FIREBASE_APP_ID ? '[OK]' : '[MISSING]',
  });
  throw new Error(`Missing Firebase configuration. Please check your .env file and restart the dev server.`);
}

// Verify all config values are strings (not undefined)
const configValues = Object.values(firebaseConfig);
if (configValues.some(val => !val || typeof val !== 'string')) {
  console.error('[ERROR] Invalid Firebase configuration detected. Some values are missing or invalid.');
  console.error('Config object:', firebaseConfig);
  throw new Error('Invalid Firebase configuration. Please check your .env file.');
}

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('[SUCCESS] Firebase initialized successfully');
} catch (error) {
  console.error('[ERROR] Firebase initialization failed:', error);
  throw error;
}

export const auth = getAuth(app);