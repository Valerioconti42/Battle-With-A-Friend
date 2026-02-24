import http from 'http';
import app from './app.js'; // This imports all your existing API routes!
import { initGameServer } from './socket.js'; // This imports the game logic above

const PORT = process.env.PORT || 3000;

// Create a raw HTTP server and wrap it around your Express app
const server = http.createServer(app);

// Attach our new real-time Socket.io game engine to the server
initGameServer(server);

// Start listening!
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Game Socket engine initialized!`);
});
