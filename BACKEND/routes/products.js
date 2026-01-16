const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const { Product } = require("../models/product");
const { Category } = require("../models/category");
const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Invalid file type");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

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

// Get the number of products - must be before /:id route
router.get(`/get/count`, async (req, res) => {
  const productCount = await Product.countDocuments((count) => count);
  if (!productCount) {
    res
      .status(500)
      .json({ success: false, message: "Product count not found" });
  }
  res.status(200).json({ success: true, productCount });
});

// Get featured products - must be before /:id route
router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const productCount = await Product.find({ isFeatured: true }).limit(+count);
  if (!productCount) {
    res
      .status(500)
      .json({ success: false, message: "Featured products not found" });
  }
  res.status(200).json({ success: true, productCount });
});

// Update gallery images - must be before /:id route
router.put(`/gallery-images/:id`,(req, res, next) => { 
  // storing all images in the req.files array
  uploadOptions.array("images", 10)(req, res, (err) => {
      if (err && err.code === "LIMIT_UNEXPECTED_FILE") {
        // Ignore unexpected fields (like 'image'), only process 'images'
        return next();
      }
      if (err) return next(err);
      next();
    });
  },
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res
          .status(400)
          .json({ message: "Invalid product id", success: false });
      }

      const files = req.files;
      if (!files || files.length === 0) {
        return res.status(400).json({
          message:
            "No images provided. Please upload at least one image with field name 'images'",
          success: false,
        });
      }

      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
      const imagesPaths = files.map((file) => `${basePath}${file.filename}`);

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { images: imagesPaths },
        { new: true }
      );

      if (!product) {
        return res
          .status(500)
          .json({ message: "Product not updated", success: false });
      }
      res.status(200).json({ success: true, product });
    } catch (error) {
      console.error("Error updating gallery images:", error);
      res.status(500).json({
        message: error.message || "Internal server error",
        success: false,
      });
    }
  }
);

// Get a product by id
router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");
  if (!product) {
    res.status(500).json({ message: "Product not found", success: false });
  }
  res.send(product);
});

// Create a new product
router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) {
    res.status(500).json({ message: "Category not found", success: false });
  }

  const file = req.file;

  if (!file) {
    res.status(400).json({ message: "No image file provided", success: false });
  }

  const fileName = file.filename;

  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
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
router.put(`/:id`, uploadOptions.single("image"), async (req, res) => {
  // Check if the id is valid
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid product id", success: false });
  }

  // Check if the category exists
  const category = await Category.findById(req.body.category);
  if (!category) {
    res.status(500).json({ message: "Category not found", success: false });
  }

  // Check if the product exists
  const productToUpdate = await Product.findById(req.params.id);
  if (!productToUpdate) {
    res.status(500).json({ message: "Product not found", success: false });
  }

  const file = req.file;

  let imagePath;
  // Check if a new image is provided
  // If a new image is provided, update the image path
  if (file) {
    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    imagePath = `${basePath}${fileName}`;
  } else {
    // If no new image is provided, keep the old image path
    imagePath = productToUpdate.image;
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: imagePath,
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

// Export the router module
module.exports = router;
