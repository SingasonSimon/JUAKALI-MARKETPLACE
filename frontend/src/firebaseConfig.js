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

// Check for placeholder values
const placeholderPatterns = ['your-', 'placeholder', 'example', 'replace'];
const hasPlaceholders = Object.values(firebaseConfig).some(val => 
  val && typeof val === 'string' && placeholderPatterns.some(pattern => val.toLowerCase().includes(pattern))
);

if (missingVars.length > 0 || hasPlaceholders) {
  console.error('[ERROR] Missing or incomplete Firebase environment variables');
  console.error('Please update the .env file in the frontend directory with your Firebase config.');
  console.error('Steps to get Firebase config:');
  console.error('1. Go to https://console.firebase.google.com/');
  console.error('2. Select your project: juakali-app-77725');
  console.error('3. Click the gear icon > Project Settings');
  console.error('4. Scroll down to "Your apps" section');
  console.error('5. Click on the Web app icon (</>) or "Add app" > Web');
  console.error('6. Copy the config values from the firebaseConfig object');
  
  // Show a user-friendly error in the browser
  if (typeof document !== 'undefined') {
    document.body.innerHTML = `
      <div style="font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #1a1a1a; color: #fff; padding: 20px;">
        <div style="max-width: 600px; background: #2a2a2a; padding: 40px; border-radius: 12px; border: 1px solid #444;">
          <h1 style="margin-top: 0; color: #fbbf24;">Firebase Configuration Required</h1>
          <p style="line-height: 1.6; color: #d1d5db;">
            The Firebase environment variables are missing or contain placeholder values.
            Please update the <code style="background: #1a1a1a; padding: 2px 6px; border-radius: 4px;">.env</code> file in the frontend directory.
          </p>
          <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #60a5fa;">Steps to configure Firebase:</h3>
            <ol style="line-height: 2; color: #d1d5db;">
              <li>Go to <a href="https://console.firebase.google.com/" target="_blank" style="color: #60a5fa;">Firebase Console</a></li>
              <li>Select your project: <strong>juakali-app-77725</strong></li>
              <li>Click the gear icon → <strong>Project Settings</strong></li>
              <li>Scroll down to <strong>"Your apps"</strong> section</li>
              <li>Click on the <strong>Web app icon (</>)</strong> or <strong>"Add app" → Web</strong></li>
              <li>Copy the config values from the <code>firebaseConfig</code> object</li>
              <li>Update <code>.env</code> file with the actual values</li>
              <li>Restart the dev server</li>
            </ol>
          </div>
          <p style="color: #9ca3af; font-size: 14px; margin-bottom: 0;">
            The .env file should be located at: <code style="background: #1a1a1a; padding: 2px 6px; border-radius: 4px;">frontend/.env</code>
          </p>
        </div>
      </div>
    `;
  }
  
  throw new Error(`Missing or incomplete Firebase configuration. Please check your .env file and restart the dev server.`);
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