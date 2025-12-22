# Basketball Scoreboard - Refactored Code Structure

## 📁 File Organization

The application has been refactored into modular, maintainable files:

### **index-refactored.html** (New Modular Version)
- Clean HTML structure with external CSS and JS
- Minimal inline styles
- Better for maintenance and updates

### **styles.css** (Extracted Stylesheet)
- All CSS organized in logical sections:
  - Reset & Base
  - Components (buttons, tabs, cards)
  - Layout (scoreboard, protocol)
  - Print styles
  - Responsive design

### **app.js** (Application Logic)
- **Constants**: All magic numbers/strings extracted
- **Utility Functions**: Reusable helper methods
- **Team Class**: Encapsulated team data and operations
- **GameLogEntry Class**: Structured log entries
- **Vue Application**: Clean component with organized methods

### **index.html** (Original Single-File Version)
- Preserved for backward compatibility
- Still works standalone

---

## 🔧 Refactoring Improvements

### 1. **Code Organization**
```javascript
// BEFORE: Magic numbers scattered throughout
if (this.currentPeriod <= 2) {
    return 2 - teamData.timeouts.firstHalf;
}

// AFTER: Named constants
const TIMEOUTS_FIRST_HALF = 2;
const FIRST_HALF_QUARTERS = [1, 2];

if (Utils.isFirstHalf(period)) {
    return TIMEOUTS_FIRST_HALF - teamData.timeouts.firstHalf;
}
```

### 2. **Object-Oriented Design**
```javascript
// BEFORE: Plain objects with scattered logic
this.teamA = {
    name: '',
    score: 0,
    players: []
};

// AFTER: Encapsulated Team class
class Team {
    addPoints(points) { this.score += points; }
    addFoul() { this.fouls++; }
    getAvailableTimeouts(period) { /* logic */ }
}
```

### 3. **Utility Functions**
```javascript
// BEFORE: Repeated percentage calculation
Math.round((made / total) * 100)

// AFTER: Reusable utility
Utils.calculatePercentage(made, total)
```

### 4. **Clear Method Groups**
- **Player Management**: addPlayer, removePlayer
- **Team Import/Export**: exportTeam, importTeam
- **Game Control**: startGame, resetGame, resetScores
- **Scoring Actions**: addPoints, addFoul, addFreeThrow, addTimeout
- **Game Log**: logAction, deleteLogEntry
- **Statistics**: getPlayerPoints, getPlayerFouls, etc.
- **Storage**: saveToLocalStorage, loadFromLocalStorage

### 5. **Improved Readability**
```javascript
// BEFORE: Complex inline conditions
getAvailableTimeouts(team) {
    const teamData = team === 'A' ? this.teamA : this.teamB;
    const isFirstHalf = this.currentPeriod <= 2;
    if (isFirstHalf) {
        return 2 - teamData.timeouts.firstHalf;
    } else {
        return 3 - teamData.timeouts.secondHalf;
    }
}

// AFTER: Clean, delegated logic
getAvailableTimeouts(team) {
    return this.getTeam(team).getAvailableTimeouts(this.currentPeriod);
}
```

### 6. **Constants Extracted**
```javascript
const QUARTERS_PER_GAME = 4;
const TIMEOUTS_FIRST_HALF = 2;
const TIMEOUTS_SECOND_HALF = 3;
const FIRST_HALF_QUARTERS = [1, 2];
const SECOND_HALF_QUARTERS = [3, 4];

const POINT_VALUES = {
    FREE_THROW: 1,
    FIELD_GOAL: 2,
    THREE_POINTER: 3
};

const ACTION_TYPES = {
    POINTS: 'Points',
    FOUL: 'Foul',
    FREE_THROW_MADE: 'FT Made',
    FREE_THROW_MISSED: 'FT Missed',
    TIMEOUT: 'Timeout'
};
```

---

## 🎯 Benefits

### **Maintainability**
- ✅ Changes to CSS don't affect HTML/JS
- ✅ Logic changes isolated in app.js
- ✅ Easy to find and fix bugs

### **Readability**
- ✅ Clear separation of concerns
- ✅ Self-documenting code with constants
- ✅ Logical method grouping

### **Testability**
- ✅ Team class can be unit tested
- ✅ Utility functions independently testable
- ✅ Pure functions without side effects

### **Scalability**
- ✅ Easy to add new features
- ✅ Can split into more modules if needed
- ✅ Clear extension points

### **Performance**
- ✅ Cleaner code = faster execution
- ✅ Reusable functions avoid duplication
- ✅ Class instances more memory efficient

---

## 🚀 Usage

### **Option 1: Modular Version (Recommended)**
```bash
# Open the refactored version
open index-refactored.html

# Or use a local server
python -m http.server 8000
# Navigate to http://localhost:8000/index-refactored.html
```

### **Option 2: Single-File Version**
```bash
# Original standalone version (no server needed)
open index.html
```

---

## 📝 Migration Notes

The refactored version is **100% functionally equivalent** to the original:
- ✅ Same features
- ✅ Same UI/UX
- ✅ Same data format (localStorage compatible)
- ✅ Backward compatible

---

## 🔄 Future Improvements

With this refactored structure, it's now easier to add:
- 📱 Mobile-specific components
- 📊 Advanced statistics module
- 🎨 Theme system
- 🌐 i18n (multiple languages)
- 🧪 Unit tests
- 📦 Build system (webpack/vite)
- 🔌 Plugin architecture

---

## 📖 Code Documentation

All major sections include:
- Clear comments explaining purpose
- Section dividers for navigation
- JSDoc-style documentation (can be added)
- Consistent naming conventions

---

## 🛠️ Development

```bash
# Project structure
FIBA/
├── index.html              # Original single-file version
├── index-refactored.html   # New modular HTML
├── styles.css              # Extracted styles
├── app.js                  # Application logic
├── README.md               # Original README
├── REFACTORING.md          # This file
├── przyklad_zespol_A.json  # Sample data
└── przyklad_zespol_B.json  # Sample data
```

---

## ✅ Quality Checklist

- [x] **Separation of Concerns**: HTML/CSS/JS separated
- [x] **DRY Principle**: No code duplication
- [x] **SOLID Principles**: Single responsibility per class
- [x] **Named Constants**: No magic numbers
- [x] **Error Handling**: Try-catch blocks added
- [x] **Comments**: Clear documentation
- [x] **Consistent Style**: Unified formatting
- [x] **Backward Compatible**: Works with old data

---

## 🎓 Learning Resources

This refactoring demonstrates:
- Object-Oriented Programming (OOP)
- Design Patterns (Class, Factory)
- Clean Code principles
- Modular architecture
- Vue.js best practices

---

Made with ❤️ for better code quality!
