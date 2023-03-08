import express from "express";
import { TabModel } from "../models/tab.model.js";

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

    res.status(200).json(tabs);
  } catch (error) {
    console.log(error);
    res.status(404).json(error);
  }
});

export { searchbarRouter };
