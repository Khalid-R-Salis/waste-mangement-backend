const mongoose = require("mongoose");

const collectionPointSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driverName: {
      type: String,
      default: null,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    time: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      enum: ["Organic", "Recyclable", "Hazardous"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
    userPhoneNumber: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const CollectionPoint = mongoose.model(
  "CollectionPoint",
  collectionPointSchema
);
module.exports = CollectionPoint;
