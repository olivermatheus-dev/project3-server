import bcrypt from "bcrypt";
import express from "express";
import { generateToken } from "../config/jwt.config.js";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import isAuth from "../middlewares/isAuth.js";
import { UserModel } from "../models/user.model.js";
import { TabModel } from "../models/tab.model.js";
import { CommentModel } from "../models/comment.model.js";

//o index.js está redirecionando as rotas para arquivos como esse dependendo do path da req. Dai, chegando aqui conseguimos trabalhar as rotas.
const userRouter = express.Router(); //instanciando o express.Router em uma variável

const SALT_ROUNDS = 10; //camadas de encriptação, quanto mais, mais tempo parar gerar e para conferir

//rota de cadastro de user
userRouter.post("/sign-up", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ msg: "Senha invalida." });
    }

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    console.log("SALT:", salt);

    const hashedPassword = await bcrypt.hash(password, salt);

    const createdUser = await UserModel.create({
      ...req.body,
      passwordHash: hashedPassword,
    });

    console.log("CREATED USER", { ...createdUser });
    delete createdUser._doc.passwordHash;

    return res.status(201).json(createdUser);
  } catch (err) {
    console.log(err);

    return res.status(500).json(err);
  }
});

// userRouter.post("/login", async (req, res) => {
//   try {
//     //desestruturando email e password de req.body
//     const { email, password } = req.body;

//     //procurando o email que o front enviou no body por alguma correspondência no nosso banco de dados
//     const user = await UserModel.findOne({ email: email });

//     //abaixo verificando se encontramos um user com o e-mail no sistema
//     if (!user) {
//       console.log();
//       return res.status(404).json({ msg: "Email ou senha inválidos" });
//     }

//     if (await bcrypt.compare(password, user.passwordHash)) {
//       const token = generateToken(user);

//       return res.status(200).json({
//         user: {
//           username: user.username,
//           name: user.name,
//           email: user.email,
//           _id: user._id,
//           role: user.role,
//         },
//         token: token,
//       });
//     } else {
//       return res.status(404).json({ msg: "Email ou senha inválidos" });
//     }
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json(err);
//   }
// });

userRouter.post("/login", async (req, res) => {
  try {
    //desestruturando email/username e password de req.body
    const { emailOrUsername, password } = req.body;

    //procurando o email ou username que o front enviou no body por alguma correspondência no nosso banco de dados
    const user = await UserModel.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    //abaixo verificando se encontramos um user com o email ou username no sistema
    if (!user) {
      return res.status(404).json({ msg: "Email/username ou senha inválidos" });
    }

    if (await bcrypt.compare(password, user.passwordHash)) {
      const token = generateToken(user);

      return res.status(200).json({
        user: {
          username: user.username,
          name: user.name,
          email: user.email,
          _id: user._id,
          role: user.role,
        },
        token: token,
      });
    } else {
      return res.status(404).json({ msg: "Email/username ou senha inválidos" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

userRouter.put(
  "/update/:username",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const user = await UserModel.findOne({
        username: req.params.username,
      });

      const userUpdated = await UserModel.findByIdAndUpdate(
        user._id,
        { user, ...req.body },
        { new: true, runValidators: true }
      );
      return res.status(200).json(userUpdated);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }
);

userRouter.get(
  "/profile/:username",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      // const user = req.currentUser;
      const user = await UserModel.findOne({
        username: req.params.username,
      })
        .populate("tabsId")
        .populate("following")
        .populate("follower");

      delete user._doc.passwordHash;

      return res.status(200).json(user);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
);

userRouter.put("/:username", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { username: req.params.username },
      { ...req.body },
      { new: true, runValidators: true }
    );

    delete updatedUser._doc.passwordHash;

    return res.status(200).json(updatedUser);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

userRouter.delete(
  "/delete/:username",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const user = await UserModel.findOne({
        username: req.params.username,
      });
      if (
        toString(req.params.username) ===
        toString(req.currentUser.username || req.currentUser.role === "ADMIN")
      ) {
        await TabModel.deleteMany({ authorId: user._id });
        await TabModel.deleteMany({ likesUserId: user._id });
        await CommentModel.deleteMany({ authorId: user._id });
        //
        await UserModel.updateMany(
          { $or: [{ follower: user._id }, { following: user._id }] },
          { $pull: { follower: user._id, following: user._id } }
        );
        //
        await UserModel.findByIdAndDelete(user._id);

        return res.status(200).json("User deleted");
      }
      return res.status(400).json("Você não tem autorização para isso!");
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
);

export { userRouter };
