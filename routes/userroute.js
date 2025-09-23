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

router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name profilePic");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
export default router;