// import mongoose from 'mongoose';

// const messageSchema = new mongoose.Schema(
//   {
//     sender: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     receiver: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     content: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     read: {
//       type: Boolean,
//       default: false,
//     }
//   },
//   {
//     timestamps: true, 
//   }
// );

// const Message = mongoose.model('Message', messageSchema);

// export default Message;


import mongoose from "mongoose";

const messageSchema=new mongoose.Schema({
    from:{type:String, required:true
    },
    to:{type:String, required:true},
    message:{type:String, required:true},
    timestamp:{type:Date, default:Date.now}
})

const Message = mongoose.model('Message', messageSchema);
export default Message;