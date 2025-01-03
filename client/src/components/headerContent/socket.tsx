// src/socket.ts

import { io } from 'socket.io-client';

// Replace with your server's URL
const SOCKET_URL = 'health-center-repo-production.up.railway.app';

const socket = io(SOCKET_URL);

// Identify the worker upon connecting
const workerId = sessionStorage.getItem('id'); // Ensure 'id' corresponds to worker's ID

if (workerId) {
  socket.emit('identify', workerId);
}

export default socket;
