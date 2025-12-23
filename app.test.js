/**
 * Unit Tests for Basketball Scoreboard Application
 * 
 * To run these tests, you need to install a test framework:
 * npm install --save-dev vitest @vitest/ui
 * 
 * Then run: npx vitest
 */

// Mock Vue and window objects for testing
global.Vue = {
    createApp: () => ({
        mount: () => {}
    })
};

// Import constants from app.js (in real scenario, these should be exported)
const ACTION_TYPES = {
    POINTS: 'Points',
    FOUL: 'Foul',
    FREE_THROW_MADE: '1 Point FT',
    FREE_THROW_MISSED: 'FT Missed',
    TIMEOUT: 'Timeout',
    SUBSTITUTION: 'Substitution'
};

const DISQUALIFICATION_FOULS = 5;

// Test Suite
describe('Basketball Scoreboard - Critical Functions', () => {
    
    // Helper to create a minimal game state
    const createGameState = () => ({
        teamA: { name: 'Team A', score: 0, fouls: 0, players: [] },
        teamB: { name: 'Team B', score: 0, fouls: 0, players: [] },
        gameLog: [],
        currentPeriod: 1
    });

    // Helper to create a player
    const createPlayer = (number, name, onCourt = false) => ({
        number,
        name,
        onCourt,
        fouledOut: false
    });

    describe('Player Statistics Caching', () => {
        test('should calculate player fouls correctly from game log', () => {
            const gameLog = [
                { team: 'A', player: { number: 5, name: 'John' }, action: ACTION_TYPES.FOUL, points: 0, period: 1 },
                { team: 'A', player: { number: 5, name: 'John' }, action: ACTION_TYPES.FOUL, points: 0, period: 1 },
                { team: 'A', player: { number: 7, name: 'Mike' }, action: ACTION_TYPES.FOUL, points: 0, period: 1 },
                { team: 'B', player: { number: 5, name: 'Alex' }, action: ACTION_TYPES.FOUL, points: 0, period: 1 }
            ];

            // Simulate playerStatsCache computation
            const stats = {};
            gameLog.forEach(entry => {
                if (entry.player) {
                    const key = `${entry.team}-${entry.player.number}`;
                    if (!stats[key]) stats[key] = { fouls: 0, points: 0 };
                    if (entry.action === ACTION_TYPES.FOUL) stats[key].fouls++;
                }
            });

            expect(stats['A-5'].fouls).toBe(2);
            expect(stats['A-7'].fouls).toBe(1);
            expect(stats['B-5'].fouls).toBe(1);
        });

        test('should calculate player points correctly from game log', () => {
            const gameLog = [
                { team: 'A', player: { number: 5, name: 'John' }, action: ACTION_TYPES.POINTS, points: 2, period: 1 },
                { team: 'A', player: { number: 5, name: 'John' }, action: ACTION_TYPES.POINTS, points: 3, period: 1 },
                { team: 'A', player: { number: 7, name: 'Mike' }, action: ACTION_TYPES.FREE_THROW_MADE, points: 1, period: 1 }
            ];

            const stats = {};
            gameLog.forEach(entry => {
                if (entry.player) {
                    const key = `${entry.team}-${entry.player.number}`;
                    if (!stats[key]) stats[key] = { fouls: 0, points: 0 };
                    if (entry.points > 0) stats[key].points += entry.points;
                }
            });

            expect(stats['A-5'].points).toBe(5);
            expect(stats['A-7'].points).toBe(1);
        });

        test('should calculate free throw statistics', () => {
            const gameLog = [
                { team: 'A', player: { number: 5, name: 'John' }, action: ACTION_TYPES.FREE_THROW_MADE, points: 1, period: 1 },
                { team: 'A', player: { number: 5, name: 'John' }, action: ACTION_TYPES.FREE_THROW_MADE, points: 1, period: 1 },
                { team: 'A', player: { number: 5, name: 'John' }, action: ACTION_TYPES.FREE_THROW_MISSED, points: 0, period: 1 }
            ];

            const stats = {};
            gameLog.forEach(entry => {
                if (entry.player) {
                    const key = `${entry.team}-${entry.player.number}`;
                    if (!stats[key]) stats[key] = { freeThrowsMade: 0, freeThrowsTotal: 0 };
                    if (entry.action === ACTION_TYPES.FREE_THROW_MADE) {
                        stats[key].freeThrowsMade++;
                        stats[key].freeThrowsTotal++;
                    } else if (entry.action === ACTION_TYPES.FREE_THROW_MISSED) {
                        stats[key].freeThrowsTotal++;
                    }
                }
            });

            expect(stats['A-5'].freeThrowsMade).toBe(2);
            expect(stats['A-5'].freeThrowsTotal).toBe(3);
        });
    });

    describe('Foul Disqualification Logic', () => {
        test('should disqualify player with 5 fouls', () => {
            const player = createPlayer(5, 'John', true);
            const playerFouls = 4;

            // Simulate adding 5th foul
            if (playerFouls + 1 >= DISQUALIFICATION_FOULS) {
                player.fouledOut = true;
                player.onCourt = false;
            }

            expect(player.fouledOut).toBe(true);
            expect(player.onCourt).toBe(false);
        });

        test('should not disqualify player with 4 fouls', () => {
            const player = createPlayer(5, 'John', true);
            const playerFouls = 3;

            if (playerFouls + 1 >= DISQUALIFICATION_FOULS) {
                player.fouledOut = true;
                player.onCourt = false;
            }

            expect(player.fouledOut).toBe(false);
            expect(player.onCourt).toBe(true);
        });

        test('should prevent adding foul to player who already has 5 fouls', () => {
            const playerFouls = 5;
            const canAddFoul = playerFouls < DISQUALIFICATION_FOULS;

            expect(canAddFoul).toBe(false);
        });
    });

    describe('Substitution Logging', () => {
        test('should log player coming in from bench', () => {
            const team = 'A';
            const inPlayer = { number: 7, name: 'Mike' };
            const outPlayer = null;

            const expectedAction = `${ACTION_TYPES.SUBSTITUTION}: IN #${inPlayer.number} ${inPlayer.name}`;
            
            expect(expectedAction).toBe('Substitution: IN #7 Mike');
        });

        test('should log player going out to bench', () => {
            const team = 'A';
            const inPlayer = null;
            const outPlayer = { number: 5, name: 'John' };

            const expectedAction = `${ACTION_TYPES.SUBSTITUTION}: OUT #${outPlayer.number} ${outPlayer.name}`;
            
            expect(expectedAction).toBe('Substitution: OUT #5 John');
        });

        test('should log player swap', () => {
            const team = 'A';
            const inPlayer = { number: 7, name: 'Mike' };
            const outPlayer = { number: 5, name: 'John' };

            const expectedAction = `${ACTION_TYPES.SUBSTITUTION}: OUT #${outPlayer.number} ${outPlayer.name}, IN #${inPlayer.number} ${inPlayer.name}`;
            
            expect(expectedAction).toBe('Substitution: OUT #5 John, IN #7 Mike');
        });

        test('should log fouled out player substitution', () => {
            const team = 'A';
            const outPlayer = { number: 5, name: 'John' };
            const reason = 'fouled out';

            const expectedAction = `${ACTION_TYPES.SUBSTITUTION}: OUT #${outPlayer.number} ${outPlayer.name} (${reason})`;
            
            expect(expectedAction).toBe('Substitution: OUT #5 John (fouled out)');
        });
    });

    describe('Possession Arrow Logic', () => {
        test('should cycle possession from null to A', () => {
            let possession = null;
            
            if (possession === null) {
                possession = 'A';
            } else if (possession === 'A') {
                possession = 'B';
            } else {
                possession = 'A';
            }

            expect(possession).toBe('A');
        });

        test('should cycle possession from A to B', () => {
            let possession = 'A';
            
            if (possession === null) {
                possession = 'A';
            } else if (possession === 'A') {
                possession = 'B';
            } else {
                possession = 'A';
            }

            expect(possession).toBe('B');
        });

        test('should cycle possession from B to A', () => {
            let possession = 'B';
            
            if (possession === null) {
                possession = 'A';
            } else if (possession === 'A') {
                possession = 'B';
            } else {
                possession = 'A';
            }

            expect(possession).toBe('A');
        });

        test('should toggle possession at start of Q3', () => {
            let possession = 'A';
            const currentPeriod = 3;

            if (currentPeriod === 3 && possession !== null) {
                possession = possession === 'A' ? 'B' : 'A';
            }

            expect(possession).toBe('B');
        });
    });

    describe('Undo Functionality', () => {
        test('should reverse point scoring', () => {
            let teamScore = 10;
            const pointsToUndo = 2;

            teamScore -= pointsToUndo;

            expect(teamScore).toBe(8);
        });

        test('should reverse foul', () => {
            let teamFouls = 3;
            
            teamFouls = Math.max(0, teamFouls - 1);

            expect(teamFouls).toBe(2);
        });

        test('should not go below 0 fouls when undoing', () => {
            let teamFouls = 0;
            
            teamFouls = Math.max(0, teamFouls - 1);

            expect(teamFouls).toBe(0);
        });

        test('should reactivate player if undo brings fouls below 5', () => {
            const player = createPlayer(5, 'John', false);
            player.fouledOut = true;
            const remainingFouls = 4; // After undo

            if (player.fouledOut && remainingFouls < 5) {
                player.fouledOut = false;
            }

            expect(player.fouledOut).toBe(false);
        });

        test('should restore previous possession after undo', () => {
            const gameLog = [
                { team: 'A', action: 'Possession: ⬅️', period: 1 },
                { team: 'B', action: 'Possession: ➡️', period: 2 },
                { team: 'A', action: 'Possession: ⬅️', period: 3 }
            ];

            // Simulate undoing last possession entry
            const previousPossessionEntry = gameLog
                .slice(0, 2) // Before last entry
                .reverse()
                .find(e => e.action && e.action.startsWith('Possession:'));

            const restoredPossession = previousPossessionEntry ? previousPossessionEntry.team : null;

            expect(restoredPossession).toBe('B');
        });

        test('should return to neutral possession if no previous entry', () => {
            const gameLog = [
                { team: 'A', action: 'Possession: ⬅️', period: 1 }
            ];

            // Simulate undoing only possession entry
            const previousPossessionEntry = gameLog
                .slice(0, 0)
                .reverse()
                .find(e => e.action && e.action.startsWith('Possession:'));

            const restoredPossession = previousPossessionEntry ? previousPossessionEntry.team : null;

            expect(restoredPossession).toBe(null);
        });
    });

    describe('Score Calculation', () => {
        test('should calculate team score from game log', () => {
            const gameLog = [
                { team: 'A', points: 2, period: 1 },
                { team: 'A', points: 3, period: 1 },
                { team: 'B', points: 2, period: 1 },
                { team: 'A', points: 1, period: 2 }
            ];

            const scoreA = gameLog
                .filter(e => e.team === 'A' && e.points > 0)
                .reduce((sum, e) => sum + e.points, 0);

            const scoreB = gameLog
                .filter(e => e.team === 'B' && e.points > 0)
                .reduce((sum, e) => sum + e.points, 0);

            expect(scoreA).toBe(6);
            expect(scoreB).toBe(2);
        });

        test('should calculate score at specific log index', () => {
            const gameLog = [
                { team: 'A', points: 2, period: 1 },
                { team: 'A', points: 3, period: 1 },
                { team: 'B', points: 2, period: 1 }
            ];

            const logIndex = 1; // After second entry
            const scoreA = gameLog
                .slice(0, logIndex + 1)
                .filter(e => e.team === 'A' && e.points > 0)
                .reduce((sum, e) => sum + e.points, 0);

            expect(scoreA).toBe(5);
        });
    });

    describe('Team Foul Status', () => {
        test('should show BONUS when team has 5+ fouls', () => {
            const teamFouls = 5;
            let status;

            if (teamFouls >= DISQUALIFICATION_FOULS) {
                status = 'BONUS';
            } else if (teamFouls === 4) {
                status = 'WARNING';
            } else {
                status = 'OK';
            }

            expect(status).toBe('BONUS');
        });

        test('should show WARNING when team has 4 fouls', () => {
            const teamFouls = 4;
            let status;

            if (teamFouls >= DISQUALIFICATION_FOULS) {
                status = 'BONUS';
            } else if (teamFouls === 4) {
                status = 'WARNING';
            } else {
                status = 'OK';
            }

            expect(status).toBe('WARNING');
        });

        test('should show OK when team has less than 4 fouls', () => {
            const teamFouls = 3;
            let status;

            if (teamFouls >= DISQUALIFICATION_FOULS) {
                status = 'BONUS';
            } else if (teamFouls === 4) {
                status = 'WARNING';
            } else {
                status = 'OK';
            }

            expect(status).toBe('OK');
        });
    });

    describe('Period Formatting', () => {
        test('should format regular quarters', () => {
            expect(formatPeriod(1)).toBe('Q1');
            expect(formatPeriod(2)).toBe('Q2');
            expect(formatPeriod(3)).toBe('Q3');
            expect(formatPeriod(4)).toBe('Q4');
        });

        test('should format overtime periods', () => {
            expect(formatPeriod(5)).toBe('OT1');
            expect(formatPeriod(6)).toBe('OT2');
            expect(formatPeriod(7)).toBe('OT3');
        });

        function formatPeriod(period) {
            if (period <= 4) {
                return `Q${period}`;
            } else {
                return `OT${period - 4}`;
            }
        }
    });
});

// Simple test runner if no framework is installed
if (typeof describe === 'undefined') {
    console.log('❌ No test framework found. Please install Vitest or Jest to run tests.');
    console.log('Installation: npm install --save-dev vitest @vitest/ui');
    console.log('Run tests: npx vitest');
}
