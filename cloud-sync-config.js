/* ============================================
   Cloud Sync Configuration
   Multi-device synchronization settings
   ============================================ */

const CloudSyncConfig = {
  // Feature toggle
  enabled: false, // Set to true to enable cloud sync
  
  // Backend configuration (example - replace with actual backend)
  backend: {
    type: 'firebase', // Options: 'firebase', 'custom', 'none'
    
    // Firebase configuration (replace with your project details)
    firebase: {
      apiKey: 'YOUR_API_KEY_HERE',
      authDomain: 'your-project.firebaseapp.com',
      projectId: 'your-project-id',
      storageBucket: 'your-project.appspot.com',
      messagingSenderId: '123456789',
      appId: 'your-app-id'
    },
    
    // Custom backend configuration
    custom: {
      apiUrl: 'https://your-api.example.com',
      wsUrl: 'wss://your-api.example.com/ws',
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
