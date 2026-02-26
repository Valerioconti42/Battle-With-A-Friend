import { Server } from 'socket.io';

export function initGameServer(httpServer) {
    // Set up Socket.io and allow your local network to connect
    const io = new Server(httpServer, { 
        cors: { origin: '*' } 
    });

    // This object will hold all active matches
    const rooms = {}; 

    io.on('connection', (socket) => {
        console.log('🎮 A player connected:', socket.id);

        // 1. Put the player in a match
        socket.on('join_match', (matchId) => {
            socket.join(matchId);
            
            if (!rooms[matchId]) {
                // First player to join becomes Player 1 (Blue, on the left)
                rooms[matchId] = {
                    p1: { id: socket.id, angle: 0, x: 200, y: 300 },
                    p2: null,
                    status: 'waiting'
                };
                console.log(`Player 1 joined match ${matchId}`);
            } else {
                // Second player becomes Player 2 (Red, on the right)
                rooms[matchId].p2 = { id: socket.id, angle: 180, x: 600, y: 300 };
                rooms[matchId].status = 'playing';
                console.log(`Player 2 joined! Match ${matchId} starting.`);
                
                // Tell both players the game has started!
                io.to(matchId).emit('game_start', rooms[matchId]);
            }
        });

        // 2. Handle the weapon rotation
        socket.on('rotate', ({ matchId, direction }) => {
            const room = rooms[matchId];
            if (!room || room.status !== 'playing') return;

            const speed = 5; // How fast the weapon rotates (degrees per tick)
            const player = room.p1.id === socket.id ? room.p1 : room.p2;
            
            // Update the player's angle
            if (direction === 'left') player.angle -= speed;
            if (direction === 'right') player.angle += speed;

            // 3. Collision Detection (Did they hit the other player?)
            // We check if the angle of the weapon is pointing exactly at the opponent
            const targetAngleP1toP2 = 0;   // P1 needs to point right (0 degrees) to hit P2
            const targetAngleP2toP1 = 180; // P2 needs to point left (180 degrees) to hit P1

            // Normalize angles to be between 0 and 360 for easier math
            const p1NormalizedAngle = ((room.p1.angle % 360) + 360) % 360;
            const p2NormalizedAngle = ((room.p2.angle % 360) + 360) % 360;

            // If Player 1 is aiming within 5 degrees of Player 2
            if (room.p1.id === socket.id && Math.abs(p1NormalizedAngle - targetAngleP1toP2) < 5) {
                io.to(matchId).emit('game_over', { winner: room.p1.id });
                room.status = 'finished';
            } 
            // If Player 2 is aiming within 5 degrees of Player 1
            else if (room.p2.id === socket.id && Math.abs(p2NormalizedAngle - targetAngleP2toP1) < 5) {
                io.to(matchId).emit('game_over', { winner: room.p2.id });
                room.status = 'finished';
            }

            // 4. Send the new positions to both players so their screens update
            io.to(matchId).emit('state_update', room);
        });

        socket.on('disconnect', () => {
            console.log('❌ Player disconnected:', socket.id);
            // Optional: If a player leaves, you could automatically end the match here
        });
    });
}
