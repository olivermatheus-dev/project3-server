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
    const allTabs = await TabModel.find().populate({
      path: "authorId",
      select: "-passwordHash",
    });

    return res.status(201).json(allTabs);
  } catch (err) {
    console.log(err);
    return res.status(404).json("Deu erro no get all irmão");
  }
});

//tabs mais recentes
tabRouter.get("/category/recentes/:page", async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const tabs = await TabModel.find()
      .populate({
        path: "authorId",
        select: "-passwordHash",
      })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    return res.status(200).json(tabs);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Erro ao buscar as tabs recentes");
  }
});

// Rota para buscar as tabs mais relevantes
tabRouter.get("/category/relevant/:page", async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const tabs = await TabModel.find()
      .populate({
        path: "authorId",
        select: "-passwordHash",
      })
      .sort({ relevance: -1 })
      .skip(startIndex)
      .limit(limit);

    return res.status(200).json(tabs);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Erro ao buscar tabs");
  }
});

//sistema de pagainação
tabRouter.get("/category/curtidos/:page", async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const tabs = await TabModel.find()
      .populate({
        path: "authorId",
        select: "-passwordHash",
      })
      .skip(startIndex)
      .limit(limit);

    // Conta a quantidade de likes de cada tab
    const tabsWithLikesCount = tabs.map((tab) => {
      const likesCount = tab.likesUserId.length;
      return { ...tab.toObject(), likesCount };
    });

    // Ordena as tabs pela quantidade de likes em ordem decrescente
    const sortedTabs = tabsWithLikesCount.sort(
      (tab1, tab2) => tab2.likesCount - tab1.likesCount
    );

    return res.status(200).json(sortedTabs);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Erro ao buscar as tabs recentes");
  }
});

//rota de feed
// tabRouter.get("/feed", isAuth, attachCurrentUser, async (req, res) => {
//   try {
//     const userId = req.currentUser.id;

//     const user = await UserModel.findById(userId).populate("following");

//     let tabs = [];

//     for (let i = 0; i < user.following.length; i++) {
//       const followingUser = user.following[i];
//       const followingUserTabs = await TabModel.find({
//         _id: { $in: followingUser.tabsId },
//       }).populate("author");

//       tabs = tabs.concat(followingUserTabs);
//     }

//     res.json({ tabs });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Internal server error");
//   }
// });

tabRouter.get("/feed", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const userId = req.currentUser.id;

    const user = await UserModel.findById(userId).populate("following");

    let tabs = [];

    for (let i = 0; i < user.following.length; i++) {
      const followingUser = user.following[i];
      const followingUserTabs = await TabModel.find({
        _id: { $in: followingUser.tabsId },
      }).populate("authorId");

      if (followingUserTabs.length > 0) {
        tabs = tabs.concat(followingUserTabs);
      }
    }

    // Caso o usuário não esteja seguindo ninguém ou nenhum dos usuários que está seguindo tenha tabs publicados
    if (tabs.length === 0) {
      res.status(404).json({ message: "Nenhum tab encontrado." });
    } else {
      res.status(200).json(tabs);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

//get details viewsDetails
tabRouter.get("/details/:tabId", async (req, res) => {
  try {
    const tabDetails = await TabModel.findById(req.params.tabId)
      .populate({
        path: "authorId",
        select: "-passwordHash",
      })
      .populate({
        path: "commentsId",
        populate: {
          path: "authorId",
          select: "-passwordHash",
        },
      });

    return res.status(201).json(tabDetails);
  } catch (err) {
    console.log(err);
    return res.status(404).json("Deu erro no get details irmão");
  }
});

//views com cálculo de relevancia
tabRouter.get("/views/:tabId", async (req, res) => {
  try {
    // Incrementa o valor da chave viewsDetails em 1
    await TabModel.findByIdAndUpdate(req.params.tabId, {
      $inc: { viewsDetails: 1 },
    });

    // Atualiza a relevância da tab
    const tab = await TabModel.findById(req.params.tabId);

    const relevance = (tab.likesUserId.length + 1) / (tab.viewsDetails + 1);
    await TabModel.findByIdAndUpdate(req.params.tabId, { relevance });

    return res.status(201).json(relevance);
  } catch (err) {
    console.log(err);
    return res.status(404).json("Visualização não contabilizada");
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
