// frontend/js/game.js

// 1. Connect to the Socket.io server (The Referee)
const socket = io(); 

// 2. Set up the Canvas (The TV Screen)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let myId = null;
let gameState = null;
const params = new URLSearchParams(window.location.search);
let currentMatchId = params.get('id');// Hardcoded match name for testing

// Tell the server we want to play!
const user = JSON.parse(localStorage.getItem('user') || '{}');
socket.emit('join_match', { matchId: currentMatchId, userId: user.id });
// --- SOCKET LISTENERS (Listening to the Referee) ---

socket.on('game_start', (state) => {
    myId = socket.id;
    gameState = state;
    console.log("🎮 Game started! You are connected.");
});

// Every time the server says someone moved, update our state and redraw
socket.on('state_update', (state) => {
    gameState = state;
    drawGame();
});

// When the server announces a winner
socket.on('game_over', ({ winner }) => {
    if (winner === socket.id) {
        alert("🏆 YOU WIN! First strike!");
    } else {
        alert("💀 YOU LOSE! You got hit.");
    }
    // Reset the match so you can play again
const user = JSON.parse(localStorage.getItem('user') || '{}');
socket.emit('join_match', { matchId: currentMatchId, userId: user.id });});

// --- CONTROLS (Your Controller) ---

// Listen for keyboard presses and tell the server
document.addEventListener('keydown', (e) => {
    if (!gameState || gameState.status !== 'playing') return;

    if (e.key === 'ArrowLeft') {
        socket.emit('rotate', { matchId: currentMatchId, direction: 'left' });
    }
    if (e.key === 'ArrowRight') {
        socket.emit('rotate', { matchId: currentMatchId, direction: 'right' });
    }
});

// --- DRAWING LOGIC (Painting the Screen) ---

function drawGame() {
    // Wipe the screen clean every single frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameState) return;

    // Draw Player 1 (Blue)
    if (gameState.p1) {
        drawPlayer(gameState.p1.x, gameState.p1.y, gameState.p1.angle, '#3498db');
    }
    
    // Draw Player 2 (Red)
    if (gameState.p2) {
        drawPlayer(gameState.p2.x, gameState.p2.y, gameState.p2.angle, '#e74c3c');
    }
}

function drawPlayer(x, y, angle, color) {
    // 1. Draw the player's body (a circle)
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();

    // 2. Draw the weapon (a line pointing outward)
    ctx.save();
    ctx.translate(x, y); 
    ctx.rotate((angle * Math.PI) / 180); // Convert degrees to radians for Canvas
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(80, 0); // This 80 is the length of the weapon!
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.closePath();
    
    ctx.restore();
}
