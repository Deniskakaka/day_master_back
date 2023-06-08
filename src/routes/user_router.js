"use strict";

const {
  addUserAction,
  loginUser,
  getUserAction,
} = require("../controllers/users_controller");
const express = require("express");

const router = express.Router();

router.post("/register", addUserAction);
router.post("/login", loginUser);
router.get("/:id", getUserAction);

module.exports = router;
