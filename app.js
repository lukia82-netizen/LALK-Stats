/* ============================================
   Basketball Scoreboard - Application Logic
   ============================================ */

// === CONSTANTS ===
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
    FREE_THROW_MADE: '1 Point FT',
    FREE_THROW_MISSED: 'FT Missed',
    TIMEOUT: 'Timeout',
    SUBSTITUTION: 'Substitution'
};

// === UTILITY FUNCTIONS ===
const Utils = {
    getCurrentTime(minutes, seconds) {
        // Format game clock time as MM:SS
        const min = String(minutes).padStart(2, '0');
        const sec = String(seconds).padStart(2, '0');
        return `${min}:${sec}`;
    },

    formatDate(date) {
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        });
    },

    isFirstHalf(period) {
        return FIRST_HALF_QUARTERS.includes(period);
    },

    calculatePercentage(made, total) {
        if (total === 0) return 0;
        return Math.round((made / total) * 100);
    },

    downloadJSON(data, filename) {
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    getLastName(fullName) {
        if (!fullName) return '';
        const parts = fullName.trim().split(/\s+/);
        return parts[parts.length - 1];
    }
};

// === TEAM CLASS ===
class Team {
    constructor(name = '', isHomeTeam = true) {
        this.name = name;
        this.score = 0;
        this.fouls = 0; // Quarter fouls (reset each quarter, max 5 for display)
        this.totalFouls = 0; // Total fouls for entire game (for protocol)
        this.freeThrowsMade = 0;
        this.freeThrowsTotal = 0;
        this.players = [];
        this.timeouts = { firstHalf: 0, secondHalf: 0 };
        this.isHomeTeam = isHomeTeam;
    }

    addPlayer(number = '', name = '', onCourt = false, wasStarter = false) {
        this.players.push({ number, name, onCourt, wasStarter });
    }

    removePlayer(index) {
        this.players.splice(index, 1);
    }

    togglePlayerCourt(index) {
        if (this.players[index]) {
            this.players[index].onCourt = !this.players[index].onCourt;
        }
    }

    getCourtPlayers() {
        return this.players.filter(p => p.onCourt);
    }

    getReservePlayers() {
        return this.players.filter(p => !p.onCourt);
    }

    addPoints(points) {
        this.score += points;
    }

    addFoul() {
        if (this.fouls < 5) {
            this.fouls++; // Quarter fouls (capped at 5)
        }
        this.totalFouls++; // Total game fouls (unlimited)
    }

    addFreeThrow(made) {
        this.freeThrowsTotal++;
        if (made) {
            this.freeThrowsMade++;
            this.score += POINT_VALUES.FREE_THROW;
        }
    }

    addTimeout(isFirstHalf) {
        if (isFirstHalf) {
            this.timeouts.firstHalf++;
        } else {
            this.timeouts.secondHalf++;
        }
    }

    removeTimeout(isFirstHalf) {
        if (isFirstHalf) {
            this.timeouts.firstHalf = Math.max(0, this.timeouts.firstHalf - 1);
        } else {
            this.timeouts.secondHalf = Math.max(0, this.timeouts.secondHalf - 1);
        }
    }

    getAvailableTimeouts(currentPeriod) {
        const isFirstHalf = Utils.isFirstHalf(currentPeriod);
        const maxTimeouts = isFirstHalf ? TIMEOUTS_FIRST_HALF : TIMEOUTS_SECOND_HALF;
        const usedTimeouts = isFirstHalf ? this.timeouts.firstHalf : this.timeouts.secondHalf;
        return maxTimeouts - usedTimeouts;
    }

    canAddTimeout(currentPeriod) {
        return this.getAvailableTimeouts(currentPeriod) > 0;
    }

    getFreeThrowPercentage() {
        return Utils.calculatePercentage(this.freeThrowsMade, this.freeThrowsTotal);
    }

    reset() {
        this.score = 0;
        this.fouls = 0;
        this.totalFouls = 0;
        this.freeThrowsMade = 0;
        this.freeThrowsTotal = 0;
        this.timeouts = { firstHalf: 0, secondHalf: 0 };
    }

    toJSON() {
        return {
            name: this.name,
            score: this.score,
            fouls: this.fouls,
            totalFouls: this.totalFouls,
            freeThrowsMade: this.freeThrowsMade,
            freeThrowsTotal: this.freeThrowsTotal,
            players: this.players,
            timeouts: this.timeouts
        };
    }

