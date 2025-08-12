import express from "express";
import Message from "../models/message.js";

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

export default messagerouter;