const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const routerUser = require("./routes/user_router");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

const server = () => {
  app.use("/register", express.json(), routerUser);
  app.use("/", express.json(), routerUser);
  app.use("/user", express.json(), routerUser);
  return app;
};

module.exports = {
  server,
};
