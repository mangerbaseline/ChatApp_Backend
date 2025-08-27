import express from 'express';
import User from '../models/User.js';
import router from './authroutes.js';

const friendrouter=express.Router();

friendrouter.post('/send',async(req,res)=>{
    const{senderId, receiverId}=req.body;

    if(senderId===receiverId) return res.status(400).json({message:'Cant request yourself'})

    const sender = await User.findById(senderId);
    const receiver= await User.findById(receiverId);
    
    if(!sender || !receiver) return res.status(404).json({message:'User not found'});

    if(receiver.receivedRequests.includes(senderId)) return res.status(400).json({message:'Already sent request'})

        //if req is not sent already then push sender id to receiver and receiver id to sender
        sender.sentRequests.push(receiverId);
        receiver.receivedRequests.push(senderId);

        await sender.save();
        await receiver.save();

        res.json({message:'friend request sent'});
});


friendrouter.get('/request/:userId',async(req,res)=>{
    const user=await User.findById(req.params.userId).populate('receivedRequests','name _id')
     if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.receivedRequests);
});
friendrouter.post('/accept', async (req, res) => {
  const { senderId, receiverId } = req.body;

  const sender = await User.findById(senderId);
  const receiver = await User.findById(receiverId);

  if (!sender || !receiver) return res.status(400).json({ message: 'User not found' });

  // Remove requests
  sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== receiverId);
  receiver.receivedRequests = receiver.receivedRequests.filter(id => id.toString() !== senderId);

  // Save friends if not already
  if (!sender.friends.includes(receiverId)) sender.friends.push(receiverId);
  if (!receiver.friends.includes(senderId)) receiver.friends.push(senderId);

  await sender.save();
  await receiver.save();

  // (Optional) if using Socket.IO, emit update
  // io.to(senderId).emit('friend-request-accepted', receiverId);
  // io.to(receiverId).emit('friend-request-accepted', senderId);

  res.status(200).json({ message: 'Friend request accepted' });
});

friendrouter.get('/list/:userId', async (req, res) => {
     const user = await User.findById(req.params.userId).populate('friends', 'name _id');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user.friends);
})

// friendrouter.get('/')

export default friendrouter;

