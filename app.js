/* ============================================
   Basketball Scoreboard - Application Logic
   ============================================ */

// === CONSTANTS ===
const QUARTERS_PER_GAME = 4;
const TIMEOUTS_FIRST_HALF = 2;
const TIMEOUTS_SECOND_HALF = 3;
const TIMEOUTS_OVERTIME = 1;
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
        this.timeouts = { firstHalf: 0, secondHalf: 0, overtime: 0 };
        this.isHomeTeam = isHomeTeam;
    }

    addPlayer(number = '', name = '', onCourt = false, wasStarter = false, fouls = 0) {
        this.players.push({ number, name, onCourt, wasStarter, fouls: fouls || 0 });
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

    addTimeout(isFirstHalf, isOvertime = false) {
        if (isOvertime) {
            this.timeouts.overtime++;
        } else if (isFirstHalf) {
            this.timeouts.firstHalf++;
        } else {
            this.timeouts.secondHalf++;
        }
    }

    removeTimeout(isFirstHalf, isOvertime = false) {
        if (isOvertime) {
            this.timeouts.overtime = Math.max(0, this.timeouts.overtime - 1);
        } else if (isFirstHalf) {
            this.timeouts.firstHalf = Math.max(0, this.timeouts.firstHalf - 1);
        } else {
            this.timeouts.secondHalf = Math.max(0, this.timeouts.secondHalf - 1);
        }
    }

    getAvailableTimeouts(currentPeriod) {
        if (currentPeriod >= 5) {
            // Overtime
            return TIMEOUTS_OVERTIME - this.timeouts.overtime;
        }
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
        this.timeouts = { firstHalf: 0, secondHalf: 0, overtime: 0 };
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
            team.timeouts = { firstHalf: 0, secondHalf: 0, overtime: 0 };
        } else if (!team.timeouts.overtime) {
            team.timeouts.overtime = 0;
        }
        // Ensure totalFouls property exists (backward compatibility)
        if (team.totalFouls === undefined) {
            team.totalFouls = team.fouls || 0;
        }
        // Ensure free throw stats exist (backward compatibility)
        if (team.freeThrowsMade === undefined) {
            team.freeThrowsMade = 0;
        }
        if (team.freeThrowsTotal === undefined) {
            team.freeThrowsTotal = 0;
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

            // === TIMEOUT TIMER ===
            timeoutTeam: null, // 'A' or 'B'
            timeoutSeconds: 60,
            timeoutInterval: null,

            // === DRAG AND DROP STATE ===
            draggedPlayer: null,
            draggedTeam: null,
            draggedIndex: null,

            // === PENDING ACTION STATE ===
            pendingAction: null,

            // === RECENTLY SWAPPED PLAYERS ===
            recentlySwappedPlayers: [], // [{team, number}]

            // === PRINT MODE STATE ===
            printMode: 'none', // 'none', 'minimal', 'full'

            // === POSSESSION ARROW ===
            possessionArrow: null, // null, 'A', or 'B'

            // === UNSAVED CHANGES ===
            hasUnsavedChanges: false
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
            return this.gameLog.filter(entry => SECOND_HALF_QUARTERS.includes(entry.period) || entry.period >= 5);
        },

        // === PERIOD DISPLAY ===
        periodDisplay() {
            if (this.currentPeriod <= 4) {
                return `Q${this.currentPeriod}`;
            } else {
                return `OT${this.currentPeriod - 4}`;
            }
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

        clearAllPlayers(team) {
            if (confirm(`Are you sure you want to remove all players from ${this.getTeam(team).name || 'Team ' + team}?`)) {
                this.getTeam(team).players = [];
                this.saveToLocalStorage();
            }
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
            if (!player) return;
            
            // Block if player has fouled out
            if (player.fouledOut || this.getPlayerFouls(team, player.number) >= 5) {
                alert(`Player #${player.number} has fouled out and cannot play!`);
                return;
            }
            
            // If there's a pending action (points, foul, etc), execute it
            if (this.pendingAction) {
                this.selectedPlayer = { ...player, team };
                this.executePendingAction();
                return;
            }
            
            // If another player is already selected from same team, try substitution
            if (this.selectedPlayer && this.selectedPlayer.team === team && 
                this.selectedPlayer.number != player.number) {
                this.trySubstitution(team, index);
                return;
            }
            
            // If clicking same player, deselect
            if (this.selectedPlayer && this.selectedPlayer.team === team && 
                this.selectedPlayer.number == player.number) {
                this.selectedPlayer = null;
                return;
            }
            
            // Otherwise just select this player
            this.selectedPlayer = { ...player, team };
        },

        isPlayerSelected(team, player) {
            return this.selectedPlayer && 
                   this.selectedPlayer.team === team && 
                   this.selectedPlayer.number == player.number;
        },

        isPlayerRecentlySwapped(team, player) {
            return this.recentlySwappedPlayers.some(p => 
                p.team === team && p.number == player.number
            );
        },

        trySubstitution(team, index) {
            const teamData = this.getTeam(team);
            const clickedPlayer = teamData.players[index];
            const selectedPlayerObj = teamData.players.find(p => p.number === this.selectedPlayer.number);
            
            if (!selectedPlayerObj || !clickedPlayer) return;
            
            // Check if one is on court and one on bench
            if (selectedPlayerObj.onCourt === clickedPlayer.onCourt) {
                // Both in same location - just switch selection
                this.selectedPlayer = { ...clickedPlayer, team };
                return;
            }
            
            // Valid substitution - swap them
            const wasFirstOnCourt = selectedPlayerObj.onCourt;
            const wasSecondOnCourt = clickedPlayer.onCourt;
            
            // Swap their onCourt status
            selectedPlayerObj.onCourt = !selectedPlayerObj.onCourt;
            clickedPlayer.onCourt = !clickedPlayer.onCourt;
            
            // Log substitution
            const outPlayer = wasFirstOnCourt ? selectedPlayerObj : clickedPlayer;
            const inPlayer = wasFirstOnCourt ? clickedPlayer : selectedPlayerObj;
            
            this.logAction({
                team,
                teamName: teamData.name,
                action: `${ACTION_TYPES.SUBSTITUTION}: OUT #${outPlayer.number} ${outPlayer.name}, IN #${inPlayer.number} ${inPlayer.name}`,
                player: { number: inPlayer.number, name: inPlayer.name },
                period: this.currentPeriod
            });
            
            // Highlight both players that were swapped
            this.recentlySwappedPlayers = [
                { team, number: selectedPlayerObj.number },
                { team, number: clickedPlayer.number }
            ];
            
            // Clear highlight after 1.5 seconds
            setTimeout(() => {
                this.recentlySwappedPlayers = [];
            }, 1500);
            
            // Clear selection
            this.selectedPlayer = null;
            this.saveToLocalStorage();
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
            const player = teamData.players[index];
            
            // Block dragging if player has fouled out
            if (player.fouledOut || this.getPlayerFouls(team, player.number) >= 5) {
                event.preventDefault();
                alert(`Player #${player.number} has fouled out and cannot play!`);
                return;
            }
            
            this.draggedPlayer = player;
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
                
                // Block if dragged player has fouled out
                if (draggedPlayer.fouledOut || this.getPlayerFouls(team, draggedPlayer.number) >= 5) {
                    alert(`Player #${draggedPlayer.number} has fouled out and cannot play!`);
                    this.clearDragState();
                    return;
                }
                
                // Block if target player has fouled out and we're trying to put them on court
                if ((targetPlayer.fouledOut || this.getPlayerFouls(team, targetPlayer.number) >= 5) && draggedPlayer.onCourt) {
                    alert(`Player #${targetPlayer.number} has fouled out and cannot enter the court!`);
                    this.clearDragState();
                    return;
                }
                
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
            this.possessionArrow = null; // Reset possession to neutral
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
            
            // If 1 point, treat as free throw
            if (points === 1) {
                teamData.addFreeThrow(true);
                this.logAction({
                    team,
                    teamName: teamData.name,
                    action: ACTION_TYPES.FREE_THROW_MADE,
                    player: this.selectedPlayer,
                    period: this.currentPeriod,
                    points: 1
                });
            } else {
                teamData.addPoints(points);
                const action = points === 3 ? '3-Point FG' : '2-Point FG';
                this.logAction({
                    team,
                    teamName: teamData.name,
                    action,
                    player: this.selectedPlayer,
                    period: this.currentPeriod,
                    points
                });
            }

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
            
            // Check if player already has 5 fouls
            const playerFouls = this.getPlayerFouls(team, this.selectedPlayer.number);
            if (playerFouls >= 5) {
                alert(`Player #${this.selectedPlayer.number} already has 5 fouls and is disqualified!`);
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
            
            // Check if player now has 5 fouls and disqualify them
            if (playerFouls + 1 >= 5) {
                const playerIndex = teamData.players.findIndex(p => p.number === this.selectedPlayer.number);
                if (playerIndex !== -1) {
                    const player = teamData.players[playerIndex];
                    player.fouledOut = true;
                    player.onCourt = false;
                    
                    // Move player to end of bench by sorting - fouled out players go last
                    const removedPlayer = teamData.players.splice(playerIndex, 1)[0];
                    teamData.players.push(removedPlayer);
                    
                    // Force Vue reactivity update
                    this.$forceUpdate();
                    
                    // Play whistle sound
                    this.playWhistle();
                    
                    alert(`Player #${this.selectedPlayer.number} has fouled out (5 fouls) and has been removed from the court!`);
                }
            }

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
            const isOvertime = this.currentPeriod >= 5;
            
            teamData.addTimeout(isFirstHalf, isOvertime);
            
            this.logAction({
                team,
                teamName: teamData.name,
                action: ACTION_TYPES.TIMEOUT,
                player: null,
                period: this.currentPeriod
            });

            // Start timeout timer
            this.startTimeoutTimer(team);

            this.saveToLocalStorage();
        },

        // ============================================
        // GAME CLOCK
        // ============================================
        startGameClock() {
            if (this.gameClockRunning) return;
            
            // Stop timeout timer when starting game clock
            this.stopTimeoutTimer();
            
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
            // Play buzzer sound
            this.playBuzzer();
            
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
            } else if (this.currentPeriod === 4) {
                // End of Q4 - check for overtime
                if (this.teamA.score === this.teamB.score) {
                    if (confirm('Game tied! Start Overtime?')) {
                        this.currentPeriod = 5; // OT1
                        this.gameClockMinutes = 5;
                        this.gameClockSeconds = 0;
                        // DO NOT reset fouls in overtime (FIBA rules)
                        // Reset overtime timeouts
                        this.teamA.timeouts.overtime = 0;
                        this.teamB.timeouts.overtime = 0;
                        this.saveToLocalStorage();
                    }
                } else {
                    alert('Game Over! Final score: ' + this.teamA.name + ' ' + this.teamA.score + ' - ' + this.teamB.score + ' ' + this.teamB.name);
                }
            } else {
                // End of OT - check if still tied
                if (this.teamA.score === this.teamB.score) {
                    if (confirm(`Overtime ${this.currentPeriod - 4} ended - still tied! Continue to OT${this.currentPeriod - 3}?`)) {
                        this.currentPeriod++;
                        this.gameClockMinutes = 5;
                        this.gameClockSeconds = 0;
                        // DO NOT reset fouls in overtime (FIBA rules)
                        // Reset overtime timeouts for next OT
                        this.teamA.timeouts.overtime = 0;
                        this.teamB.timeouts.overtime = 0;
                        this.saveToLocalStorage();
                    }
                } else {
                    alert('Game Over! Final score: ' + this.teamA.name + ' ' + this.teamA.score + ' - ' + this.teamB.score + ' ' + this.teamB.name);
                }
            }
        },

        // ============================================
        // TIMEOUT TIMER
        // ============================================
        startTimeoutTimer(team) {
            // Clear any existing timeout timer
            this.stopTimeoutTimer();
            
            // Set timeout team and reset to 60 seconds
            this.timeoutTeam = team;
            this.timeoutSeconds = 60;
            
            // Pause game clock if running
            if (this.gameClockRunning) {
                this.pauseGameClock();
            }
            
            // Start countdown
            this.timeoutInterval = setInterval(() => {
                this.timeoutSeconds--;
                
                if (this.timeoutSeconds <= 0) {
                    this.stopTimeoutTimer();
                }
            }, 1000);
        },

        stopTimeoutTimer() {
            // Play buzzer sound when timeout ends
            if (this.timeoutInterval) {
                this.playBuzzer();
            }
            
            if (this.timeoutInterval) {
                clearInterval(this.timeoutInterval);
                this.timeoutInterval = null;
            }
            this.timeoutTeam = null;
            this.timeoutSeconds = 60;
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
                
                // Check if this was the player's 5th foul and reactivate them
                if (entry.player) {
                    const playerIndex = teamData.players.findIndex(p => p.number === entry.player.number);
                    if (playerIndex !== -1) {
                        const player = teamData.players[playerIndex];
                        // Count remaining fouls for this player after deletion
                        const remainingFouls = this.gameLog.filter((e, i) => 
                            i !== actualIndex && 
                            e.team === entry.team && 
                            e.player && 
                            e.player.number === entry.player.number &&
                            e.action === ACTION_TYPES.FOUL
                        ).length;
                        
                        // If player was fouled out but now has less than 5 fouls, reactivate
                        if (player.fouledOut && remainingFouls < 5) {
                            player.fouledOut = false;
                            
                            // Move player back from end of bench - sort so fouled-out players are at the end
                            teamData.players.sort((a, b) => {
                                // Fouled out players go to the end
                                if (a.fouledOut && !b.fouledOut) return 1;
                                if (!a.fouledOut && b.fouledOut) return -1;
                                return 0; // Maintain relative order within each group
                            });
                            
                            this.$forceUpdate();
                        }
                    }
                }
            }
            
            if (entry.action === ACTION_TYPES.FREE_THROW_MADE) {
                teamData.freeThrowsMade = Math.max(0, teamData.freeThrowsMade - 1);
                teamData.freeThrowsTotal = Math.max(0, teamData.freeThrowsTotal - 1);
            } else if (entry.action === ACTION_TYPES.FREE_THROW_MISSED) {
                teamData.freeThrowsTotal = Math.max(0, teamData.freeThrowsTotal - 1);
            }
            
            if (entry.action === ACTION_TYPES.TIMEOUT) {
                const isFirstHalf = Utils.isFirstHalf(entry.period);
                const isOvertime = entry.period >= 5;
                teamData.removeTimeout(isFirstHalf, isOvertime);
                
                // Stop timeout timer if this team's timeout is currently active
                if (this.timeoutTeam === entry.team) {
                    this.stopTimeoutTimer();
                }
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
                // If 1 point, treat as free throw
                if (action.points === 1) {
                    teamData.addFreeThrow(true);
                    this.logAction({
                        team: action.team,
                        teamName: teamData.name,
                        action: ACTION_TYPES.FREE_THROW_MADE,
                        player: this.selectedPlayer,
                        period: this.currentPeriod,
                        points: 1
                    });
                } else {
                    teamData.addPoints(action.points);
                    const actionName = action.points === 3 ? '3-Point FG' : '2-Point FG';
                    this.logAction({
                        team: action.team,
                        teamName: teamData.name,
                        action: actionName,
                        player: this.selectedPlayer,
                        period: this.currentPeriod,
                        points: action.points
                    });
                }
            } else if (action.type === 'foul') {
                // Check if player already has 5 fouls
                const playerFouls = this.getPlayerFouls(action.team, this.selectedPlayer.number);
                if (playerFouls >= 5) {
                    alert(`Player #${this.selectedPlayer.number} already has 5 fouls and is disqualified!`);
                    this.selectedPlayer = null;
                    this.pendingAction = null;
                    return;
                }
                
                teamData.addFoul();
                this.logAction({
                    team: action.team,
                    teamName: teamData.name,
                    action: ACTION_TYPES.FOUL,
                    player: this.selectedPlayer,
                    period: this.currentPeriod
                });
                
                // Check if player now has 5 fouls and disqualify them
                if (playerFouls + 1 >= 5) {
                    const playerIndex = teamData.players.findIndex(p => p.number === this.selectedPlayer.number);
                    if (playerIndex !== -1) {
                        const player = teamData.players[playerIndex];
                        player.fouledOut = true;
                        player.onCourt = false;
                        
                        // Move player to end of bench by sorting - fouled out players go last
                        const removedPlayer = teamData.players.splice(playerIndex, 1)[0];
                        teamData.players.push(removedPlayer);
                        
                        // Force Vue reactivity update
                        this.$forceUpdate();
                        
                        // Play whistle sound
                        this.playWhistle();
                        
                        alert(`Player #${this.selectedPlayer.number} has fouled out (5 fouls) and has been removed from the court!`);
                    }
                }
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

        formatPeriod(period) {
            if (period <= 4) {
                return period;
            } else {
                return `OT${period - 4}`;
            }
        },

        // ============================================
        // UNDO FUNCTIONALITY
        // ============================================
        undoLastAction() {
            if (this.gameLog.length === 0) {
                alert('No actions to undo!');
                return;
            }
            
            // Delete the last entry (which is at index 0 in reversed view)
            this.deleteLogEntry(0);
        },

        // ============================================
        // POSSESSION ARROW
        // ============================================
        togglePossessionArrow() {
            if (this.possessionArrow === null) {
                this.possessionArrow = 'A';
            } else if (this.possessionArrow === 'A') {
                this.possessionArrow = 'B';
            } else {
                this.possessionArrow = 'A';
            }
            this.saveToLocalStorage();
        },

        // ============================================
        // SOUND EFFECTS
        // ============================================
        playBuzzer() {
            // Create audio context and play buzzer beep
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = 800; // Hz
                oscillator.type = 'square';
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
            } catch (e) {
                console.log('Audio not supported:', e);
            }
        },

        playWhistle() {
            // Create audio context and play whistle sound (higher pitch, shorter duration)
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = 2000; // Hz - higher pitch for whistle
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            } catch (e) {
                console.log('Audio not supported:', e);
            }
        },

        // ============================================
        // CSV EXPORT
        // ============================================
        exportToCSV() {
            const rows = [];
            
            // Header
            rows.push(['Basketball Game Statistics']);
            rows.push(['Date', this.currentDate]);
            rows.push(['Teams', `${this.teamA.name} vs ${this.teamB.name}`]);
            rows.push(['Final Score', `${this.teamA.score} : ${this.teamB.score}`]);
            rows.push([]);
            
            // Team A Stats
            rows.push([`${this.teamA.name} - Player Statistics`]);
            rows.push(['#', 'Name', 'Played', 'Points', 'Fouls', 'FT Made', 'FT Total', 'FT%', '+/-']);
            this.teamA.players.forEach(player => {
                rows.push([
                    player.number,
                    player.name,
                    this.getPlayerStatus('A', player),
                    this.getPlayerPoints('A', player.number),
                    this.getPlayerFouls('A', player.number),
                    this.getPlayerFreeThrows('A', player.number).made,
                    this.getPlayerFreeThrows('A', player.number).total,
                    this.calculatePlayerFTPercentage('A', player.number),
                    this.getPlayerPlusMinus('A', player.number)
                ]);
            });
            rows.push([]);
            
            // Team B Stats
            rows.push([`${this.teamB.name} - Player Statistics`]);
            rows.push(['#', 'Name', 'Played', 'Points', 'Fouls', 'FT Made', 'FT Total', 'FT%', '+/-']);
            this.teamB.players.forEach(player => {
                rows.push([
                    player.number,
                    player.name,
                    this.getPlayerStatus('B', player),
                    this.getPlayerPoints('B', player.number),
                    this.getPlayerFouls('B', player.number),
                    this.getPlayerFreeThrows('B', player.number).made,
                    this.getPlayerFreeThrows('B', player.number).total,
                    this.calculatePlayerFTPercentage('B', player.number),
                    this.getPlayerPlusMinus('B', player.number)
                ]);
            });
            rows.push([]);
            
            // Game Log
            rows.push(['Game Log']);
            rows.push(['Quarter', 'Time', 'Team', 'Player', 'Action', 'Score']);
            this.gameLog.forEach(entry => {
                rows.push([
                    entry.period,
                    entry.time,
                    entry.teamName,
                    entry.player ? `#${entry.player.number} ${entry.player.name}` : '-',
                    entry.action,
                    this.getScoreAtLogIndex(this.gameLog.indexOf(entry))
                ]);
            });
            
            // Convert to CSV string
            const csvContent = rows.map(row => 
                row.map(cell => `"${cell}"`).join(',')
            ).join('\\n');
            
            // Download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `basketball_game_${this.teamA.name}_vs_${this.teamB.name}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },

        // ============================================
        // PERFORMANCE STATS
        // ============================================
        getPlayerPlusMinus(team, playerNumber) {
            // Calculate +/- when player is on court
            let plusMinus = 0;
            let onCourt = false;
            
            // Check if player started
            const teamData = this.getTeam(team);
            const player = teamData.players.find(p => p.number == playerNumber);
            if (player && player.wasStarter) {
                onCourt = true;
            }
            
            this.gameLog.forEach(entry => {
                // Check for substitutions involving this player
                if (entry.action === ACTION_TYPES.SUBSTITUTION && entry.player && entry.player.number == playerNumber && entry.team === team) {
                    onCourt = !onCourt; // Toggle on/off court
                }
                
                // Count points while on court
                if (onCourt && entry.points > 0) {
                    if (entry.team === team) {
                        plusMinus += entry.points; // Team scored
                    } else {
                        plusMinus -= entry.points; // Opponent scored
                    }
                }
            });
            
            return plusMinus > 0 ? `+${plusMinus}` : plusMinus.toString();
        },

        getPlayerShootingPercentage(team, playerNumber) {
            // Calculate FG% (excluding free throws)
            const fieldGoals = this.gameLog.filter(entry => 
                entry.team === team && 
                entry.player && 
                entry.player.number == playerNumber &&
                (entry.points === 2 || entry.points === 3)
            );
            
            return fieldGoals.length;
        },

        // ============================================
        // STORAGE
        // ============================================
        saveToLocalStorage() {
            const gameData = {
                teamA: this.teamA.toJSON(),
                teamB: this.teamB.toJSON(),
                gameLog: this.gameLog,
                currentPeriod: this.currentPeriod,
                gameClockMinutes: this.gameClockMinutes,
                gameClockSeconds: this.gameClockSeconds,
                possessionArrow: this.possessionArrow
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
                this.gameClockMinutes = data.gameClockMinutes !== undefined ? data.gameClockMinutes : 10;
                this.gameClockSeconds = data.gameClockSeconds !== undefined ? data.gameClockSeconds : 0;
                this.possessionArrow = data.possessionArrow !== undefined ? data.possessionArrow : null;
                
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

            // Spacebar - toggle game clock
            if (key === ' ') {
                event.preventDefault();
                if (this.gameClockRunning) {
                    this.pauseGameClock();
                } else {
                    this.startGameClock();
                }
            }
            
            // Team A points
            else if (key === 'Q') this.addPoints('A', 1);
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
            
            // Undo
            else if (key === 'Z' && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                this.undoLastAction();
            }
            
            // Player selection (1-5 for Team A on court)
            else if (key >= '1' && key <= '5') {
                const playerIndex = parseInt(key) - 1;
                const courtPlayers = this.teamA.getCourtPlayers();
                if (courtPlayers[playerIndex]) {
                    const actualIndex = this.teamA.players.indexOf(courtPlayers[playerIndex]);
                    this.selectPlayerByIndex('A', actualIndex);
                }
            }
            
            // Player selection (6-0 for Team B on court)
            else if (key >= '6' && key <= '9') {
                const playerIndex = parseInt(key) - 6;
                const courtPlayers = this.teamB.getCourtPlayers();
                if (courtPlayers[playerIndex]) {
                    const actualIndex = this.teamB.players.indexOf(courtPlayers[playerIndex]);
                    this.selectPlayerByIndex('B', actualIndex);
                }
            }
            else if (key === '0') {
                const courtPlayers = this.teamB.getCourtPlayers();
                if (courtPlayers[4]) {
                    const actualIndex = this.teamB.players.indexOf(courtPlayers[4]);
                    this.selectPlayerByIndex('B', actualIndex);
                }
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
        
        // Save data before page unload
        window.addEventListener('beforeunload', () => {
            this.saveToLocalStorage();
        });
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
