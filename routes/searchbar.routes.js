import express from "express";
import { TabModel } from "../models/tab.model.js";
import { UserModel } from "../models/user.model.js";

const searchbarRouter = express.Router();

searchbarRouter.get("/:term", async (req, res) => {
  try {
    const term = req.params.term;

    const tabs = await TabModel.find({
      $or: [
        { title: { $regex: term, $options: "i" } },
        { category: { $regex: term, $options: "i" } },
        { tags: { $regex: term, $options: "i" } },
      ],
    });

    const users = await UserModel.find({
      $or: [
        { name: { $regex: term, $options: "i" } },
        { username: { $regex: term, $options: "i" } },
      ],
    });

    const results = [...users, ...tabs];

    res.status(200).json(results);
  } catch (error) {
    console.log(error);
    res.status(404).json(error);
  }
});

export { searchbarRouter };
