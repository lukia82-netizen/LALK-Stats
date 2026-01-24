# PWA + Cloud Sync + Live Streaming - Setup Guide

## 🎯 Quick Start

This application now supports:
- 📱 **PWA Installation** - Install as native app on mobile/desktop
- 🌐 **Cloud Sync** - Optional multi-device synchronization
- 📡 **Live Streaming** - Share game stats in real-time

## 📱 PWA Setup

### Prerequisites
- Modern browser (Chrome 90+, Edge 90+, Safari 14+, Firefox 88+)
- HTTPS connection (or localhost for testing)

### Installation Steps

#### Desktop
1. Open `index-refactored.html` in a supported browser
2. Look for "Install" icon in address bar or click "📱 Install App" button
3. Follow browser prompts to install
4. App icon will appear in Start Menu/Applications

#### Mobile (Android/iOS)
1. Open website in Chrome (Android) or Safari (iOS)
2. Tap browser menu (⋮ or share icon)
3. Select "Add to Home Screen" or "Install App"
4. Confirm installation
5. App icon appears on home screen

### Features
- ✅ Works offline after first load
- ✅ Auto-updates when online
- ✅ Full-screen mode (no browser UI)
- ✅ Fast loading with Service Worker cache

### Generating Icons
Icons are required for PWA to work properly:

1. Open `icons/generate-icons.html` in browser
2. Click download links for each icon size
3. Save all PNG files to `icons/` directory
4. Icons will be automatically used by manifest.json

Or use your own tool (ImageMagick, Photoshop, etc.) to create:
- 72×72, 96×96, 128×128, 144×144, 152×152
- 192×192 (Android), 384×384, 512×512 (high-res)

## 🌐 Cloud Sync Setup

### Option 1: Firebase (Recommended)

#### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project
3. Enable Realtime Database or Firestore
4. Get your configuration

#### 2. Configure Application
Edit `cloud-sync-config.js`:

```javascript
const CloudSyncConfig = {
  enabled: true,  // Enable sync
  backend: {
    type: 'firebase',
    firebase: {
      apiKey: 'YOUR_API_KEY',
      authDomain: 'your-project.firebaseapp.com',
      projectId: 'your-project-id',
      storageBucket: 'your-project.appspot.com',
      messagingSenderId: '123456789',
      appId: 'your-app-id'
    }
  }
};
```

#### 3. Add Firebase SDK
In `index-refactored.html`, add before app.js:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.0.0/firebase-database-compat.js"></script>
```

#### 4. Test
1. Start game on Device A
2. Enable "🌐 Sync ON"
3. Open same game on Device B
4. Changes should sync automatically

### Option 2: Custom Backend

#### 1. Backend Requirements
Your API should support:
- POST `/api/sync` - Upload game data
- GET `/api/sync/:gameId` - Download game data
- WebSocket `/ws` - Real-time updates (optional)

#### 2. Configure Application
Edit `cloud-sync-config.js`:

```javascript
const CloudSyncConfig = {
  enabled: true,
  backend: {
    type: 'custom',
    custom: {
      apiUrl: 'https://your-api.example.com',
      wsUrl: 'wss://your-api.example.com/ws',
      authEndpoint: '/api/auth',
      syncEndpoint: '/api/sync',
      streamEndpoint: '/api/stream'
    }
  }
};
```

#### 3. Implement Backend
See `cloud-sync.js` for expected data format:

```javascript
// Upload payload
{
  teamA: { /* team data */ },
  teamB: { /* team data */ },
  gameLog: [ /* actions */ ],
  currentPeriod: 1,
  lastModified: "2026-01-24T12:00:00Z"
}
```

### Security Considerations
- ✅ Use HTTPS for production
- ✅ Implement authentication (JWT tokens)
- ✅ Add CORS headers on backend
- ✅ Validate data on server side
- ✅ Rate limiting to prevent abuse

## 📡 Live Streaming Setup

### Local Testing (Current Implementation)
Works immediately without setup:
1. Start game
2. Click "📡 Go Live"
3. Copy share link
4. Open link in another tab/device
5. Viewers see real-time updates

**Note**: This uses LocalStorage, so sharing only works on same device/browser.

### Production Setup (WebSocket)

#### 1. Backend Requirements
Implement WebSocket server:
- Broadcast game updates to connected clients
- Handle connection/disconnection
- Room-based architecture (one room per game)

#### 2. Technology Options
**Node.js + Socket.io**:
```javascript
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  socket.on('start-stream', (code) => {
    socket.join(code);
  });
  
  socket.on('game-update', (code, data) => {
    io.to(code).emit('update', data);
  });
});
```

**Python + Flask-SocketIO**:
```python
from flask_socketio import SocketIO, emit, join_room

