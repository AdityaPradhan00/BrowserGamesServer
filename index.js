import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import ticTacToeSocket from './sockets/ticTacToeSocket.js';
import superTicTacToeSocket from './sockets/superTicTacToeSocket.js'

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });


ticTacToeSocket(io);
superTicTacToeSocket(io);
server.listen(5000, () => {
    console.log('listening on Port :5000');
})