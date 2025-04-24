// Simple socket.io signaling server for WebRTC (TypeScript)
// Save as signaling-server.ts and run with: npx ts-node signaling-server.ts

import { Server } from 'socket.io';

const io = new Server(4000, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

interface RoomMap {
  [roomId: string]: string[];
}

const rooms: RoomMap = {};

io.on('connection', (socket) => {
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push(socket.id);
    // Send all users except self
    socket.emit('all-users', rooms[roomId].filter(id => id !== socket.id));
    // Notify others
    socket.to(roomId).emit('user-joined', { signal: null, callerId: socket.id });
    (socket as any).roomId = roomId;
  });

  socket.on('sending-signal', ({ userToSignal, callerId, signal }) => {
    io.to(userToSignal).emit('user-joined', { signal, callerId });
  });

  socket.on('returning-signal', ({ signal, callerId }) => {
    io.to(callerId).emit('receiving-returned-signal', { id: socket.id, signal });
  });

  socket.on('disconnect', () => {
    const roomId = (socket as any).roomId;
    if (roomId && rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
      socket.to(roomId).emit('user-left', socket.id);
      if (rooms[roomId].length === 0) delete rooms[roomId];
    }
  });
});

console.log('Signaling server running on ws://localhost:4000');
