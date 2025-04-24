import { NextRequest } from 'next/server';
import { Server as IOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';

// Type augmentation for Next.js Edge API Route
interface CustomSocket extends NetSocket {
  server: HTTPServer & { io?: IOServer };
}

const rooms: Record<string, string[]> = {};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: any, res: any) {
  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server, {
      path: '/api/signaling',
      addTrailingSlash: false,
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

    res.socket.server.io = io;
  }
  res.end();
}
