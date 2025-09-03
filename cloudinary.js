import { v2 as cloudinary } from "cloudinary";
import dotenv from 'dotenv';
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log("Cloudinary loaded with:", {
  cloud: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY ? "✔️ loaded" : "❌ missing",
  secret: process.env.CLOUDINARY_API_SECRET ? "✔️ loaded" : "❌ missing",
});
export default cloudinary;
