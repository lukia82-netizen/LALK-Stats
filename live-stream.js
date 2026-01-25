/* ============================================
   Live Stats Streaming Module
   Handles real-time stats sharing
   ============================================ */

class LiveStreamManager {
  constructor(config) {
    this.config = config;
    this.streaming = false;
    this.shareCode = null;
    this.shareUrl = null;
    this.viewers = 0;
    this.listeners = [];
    this.updateInterval = null;
  }

  /**
   * Start live streaming
   * @returns {Object} Share information (code, url, expiry)
   */
  async startStreaming() {
    if (this.streaming) {
      console.log('[LiveStream] Already streaming');
      return this.getShareInfo();
    }

    try {
      // Generate unique share code
      this.shareCode = this.generateShareCode();
      this.shareUrl = this.generateShareUrl(this.shareCode);
      
      // Set expiry time
      this.shareExpiry = new Date();
      this.shareExpiry.setHours(this.shareExpiry.getHours() + this.config.streaming.shareExpiry);
      
      // Start real-time updates
      this.startRealTimeUpdates();
      
      this.streaming = true;
      console.log('[LiveStream] Streaming started:', this.shareCode);
      
      this.notifyListeners({
        event: 'stream_started',
        shareCode: this.shareCode,
        shareUrl: this.shareUrl
      });
      
      return this.getShareInfo();
    } catch (error) {
      console.error('[LiveStream] Failed to start streaming:', error);
      throw error;
    }
  }

  /**
   * Stop live streaming
   */
  stopStreaming() {
    if (!this.streaming) {
      return;
    }

    this.stopRealTimeUpdates();
    
    this.streaming = false;
    this.shareCode = null;
    this.shareUrl = null;
    this.viewers = 0;
    
    console.log('[LiveStream] Streaming stopped');
    
    this.notifyListeners({
      event: 'stream_stopped'
    });
  }

