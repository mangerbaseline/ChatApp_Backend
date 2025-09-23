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

import cloudinary from './cloudinary.js';
import fs from 'fs';
import client from './radisClient.js';



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
app.use('/group', grouprouter, authMiddleware);
app.use('/upload-pic', profileRouter);

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


io.on('connection', async (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.join(userId);

    // 1. Add user to the online_users set in Redis
    await client.sAdd("online_users", userId);
    console.log(`User ${userId} connected with socket ${socket.id}`);

    // 2. Broadcast the 'user-online' event to all other clients
    socket.broadcast.emit("user-online", userId);
  }

  // When a user joins, put them in a room with their userId
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their personal room`);
  });

  // Caller sends a call offer
  socket.on("callUser", (data) => {
    console.log("callUser event received:", data);

    // Send the offer to the target user's room
    socket.to(data.userToCall).emit("callUser", {
      signalData: data.signalData,
      from: data.from,        // caller's userId
    });
  });

  // Receiver answers the call
  socket.on("answerCall", (data) => {
    console.log("answerCall event received:", data);

    // Send the answer back to the caller's room
    
    socket.to(data.to).emit("callAccepted", data.signal);
    console.log("call answered",data.signal);
    
  });

  socket.on("endCall", (data) => {
    io.to(data.to).emit("callEnded");
  });


  socket.on('private_message', async ({ to, from, message }) => {
    try {
      const newMsg = new Message({ to, from, message });
      console.log("message sent from", { from }, "and", { message });

      await newMsg.save();
      io.to(to).emit('private_message', { from, to, message });
    } catch (err) {
      console.log('Error saving message:', err);
    }

  });


  // socket.on("private_file", async ({ to, from, fileName, fileType, fileData }) => {
  //   try {
  //     console.log("reached back");

  //     let fileUrl = null;
  //     if (fileData) {
  //       // console.log("file data", fileData);

  //       const buffer = Buffer.from(fileData, "base64");
  //       const tempPath = `public/uploads/${Date.now()}_${fileName}`;
  //       fs.writeFileSync(tempPath, buffer);
  //       //  console.log("Before cloudinary");

  //       const result = await cloudinary.uploader.upload(tempPath, {
  //         resource_type: "auto",
  //         folder: "chat_files",
  //       });
  //       console.log("after cloud", result);


  //       fileUrl = result.secure_url;
  //       console.log("file url is: ", fileUrl);

  //       fs.unlinkSync(tempPath);
  //     }

  //     // Save file message
  //     const newMsg = new Message({
  //       from,
  //       to,
  //       message: null,
  //       fileUrl: fileUrl,
  //       fileType,
  //     });
  //     console.log("new message is:", newMsg);

  //     await newMsg.save();

  //     // Emit file message
  //     io.to(to).emit("private_file", newMsg);
  //     io.to(from).emit("private_file", newMsg);

  //   } catch (err) {
  //     console.error("Error handling file:", err);
  //   }
  // });


  /////////////////group file
  socket.on("group_file", async ({ from, groupId, fileName, fileType, fileData }) => {
    console.log("📥 group_file hit:", fileName, fileType);

    try {
      // fileData is now an ArrayBuffer → convert to Buffer
      const buffer = Buffer.from(fileData);

      const tempPath = `public/uploads/${Date.now()}_${fileName}`;
      fs.writeFileSync(tempPath, buffer);


      const result = await cloudinary.uploader.upload(tempPath, {
        resource_type: "auto",
        folder: "group_files",
      });

      fs.unlinkSync(tempPath);

      // Save to DB
      const newMsg = new GroupMessage({
        sender: new mongoose.Types.ObjectId(from),
        groupId: new mongoose.Types.ObjectId(groupId),
        text: null,
        fileUrl: result.secure_url,
        fileType,
      });

      await newMsg.save();

      console.log("✅ Group file saved:", newMsg);

      // Emit to others (not sender)
      socket.to(groupId).emit("group_file", {
        _id: newMsg._id,
        groupId,
        sender: newMsg.sender,
        fileUrl: newMsg.fileUrl,
        fileType: newMsg.fileType,
        text: null,
        timestamp: newMsg.timestamp,
      });

    } catch (err) {
      console.error("❌ Error handling group file:", err);
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

  //   socket.on('disconnect', () => {
  //     console.log(`Socket ${socket.id} disconnected`);
  //      if (!userId) return;

  //     const sockets = onlineUsers.get(userId) || [];
  //     const updated = sockets.filter(id => id !== socket.id);

  //     if (updated.length > 0) {
  //       onlineUsers.set(userId, updated);
  //     } else {
  //       onlineUsers.delete(userId);

  //       // Notify others this user went offline
  //       socket.broadcast.emit("user-offline", userId);
  //     }
  //   });
  // });


  socket.on('disconnect', async () => {
    console.log(`Socket ${socket.id} disconnected`);
    if (!userId) return;

    // Check if the user has any other active sockets
    // This is important to handle multiple tabs/devices
    const otherSockets = await io.in(userId).fetchSockets();

    if (otherSockets.length === 0) {
      // 3. If no other sockets are online for this user, remove from Redis
      await client.sRem("online_users", userId);

      // 4. Notify others this user went offline
      socket.broadcast.emit("user-offline", userId);
    }
  });
});

// Start server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server started at port: ${port}`);
});
