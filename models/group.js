import mongoose, { Schema } from "mongoose";

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    profilePic:{type:String, default:"/avatar.png"},
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true 
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User"
    }],
    category:{type:String, required:true},
    createdAt: { type: Date, default: Date.now }
});
const Group=mongoose.model('Group', groupSchema)
export default Group;