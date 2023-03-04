import { model, Schema } from "mongoose";

const tabSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User" }, // aqui estamos relacionando o id do user para quando criarmos um tab, colocarmos um author pra ele
    commentsId: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    favoriteUserId: [{ type: Schema.Types.ObjectId, ref: "User" }], //depois usaremos a propriedade size para contabilizar os likes
    likesUserId: [{ type: Schema.Types.ObjectId, ref: "User" }], //depois usaremos a propriedade size para contabilizar os likes
    category: { type: String, default: "Sem Categoria" },
    imageURL: { type: String, default: "Sem Imagem" }, //definiremos na rota de criação do tab (fazer o if)
    iconURL: { type: String, default: "Sem Icone" }, //definiremos na rota de criação do tab (fazer o if)

    statusVisibility: { type: Boolean, default: true },
  },
  { timestamps: true }
);
//segundo parametro passado no
export const TabModel = model("Tab", tabSchema);
