import express from "express";
import { uploadImg } from "../config/cloudinary.config.js";
const uploadImgRouter = express.Router();

uploadImgRouter.post("/", uploadImg.single("img"), (req, res) => {
  if (!req.file) {
    console.log(req.file);
    return res.status(400).json({ msg: "Upload fail" });
  }

  return res.status(201).json({ url: req.file.path });
});

export { uploadImgRouter };
