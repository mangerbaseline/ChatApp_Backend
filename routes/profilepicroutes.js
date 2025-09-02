import express from 'express';
import multer from 'multer';
import path from 'path';
import User from '../models/User.js';
import Group from '../models/group.js'

const profileRouter = express.Router();

// Multer storage config (local uploads → public/uploads)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads'); // ✅ store in /public/uploads
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  }
});

const upload = multer({ storage });

// Upload profile picture
profileRouter.post('/:id', upload.single('profilePic'), async (req, res) => {
  try {
    const userId = req.params.id;
const fullUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: fullUrl },
      { new: true }
    );

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

profileRouter.post('/id/:id', upload.single('profilePic'), async (req, res) => {
  try {
    const groupId = req.params.id;
    
const fullUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    group.profilePic = fullUrl;
    await group.save();

    res.json({ success: true, group });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }

});

export default profileRouter;
