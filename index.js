import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import { connectToDB } from "./config/db.config.js";
import { userRouter } from "./routes/user.routes.js";
import { tabRouter } from "./routes/tab.routes.js";
import { commentRouter } from "./routes/comment.routes.js";
import { followRouter } from "./routes/follow.routes.js";

dotenv.config(); //essa configuração permite usarmos as variáveis de ambiente que setamos no .env

connectToDB(); //conecta ao banco de dados usando o mongoose
const app = express();

app.use(cors()); //configuramos uma biblioteca chamada cors para que nosso servidor possa receber req de outros dominios e nãoo só do nosso
//isso não é a melhor coisa, o melhor seria configurar o cors para receber req só de uma lista pré-configurada de sites

app.use(express.json()); // esse é um método que já transforma os objetos recebidos de json para js

app.use(
  "/user",
  userRouter
); /*aqui ele está dizendo que: tudo que chegar de req com esse path, joga pra userRouter, que está na pasta routes, importante importar */

app.use("/tab", tabRouter);
app.use("/comment", commentRouter);
app.use("/follow", followRouter);

app.listen(Number(process.env.PORT), () => {
  console.log(`Server up and running at port ${process.env.PORT}`);
});
