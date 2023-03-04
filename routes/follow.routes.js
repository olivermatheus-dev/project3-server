import express from "express";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import isAuth from "../middlewares/isAuth.js";
import { UserModel } from "../models/user.model.js";

const followRouter = express.Router();

followRouter.put(
  "/add/:idUserToFollow",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      //user que tá sendo seguindo -> precisamos de att quem segue ele
      //user que seguindo (nós) -> precisamos de add o user do cara que ele tá seguindo na nossa array
      let user = req.currentUser;
      let userToFollow = UserModel.findById(req.params.idUserToFollow);
      if (user.following.includes(req.params.idUserToFollow)) {
        return res.status(500).json("Você já segue essa pessoa!");
      }

      //abaixo pegando o user que estamos seguindo e colocando a gente na lista de seguidores dele
      userToFollow = await UserModel.findByIdAndUpdate(
        { _id: req.params.idUserToFollow },
        { $push: { follower: user._id } },
        { new: true, runValidators: true }
      );
      user = await UserModel.findByIdAndUpdate(
        { _id: user._id },
        { $push: { following: userToFollow._id } },
        { new: true, runValidators: true }
      );
      return res.status(200).json(userToFollow);
    } catch (err) {
      console.log(err);
      return res.status(500).json("Deu erro no follow, irmão");
    }
  }
);
followRouter.put(
  "/remove/:idUserToStopFollow",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      let user = req.currentUser;
      let userToStopFollow = UserModel.findById(req.params.idUserToStopFollow);
      if (user.following.includes(req.params.idUserToStopFollow)) {
        userToStopFollow = await UserModel.findByIdAndUpdate(
          { _id: req.params.idUserToStopFollow },
          { $pull: { follower: user._id } },
          { new: true, runValidators: true }
        );

        user = await UserModel.findByIdAndUpdate(
          { _id: user._id },
          { $pull: { following: req.params.idUserToStopFollow } },
          { new: true, runValidators: true }
        );
        return res.status(200).json(userToStopFollow);
      }
      return res.status(404).json("Você já não segue esse usuário!");
    } catch (err) {
      console.log(err);
      return res.status(500).json("Erro ao parar de seguir!");
    }
  }
);

followRouter.get(
  "/all-followings",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const user = await UserModel.findById(req.currentUser._id).populate(
        "following"
      );

      return res.status(200).json(user.following);
    } catch (err) {
      console.log(err);
      return res.status(500).json("Deu erro irmão");
    }
  }
);

followRouter.get(
  "/all-followers",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const user = await UserModel.findById(req.currentUser._id).populate(
        "follower"
      );

      return res.status(200).json(user.follower);
    } catch (err) {
      console.log(err);
      return res.status(500).json("Deu erro irmão");
    }
  }
);

export { followRouter };
