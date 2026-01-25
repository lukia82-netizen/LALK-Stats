/* ============================================
   Cloud Sync Configuration
   Multi-device synchronization settings
   ============================================ */

// WARNING: DO NOT commit real API keys to version control!
// Use environment variables or a secure config management system in production.

const CloudSyncConfig = {
  // Feature toggle
  enabled: false, // Set to true to enable cloud sync
  
  // Backend configuration
  // IMPORTANT: Replace placeholder values before enabling sync
  backend: {
    type: 'firebase', // Options: 'firebase', 'custom', 'none'
    
    // Firebase configuration
    // Get these values from Firebase Console: Project Settings → Your Apps
    firebase: {
      apiKey: 'YOUR_API_KEY_HERE',  // ⚠️ REPLACE THIS
      authDomain: 'your-project.firebaseapp.com',  // ⚠️ REPLACE THIS
      projectId: 'your-project-id',  // ⚠️ REPLACE THIS
      storageBucket: 'your-project.appspot.com',  // ⚠️ REPLACE THIS
      messagingSenderId: '123456789',  // ⚠️ REPLACE THIS
      appId: 'your-app-id'  // ⚠️ REPLACE THIS
    },
    
    // Custom backend configuration
    custom: {
      apiUrl: 'https://your-api.example.com',  // ⚠️ REPLACE THIS
      wsUrl: 'wss://your-api.example.com/ws',  // ⚠️ REPLACE THIS
      authEndpoint: '/api/auth',
      syncEndpoint: '/api/sync',
      streamEndpoint: '/api/stream'
    }
  },
  
  // Sync settings
  sync: {
    autoSync: true,           // Automatically sync on changes
    syncInterval: 5000,       // Sync interval in milliseconds
    conflictResolution: 'latest', // Options: 'latest', 'manual', 'merge'
    retryAttempts: 3,
    retryDelay: 2000
  },
  
  // Live streaming settings
  streaming: {
    enabled: false,           // Toggle for live stats streaming
    shareExpiry: 24,          // Share link expiry in hours
    updateInterval: 1000,     // Real-time update interval in ms
    maxViewers: 100           // Maximum concurrent viewers
  },
  
  // Security settings
  security: {
    requireAuth: true,        // Require authentication for sync
    encryptData: true,        // Encrypt data before syncing
    allowPublicSharing: true  // Allow public share links
  }
};

// Export for use in app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CloudSyncConfig;
}
