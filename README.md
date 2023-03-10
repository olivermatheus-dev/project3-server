# Ceos Tab Servidor

Back-end do projeto  [Ceos Tab](https://github.com/olivermatheus-dev/project3-client)

# Sobre

O projeto foi criado para atender os requisitos do terceiro módulo do curso de **Web development** da **Ironhack**

Se trata de uma REST API com um CRUD completo nas rotas.



# Instruções de uso



## User Routes

**Criação**

    POST /user/sign-up

**Login**

    POST /user/login

**Update **

    PUT /user/update/:username
    
**Get usuário**

    GET /users/profile/:username
     
**Deletar conta**

    DELETE /user/delete/:username
    

## Imagem Route

**Criação**

    POST /upload/

    
## Tab Routes

**Criação**

    POST /tab/create
    
**Get All**

    GET /tab/all-tabs
    
  **Get Tab mais recente**

    GET /tab/category/recentes/:page

**Get Tab mais relevante**

    GET tab/category/relevant/:page
    
 **Get Tab mais curtida**

    GET tab/category/curtidos/:page
  
   **Get Home**

    GET tab/home/:page
  
   **Get Feed**

    GET tab/feed
    
**Get Tab Detalhada**

    GET tab/details/:tabId

**Get Tab relevância por visualização**

	GET tab/views/:tabId

**Atualização de Tab**

	PUT tab/update/:tabId

**Delete Tab**

    DELETE tab/delete/:tabId


## Searchbar Route

**Get Searchbar**

    GET /searchbar/:term

## Like Routes

**Adicionar curtida**

    PUT /like/add/:tabIdToLike

**Remover curtida**

    PUT /like/remove/:tabIdToLike


## Follow Routes

**Adicionar seguidor**

    PUT /follow/add/:idUserToFollow
    
 **Remover seguidor**

    PUT /follow/remove/:idUserToStopFollow
    
   **Get de quem está seguindo**

    GET /follow/all-followings
    
   **Get de seguidores**

    GET /follow/all-followers
    
  ## Comment Routes

**Adicionar comentário**

    POST /comment/create/:tabId
    
**Deletar comentário**

    DELETE /comment/delete/:commentId

# GitHub dos desenvolvedores


- [Danilo Shinzato](https://github.com/dtshinzato)
- [Oliver Matheus](https://github.com/olivermatheus-dev)
- [Pedro Henrique G Barbosa](https://github.com/Per00)

# Ceos Tab Front

Abaixo o link do repositório do front da aplicação

[Click here](https://github.com/olivermatheus-dev/project3-client)

## Utilizando em seu computador localmente
Você pode rodar a aplicação em seu localhost, após clonar para seu computador.

*Lembre de utilizar o npm install*
**Lembre de criar seu arquivo .env e atualizar como o  exemple.env**
