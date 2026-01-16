const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
      required: true,
    },
  ],
  shippingAddress1: {
    type: String,
    required: true,
  },
  shippingAddress2: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "Pending",
  },
  totalPrice: {
    type: Number,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  dateOrdered: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

orderSchema.set("toJSON", {
  virtuals: true,
});

exports.Order = mongoose.model("Order", orderSchema);

/** Order Exmaple:
{
    "orderItems": [
        {
            "quantity": 3,
            "product": "602d214a685a42cc7f793b28"
        },
        {
            "quantity": 2,
            "product": "602d214a685a42cc7f793b29"
        },
        ...
    ],
    "shippingAddress1": "1234 Main St",
    "shippingAddress2": "Apt 1",
    "city": "New York",
    "zip": "10001",
    "country": "USA",
    "phone": "1234567890",
    "status": "Pending",
    "totalPrice": 100,
    "user": "602d214a685a42cc7f793b28",
    "dateOrdered": "2021-01-01T00:00:00.000Z"
}
**/
