import cloudinary from "cloudinary";

import { CloudinaryStorage } from "multer-storage-cloudinary";

import multer from "multer";

import * as dotenv from "dotenv";

dotenv.config();

const cloudinaryInst = cloudinary.v2;

cloudinaryInst.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryInst,
  params: {
    folder: "ceostab",
    format: async (req, file) => "png",
    use_filename: true,
  },
});

const uploadImg = multer({ storage: storage });

export { uploadImg };
