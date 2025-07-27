// src/lib/firebase.js
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBbO4EW6lJvPuYX1wqxFCeV25gDd20gytU",
  authDomain: "sahayak-teaching.firebaseapp.com",
  projectId: "sahayak-teaching",
  storageBucket: "sahayak-teaching.firebasestorage.app",
  messagingSenderId: "253184823450",
  appId: "1:253184823450:web:221e3b04ebfc721d54cf23"
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Set authentication persistence
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Auth persistence error:', error);
});

// Google Auth Provider with enhanced configuration
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  hd: '' // Remove domain restriction, allow any Google account
});

// Add additional scopes for profile information
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Enhanced auth functions with better error handling
export const signInWithGooglePopup = async () => {
  try {
    console.log('🔐 Initiating Google sign-in...');
    const result = await signInWithPopup(auth, googleProvider);
    
    console.log('✅ Google sign-in successful');
    console.log('User:', {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL
    });
    
    return {
      success: true,
      user: result.user,
      credential: result.credential
    };
  } catch (error) {
    console.error('❌ Google sign-in error:', error);
    
    // Handle specific error cases
    let errorMessage = 'Failed to sign in with Google';
    
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = 'Sign-in was cancelled';
        break;
      case 'auth/popup-blocked':
        errorMessage = 'Popup was blocked by browser. Please allow popups and try again.';
        break;
      case 'auth/cancelled-popup-request':
        errorMessage = 'Sign-in was cancelled';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection and try again.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many attempts. Please try again later.';
        break;
      default:
        errorMessage = error.message || 'An unexpected error occurred';
    }
    
    return {
      success: false,
      error: errorMessage,
      code: error.code
    };
  }
};

export const signOutUser = async () => {
  try {
    console.log('🚪 Signing out user...');
    await signOut(auth);
    console.log('✅ User signed out successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Sign out error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to sign out' 
    };
  }
};

// Enhanced auth state observer with additional logging
export const onAuthStateChangedListener = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('👤 User authenticated:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        photoURL: user.photoURL
      });
    } else {
      console.log('👤 User not authenticated');
    }
    callback(user);
  });
};

// Utility function to get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Utility function to check if user is authenticated
export const isAuthenticated = () => {
  return !!auth.currentUser;
};

// Function to get user profile data
export const getUserProfile = () => {
  const user = auth.currentUser;
  if (user) {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      phoneNumber: user.phoneNumber,
      providerData: user.providerData
    };
  }
  return null;
};

// Function to update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const user = auth.currentUser;
    if (user) {
      await user.updateProfile(profileData);
      console.log('✅ Profile updated successfully');
      return { success: true };
    }
    return { success: false, error: 'No user signed in' };
  } catch (error) {
    console.error('❌ Profile update error:', error);
    return { success: false, error: error.message };
  }
};

// Export the app instance
export default app;

// Development helper - log Firebase config (remove in production)
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Firebase Config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    apiKey: firebaseConfig.apiKey.substring(0, 10) + '...' // Only show first 10 chars
  });
}