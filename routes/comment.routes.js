import express from "express";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import isAuth from "../middlewares/isAuth.js";
import { UserModel } from "../models/user.model.js";
import { TabModel } from "../models/tab.model.js";
import { CommentModel } from "../models/comment.model.js";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: "1565962",
  key: "07fcbd11feb1e589ab0e",
  secret: "039fd018b816dd0a09bb",
  cluster: "sa1",
  useTLS: true,
});

const pushUpdate = (tabId) => {
  pusher.trigger(`tab_${tabId}`, "update", {});
  console.log("Tab comment update pushed", tabId);
};

const commentRouter = express.Router();

//falta adicionar na array de commentsId dentro de user
commentRouter.post(
  "/create/:tabId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      //verificar a integridade do formato das informações que estão chegando no req.body
      const user = req.currentUser;
      const comment = await CommentModel.create({
        ...req.body,
        authorId: req.currentUser._id,
        tabId: req.params.tabId,
      });

      await TabModel.findOneAndUpdate(
        { _id: req.params.tabId },
        { $push: { commentsId: comment._id } },
        { new: true, runValidators: true }
      );

      //   await UserModel.findOneAndUpdate(
      //     { _id: user._id },
      //     { $push: { commentsId: comment._id } },
      //     { new: true, runValidators: true }
      //   );

      pushUpdate(req.params.tabId);

      return res.status(200).json("Comment criado com sucesso");
    } catch (err) {
      console.log(err);
      return res.status(404).json("Deu erro pra criar irmão");
    }
  }
);

commentRouter.delete(
  "/delete/:commentId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const comment = await CommentModel.findById(req.params.commentId);
      const user = req.currentUser;

      if (toString(comment.authorId) === toString(user._id)) {
        await CommentModel.findByIdAndDelete(comment._id);

        //tirando do tab abaixo
        await TabModel.findByIdAndUpdate(comment.tabId, {
          $pull: { commentsId: req.params.commentId },
        });

        //tirando de dentro do user
        // await UserModel.findByIdAndUpdate(comment.authorId, {
        //   $pull: { commentsId: req.params.commentId },
        // });

        pushUpdate(req.params.tabId);

        return res.status(200).json("Deletado com sucesso");
      }
      return res
        .status(200)
        .json("Você não tem permissão para fazer isso, irmão!");
    } catch (err) {
      console.log(err);
      return res.status(400).json("Algo deu errado, irmão!");
    }
  }
);

export { commentRouter };
