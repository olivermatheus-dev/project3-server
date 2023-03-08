import express from "express";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import isAuth from "../middlewares/isAuth.js";
import { TabModel } from "../models/tab.model.js";
import { UserModel } from "../models/user.model.js";

const likeRouter = express.Router();

likeRouter.put(
  "/add/:tabIdToLike",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const user = req.currentUser;

      if (user.tabsLiked.includes(req.params.tabIdToLike)) {
        return res.status(500).json("Você já curtiu esse tab!");
      }

      await UserModel.findByIdAndUpdate(
        { _id: user._id },
        { $push: { tabsLiked: req.params.tabIdToLike } },
        { new: true, runValidators: true }
      );
      await TabModel.findByIdAndUpdate(
        { _id: req.params.tabIdToLike },
        { $push: { likesUserId: user._id } },
        { new: true, runValidators: true }
      );
      return res.status(200).json("Tab curtido com sucesso!");
    } catch (err) {
      console.log(err);
      return res.status(500).json("Deu erro no like, irmão");
    }
  }
);

likeRouter.put(
  "/remove/:tabIdToLike",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const user = req.currentUser;

      if (!user.tabsLiked.includes(req.params.tabIdToLike)) {
        return res.status(500).json("Você já não curte esse tab!");
      }

      await UserModel.findByIdAndUpdate(
        { _id: user._id },
        { $pull: { tabsLiked: req.params.tabIdToLike } },
        { new: true, runValidators: true }
      );
      await TabModel.findByIdAndUpdate(
        { _id: req.params.tabIdToLike },
        { $pull: { likesUserId: user._id } },
        { new: true, runValidators: true }
      );
      return res.status(200).json("Tab descurtido com sucesso!");
    } catch (err) {
      console.log(err);
      return res.status(500).json("Deu erro no dislike, irmão");
    }
  }
);

export { likeRouter };