@socketio.on('start-stream')
def handle_stream(code):
    join_room(code)

@socketio.on('game-update')
def handle_update(code, data):
    emit('update', data, room=code)
```

#### 3. Update Live Stream Module
Edit `live-stream.js`:

```javascript
// Replace pushUpdate() with WebSocket
async pushUpdate() {
  const gameData = this.getCurrentGameData();
  
  // Send via WebSocket instead of LocalStorage
  this.socket.emit('game-update', this.shareCode, gameData);
}

// Initialize WebSocket connection
initializeWebSocket() {
  this.socket = io('wss://your-server.com');
  this.socket.on('connect', () => {
    console.log('WebSocket connected');
  });
}
```

#### 4. Update Viewer Page
Edit `viewer.html`:

```javascript
// Replace polling with WebSocket
mounted() {
  this.socket = io('wss://your-server.com');
  
  this.socket.emit('join-stream', this.shareCode);
  
  this.socket.on('update', (data) => {
    this.gameData = data;
    this.lastUpdate = new Date().toLocaleTimeString();
  });
}
```

### Scaling Considerations
- **100-1000 viewers**: Single WebSocket server
- **1000-10000 viewers**: Multiple servers + Redis pub/sub
- **10000+ viewers**: CDN + edge computing (Cloudflare Workers)

### Monitoring
Add analytics to track:
- Active streams
- Viewer count per stream
- Average stream duration
- Bandwidth usage

## 🧪 Testing

### PWA Testing
```bash
# Serve over HTTPS (required for PWA)
npx serve -s . --ssl-cert cert.pem --ssl-key key.pem

# Or use ngrok for testing
ngrok http 8080
```

Test checklist:
- [ ] Install prompt appears
- [ ] App installs successfully
- [ ] Works offline after installation
- [ ] Service Worker caches assets
- [ ] Updates check on app launch

### Cloud Sync Testing
1. Open app on two devices/browsers
2. Enable sync on both
3. Make changes on Device A
4. Verify changes appear on Device B
5. Test conflict resolution (edit same data)
6. Test offline → online sync

### Live Streaming Testing
1. Start game
2. Click "Go Live"
3. Copy share link
4. Open viewer page
5. Verify real-time updates
6. Test multiple viewers
7. Test expiry (wait 24h or modify config)

## 🐛 Troubleshooting

### PWA Won't Install
- Ensure HTTPS or localhost
- Check manifest.json is valid (use [Web Manifest Validator](https://manifest-validator.appspot.com/))
- Verify all required icons exist
- Clear browser cache and try again
- Check Console for errors (F12)

### Cloud Sync Not Working
- Check `cloud-sync-config.js` has `enabled: true`
- Verify Firebase/backend credentials
- Check browser Console for errors
- Ensure CORS headers allow your domain
- Test API endpoints with curl/Postman

### Live Stream Not Updating
- Verify streaming is active (red "LIVE" indicator)
- Check share code is correct
- Open browser Console on viewer page
- Verify game data exists in LocalStorage
- For production: check WebSocket connection

### Icons Not Loading
- Run `icons/generate-icons.html` to create PNGs
- Or manually create icon files
- Verify file names match manifest.json
- Check file paths are correct
- Use absolute URLs if hosting on subdomain

## 📚 Additional Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Socket.io Documentation](https://socket.io/docs/)
- [Web App Manifest](https://web.dev/add-manifest/)

## 🔐 Security Best Practices

1. **Authentication**: Implement user auth for cloud sync
2. **Data Validation**: Validate all inputs server-side
3. **Rate Limiting**: Prevent sync/stream abuse
4. **HTTPS Only**: Never use HTTP in production
5. **Secret Management**: Use environment variables for API keys
6. **CORS**: Restrict allowed origins
7. **CSP**: Add Content Security Policy headers
8. **Input Sanitization**: Prevent XSS attacks

## 📝 License

This setup guide is part of the LALK Basketball Scoreboard application.
Use in accordance with the application license and LALK regulations.

---

**Version**: 3.0  
**Last Updated**: January 24, 2026  
**Author**: Łukasz Nowak + GitHub Copilot
