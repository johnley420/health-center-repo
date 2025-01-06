// src/socket.ts

import { io } from 'socket.io-client';

// Replace with your server's URL
const SOCKET_URL = 'http://localhost:8081';

const socket = io(SOCKET_URL);

// Identify the worker upon connecting
const workerId = sessionStorage.getItem('id'); // Ensure 'id' corresponds to worker's ID

if (workerId) {
  socket.emit('identify', workerId);
}

export default socket;
