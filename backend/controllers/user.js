const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const { post } = require("../app");
const user = require("../models/user");
const User = require("../models/user");

exports.updateUser = (req, res, next) => {
  User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        "pagination.perPage": req.body.perPage,
      },
    },
    { new: true }
  )
    .then((data) => {
      res.status(200).json({
        data,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Invalid API request!",
      });
    });
};

exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      email: req.body.email,
      password: hash,
      pagination: {
        perPage: 10,
      },
    });
    user
      .save()
      .then((result) => {
        res.status(201).json({
          message: "User created!",
          result: result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: "Invalid authentication credentials!",
        });
      });
  });
};

exports.userLogin = (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: "Authentication Failed!",
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then((result) => {
      if (!result) {
        return res.status(401).json({
          message: "Authentication Failed!",
        });
      }
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      );
      res.status(200).json({
        token,
        expiresIn: 3600,
        userId: fetchedUser._id,
        pagination: {
          perPage: fetchedUser.pagination.perPage,
        },
      });
    })
    .catch((err) => {
      return res.status(401).json({
        message: "Invalid authentication credentials!",
      });
    });
};
