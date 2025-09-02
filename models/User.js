import mongoose from 'mongoose'

// key value pair
const userSchema = new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true},
    password:{type:String, required:true},
    profilePic: { type:String, default: "/avatar.png" }, 
    friends:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],
    sentRequests:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    receivedRequests:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}]
})

export default mongoose.model('User',userSchema);