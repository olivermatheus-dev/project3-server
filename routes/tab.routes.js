import express from "express";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import isAuth from "../middlewares/isAuth.js";
import { UserModel } from "../models/user.model.js";
import { TabModel } from "../models/tab.model.js";
import { CommentModel } from "../models/comment.model.js";

const tabRouter = express.Router();

let image;
let icon;
function categoryCheck(category) {
  switch (category) {
    case "javascript":
      image = "imagem de javascript";
      icon = "icon de javascript";
      break;

    default:
  }
}
//create abaixo
tabRouter.post("/create", isAuth, attachCurrentUser, async (req, res) => {
  try {
    //verificar a integridade do formato das informações que estão chegando no req.body
    categoryCheck(req.body.category);
    const tab = await TabModel.create({
      ...req.body,
      authorId: req.currentUser._id,
      imageURL: image,
      iconURL: icon,
    });

    await UserModel.findOneAndUpdate(
      { _id: req.currentUser._id },
      { $push: { tabsId: tab._id } },
      { new: true, runValidators: true }
    );

    return res.status(200).json(tab);
  } catch (err) {
    console.log(err);
    return res.status(404).json("Deu erro pra criar irmão");
  }
});

//get all abaixo
tabRouter.get("/all-tabs", async (req, res) => {
  try {
    const allTabs = await TabModel.find();

    return res.status(201).json(allTabs);
  } catch (err) {
    console.log(err);
    return res.status(404).json("Deu erro no get all irmão");
  }
});

//get details
tabRouter.get("/details/:tabId", async (req, res) => {
  try {
    const tabDetails = await TabModel.findById(req.params.tabId);
    if (tabDetails.commentsId.length) {
      tabDetails = await TabModel.findById(req.params.tabId).populate(
        "commentsId"
      );
    }

    return res.status(201).json(tabDetails);
  } catch (err) {
    console.log(err);
    return res.status(404).json("Deu erro no get details irmão");
  }
});

tabRouter.put("/update/:tabId", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const tab = await TabModel.findById(req.params.tabId);
    if (toString(tab.authorId) === toString(req.currentUser._id)) {
      const tabUpdated = await TabModel.findOneAndUpdate(
        { _id: req.params.tabId },
        { tab, ...req.body },
        { new: true, runValidators: true }
      );
      return res.status(200).json(tabUpdated);
    }
    return res
      .status(404)
      .json("Você não tem permissão para fazer isso, irmão!");
  } catch (err) {
    console.log(err);
    return res.status(404).json("Deu erro no update irmão");
  }
});

tabRouter.delete(
  "/delete/:tabId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const tab = await TabModel.findById(req.params.tabId);
      const user = req.currentUser;
      if (toString(tab.authorId) === toString(req.currentUser._id)) {
        const tab = await TabModel.findByIdAndDelete(req.params.tabId);
        //tirando do author abaixo
        await UserModel.findByIdAndUpdate(tab.authorId, {
          $pull: { tabsId: req.params.tabId },
        });
        await CommentModel.deleteMany({ tabId: tab._id });
        await UserModel.deleteMany({ tabId: tab._id });
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

export { tabRouter };
