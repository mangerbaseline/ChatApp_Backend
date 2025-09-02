import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';

import router from './routes/authroutes.js';
import messagerouter from './routes/messageroutes.js';
import friendrouter from './routes/friendrouter.js';
import Message from './models/message.js';
import grouprouter from './routes/groupRoutes.js';
import authMiddleware from './middleware/auth.js';
import GroupMessage from './models/groupMessage.js';
import Group from './models/group.js';
import User from './models/User.js';
import profileRouter from './routes/profilepicroutes.js';
import { fileURLToPath } from "url";



dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
const allowedOrigins = [
  'http://localhost:3000',
  'http://192.168.1.253:3000',
  'https://chat-app-fronend-pi.vercel.app' 
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));



// Routes
app.use('/', router);
app.use('/messages', messagerouter);
app.use('/friend', friendrouter);
app.use('/group',grouprouter,authMiddleware);
app.use('/upload-pic',profileRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

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
    origin: allowedOrigins,
    credentials: true
  }
});
io.on('connection', async(socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    socket.join(userId); // Join room named after the userId
    console.log(`User ${userId} connected with socket ${socket.id}`);
  }
  //   const groups =  await Group.find({ members: userId }); // fetch groups user belongs to
  //   groups.forEach(g => {
  //     socket.join(g._id.toString()); // join each group room
  //     console.log(`User ${userId} joined group room ${g._id}`);
  //   });
  

  socket.on('private_message', async ({ to, from, message }) => {
    try {
      const newMsg = new Message({ to, from, message });
      await newMsg.save();
      io.to(to).emit('private_message', { from, to, message });
    } catch (err) {
      console.log('Error saving message:', err);
    }
    
  });
    socket.on("friend-request-accepted", ({ senderId, receiverId }) => {
    console.log(`Friend request accepted between ${senderId} and ${receiverId}`);
    // Notify both users
    io.to(senderId).emit("friend-request-accepted", { receiverId });
    io.to(receiverId).emit("friend-request-accepted", { senderId });
  });


  /////group
  socket.on("join_groups", async (userId) => {
  try {
    const groups = await Group.find({ members: userId });
    groups.forEach(g => {
      socket.join(g._id.toString());
      console.log(`User ${userId} joined group room ${g._id}`);
    });
  } catch (err) {
    console.error("Error joining groups:", err);
  }
});

socket.on("group_message", async ({ groupId, fromId, message }) => {
  try {
    const newGroupMsg = new GroupMessage({
      sender: fromId,
      groupId,
      text: message
    });
    await newGroupMsg.save();

    // fetch sender name
    const sender = await User.findById(fromId).select("name");

    io.to(groupId).emit("group_message", {
      groupId,
      fromId,
      fromName: sender?.name || "Unknown",
      message,
      timestamp: newGroupMsg.timestamp
    });
  } catch (err) {
    console.error("Error saving group message:", err);
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