    static fromJSON(data) {
        const team = new Team(data.name);
        Object.assign(team, data);
        // Ensure timeouts property exists (backward compatibility)
        if (!team.timeouts) {
            team.timeouts = { firstHalf: 0, secondHalf: 0 };
        }
        // Ensure onCourt property exists for all players (backward compatibility)
        if (team.players) {
            team.players = team.players.map(player => ({
                ...player,
                onCourt: player.onCourt !== undefined ? player.onCourt : false
            }));
        }
        return team;
    }
}

// === GAME LOG ENTRY ===
class GameLogEntry {
    constructor(team, teamName, action, player, period, points = 0, gameClockMinutes = 10, gameClockSeconds = 0) {
        this.team = team;
        this.teamName = teamName;
        this.action = action;
        this.player = player;
        this.period = period;
        this.points = points;
        this.time = Utils.getCurrentTime(gameClockMinutes, gameClockSeconds);
    }
}

// === VUE APPLICATION ===
const { createApp } = Vue;

createApp({
    data() {
        return {
            // === VIEW STATE ===
            currentView: 'setup',
            currentPeriod: 1,
            gameReady: false,
            selectedPlayer: null,

            // === TEAMS ===
            teamA: new Team('', true),
            teamB: new Team('', false),

            // === GAME DATA ===
            gameLog: [],
            gameTime: '00:00',

            // === GAME CLOCK ===
            gameClockMinutes: 10,
            gameClockSeconds: 0,
            gameClockRunning: false,
            gameClockInterval: null,

            // === DRAG AND DROP STATE ===
            draggedPlayer: null,
            draggedTeam: null,
            draggedIndex: null,

            // === PENDING ACTION STATE ===
            pendingAction: null,

            // === PRINT MODE STATE ===
            printMode: 'none' // 'none', 'minimal', 'full'
        };
    },

    computed: {
        // === VALIDATION ===
        canStartGame() {
            return this.teamA.name && this.teamB.name && 
                   this.teamA.players.length > 0 && this.teamB.players.length > 0;
        },

        // === TEAM FOUL STATUS ===
        teamAFoulStatus() {
            if (this.teamA.fouls >= 5) return 'BONUS';
            if (this.teamA.fouls === 4) return 'WARNING';
            return 'OK';
        },
        
        teamBFoulStatus() {
            if (this.teamB.fouls >= 5) return 'BONUS';
            if (this.teamB.fouls === 4) return 'WARNING';
            return 'OK';
        },

        // === DATE & TIME ===
        currentDate() {
            return Utils.formatDate(new Date());
        },

        gameClockFormatted() {
            const min = String(this.gameClockMinutes).padStart(2, '0');
            const sec = String(this.gameClockSeconds).padStart(2, '0');
            return `${min}:${sec}`;
        },

        // === GAME LOG FILTERS ===
        reversedGameLog() {
            return [...this.gameLog].reverse();
        },

        firstHalfLog() {
            return this.gameLog.filter(entry => FIRST_HALF_QUARTERS.includes(entry.period));
        },

        secondHalfLog() {
            return this.gameLog.filter(entry => SECOND_HALF_QUARTERS.includes(entry.period));
        }
    },

    methods: {
        // ============================================
        // PLAYER MANAGEMENT
        // ============================================
        addPlayer(team) {
            this.getTeam(team).addPlayer();
        },

        removePlayer(team, index) {
            this.getTeam(team).removePlayer(index);
        },

        togglePlayerCourt(team, index) {
            if (this.gameReady) {
                alert('Cannot change starting lineup during the game!');
                return;
            }
            this.getTeam(team).togglePlayerCourt(index);
        },

        selectPlayerByIndex(team, index) {
            const teamData = this.getTeam(team);
            const player = teamData.players[index];
            if (player) {
                this.selectedPlayer = { ...player, team };
                
                // Apply pending action if exists
                if (this.pendingAction) {
                    this.executePendingAction();
                }
            }
        },

        isPlayerSelected(team, player) {
            return this.selectedPlayer && 
                   this.selectedPlayer.team === team && 
                   this.selectedPlayer.number == player.number;
        },

        isPendingAction(team, type, value) {
            if (!this.pendingAction) return false;
            if (this.pendingAction.team !== team) return false;
            if (this.pendingAction.type !== type) return false;
            
            // For points, check the value matches
            if (type === 'points') {
                return this.pendingAction.points === value;
            }
            // For freeThrow, check if made/missed matches
            if (type === 'freeThrow') {
                return this.pendingAction.made === value;
            }
            // For foul, just check type and team (already done above)
            return true;
        },

        // ============================================
        // DRAG AND DROP FOR SUBSTITUTIONS
        // ============================================
        startDrag(team, index, event) {
            const teamData = this.getTeam(team);
            this.draggedPlayer = teamData.players[index];
            this.draggedTeam = team;
            this.draggedIndex = index;
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/html', event.target.innerHTML);
        },

        onDragOver(event) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
        },

        dropOnCourt(team, event) {
            event.preventDefault();
            if (this.draggedTeam === team && this.draggedPlayer) {
                const teamData = this.getTeam(team);
                const courtPlayers = teamData.getCourtPlayers();
                
                // Check if already on court or if court is full (max 5)
                if (!this.draggedPlayer.onCourt && courtPlayers.length < 5) {
                    this.draggedPlayer.onCourt = true;
                    this.saveToLocalStorage();
                }
                
                this.clearDragState();
            }
        },

        dropOnBench(team, event) {
            event.preventDefault();
            if (this.draggedTeam === team && this.draggedPlayer) {
                // Move to bench
                if (this.draggedPlayer.onCourt) {
                    this.draggedPlayer.onCourt = false;
                    this.saveToLocalStorage();
                }
                
                this.clearDragState();
            }
        },

        clearDragState() {
            this.draggedPlayer = null;
            this.draggedTeam = null;
            this.draggedIndex = null;
        },

        onPlayerDragEnter(team, targetIndex, event) {
            event.preventDefault();
            // Just prevent default to allow drop - no automatic swap
        },

        dropOnPlayer(team, targetIndex, event) {
            event.preventDefault();
            event.stopPropagation();
            
            // Only swap if dragging from same team and not the same player
            if (this.draggedTeam === team && this.draggedPlayer && this.draggedIndex !== targetIndex) {
                const teamData = this.getTeam(team);
                const targetPlayer = teamData.players[targetIndex];
                const draggedPlayer = this.draggedPlayer;
                
                // Determine substitution type
                const draggedWasOnCourt = draggedPlayer.onCourt;
                const targetWasOnCourt = targetPlayer.onCourt;
                
                // Swap their onCourt status
                const tempStatus = draggedPlayer.onCourt;
                draggedPlayer.onCourt = targetPlayer.onCourt;
                targetPlayer.onCourt = tempStatus;
                
                // Log substitutions to game log
                if (draggedWasOnCourt && !targetWasOnCourt) {
                    // Dragged player went to bench, target came to court
                    this.logAction({
                        team,
                        teamName: teamData.name,
                        action: `${ACTION_TYPES.SUBSTITUTION}: OUT #${draggedPlayer.number} ${draggedPlayer.name}, IN #${targetPlayer.number} ${targetPlayer.name}`,
                        player: { number: targetPlayer.number, name: targetPlayer.name },
                        period: this.currentPeriod
                    });
                } else if (!draggedWasOnCourt && targetWasOnCourt) {
                    // Dragged player came to court, target went to bench
                    this.logAction({
                        team,
                        teamName: teamData.name,
                        action: `${ACTION_TYPES.SUBSTITUTION}: OUT #${targetPlayer.number} ${targetPlayer.name}, IN #${draggedPlayer.number} ${draggedPlayer.name}`,
                        player: { number: draggedPlayer.number, name: draggedPlayer.name },
                        period: this.currentPeriod
                    });
                }
                
                this.saveToLocalStorage();
            }
            
            this.clearDragState();
        },

        getLastName(fullName) {
            return Utils.getLastName(fullName);
        },

        // ============================================
        // TEAM IMPORT/EXPORT
        // ============================================
        exportTeam(team) {
            const teamData = this.getTeam(team);
            const filename = `team_${teamData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
            Utils.downloadJSON(teamData.toJSON(), filename);
        },

        importTeam(team, event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    // Ensure timeouts property exists (backward compatibility)
                    if (!data.timeouts) {
                        data.timeouts = { firstHalf: 0, secondHalf: 0 };
                    }
                    // Ensure onCourt property exists for all players (backward compatibility)
                    if (data.players) {
                        data.players = data.players.map(player => ({
                            ...player,
                            onCourt: player.onCourt !== undefined ? player.onCourt : false
                        }));
                    }
                    const teamObj = this.getTeam(team);
                    Object.assign(teamObj, data);
                    alert('Team imported successfully!');
                } catch (error) {
                    alert('Error importing file!');
                    console.error(error);
                }
            };
            reader.readAsText(file);
        },

        // ============================================
        // GAME CONTROL
        // ============================================
        startGame() {
            if (!this.canStartGame) return;
            
            // Mark starting lineup
            this.teamA.players.forEach(p => p.wasStarter = p.onCourt);
            this.teamB.players.forEach(p => p.wasStarter = p.onCourt);
            
            this.gameReady = true;
            this.currentView = 'game';
            this.resetScores();
            this.gameLog = [];
            this.currentPeriod = 1;
            this.resetGameClock();
            this.saveToLocalStorage();
            alert('Game started! Good luck! Press Start to begin the clock.');
        },

        resetGame() {
            if (!confirm('Are you sure you want to reset the game? All data will be lost.')) {
                return;
            }
            this.gameReady = false;
            this.currentView = 'setup';
            // Clear starting lineup flags
            this.teamA.players.forEach(p => p.wasStarter = false);
            this.teamB.players.forEach(p => p.wasStarter = false);
            this.resetScores();
            this.gameLog = [];
            this.currentPeriod = 1;
            this.resetGameClock();
            this.saveToLocalStorage();
        },

        resetScores() {
            this.teamA.reset();
            this.teamB.reset();
        },

        // ============================================
        // SCORING ACTIONS
        // ============================================
        addPoints(team, points) {
            // If no player selected, store as pending action
            if (!this.selectedPlayer) {
                this.pendingAction = {
                    type: 'points',
                    team,
                    points
                };
                return;
            }
            
            // Prevent adding points to opposite team's player
            if (this.selectedPlayer.team !== team) {
                alert('Cannot add points for opposite team\'s player!');
                return;
            }
            
            const teamData = this.getTeam(team);
            teamData.addPoints(points);
            
            const action = points === 3 ? '3-Point FG' : points === 2 ? '2-Point FG' : '1-Point';
            this.logAction({
                team,
                teamName: teamData.name,
                action,
                player: this.selectedPlayer,
                period: this.currentPeriod,
                points
            });

            this.selectedPlayer = null;
            this.saveToLocalStorage();
        },

        addFoul(team) {
            // If no player selected, store as pending action
            if (!this.selectedPlayer) {
                this.pendingAction = {
                    type: 'foul',
                    team
                };
                return;
            }
            
            // Prevent adding foul to opposite team's player
            if (this.selectedPlayer.team !== team) {
                alert('Cannot add foul for opposite team\'s player!');
                return;
            }
            
            const teamData = this.getTeam(team);
            teamData.addFoul();
            
            this.logAction({
                team,
                teamName: teamData.name,
                action: ACTION_TYPES.FOUL,
                player: this.selectedPlayer,
                period: this.currentPeriod
            });

            this.selectedPlayer = null;
            this.saveToLocalStorage();
        },

        addFreeThrow(team, made) {
            // If no player selected, store as pending action
            if (!this.selectedPlayer) {
                this.pendingAction = {
                    type: 'freeThrow',
                    team,
                    made
                };
                return;
            }
            
            // Prevent adding free throw to opposite team's player
            if (this.selectedPlayer.team !== team) {
                alert('Cannot add free throw for opposite team\'s player!');
                return;
            }
            
            const teamData = this.getTeam(team);
            teamData.addFreeThrow(made);
            
            const action = made ? ACTION_TYPES.FREE_THROW_MADE : ACTION_TYPES.FREE_THROW_MISSED;
            this.logAction({
                team,
                teamName: teamData.name,
                action,
                player: this.selectedPlayer,
                period: this.currentPeriod,
                points: made ? POINT_VALUES.FREE_THROW : 0
            });

            this.selectedPlayer = null;
            this.saveToLocalStorage();
        },

        addTimeout(team) {
            const teamData = this.getTeam(team);
            const isFirstHalf = Utils.isFirstHalf(this.currentPeriod);
            
            teamData.addTimeout(isFirstHalf);
            
            this.logAction({
                team,
                teamName: teamData.name,
                action: ACTION_TYPES.TIMEOUT,
                player: null,
                period: this.currentPeriod
            });

            this.saveToLocalStorage();
        },

        // ============================================
        // GAME CLOCK
        // ============================================
        startGameClock() {
            if (this.gameClockRunning) return;
            
            this.gameClockRunning = true;
            this.gameClockInterval = setInterval(() => {
                if (this.gameClockSeconds === 0) {
                    if (this.gameClockMinutes === 0) {
                        // Quarter ended
                        this.pauseGameClock();
                        this.onQuarterEnd();
                        return;
                    }
                    this.gameClockMinutes--;
                    this.gameClockSeconds = 59;
                } else {
                    this.gameClockSeconds--;
                }
            }, 1000);
        },

        pauseGameClock() {
            this.gameClockRunning = false;
            if (this.gameClockInterval) {
                clearInterval(this.gameClockInterval);
                this.gameClockInterval = null;
            }
        },

        resetGameClock() {
            this.pauseGameClock();
            this.gameClockMinutes = 10;
            this.gameClockSeconds = 0;
        },

        setCustomGameClock() {
            this.pauseGameClock();
            
            const timeInput = prompt('Enter time in MM:SS format (e.g., 10:00, 05:30):', 
                `${String(this.gameClockMinutes).padStart(2, '0')}:${String(this.gameClockSeconds).padStart(2, '0')}`);
            
            if (timeInput === null) return; // User cancelled
            
            const parts = timeInput.trim().split(':');
            if (parts.length !== 2) {
                alert('Invalid format! Please use MM:SS format (e.g., 10:00)');
                return;
            }
            
            const minutes = parseInt(parts[0]);
            const seconds = parseInt(parts[1]);
            
            if (isNaN(minutes) || isNaN(seconds) || minutes < 0 || seconds < 0 || seconds >= 60) {
                alert('Invalid time! Minutes must be >= 0 and seconds must be between 0-59.');
                return;
            }
            
            this.gameClockMinutes = minutes;
            this.gameClockSeconds = seconds;
        },

        onQuarterEnd() {
            if (this.currentPeriod < 4) {
                if (confirm(`Quarter ${this.currentPeriod} ended! Start Quarter ${this.currentPeriod + 1}?`)) {
                    this.currentPeriod++;
                    this.resetGameClock();
                    
                    // Reset team fouls for new quarter
                    this.teamA.fouls = 0;
                    this.teamB.fouls = 0;
                    
                    this.saveToLocalStorage();
                    alert(`Quarter ${this.currentPeriod} ready. Press Start to begin the clock.`);
                }
            } else {
                alert('Game Over! Final score: ' + this.teamA.name + ' ' + this.teamA.score + ' - ' + this.teamB.score + ' ' + this.teamB.name);
                this.resetGameClock();
            }
        },

        // ============================================
        // GAME LOG
        // ============================================
        logAction(data) {
            const entry = new GameLogEntry(
                data.team,
                data.teamName,
                data.action,
                data.player,
                data.period,
                data.points || 0,
                this.gameClockMinutes,
                this.gameClockSeconds
            );
            this.gameLog.push(entry);
        },

        deleteLogEntry(index) {
            const entry = this.reversedGameLog[index];
            const actualIndex = this.gameLog.indexOf(entry);
            
            if (actualIndex === -1) return;

            // Reverse the action
            const teamData = this.getTeam(entry.team);
            
            if (entry.points > 0) {
                teamData.score -= entry.points;
            }
            
            if (entry.action === ACTION_TYPES.FOUL) {
                teamData.fouls = Math.max(0, teamData.fouls - 1);
            }
            
            if (entry.action === ACTION_TYPES.FREE_THROW_MADE) {
                teamData.freeThrowsMade = Math.max(0, teamData.freeThrowsMade - 1);
                teamData.freeThrowsTotal = Math.max(0, teamData.freeThrowsTotal - 1);
            } else if (entry.action === ACTION_TYPES.FREE_THROW_MISSED) {
                teamData.freeThrowsTotal = Math.max(0, teamData.freeThrowsTotal - 1);
            }
            
            if (entry.action === ACTION_TYPES.TIMEOUT) {
                const isFirstHalf = Utils.isFirstHalf(entry.period);
                teamData.removeTimeout(isFirstHalf);
            }

            this.gameLog.splice(actualIndex, 1);
            this.saveToLocalStorage();
        },

        // ============================================
        // PENDING ACTION EXECUTION
        // ============================================
        executePendingAction() {
            if (!this.pendingAction || !this.selectedPlayer) return;
            
            const action = { ...this.pendingAction };
            
            // Clear pending action BEFORE executing to prevent conflicts
            this.pendingAction = null;
            
            // Check if selected player is from the correct team
            if (this.selectedPlayer.team !== action.team) {
                alert('Cannot apply action to opposite team\'s player!');
                this.selectedPlayer = null;
                return;
            }
            
            // Execute the pending action directly without calling the original methods
            // to avoid the selectedPlayer check
            const teamData = this.getTeam(action.team);
            
            if (action.type === 'points') {
                teamData.addPoints(action.points);
                const actionName = action.points === 3 ? '3-Point FG' : action.points === 2 ? '2-Point FG' : '1-Point';
                this.logAction({
                    team: action.team,
                    teamName: teamData.name,
                    action: actionName,
                    player: this.selectedPlayer,
                    period: this.currentPeriod,
                    points: action.points
                });
            } else if (action.type === 'foul') {
                teamData.addFoul();
                this.logAction({
                    team: action.team,
                    teamName: teamData.name,
                    action: ACTION_TYPES.FOUL,
                    player: this.selectedPlayer,
                    period: this.currentPeriod
                });
            } else if (action.type === 'freeThrow') {
                teamData.addFreeThrow(action.made);
                const actionName = action.made ? ACTION_TYPES.FREE_THROW_MADE : ACTION_TYPES.FREE_THROW_MISSED;
                this.logAction({
                    team: action.team,
                    teamName: teamData.name,
                    action: actionName,
                    player: this.selectedPlayer,
                    period: this.currentPeriod,
                    points: action.made ? POINT_VALUES.FREE_THROW : 0
                });
            }
            
            this.selectedPlayer = null;
            this.saveToLocalStorage();
        },

        // ============================================
        // PLAYER SELECTION
        // ============================================
        selectPlayer(team, player) {
            this.selectedPlayer = { ...player, team };
        },

        cancelSelection() {
            this.selectedPlayer = null;
            this.pendingAction = null;
        },

        // ============================================
        // STATISTICS HELPERS
        // ============================================
        getTeam(teamId) {
            return teamId === 'A' ? this.teamA : this.teamB;
        },

        getAvailableTimeouts(team) {
            return this.getTeam(team).getAvailableTimeouts(this.currentPeriod);
        },

        canAddTimeout(team) {
            return this.getTeam(team).canAddTimeout(this.currentPeriod);
        },

        calculateFreeThrowPercentage(team) {
            return this.getTeam(team).getFreeThrowPercentage();
        },

        getPlayerPoints(team, playerNumber) {
            return this.gameLog
                .filter(entry => entry.team === team && 
                               entry.player && 
                               entry.player.number == playerNumber &&
                               entry.points > 0)
                .reduce((sum, entry) => sum + entry.points, 0);
        },

        getPlayerFouls(team, playerNumber) {
            return this.gameLog
                .filter(entry => entry.team === team && 
                               entry.player && 
                               entry.player.number == playerNumber &&
                               entry.action === ACTION_TYPES.FOUL)
                .length;
        },

        getPlayerFreeThrows(team, playerNumber) {
            const entries = this.gameLog.filter(entry => 
                entry.team === team && 
                entry.player && 
                entry.player.number == playerNumber &&
                (entry.action === ACTION_TYPES.FREE_THROW_MADE || 
                 entry.action === ACTION_TYPES.FREE_THROW_MISSED)
            );
            
            const made = entries.filter(e => e.action === ACTION_TYPES.FREE_THROW_MADE).length;
            const total = entries.length;
            
            return { made, total };
        },

        calculatePlayerFTPercentage(team, playerNumber) {
            const ft = this.getPlayerFreeThrows(team, playerNumber);
            return ft.total === 0 ? '-' : Utils.calculatePercentage(ft.made, ft.total) + '%';
        },

        didPlayerPlay(team, playerNumber) {
            // Check if player has any actions in game log
            return this.gameLog.some(entry => 
                entry.team === team && 
                entry.player && 
                entry.player.number == playerNumber
            );
        },

        getPlayerStatus(team, player) {
            // Check if player was in starting lineup
            const wasStarter = player.wasStarter === true;
            const played = this.didPlayerPlay(team, player.number);
            
            if (wasStarter) {
                return '⭕'; // Circle for starting lineup
            } else if (played) {
                return 'X'; // X for played as substitute
            } else {
                return '--'; // Dash for did not play
            }
        },

        getQuarterScore(team, quarter) {
            return this.gameLog
                .filter(entry => entry.team === team && 
                               entry.period === quarter && 
                               entry.points > 0)
                .reduce((sum, entry) => sum + entry.points, 0);
        },

        getScoreAtLogIndex(logIndex) {
            const scoreA = this.gameLog
                .slice(0, logIndex + 1)
                .filter(e => e.team === 'A' && e.points > 0)
                .reduce((sum, e) => sum + e.points, 0);
            
            const scoreB = this.gameLog
                .slice(0, logIndex + 1)
                .filter(e => e.team === 'B' && e.points > 0)
                .reduce((sum, e) => sum + e.points, 0);
            
            return `${scoreA}:${scoreB}`;
        },

        // ============================================
        // STORAGE
        // ============================================
        saveToLocalStorage() {
            const gameData = {
                teamA: this.teamA.toJSON(),
                teamB: this.teamB.toJSON(),
                gameLog: this.gameLog,
                currentPeriod: this.currentPeriod
            };
            localStorage.setItem('basketballGame', JSON.stringify(gameData));
        },

        loadFromLocalStorage() {
            const saved = localStorage.getItem('basketballGame');
            if (!saved) return;

            try {
                const data = JSON.parse(saved);
                this.teamA = Team.fromJSON(data.teamA);
                this.teamB = Team.fromJSON(data.teamB);
                this.gameLog = data.gameLog || [];
                this.currentPeriod = data.currentPeriod || 1;
                
                if (this.teamA.name && this.teamB.name) {
                    this.gameReady = true;
                }
            } catch (error) {
                console.error('Error loading game data:', error);
            }
        },

        saveGame() {
            this.saveToLocalStorage();
            
            const gameData = {
                date: new Date().toISOString(),
                teamA: this.teamA.toJSON(),
                teamB: this.teamB.toJSON(),
                gameLog: this.gameLog,
                finalScore: `${this.teamA.score} - ${this.teamB.score}`
            };
            
            const filename = `game_${this.teamA.name}_vs_${this.teamB.name}_${new Date().toISOString().split('T')[0]}.json`;
            Utils.downloadJSON(gameData, filename);
            alert('Game saved!');
        },

        // ============================================
        // PRINT & EXPORT
        // ============================================
        printProtocol() {
            this.currentView = 'protocol';
            this.printMode = 'minimal';
            setTimeout(() => {
                window.print();
                this.printMode = 'none';
            }, 100);
        },

        exportToPDF() {
            this.currentView = 'protocol';
            this.printMode = 'full';
            setTimeout(() => {
                alert('Use your browser\'s Print function and select "Save as PDF"');
                window.print();
                this.printMode = 'none';
            }, 100);
        },

        // ============================================
        // KEYBOARD SHORTCUTS
        // ============================================
        handleKeyPress(event) {
            if (this.currentView !== 'game') return;

            const key = event.key.toUpperCase();

            // Team A points
            if (key === 'Q') this.addPoints('A', 1);
            else if (key === 'W') this.addPoints('A', 2);
            else if (key === 'E') this.addPoints('A', 3);
            
            // Team B points
            else if (key === 'A') this.addPoints('B', 1);
            else if (key === 'S') this.addPoints('B', 2);
            else if (key === 'D') this.addPoints('B', 3);
            
            // Fouls
            else if (key === 'R') this.addFoul('A');
            else if (key === 'F') this.addFoul('B');
            
            // Free throws
            else if (key === 'T') this.addFreeThrow('A', true);
            else if (key === 'G') this.addFreeThrow('B', true);
            
            // Player selection (1-5)
            else if (key >= '1' && key <= '5') {
                const playerIndex = parseInt(key) - 1;
                // Toggle between teams or select from current context
            }
            
            // Cancel selection
            else if (key === 'ESCAPE') this.cancelSelection();
        }
    },

    mounted() {
        // Load saved game data
        this.loadFromLocalStorage();
        
        // Add keyboard event listener
        window.addEventListener('keydown', this.handleKeyPress);
    },

    beforeUnmount() {
        // Clean up event listener
        window.removeEventListener('keydown', this.handleKeyPress);
        
        // Clean up game clock interval
        if (this.gameClockInterval) {
            clearInterval(this.gameClockInterval);
        }
    }
}).mount('#app');
