const express = require("express");
const { UserController } = require("../../controllers");
const router = express.Router();
const { AuthRequestMiddleware } = require('../../middlewares');

router.post(
  "/signup",
  AuthRequestMiddleware.validateAuthRequest,
  UserController.createUser
);

router.post(
  "/signin",
  AuthRequestMiddleware.validateAuthRequest,
  UserController.signIn
);

module.exports = router;