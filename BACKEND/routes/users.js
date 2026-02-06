const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.get(`/`, async (req, res) => {
  const userList = await User.find().select("-passwordHash");
  if (!userList) {
    res.status(500).json({ message: "No users found", success: false });
  }
  res.send(userList);
});

// Get a user by id
router.get(`/:id`, async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");
  if (!user) {
    res.status(500).json({ message: "User not found", success: false });
  }
  res.send(user);
});

// Create/Register a new user (POST /api/v1/users)
router.post(`/`, async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });
  user = await user.save();
  if (!user) {
    return res
      .status(500)
      .json({ message: "User not created", success: false });
  }
  res.status(201).send(user);
});

router.post(`/login`, async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const secret = process.env.JWT_SECRET;

  if (!user) {
    return res.status(400).json({ message: "User not found", success: false });
  }

  // Debug: Check if passwordHash is properly formatted
  const isPasswordValid = bcrypt.compareSync(
    req.body.password,
    user.passwordHash
  );
  console.log("Login attempt:", {
    email: req.body.email,
    passwordHashExists: !!user.passwordHash,
    passwordHashStartsWith: user.passwordHash?.substring(0, 7),
    isPasswordValid: isPasswordValid,
  });

  if (isPasswordValid) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      { expiresIn: "1d" }
    );

    return res.status(200).json({ user: user.email, token: token });
  } else {
    return res
      .status(400)
      .json({ message: "Password is incorrect", success: false });
  }
});

// Delete a user
router.delete(`/:id`, async (req, res) => {
  const user = await User.findByIdAndRemove(req.params.id);
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  res.status(200).json({ success: true, message: "User deleted successfully" });
});

// Get the number of users
router.get(`/get/count`, async (req, res) => {
  const userCount = await User.countDocuments();
  if (!userCount) {
    res.status(500).json({ message: "No users found", success: false });
  }
  res.status(200).json({ userCount: userCount });
});

module.exports = router;