  /**
   * Start pushing updates to viewers
   */
  startRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.pushUpdate();
    }, this.config.streaming.updateInterval);
    
    console.log('[LiveStream] Real-time updates started');
  }

  /**
   * Stop pushing updates
   */
  stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('[LiveStream] Real-time updates stopped');
    }
  }

  /**
   * Push current game state to all viewers
   */
  async pushUpdate() {
    if (!this.streaming) {
      return;
    }

    try {
      const gameData = this.getCurrentGameData();
      
      // In production, this would send data to a WebSocket server or push notification service
      // For now, we'll store it in a way that viewers can poll
      this.storeStreamData(gameData);
      
      this.notifyListeners({
        event: 'update_sent',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('[LiveStream] Failed to push update:', error);
    }
  }

  /**
   * Generate unique share code
   * Excludes visually confusing characters: 0, O, 1, I, L, S, 5
   * to prevent misreading when sharing codes verbally or visually
   * @returns {string} Share code (6 characters)
   */
  generateShareCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing chars: 0,O,1,I,L,S,5
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Generate shareable URL
   * @param {string} code - Share code
   * @returns {string} Full URL to viewer page
   */
  generateShareUrl(code) {
    const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');
    return `${baseUrl}/viewer.html?code=${code}`;
  }

  /**
   * Get current game data for streaming
   * @returns {Object} Game data
   */
  getCurrentGameData() {
    try {
      const dataStr = localStorage.getItem('basketballGame');
      if (!dataStr) {
        return null;
      }
      
      const data = JSON.parse(dataStr);
      
      // Return only necessary data for viewing (no edit capabilities)
      return {
        teamA: {
          name: data.teamA?.name || 'Team A',
          score: data.teamA?.score || 0,
          fouls: data.teamA?.fouls || 0,
          players: data.teamA?.players?.map(p => ({
            number: p.number,
            name: p.name,
            onCourt: p.onCourt,
            fouls: p.fouls || 0
          })) || []
        },
        teamB: {
          name: data.teamB?.name || 'Team B',
          score: data.teamB?.score || 0,
          fouls: data.teamB?.fouls || 0,
          players: data.teamB?.players?.map(p => ({
            number: p.number,
            name: p.name,
            onCourt: p.onCourt,
            fouls: p.fouls || 0
          })) || []
        },
        currentPeriod: data.currentPeriod || 1,
        gameLog: data.gameLog || [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('[LiveStream] Failed to get game data:', error);
      return null;
    }
  }

  /**
   * Store stream data for polling
   * NOTE: This is a proof-of-concept implementation using LocalStorage.
   * For production use with remote viewers, implement a WebSocket server
   * or use Firebase Realtime Database. Current implementation only works
   * for same-device/browser sharing.
   * @param {Object} data - Game data
   */
  storeStreamData(data) {
    if (!this.shareCode) {
      return;
    }

    try {
      const streamKey = `stream_${this.shareCode}`;
      const streamData = {
        data,
        timestamp: new Date().toISOString(),
        expiry: this.shareExpiry.toISOString(),
        viewers: this.viewers
      };
      
      localStorage.setItem(streamKey, JSON.stringify(streamData));
    } catch (error) {
      console.error('[LiveStream] Failed to store stream data:', error);
    }
  }

  /**
   * Get share information
   * @returns {Object} Share info
   */
  getShareInfo() {
    if (!this.streaming) {
      return null;
    }

    return {
      code: this.shareCode,
      url: this.shareUrl,
      expiry: this.shareExpiry,
      viewers: this.viewers,
      active: this.streaming
    };
  }

  /**
   * Check if share code is valid
   * @param {string} code - Share code to validate
   * @returns {boolean} Valid or not
   */
  isValidShareCode(code) {
    try {
      const streamKey = `stream_${code}`;
      const dataStr = localStorage.getItem(streamKey);
      
      if (!dataStr) {
        return false;
      }
      
      const streamData = JSON.parse(dataStr);
      const expiry = new Date(streamData.expiry);
      
      return expiry > new Date();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get stream data by code (for viewers)
   * @param {string} code - Share code
   * @returns {Object} Game data or null
   */
  static getStreamData(code) {
    try {
      const streamKey = `stream_${code}`;
      const dataStr = localStorage.getItem(streamKey);
      
      if (!dataStr) {
        return null;
      }
      
      const streamData = JSON.parse(dataStr);
      const expiry = new Date(streamData.expiry);
      
      if (expiry <= new Date()) {
        // Expired, clean up
        localStorage.removeItem(streamKey);
        return null;
      }
      
      return streamData.data;
    } catch (error) {
      console.error('[LiveStream] Failed to get stream data:', error);
      return null;
    }
  }

  /**
   * Copy share URL to clipboard
   */
  async copyShareUrl() {
    if (!this.shareUrl) {
      throw new Error('No active stream');
    }

    try {
      await navigator.clipboard.writeText(this.shareUrl);
      console.log('[LiveStream] Share URL copied to clipboard');
      return true;
    } catch (error) {
      console.error('[LiveStream] Failed to copy to clipboard:', error);
      
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = this.shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (err) {
        document.body.removeChild(textArea);
        throw err;
      }
    }
  }

  /**
   * Add event listener
   * @param {Function} callback - Callback function
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Remove event listener
   * @param {Function} callback - Callback function
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  /**
   * Notify all listeners
   * @param {Object} data - Event data
   */
  notifyListeners(data) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('[LiveStream] Listener error:', error);
      }
    });
  }

  /**
   * Get streaming status
   * @returns {Object} Status info
   */
  getStatus() {
    return {
      streaming: this.streaming,
      shareCode: this.shareCode,
      shareUrl: this.shareUrl,
      viewers: this.viewers,
      expiry: this.shareExpiry
    };
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stopStreaming();
    this.listeners = [];
    console.log('[LiveStream] Destroyed');
  }
}

// Export for use in app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LiveStreamManager;
}
