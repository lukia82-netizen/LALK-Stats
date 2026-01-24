/* ============================================
   Cloud Sync Module
   Handles multi-device synchronization
   ============================================ */

class CloudSyncManager {
  constructor(config) {
    this.config = config;
    this.syncEnabled = config.enabled;
    this.syncInProgress = false;
    this.lastSyncTime = null;
    this.syncStatus = 'idle'; // idle, syncing, error, success
    this.listeners = [];
    this.retryCount = 0;
    
    if (this.syncEnabled) {
      this.initialize();
    }
  }

  async initialize() {
    console.log('[CloudSync] Initializing...');
    
    try {
      // Initialize backend connection
      if (this.config.backend.type === 'firebase') {
        await this.initializeFirebase();
      } else if (this.config.backend.type === 'custom') {
        await this.initializeCustomBackend();
      }
      
      // Setup auto-sync if enabled
      if (this.config.sync.autoSync) {
        this.startAutoSync();
      }
      
      console.log('[CloudSync] Initialized successfully');
      this.updateStatus('idle');
    } catch (error) {
      console.error('[CloudSync] Initialization failed:', error);
      this.updateStatus('error');
    }
  }

  async initializeFirebase() {
    // Check if Firebase SDK is loaded
    if (typeof firebase === 'undefined') {
      throw new Error('Firebase SDK not loaded. Please include Firebase scripts.');
    }
    
    // Initialize Firebase (example - requires Firebase SDK)
    // firebase.initializeApp(this.config.backend.firebase);
    console.log('[CloudSync] Firebase configuration ready (SDK not loaded in this version)');
  }

  async initializeCustomBackend() {
    console.log('[CloudSync] Custom backend configuration ready');
    // Initialize custom backend connection
    // This would connect to your own API
  }

  startAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(() => {
      if (!this.syncInProgress) {
        this.syncToCloud();
      }
    }, this.config.sync.syncInterval);
    
    console.log('[CloudSync] Auto-sync started');
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('[CloudSync] Auto-sync stopped');
    }
  }

  async syncToCloud() {
    if (!this.syncEnabled || this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;
    this.updateStatus('syncing');

    try {
      // Get current game data from localStorage
      const gameData = this.getLocalGameData();
      
      // Upload to cloud
      await this.uploadData(gameData);
      
      // Update last sync time
      this.lastSyncTime = new Date();
      this.retryCount = 0;
      
      this.updateStatus('success');
      console.log('[CloudSync] Sync successful');
      
      return true;
    } catch (error) {
      console.error('[CloudSync] Sync failed:', error);
      this.updateStatus('error');
      
      // Retry logic
      if (this.retryCount < this.config.sync.retryAttempts) {
        this.retryCount++;
        console.log(`[CloudSync] Retrying (${this.retryCount}/${this.config.sync.retryAttempts})...`);
        
        setTimeout(() => {
          this.syncToCloud();
        }, this.config.sync.retryDelay);
      }
      
      return false;
    } finally {
      this.syncInProgress = false;
    }
  }

  async syncFromCloud() {
    if (!this.syncEnabled) {
      return null;
    }

    try {
      this.updateStatus('syncing');
      
      // Download from cloud
      const cloudData = await this.downloadData();
      
      // Handle conflicts
      const resolvedData = await this.resolveConflicts(cloudData);
      
      // Update local storage
      if (resolvedData) {
        this.saveLocalGameData(resolvedData);
      }
      
      this.updateStatus('success');
      console.log('[CloudSync] Downloaded and synced from cloud');
      
      return resolvedData;
    } catch (error) {
      console.error('[CloudSync] Download failed:', error);
      this.updateStatus('error');
      return null;
    }
  }

  async uploadData(gameData) {
    // Simulate upload (replace with actual backend call)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('[CloudSync] Data uploaded to cloud:', gameData);
        resolve();
      }, 500);
    });
  }

  async downloadData() {
    // Simulate download (replace with actual backend call)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('[CloudSync] Data downloaded from cloud');
        resolve(null); // Return cloud data or null if none exists
      }, 500);
    });
  }

  async resolveConflicts(cloudData) {
    const localData = this.getLocalGameData();
    
    if (!cloudData) {
      return localData;
    }
    
    if (!localData) {
      return cloudData;
    }

    // Conflict resolution strategy
    switch (this.config.sync.conflictResolution) {
      case 'latest':
        // Use data with latest timestamp
        const localTime = new Date(localData.lastModified || 0);
        const cloudTime = new Date(cloudData.lastModified || 0);
        return cloudTime > localTime ? cloudData : localData;
        
      case 'manual':
        // Prompt user to choose (would need UI implementation)
        console.log('[CloudSync] Manual conflict resolution needed');
        return localData; // Default to local for now
        
      case 'merge':
        // Merge both datasets (complex logic needed)
        console.log('[CloudSync] Merging datasets');
        return this.mergeGameData(localData, cloudData);
        
      default:
        return localData;
    }
  }

  mergeGameData(local, cloud) {
    // Simple merge strategy - take latest actions from both
    // More sophisticated merging would be needed for production
    return {
      ...local,
      gameLog: this.mergeGameLogs(local.gameLog || [], cloud.gameLog || [])
    };
  }

  mergeGameLogs(localLog, cloudLog) {
    // Merge and deduplicate game logs by timestamp
    const merged = [...localLog, ...cloudLog];
    const unique = merged.filter((entry, index, self) =>
      index === self.findIndex((e) => 
        e.time === entry.time && e.action === entry.action && e.player === entry.player
      )
    );
    return unique.sort((a, b) => a.time.localeCompare(b.time));
  }

  getLocalGameData() {
    try {
      const data = localStorage.getItem('basketballGame');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[CloudSync] Failed to read local data:', error);
      return null;
    }
  }

  saveLocalGameData(data) {
    try {
      localStorage.setItem('basketballGame', JSON.stringify(data));
      console.log('[CloudSync] Local data updated');
    } catch (error) {
      console.error('[CloudSync] Failed to save local data:', error);
    }
  }

  updateStatus(status) {
    this.syncStatus = status;
    this.notifyListeners({ status, lastSyncTime: this.lastSyncTime });
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  notifyListeners(data) {
    this.listeners.forEach(callback => callback(data));
  }

  toggleSync(enabled) {
    this.syncEnabled = enabled;
    if (enabled) {
      this.startAutoSync();
    } else {
      this.stopAutoSync();
    }
    console.log(`[CloudSync] Sync ${enabled ? 'enabled' : 'disabled'}`);
  }

  getSyncStatus() {
    return {
      enabled: this.syncEnabled,
      status: this.syncStatus,
      lastSyncTime: this.lastSyncTime,
      inProgress: this.syncInProgress
    };
  }

  destroy() {
    this.stopAutoSync();
    this.listeners = [];
    console.log('[CloudSync] Destroyed');
  }
}

// Export for use in app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CloudSyncManager;
}
