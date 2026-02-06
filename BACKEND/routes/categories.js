const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();

router.get(`/`, async (req, res) => {
  const categoryList = await Category.find();
  if (!categoryList) {
    res.status(500).json({ message: "No categories found", success: false });
  }
  res.send(categoryList);
});

router.put(`/:id`, async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  },{new: true});
  if (!category) {
    res.status(500).json({ message: "Category not found", success: false });
  }
  
  res.send(category);
});

router.get(`/:id`, async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(500).json({ message: "Category not found", success: false });
  }
  res.send(category);
});

router.post(`/`, async (req, res) => {
  let newCategory = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });
  newCategory = await newCategory.save();
  if (!newCategory) {
    res.status(500).json({ message: "No category found", success: false });
  }
  res.send(newCategory);
});

router.delete(`/:id`, async (req, res) => {
  Category.findByIdAndDelete(req.params.id)
    .then((category) => {
      if (category) {
        return res
          .status(200)
          .json({ success: true, message: "Category deleted successfully" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err.message });
    });
});

module.exports = router;
