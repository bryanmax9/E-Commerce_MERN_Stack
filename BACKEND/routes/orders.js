const { Order } = require("../models/order");
const { OrderItem } = require("../models/order-item");
const express = require("express");
const router = express.Router();

// Get all orders
router.get(`/`, async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "name email")
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: { path: "category" } },
    })
    .sort({ dateOrdered: -1 });
  if (!orderList) {
    res.status(500).json({ message: "No orders found", success: false });
  }
  res.send(orderList);
});

// Get an order by id
router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: { path: "category" } },
    });
  if (!order) {
    res.status(500).json({ message: "Order not found", success: false });
  }
  res.send(order);
});

// Create an order
router.post(`/`, async (req, res) => {
  const orderItemsIds = await Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });

      newOrderItem = await newOrderItem.save();

      return newOrderItem._id;
    })
  );

  // Calculate total price of all order items, this will return a list of total prices for each order item
  const totalPrices = await Promise.all(
    orderItemsIds.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        "product",
        "price"
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );

  // Calculate the total price of all order items
  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

  let order = new Order({
    orderItems: orderItemsIds,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });

  order = await order.save();

  if (!order) {
    return res
      .status(500)
      .json({ message: "Order not created", success: false });
  }

  // Populate order items and user details before sending
  order = await order.populate("orderItems", "quantity product");
  order = await order.populate("user", "name email");

  res.send(order);
});

// Update an order
router.put(`/:id`, async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );

  if (!order) {
    return res.status(500).json({ message: "Order not found", success: false });
  }
  res.send(order);
});

// Delete an order
router.delete(`/:id`, async (req, res) => {
  try {
    // First, find the order to get its orderItems
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found", success: false });
    }

    // Delete all order items associated with this order
    if (order.orderItems && order.orderItems.length > 0) {
      await OrderItem.deleteMany({ _id: { $in: order.orderItems } });
    }

    // Delete the order after order items are deleted
    await Order.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Order and order items deleted successfully",
      success: true,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Order not deleted",
      success: false,
      error: err.message,
    });
  }
});

// Get total sales
router.get(`/get/totalsales`, async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } },
  ]);

  if (!totalSales) {
    return res.status(400).json({ message: "No sales found", success: false });
  }

  res
    .status(200)
    .json({ success: true, totalSales: totalSales.pop().totalSales });
});

// Get order count
router.get(`/get/count`, async (req, res) => {
  const orderCount = await Order.countDocuments();
  if (!orderCount) {
    return res.status(400).json({ message: "No orders found", success: false });
  }
  res.status(200).json({ success: true, orderCount });
});

// Get user orders
router.get(`/get/userorders/:userid`, async (req, res) => {
  const userOrders = await Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: { path: "category" } },
    })
    .sort({ dateOrdered: -1 });

  if (!userOrders) {
    return res.status(400).json({ message: "No orders found", success: false });
  }
  res.status(200).json({ success: true, userOrders });
});

module.exports = router;
