import { Router } from "express";
import User from "../models/User.js";

const router=Router();

router.get('/users',async(req,res)=>{
    try{
    const user=await User.find({_id:{$ne: req.params.currentUserId}});
    res.json(user);
    }
    catch(err){
        res.status(500).json({err:'failed'})
    }
})

export default router;