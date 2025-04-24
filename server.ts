import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const rooms: Record<string, string[]> = {};

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);

  // Attach socket.io to the HTTP server
  const io = new SocketIOServer(httpServer, {
    path: '/api/signaling',
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      if (!rooms[roomId]) rooms[roomId] = [];
      rooms[roomId].push(socket.id);
      socket.emit('all-users', rooms[roomId].filter((id) => id !== socket.id));
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
        rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
        socket.to(roomId).emit('user-left', socket.id);
        if (rooms[roomId].length === 0) delete rooms[roomId];
      }
    });
  });

  // Let Next.js handle all other routes
  server.all('*', (req, res) => handle(req, res));

  const port = process.env.PORT || 3000;
  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});