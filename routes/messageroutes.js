import express from "express";
import Message from "../models/message.js";
import GroupMessage from "../models/groupMessage.js";

const messagerouter=express.Router();

messagerouter.get('/',async(req,res)=>{
    const {user1,user2} = req.query;

    try{
        const messages=await Message.find({
            $or:[
                {from:user1, to:user2},
                {from: user2, to:user1}
            ]
        }).sort({timestamp:1});
        res.json(messages)
        
    }
    catch(err){
        res.status(500).json({error:'failed'})
    }

})


messagerouter.get('/group/:groupId', async (req, res) => {
  const { groupId } = req.params; // frontend should send ?groupId=xxx
  const currUserId = req.headers['x-user-id'];
  console.log("Userid", currUserId);
  
  if (!groupId) return res.status(400).json({ error: 'groupId is required' });

  try {
    const messages = await GroupMessage.find({ groupId })
      .populate('sender', 'name') // populate sender name
      .sort({ timestamp: 1 });    // sort by oldest first

      // res.json(messages);
      // console.log(messages)
    // Format for frontend
    const formatted = messages.map(msg => ({
      fromName: msg.sender._id.toString()===currUserId ? "You" : msg.sender.name,
      text: msg.text,
      timestamp: msg.timestamp
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch group messages' });
  }
});

export default messagerouter;