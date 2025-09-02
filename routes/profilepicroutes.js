import express from "express";
import multer from "multer";
import path from "path";
import User from "../models/User.js";
import Group from "../models/group.js";
import cloudinary from "../cloudinary.js";
import fs from "fs";

const profileRouter = express.Router();

// Multer storage config (local uploads → public/uploads)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads"); // ✅ local storage path
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});

const upload = multer({ storage });

/**
 * Upload profile picture for a user
 */
profileRouter.post("/:id", upload.single("profilePic"), async (req, res) => {
  try {
    let imageUrl;

    if (process.env.NODE_ENV === "production") {
      // ✅ Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "chat_app/profilePics",
      });
      imageUrl = result.secure_url;

      // delete local file after upload
      fs.unlinkSync(req.file.path);
    } else {
      // ✅ Local dev storage
      imageUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.profilePic = imageUrl;
    await user.save();

    res.json({ success: true, url: imageUrl, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Upload profile picture for a group
 */
profileRouter.post("/group/:id", upload.single("profilePic"), async (req, res) => {
  try {
    let imageUrl;

    if (process.env.NODE_ENV === "production") {
      // ✅ Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "chat_app/groupPics",
      });
      imageUrl = result.secure_url;

      // delete local file after upload
      fs.unlinkSync(req.file.path);
    } else {
      // ✅ Local dev storage
      imageUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
    }

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    group.profilePic = imageUrl;
    await group.save();

    res.json({ success: true, group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default profileRouter;
