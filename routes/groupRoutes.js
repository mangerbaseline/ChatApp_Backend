import express from 'express'
import Group from '../models/group.js'
import mongoose from 'mongoose';

const grouprouter = express.Router();

// Change this route to match what the frontend expects
console.log('heresfde');

grouprouter.post('/creategroup', async (req, res) => {
  console.log('Create group endpoint hit');
  console.log('Request body:', req.body);
  
  try {
    const { name, members, createdBy } = req.body;
    console.log('User ID from auth:', createdBy);

    // Validate input
    if (!name || !members || !createdBy) {
      return res.status(400).json({ error: "Group name, members, and user ID are required" });
    }

    // Convert string IDs to ObjectId if needed
    const convertToObjectId = (id) => {
      if (typeof id === 'string' && mongoose.Types.ObjectId.isValid(id)) {
        return new mongoose.Types.ObjectId(id);
      }
      return id;
    };

    const group = new Group({
      name,
      createdBy: convertToObjectId(createdBy),
      members: [convertToObjectId(createdBy), ...members.map(convertToObjectId)], 
    });
    
    await group.save();
    console.log('Group saved successfully');
    res.status(201).json(group);       
  } catch(err) {
    console.log('Error in createGroup:', err.message);
    res.status(500).json({error: err.message});
  }
});

grouprouter.get("/my-groups/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const groups = await Group.find({ members: userId })
      .populate("members", "name email");
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default grouprouter;