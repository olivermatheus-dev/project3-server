import jwt from "jsonwebtoken";

//essa function é responsável gerar um token quando o user logar
export function generateToken(user) {
  const { _id, name, email, role } = user; //pegamos as chaves que queremos dentro de user (que recebemos por props)
  const signature = process.env.TOKEN_SIGN_SECRET; //aqui utilizamos uma assinatura (outra chave secreta do .env)
  const expiration = "6h"; //prazo que o token expira (poderia ser em minutos tbm, ex: 20m)

  return jwt.sign({ _id, name, email, role }, signature, {
    expiresIn: expiration,
  });
}
