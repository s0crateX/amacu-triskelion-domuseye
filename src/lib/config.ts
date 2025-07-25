// Main configuration file that exports all service configurations
export { auth, db, storage, analytics } from './firebase';
export { imageKitConfig, getImageKitServerConfig, getImageKitClientConfig } from './imagekit';

// Re-export Firebase app for direct access if needed
export { default as firebaseApp } from './firebase';
export { default as imageKit } from './imagekit';