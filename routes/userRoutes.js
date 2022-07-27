// Módulos
const path = require('path');

const userController = require(path.join(
  __dirname,
  '../controllers/userController'
));

// Criando um novo router, que permitirá configurar as rotas do user. Ele é como o app.
const router = require('express').Router();

// Definição das rotas
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getOneUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

// Exportando o router, para que ele seja aplicado como middleware
module.exports = router;
