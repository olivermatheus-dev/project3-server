import { model, Schema } from "mongoose";

const commentsSchema = new Schema({
  content: { type: String, required: true, trim: true },
  authorId: { type: Schema.Types.ObjectId, ref: "User" }, // aqui estamos relacionando o id do user para quando criarmos um tab, colocarmos um author pra ele
  tabId: { type: Schema.Types.ObjectId, ref: "Tab" },
  createdAt: { type: Date, default: Date.now() },
});

export const CommentModel = model("Comment", commentsSchema);
