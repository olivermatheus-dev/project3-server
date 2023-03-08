import { model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true, unique: true },
    email: {
      type: String, //define o tipo de dado que será recebido
      required: true, //diz se é obrigatório ou não
      unique: true, //se é único ou não
      trim: true, //corta os espaços vazios caso eles existam no inicio e no fim da string
      match: /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/gm, //regex passando uma conferência
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "USER"], default: "USER" }, //enum significa que pode ser um ou outro o valor
    tabsId: [{ type: Schema.Types.ObjectId, ref: "Tab" }],
    img: {
      type: String,
      default:
        "https://res.cloudinary.com/df6axr8vg/image/upload/v1677976689/ceostab/file_hbheje.png",
    },
    tabsFavorited: [{ type: Schema.Types.ObjectId, ref: "Tab" }],
    tabsLiked: [{ type: Schema.Types.ObjectId, ref: "Tab" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    follower: [{ type: Schema.Types.ObjectId, ref: "User" }],
    aboutMe: { type: String, minlength: 0, maxlength: 200 },
    externalURL: { type: String },
    seniority: { type: String },
    specialization: { type: String },
  },
  { timestamps: true }
);

export const UserModel = model("User", userSchema);
