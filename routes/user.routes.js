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

userRouter.post("/login", async (req, res) => {
  try {
    //desestruturando email e password de req.body
    const { email, password } = req.body;

    //procurando o email que o front enviou no body por alguma correspondência no nosso banco de dados
    const user = await UserModel.findOne({ email: email });

    //abaixo verificando se encontramos um user com o e-mail no sistema
    if (!user) {
      console.log();
      return res.status(404).json({ msg: "Email ou senha inválidos" });
    }

    if (await bcrypt.compare(password, user.passwordHash)) {
      const token = generateToken(user);

      return res.status(200).json({
        user: {
          name: user.name,
          email: user.email,
          _id: user._id,
          role: user.role,
        },
        token: token,
      });
    } else {
      return res.status(404).json({ msg: "Email ou senha inválidos" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

userRouter.put("/update", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const user = req.currentUser;

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
});

userRouter.get("/profile", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const user = req.currentUser;
    // delete updatedUser._doc.passwordHash;

    return res.status(200).json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

userRouter.put("/", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: req.currentUser._id },
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
  "/delete/:userId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const user = req.currentUser;
      if (toString(req.params.userId) === toString(req.currentUser._id)) {
        await TabModel.deleteMany({ authorId: user._id });
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
