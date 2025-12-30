const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const { Product } = require("../models/product");
const { Category } = require("../models/category");
// Get all products
router.get(`/`, async (req, res) => {

  // Get products by category (queryparameter categoryId) catch error
  try {
    let filter = {};
    if (req.query.categories) {
      filter = { category: req.query.categories.split(",") };
    }
    const productList = await Product.find(filter).populate("category");
    res.status(200).json({ success: true, productList });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", success: false });
    console.log(err);
  }
});



// Get a product by id
router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");
  if (!product) {
    res.status(500).json({ message: "Product not found", success: false });
  }
  res.send(product);
});

// Create a new product
router.post(`/`, async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) {
    res.status(500).json({ message: "Category not found", success: false });
  }

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: req.body.image,
    images: req.body.images,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });

  product = await product.save();
  if (!product) {
    res.status(500).json({ message: "Product not created", success: false });
  }
  res.send(product);
});

// Update a product
router.put(`/:id`, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid product id", success: false });
  }

  const category = await Category.findById(req.body.category);
  if (!category) {
    res.status(500).json({ message: "Category not found", success: false });
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      images: req.body.images,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );

  if (!product) {
    res.status(500).json({ message: "Product not updated", success: false });
  }
  res.status(200).json({ success: true, product });
});

// Delete a product
router.delete(`/:id`, async (req, res) => {
  Product.findByIdAndDelete(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "Product deleted successfully" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err.message });
    });
});

// Get the number of products
router.get(`/get/count`, async (req, res) => {
  const productCount = await Product.countDocuments((count) => count);
  if (!productCount) {
    res.status(500).json({ success: false, message: "Product count not found" });
  }
  res.status(200).json({ success: true, productCount });
});

// Get featured products
router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const productCount = await Product.find({ isFeatured: true }).limit(+count);
  if (!productCount) {
    res.status(500).json({ success: false, message: "Featured products not found" });
  }
  res.status(200).json({ success: true, productCount });
});

// Export the router module
module.exports = router;
