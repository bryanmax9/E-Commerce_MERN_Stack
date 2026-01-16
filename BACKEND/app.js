const express = require("express");
const app = express();
const morgan = require("morgan");
// MongoDB connection
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");

app.use(cors());

const api = process.env.API_URL;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(morgan("tiny"));

// Serve static files from the public directory (must be before JWT middleware)
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));

// Middleware to verify JWT token before accessing the routes
app.use(authJwt());

// Middleware to handle errors
app.use(errorHandler);

// Routes
const productRouter = require("./routes/products");
const userRouter = require("./routes/users");
const orderRouter = require("./routes/orders");
const categoryRouter = require("./routes/categories");

// Use the product router
app.use(`${api}/products`, productRouter);
app.use(`${api}/users`, userRouter);
app.use(`${api}/orders`, orderRouter);
app.use(`${api}/categories`, categoryRouter);
const connectionString = process.env.CONNECTION_STRING;

// Connect to MongoDB
mongoose
  .connect(connectionString, {
    dbName: "e-shop-database",
  })
  .then(() => {
    console.log("Database connection is ready...");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(3000, () => {
  console.log(`API Version: ${api}`);
  console.log("Server is running on http://localhost:3000");
});
