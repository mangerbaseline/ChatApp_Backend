import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

import router from './routes/authroutes.js';
import messagerouter from './routes/messageroutes.js';
import friendrouter from './routes/friendrouter.js';
import Message from './models/message.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.1.253:3000', 'https://chatapp-backend-j1f0.onrender.com'],
  credentials: true
}));

// Routes
app.use('/', router);
app.use('/messages', messagerouter);
app.use('/friend', friendrouter);

// Connect to MongoDB
(async function dbconnect() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
})();

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://192.168.1.253:3000', 'https://chatapp-backend-j1f0.onrender.com'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    socket.join(userId); // Join room named after the userId
    console.log(`User ${userId} connected with socket ${socket.id}`);
  }

  socket.on('private_message', async ({ to, from, message }) => {
    try {
      const newMsg = new Message({ to, from, message });
      await newMsg.save();
      console.log(`Saved message from ${from} to ${to}: ${message}`);

      // Send only to the intended user's room
      io.to(to).emit('private_message', { from, to, message });
    } catch (err) {
      console.log('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
});

// Start server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server started at port: ${port}`);
});
