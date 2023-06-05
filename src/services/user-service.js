const { StatusCodes } = require("http-status-codes");
const { UserRepository } = require("../repositories");
const AppError = require("../utils/error/app-error");
const userRepository = new UserRepository();
const bcrypt = require("bcrypt");
const { checkPassword, createToken } = require("../utils/common/auth");

async function createUser(data) {
  try {
    const user = await userRepository.create(data);
    return user;
  } catch (error) {
    if (
      error.name == "SequelizeValidationError" ||
      error.name == "SequelizeUniqueConstraintError"
    ) {
      let explanations = [];
      error.errors.forEach((err) => {
        explanations.push(err.message);
      });
      throw new AppError(explanations, StatusCodes.BAD_REQUEST);
    }
    throw new AppError(
      `Cannot create a new user object, ${error.message}`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function signIn(data) {
  try {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) {
      throw new AppError("User not found !", StatusCodes.NOT_FOUND);
    }
    const passwordMatch = checkPassword(data.password, user.password);
    if (!passwordMatch) {
      throw new AppError("Invalid password!", StatusCodes.BAD_REQUEST);
    }

    const jwt = createToken({ id: user.id, email: user.email });

    return jwt;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Something went wrong - ${error.message}`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

module.exports = {
  createUser,
  signIn,
};
