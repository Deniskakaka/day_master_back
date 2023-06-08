"use strict";

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../models/users");

const createToken = (userId) => {
  const payload = {
    userId: userId,
  };

  const options = {
    expiresIn: "10h",
  };

  const token = jwt.sign(payload, process.env.SECRET, options);

  return token;
};

const getAllUsers = () => {
  return User.findAll();
};

const getUserByEmail = (email) => {
  return User.findOne({ where: { email } });
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
};

const comparePasswords = (userPassword, checkedPassword) => {
  return new Promise((resolve, reject) => {
    bcrypt
      .compare(checkedPassword, userPassword)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const normalize = (user) => {
  const { name, email, id } = user;

  return {
    id: id,
    name: name,
    email: email,
  };
};

const addUser = (obj) => {
  const newUser = User.create(obj);

  return newUser;
};

const getUser = (id) => {
  return User.findByPk(id);
};

module.exports = {
  getAllUsers,
  addUser,
  createToken,
  verifyToken,
  getUser,
  comparePasswords,
  validateEmail,
  normalize,
  getUserByEmail,
};
