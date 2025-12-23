# Basketball Scoreboard - New Features

## Version 2.3 - Latest Updates

### 🎯 Player Foul Tracking
- Individual player fouls are now tracked
- Players with 4+ fouls show ⚠️ warning badge
- Yellow border highlights players with 4+ fouls
- Foul count displayed on player buttons

### 🔊 Sound Effects
- **Buzzer sound** plays when:
  - Game clock reaches 0:00 (quarter/game end)
  - Timeout timer reaches 0:00
- No whistle sounds (as requested)
- Web Audio API synthesized beeps

### ⌨️ Keyboard Shortcuts
**Game Clock:**
- `SPACE` - Start/Pause game clock

**Team A Actions:**
- `Q` - +1 point (free throw)
- `W` - +2 points (field goal)
- `E` - +3 points (three-pointer)
- `R` - Add foul
- `T` - Made free throw

**Team B Actions:**
- `A` - +1 point (free throw)
- `S` - +2 points (field goal)
- `D` - +3 points (three-pointer)
- `F` - Add foul
- `G` - Made free throw

**Player Selection:**
- `1-5` - Select Team A on-court players (1st through 5th)
- `6-9, 0` - Select Team B on-court players (1st through 5th)

**Other:**
- `ESC` - Cancel player selection
- `CTRL+Z` / `CMD+Z` - Undo last action

### ↩️ Undo Functionality
- **Undo button** in header (visible during game)
- Reverses the last game log entry
- Restores score, fouls, and stats
- Keyboard shortcut: `CTRL+Z` / `CMD+Z`

### 📊 CSV Export
- **CSV Export button** in header
- Downloads complete game statistics
- Includes:
  - Game info (date, teams, score)
  - Player statistics (both teams)
  - Complete game log
  - Performance metrics (+/-)
- Filename: `basketball_game_[TeamA]_vs_[TeamB]_[Date].csv`

### ↔️ Possession Arrow
- Visual indicator for alternating possession
- Located next to period selector
- Shows current team with arrow: ⬅️ or ➡️
- Click to toggle between teams
- Color-coded (green = current possession)

### ⏱️ Overtime Support
- Automatic OT detection when game tied after Q4
- 5-minute overtime periods
- Multiple OT periods supported (OT1, OT2, OT3, etc.)
- Period display updates: Q1-Q4, then OT1+
- Fouls reset at start of each OT

### 📱 Better Mobile UI
- Optimized button sizes for touch targets
- Responsive layout for phone screens
- Improved spacing and padding
- Action buttons: minimum 50px height
- Player buttons: minimum 45px height
- Flexible grid layouts adapt to screen size
- Header controls wrap on small screens

### ⚠️ Auto-save Warning
- Browser alert when leaving page with active game
- Prevents accidental data loss
- Message: "You have an active game. Are you sure you want to leave?"
- Works with browser back button, refresh, close

### 📈 Performance Stats
- **+/- (Plus/Minus)** stat for each player
- Calculates point differential when player is on court
- Shows in Stats view and CSV export
- Format: `+5`, `-3`, `0`
- Tracks starting lineup and substitutions

## Summary of Changes

### app.js
- Added possession arrow state (`possessionArrow`)
- Added `playBuzzer()` method for sound effects
- Added `undoLastAction()` method
- Added `exportToCSV()` method with complete game data
- Added `togglePossessionArrow()` method
- Added `getPlayerPlusMinus()` for performance stats
- Enhanced `onQuarterEnd()` for overtime detection
- Updated `stopTimeoutTimer()` to play buzzer
- Enhanced keyboard shortcuts with player selection
- Added `beforeunload` event for unsaved changes warning
- Added `periodDisplay` computed property for OT display

### index.html
- Added **CSV Export** button in header
- Added **Undo** button in header
- Added possession arrow toggle UI
- Enhanced period selector with OT support
- Added player foul badges (⚠️ with count)
- Added `.high-fouls` class to player buttons
- Added +/- column to Stats view

### styles.css
- Added `.player-fouls` badge styling
- Added `.high-fouls` player button styling
- Added `.btn-warning` button style
- Enhanced mobile responsive styles
- Improved touch targets for mobile (50px+ heights)
- Better spacing on small screens
- Flexible header controls layout

## Testing Checklist

✅ Player fouls tracked and displayed
✅ Buzzer plays at quarter end
✅ Buzzer plays at timeout end
✅ Keyboard shortcuts work (Space, Q/W/E, A/S/D, etc.)
✅ Undo reverses last action
✅ CSV export downloads correctly
✅ Possession arrow toggles
✅ Overtime triggers when tied
✅ Mobile UI responsive
✅ Browser warns on page leave
✅ +/- stat calculates correctly

## Future Enhancements (Not Implemented)
- Shot clock (24-second timer)
- Team logos upload
- Dark mode toggle
- Live spectator dashboard
- Shot chart visualization
- Game history comparison
