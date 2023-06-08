"use strict";

const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

const {
  getAllUsers,
  addUser,
  createToken,
  verifyToken,
  getUser,
  comparePasswords,
  validateEmail,
  normalize,
  getUserByEmail,
} = require("../services/users_service");

const addUserAction = async (req, res) => {
  const registerUser = req.body;
  const errorObject = { type: "", textError: "" };

  if (!registerUser.name) {
    errorObject.type = "name";
    errorObject.textError = "Field name is important";
    res.status(400).json(errorObject);
  }

  if (!validateEmail(registerUser.email)) {
    errorObject.type = "email";
    errorObject.textError = "email is not valid";
    res.status(400).json(errorObject);
  }

  if (!registerUser.password || registerUser.password.length < 4) {
    errorObject.type = "password";
    errorObject.textError =
      "Field password is important and need more than 4 letters";
    res.status(400).json(errorObject);
  }

  try {
    const allUser = await getAllUsers();

    if (allUser.filter((el) => el.email === registerUser.email).length) {
      errorObject.type = "email";
      errorObject.textError = "email is busy";
      throw errorObject;
    }

    if (allUser.filter((el) => el.name === registerUser.name).length) {
      errorObject.type = "name";
      errorObject.textError = "name is busy";
      throw errorObject;
    }

    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(registerUser.password, 10);
    const token = createToken(id);

    registerUser.password = hashedPassword;

    const newUser = addUser({
      ...registerUser,
      id: id,
      token: token,
    });

    if (newUser) {
      res
        .cookie("token", token, {
          httpOnly: false,
          secure: false,
          maxAge: 24 * 60 * 60 * 1000,
        })
        .send("add");
      res.status(200);
    }
  } catch (error) {
    res.status(400).json(error);
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const token = req.headers.authorization;
  const errorObject = { type: "", textError: "" };

  if (token) {
    try {
      const decodedToken = verifyToken(token);
      const user = await getUser(decodedToken.userId);
      res.status(200).send(normalize(user).id);
    } catch (error) {
      console.error("Error occurred:", error);
      res.status(400).json({ type: "token", textError: "Invalid Token" });
    }
  } else if (email && password) {
    try {
      const user = await getUserByEmail(email);
      if (!user) {
        errorObject.type = "email";
        errorObject.textError = "Invalid email";
        throw new Error();
      }
      const checkPassword = await comparePasswords(user.password, password);
      if (!checkPassword) {
        errorObject.type = "password";
        errorObject.textError = "Invalid password";
        throw new Error();
      }

      const token = createToken(user.id);
      user.token = token;
      const save = await user.save();

      if (save) {
        res
          .cookie("token", token, {
            httpOnly: false,
            secure: false,
          })
          .send("login");
        res.status(200);
      }
    } catch (error) {
      console.error("Error occurred:", error);
      res.status(400).json(errorObject);
    }
  } else {
    res.status(400).json(errorObject);
  }
};

const getUserAction = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await getUser(id);
    res.status(200).json(normalize(user));
  } catch (error) {
    res.status(500).send("error with server");
  }
};

module.exports = {
  addUserAction,
  loginUser,
  getUserAction,
};
