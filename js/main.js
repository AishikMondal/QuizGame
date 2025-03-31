// Generate unique ID
function generateId() {
    return 'id-' + Math.random().toString(36).substr(2, 9);
}

// Get or create player data
function getPlayerData() {
    let players = JSON.parse(localStorage.getItem('quizPlayers')) || [];
    return players;
}

// Save player data
function savePlayerData(players) {
    localStorage.setItem('quizPlayers', JSON.stringify(players));
}

// Update leaderboard
function updateLeaderboard() {
    const leaderboardList = document.getElementById('leaderboardList');
    const players = getPlayerData().sort((a, b) => b.score - a.score);
    
    leaderboardList.innerHTML = '';
    
    players.slice(0, 5).forEach(player => {
        const entry = document.createElement('div');
        entry.className = 'player-entry';
        entry.innerHTML = `
            <span class="player-name">${player.name}</span>
            <span class="player-score">${player.score} pts</span>
        `;
        leaderboardList.appendChild(entry);
    });
}

// Show full leaderboard
function showFullLeaderboard() {
    const leaderboardList = document.getElementById('leaderboardList');
    const players = getPlayerData().sort((a, b) => b.score - a.score);
    
    leaderboardList.innerHTML = '';
    
    players.forEach(player => {
        const entry = document.createElement('div');
        entry.className = 'player-entry';
        entry.innerHTML = `
            <span class="player-name">${player.name}</span>
            <span class="player-score">${player.score} pts</span>
        `;
        leaderboardList.appendChild(entry);
    });
    
    document.querySelector('.view-all').style.display = 'none';
}

// Start game function
function startGame() {
    const nameInput = document.getElementById('playerName');
    const playerName = nameInput.value.trim();
    
    if (!playerName) {
        alert('Please enter your name');
        return;
    }
    
    // Create or update player
    let players = getPlayerData();
    let player = players.find(p => p.name.toLowerCase() === playerName.toLowerCase());
    
    if (!player) {
        player = {
            id: generateId(),
            name: playerName,
            score: 0
        };
        players.push(player);
        savePlayerData(players);
    }
    
    // Store current player ID in session
    sessionStorage.setItem('currentPlayerId', player.id);
    sessionStorage.setItem('currentPlayerName', player.name);
    
    // Redirect to game
    window.location.href = 'game.html';
}

// Initialize leaderboard
updateLeaderboard();