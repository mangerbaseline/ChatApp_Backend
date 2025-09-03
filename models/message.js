// import mongoose from "mongoose";

// const messageSchema=new mongoose.Schema({
//     from:{type:String, required:true
//     },
//     to:{type:String, required:true},
//     message:{type:String},
//     file:{type:String},
//     timestamp:{type:Date, default:Date.now}
// })

// const Message = mongoose.model('Message', messageSchema);
// export default Message;


import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  message: { type: String }, // text message (optional)
  fileUrl: { type: String, default: null }, // Cloudinary URL
  fileType: { type: String, default: null }, // e.g. image/png, application/pdf
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
