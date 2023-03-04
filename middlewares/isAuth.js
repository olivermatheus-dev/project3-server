import * as dotenv from "dotenv";
import { expressjwt } from "express-jwt";

dotenv.config();
//aqui nós estamos configurando o expressjwt (bibli) para ver se o token daquele user é válido
export default expressjwt({
  secret: process.env.TOKEN_SIGN_SECRET,
  algorithms: ["HS256"],
});
