import express from 'express'
import Group from '../models/group.js'
import mongoose from 'mongoose';

const grouprouter = express.Router();

// Change this route to match what the frontend expects

grouprouter.post('/creategroup', async (req, res) => {
try {
    const { name, members, createdBy } = req.body;
    
    // Validation
    if (!name || !Array.isArray(members) || members.length === 0 || !createdBy) {
        return res.status(400).json({ 
            error: "Group name, members (non-empty array), and user ID are required" 
        });
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


// Add members to an existing group
grouprouter.post('/:groupId/add-members', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberIds } = req.body; // array of user IDs to add

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ message: "No member IDs provided" });
    }

    // Find group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Just add members (frontend already avoids duplicates)
    group.members.push(...memberIds);
    await group.save();

    res.status(200).json({ message: "Members added successfully", group });
  } catch (err) {
    console.error("Error adding members:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


export default grouprouter;