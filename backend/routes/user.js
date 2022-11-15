const express = require("express");
const router = express.Router();
const user = require("../models/user");
const UserController = require("../controllers/user");

router.post("/signup", UserController.createUser);

router.post("/login", UserController.userLogin);

router.put("/update/:id", UserController.updateUser);

module.exports = router;
